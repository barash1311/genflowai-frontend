'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Prediction, PageResponse } from '@/types';
import { formatDate } from '@/lib/utils';
import { Activity, Plus, Loader2, ArrowRight, CheckCircle2, XCircle, Clock, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    FAILED:  'bg-red-50 text-red-700 border-red-200',
    RUNNING: 'bg-blue-50 text-blue-700 border-blue-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  const icons: Record<string, React.ReactElement> = {
    SUCCESS: <CheckCircle2 className="h-3 w-3" />,
    FAILED:  <XCircle className="h-3 w-3" />,
    RUNNING: <Loader2 className="h-3 w-3 animate-spin" />,
    PENDING: <Clock className="h-3 w-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${map[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {icons[status]}
      {status}
    </span>
  );
}

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<Prediction | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const { data } = await api.get<PageResponse<Prediction>>('/predictions?page=0&size=50');
        setPredictions(data.data);
      } catch (err) {
        console.error('Failed to fetch predictions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center">
            <Activity className="mr-3 h-8 w-8 text-emerald-600" />
            Prediction History
          </h1>
          <p className="text-slate-500 mt-1">Review your past machine learning runs.</p>
        </div>
        <Link
          href="/dashboard/predictions/new"
          className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4 mr-2" /> Run New Prediction
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : predictions.length === 0 ? (
        <div className="text-center p-12 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Activity className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-700">No predictions found</h3>
          <p className="text-slate-500 mt-2 mb-6 max-w-sm mx-auto">You haven't executed any machine learning tasks yet.</p>
          <Link href="/dashboard/predictions/new" className="text-emerald-600 font-medium hover:text-emerald-700 flex justify-center items-center transition-colors">
             Start a new workflow <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm text-left text-slate-900">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Exec Time</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {predictions.map((pred, i) => (
                  <motion.tr 
                    key={pred.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 truncate max-w-[150px]">{pred.id}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={pred.status} />
                    </td>
                    <td className="px-6 py-4">{pred.executionTimeMs ? `${pred.executionTimeMs} ms` : '-'}</td>
                    <td className="px-6 py-4">{formatDate(pred.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      {pred.status === 'SUCCESS' && (
                        <button 
                          onClick={() => setSelectedResult(pred)} 
                          className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                        >
                          View Result
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Result Modal */}
      <AnimatePresence>
        {selectedResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-600">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6" /> Prediction Results
                </h2>
                <button 
                  onClick={() => setSelectedResult(null)}
                  className="p-1 hover:bg-white/10 rounded-lg text-white transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Execution Time</p>
                    <p className="text-lg font-bold text-slate-800">{selectedResult.executionTimeMs}ms</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Created At</p>
                    <p className="text-sm font-bold text-slate-800">{formatDate(selectedResult.createdAt)}</p>
                  </div>
                </div>

                {(() => {
                  try {
                    const data = JSON.parse(selectedResult.result || '{}');
                    return (
                      <div className="space-y-6">
                         {data.reasoning && (
                          <div>
                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Agent Reasoning</h4>
                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 italic text-slate-600 text-sm">
                              "{data.reasoning}"
                            </div>
                          </div>
                        )}

                        {data.sql && (
                          <div>
                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Generated SQL (PostGIS)</h4>
                            <div className="bg-slate-900 rounded-xl overflow-hidden shadow-inner">
                              <pre className="p-4 text-emerald-400 font-mono text-sm leading-relaxed overflow-x-auto max-h-[250px]">
                                <code>{data.sql}</code>
                              </pre>
                            </div>
                          </div>
                        )}

                        {data.shapefile_path && data.shapefile_path !== 'PENDING' && data.shapefile_path !== 'UNSAFE_SQL' && (
                          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-bold text-sm">Geospatial Layer Package</h4>
                              <p className="text-slate-400 text-xs">Standard Shapefile format (.zip)</p>
                            </div>
                            <a 
                              href={`http://localhost:8000${data.shapefile_path}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                            >
                              Download <ArrowRight className="h-4 w-4" />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  } catch (e) {
                    return <pre className="p-4 bg-slate-50 rounded-xl text-xs font-mono">{selectedResult.result}</pre>;
                  }
                })()}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setSelectedResult(null)}
                  className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
