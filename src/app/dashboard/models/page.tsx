'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Model, PageResponse } from '@/types';
import { formatDate } from '@/lib/utils';
import { Plus, BrainCircuit, Loader2, Zap, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/_providers/AuthProvider';

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Form State
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [algorithm, setAlgorithm] = useState('');
  const [description, setDescription] = useState('');
  const [accuracy, setAccuracy] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchModels = async () => {
    try {
      const { data } = await api.get<PageResponse<Model>>('/models?page=0&size=50');
      setModels(data.data);
    } catch (err) {
      console.error('Failed to fetch models', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/models', {
        name,
        version,
        algorithm,
        description,
        accuracy: accuracy ? Number(accuracy) : 0
      });
      setIsModalOpen(false);
      setName(''); setVersion(''); setAlgorithm(''); setDescription(''); setAccuracy('');
      fetchModels();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register model');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center">
            <BrainCircuit className="mr-3 h-8 w-8 text-emerald-600" />
            Active Models
          </h1>
          <p className="text-slate-500 mt-1">Machine Learning models registered for predictions.</p>
        </div>
        {/* Only show 'Add Model' for admins generally, but allowing it for demo purposes here if API permits or using isAdmin toggle */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4 mr-2" /> Register Model
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : models.length === 0 ? (
        <div className="text-center p-12 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <BrainCircuit className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-700">No models active</h3>
          <p className="text-slate-500 mt-2 mb-6 max-w-sm mx-auto">Register a new machine learning model to start running predictions on your datasets.</p>
          <button onClick={() => setIsModalOpen(true)} className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
            Register Model &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {models.map((model, idx) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:bg-slate-50 hover:shadow-md transition-shadow group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <h3 className="font-semibold text-lg text-slate-900 mr-3">{model.name}</h3>
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                      v{model.version}
                    </span>
                  </div>
                  <div className="hidden group-hover:flex items-center gap-2">
                    <button className="text-slate-400 hover:text-emerald-600 p-1 transition-colors" title="Edit"><Edit2 className="h-4 w-4" /></button>
                    <button className="text-slate-400 hover:text-red-500 p-1 transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{model.description || 'No description provided.'}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 mt-auto">
                  <div className="flex items-center bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded-md">
                    <Zap className="h-3 w-3 mr-1.5 shrink-0 text-yellow-500" /> {model.algorithm}
                  </div>
                  {model.accuracy > 0 && (
                    <div className="flex items-center bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-md">
                      {(model.accuracy * 100).toFixed(1)}% Accuracy
                    </div>
                  )}
                  <div className="ml-auto text-[10px] text-gray-400">
                    Added {formatDate(model.createdAt)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Register Model Modal */}
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
              className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-6 z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Register ML Model</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                {error && <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm">{error}</div>}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Model Name *</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" placeholder="e.g. ChurnPredictor" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Version *</label>
                    <input type="text" required value={version} onChange={(e) => setVersion(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" placeholder="e.g. 1.0.0" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Algorithm *</label>
                    <input type="text" required value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" placeholder="e.g. RandomForest" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Accuracy (0.0 - 1.0)</label>
                    <input type="number" step="0.01" min="0" max="1" value={accuracy} onChange={(e) => setAccuracy(e.target.value ? Number(e.target.value) : '')} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors" placeholder="0.95" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors h-24" placeholder="Brief details about the model..."></textarea>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 mt-4 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex items-center mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors shadow-sm">
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Save Model
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
