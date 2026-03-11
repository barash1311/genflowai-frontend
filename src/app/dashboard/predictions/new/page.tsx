'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Dataset, Model, PredictionJobResponse } from '@/types';
import { Loader2, ArrowRight, BrainCircuit, Database, CheckCircle2, XCircle, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/useToast';

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return null;
  const map: Record<string, string> = {
    SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    FAILED:  'bg-red-50 text-red-700 border-red-200',
    RUNNING: 'bg-blue-50 text-blue-700 border-blue-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {status}
    </span>
  );
}


export default function NewPredictionPage() {
  const router = useRouter();
  
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [promptText, setPromptText] = useState('');

  const [running, setRunning] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dsRes, mdRes] = await Promise.all([
          api.get('/datasets?page=0&size=50'),
          api.get('/models?page=0&size=50')
        ]);
        setDatasets(dsRes.data.data);
        setModels(mdRes.data.data);
      } catch (err) {
        console.error('Failed to fetch required data', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDataset || !selectedModel || !promptText) return;

    setRunning(true);
    setError('');
    setJobId(null);
    setResult(null);

    try {
      // 1. Create Prompt
      const promptRes = await api.post('/prompts', {
        datasetId: selectedDataset,
        promptText: promptText
      });
      const promptId = promptRes.data.id;

      // 2. Submit Prediction
      const predRes = await api.post('/predictions', {
        promptId: promptId,
        modelId: selectedModel
      });
      const newJobId = predRes.data.id;
      setJobId(newJobId);
      setJobStatus('PENDING');

      toast('Prediction job submitted successfully!', 'success');
      pollJob(newJobId);

    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to start prediction job.';
      setError(msg);
      toast(msg, 'error');
      setRunning(false);
    }
  };

  const pollJob = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get<PredictionJobResponse>(`/prediction-jobs/${id}`);
        setJobStatus(data.status);

        if (data.status === 'SUCCESS' || data.status === 'FAILED') {
          clearInterval(interval);
          setRunning(false);
          
          if (data.status === 'SUCCESS') {
            toast('Prediction completed successfully!', 'success');
            setTimeout(async () => {
                try {
                  const promptRes = await api.get(`/predictions/prompt/${data.promptId}?page=0&size=1`);
                  if (promptRes.data.data.length > 0) {
                      setResult(promptRes.data.data[0]);
                  }
                } catch(e) { }
            }, 1000);
          } else {
            toast('Prediction job failed.', 'error');
          }
        }
      } catch (err) {
        console.error('Polling error', err);
        clearInterval(interval);
        setRunning(false);
        setError('Error polling job status.');
      }
    }, 2000); // poll every 2s
  };

  if (loadingData) {
    return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <Terminal className="h-7 w-7 text-emerald-600" />
          New Prediction Workflow
        </h1>
        <p className="text-slate-500 mt-1">Configure your task, submit the prompt, and execute.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        {/* Subtle background accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center">
                <Database className="w-4 h-4 mr-2 text-emerald-600" /> Select Dataset
              </label>
              <select 
                required
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                disabled={running}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 appearance-none transition-colors"
              >
                <option value="" disabled>-- Choose Dataset --</option>
                {datasets.map(d => <option key={d.id} value={d.id}>{d.name} ({d.rowCount} rows)</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center">
                <BrainCircuit className="w-4 h-4 mr-2 text-teal-600" /> Target Model
              </label>
              <select 
                required
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={running}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 appearance-none transition-colors"
              >
                <option value="" disabled>-- Choose Model --</option>
                {models.map(m => <option key={m.id} value={m.id}>{m.name} (v{m.version})</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Prompt Instructions</label>
            <textarea
              required
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              disabled={running}
              placeholder="E.g., Predict whether these users will churn in the next 30 days based on their activity logs."
              className="w-full h-32 bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none font-mono text-sm transition-colors"
            />
          </div>

          {jobStatus && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4"
            >
              {jobStatus === 'PENDING' || jobStatus === 'RUNNING' ? (
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
                  <Loader2 className="h-6 w-6 text-emerald-600 animate-spin relative" />
                </div>
              ) : jobStatus === 'SUCCESS' ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900">Job ID: <span className="text-xs text-slate-400 font-mono ml-2">{jobId}</span></h4>
                <p className="text-sm text-slate-500 pt-1">
                  Status: <StatusBadge status={jobStatus} />
                </p>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <CheckCircle2 className="mr-2 h-6 w-6 text-emerald-500" /> 
                  Prediction Complete
                </h3>
                <span className="text-sm font-medium px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
                  {result.executionTimeMs}ms
                </span>
              </div>

              {(() => {
                try {
                  const data = JSON.parse(result.result);
                  return (
                    <div className="space-y-6">
                      {/* Reasonings / Summary */}
                      {data.reasoning && (
                        <div className="p-4 bg-slate-50 border-l-4 border-emerald-500 rounded-r-xl">
                          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Agent Reasoning</h4>
                          <p className="text-slate-600 leading-relaxed text-sm italic">
                            "{data.reasoning}"
                          </p>
                        </div>
                      )}

                      {/* SQL Block */}
                      {data.sql && (
                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xl">
                          <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
                            <span className="text-xs font-mono text-slate-400">GENERATE_POSTGIS_SQL</span>
                            <div className="flex gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-400/20"></div>
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/20"></div>
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/20"></div>
                            </div>
                          </div>
                          <div className="p-4 overflow-x-auto max-h-[300px]">
                            <pre className="text-emerald-400 font-mono text-sm leading-relaxed">
                              <code>{data.sql}</code>
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Download Link */}
                      {data.shapefile_path && data.shapefile_path !== 'PENDING' && data.shapefile_path !== 'UNSAFE_SQL' && (
                        <div className="flex justify-center p-6 bg-emerald-600/5 border border-dashed border-emerald-500/30 rounded-2xl">
                          <div className="text-center">
                            <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full mb-3">
                              <Database className="h-6 w-6" />
                            </div>
                            <h4 className="text-slate-900 font-bold">Geospatial Data Ready</h4>
                            <p className="text-slate-500 text-sm mb-4">The agent successfully generated the PostGIS dataset.</p>
                            <a 
                              href={`http://localhost:8000${data.shapefile_path}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                            >
                              Download Shapefile (.zip) <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                } catch (e) {
                  return (
                    <div className="bg-slate-900 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-emerald-400 font-mono text-xs">{result.result}</pre>
                    </div>
                  );
                }
              })()}
            </motion.div>
          )}

          {!result && (
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={running || !selectedDataset || !selectedModel || !promptText}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/25"
              >
                {running ? 'Processing...' : 'Execute Workflow'} <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          )}
          
          {result && (
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/dashboard/predictions')}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all border border-slate-200"
              >
                Back to History
              </button>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}
