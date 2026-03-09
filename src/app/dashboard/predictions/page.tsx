'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Prediction, PageResponse } from '@/types';
import { formatDate } from '@/lib/utils';
import { Activity, Plus, Loader2, Play, CheckCircle2, XCircle, Clock } from 'lucide-react';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'FAILED': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'RUNNING': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8">
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
          <Play className="h-4 w-4 mr-2" /> Run New Prediction
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
             Start a new workflow <Play className="ml-1 h-3 w-3" />
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
                          onClick={() => alert(`Result Data:\n${pred.result}`)} 
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
    </div>
  );
}
