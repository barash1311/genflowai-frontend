'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Dataset, PageResponse } from '@/types';
import { formatDate } from '@/lib/utils';
import { Plus, Database, Loader2, Link as LinkIcon, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');
  const [rowCount, setRowCount] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchDatasets = async () => {
    try {
      const { data } = await api.get<PageResponse<Dataset>>('/datasets?page=0&size=50');
      setDatasets(data.data);
    } catch (err) {
      console.error('Failed to fetch datasets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/datasets', {
        name,
        source,
        description,
        rowCount: rowCount ? Number(rowCount) : 0
      });
      setIsModalOpen(false);
      setName(''); setSource(''); setDescription(''); setRowCount('');
      fetchDatasets();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create dataset');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center">
            <Database className="mr-3 h-8 w-8 text-emerald-600" />
            Datasets
          </h1>
          <p className="text-slate-500 mt-1">Manage the data sources powering your AI models.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Dataset
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : datasets.length === 0 ? (
        <div className="text-center p-12 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Database className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-700">No datasets found</h3>
          <p className="text-slate-500 mt-2 mb-6 max-w-sm mx-auto">Upload your first dataset metadata to start running machine learning predictions.</p>
          <button onClick={() => setIsModalOpen(true)} className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
            Create one now &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {datasets.map((ds, idx) => (
              <motion.div
                key={ds.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:bg-slate-50 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-slate-900">{ds.name}</h3>
                  <div className="hidden group-hover:flex items-center gap-2">
                    <button className="text-slate-400 hover:text-emerald-600 p-1 transition-colors" title="Edit"><Edit2 className="h-4 w-4" /></button>
                    <button className="text-slate-400 hover:text-red-500 p-1 transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{ds.description || 'No description provided.'}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 mt-auto">
                  <div className="flex items-center bg-slate-100 text-slate-600 px-2 py-1 rounded-md max-w-full overflow-hidden text-ellipsis whitespace-nowrap border border-slate-200">
                    <LinkIcon className="h-3 w-3 mr-1.5 shrink-0" /> {ds.source}
                  </div>
                  {ds.rowCount > 0 && (
                    <div className="flex items-center bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-1 rounded-md">
                      {ds.rowCount.toLocaleString()} rows
                    </div>
                  )}
                  <div className="ml-auto text-[10px] text-gray-600">
                    Added {formatDate(ds.createdAt)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setIsModalOpen(false)} 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden p-6 z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Add New Dataset</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                {error && <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm">{error}</div>}
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dataset Name *</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" placeholder="e.g. Customer Logs 2025" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Source URL/Path *</label>
                  <input type="text" required value={source} onChange={(e) => setSource(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" placeholder="e.g. s3://bucket/data.csv" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors h-24" placeholder="Brief details about the dataset..."></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Row Count (approx)</label>
                  <input type="number" value={rowCount} onChange={(e) => setRowCount(e.target.value ? Number(e.target.value) : '')} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" placeholder="10000" />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 mt-4 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex mt-4 items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 transition-colors">
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Save Dataset
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
