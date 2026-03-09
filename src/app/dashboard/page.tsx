'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/app/_providers/AuthProvider';
import { Activity, Database, BrainCircuit, Play, ArrowRight, Loader2, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

function AnimatedCounter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (value === 0) return;
    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{display}</>;
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ datasets: 0, models: 0, predictions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dsRes, mdRes, prRes] = await Promise.all([
          api.get('/datasets?page=0&size=1'),
          api.get('/models?page=0&size=1'),
          api.get('/predictions?page=0&size=1')
        ]);
        setStats({
          datasets: dsRes.data.totalElements || 0,
          models: mdRes.data.totalElements || 0,
          predictions: prRes.data.totalElements || 0
        });
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Total Datasets',
      value: stats.datasets,
      icon: Database,
      href: '/dashboard/datasets',
      accentColor: 'emerald',
      bgClass: 'bg-white border-slate-200 text-emerald-600',
      change: '+2 this week',
    },
    {
      title: 'Active Models',
      value: stats.models,
      icon: BrainCircuit,
      href: '/dashboard/models',
      accentColor: 'teal',
      bgClass: 'bg-white border-slate-200 text-teal-600',
      change: 'Ready to run',
    },
    {
      title: 'Predictions Run',
      value: stats.predictions,
      icon: Activity,
      href: '/dashboard/predictions',
      accentColor: 'slate',
      bgClass: 'bg-white border-slate-200 text-slate-600',
      change: 'All time',
    }
  ];

  const accentMap: Record<string, { icon: string; counter: string; badge: string }> = {
    emerald: { icon: 'bg-emerald-50 border-emerald-100', counter: 'text-emerald-700', badge: 'text-emerald-500' },
    teal:    { icon: 'bg-teal-50 border-teal-100',       counter: 'text-teal-700',   badge: 'text-teal-500' },
    slate:   { icon: 'bg-slate-50 border-slate-100',     counter: 'text-slate-700',  badge: 'text-slate-400' },
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight text-slate-900"
          >
            Welcome back, <span className="text-emerald-600">{user?.email?.split('@')[0] || 'Engineer'}</span> 👋
          </motion.h1>
          <p className="text-slate-500 mt-1">Here is the overview of your ML platform activities.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <Clock className="h-3.5 w-3.5" />
          <span>Last updated just now</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const accent = accentMap[card.accentColor];
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`rounded-2xl border p-6 flex flex-col justify-between shadow-sm hover:shadow-lg transition-shadow cursor-default ${card.bgClass}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl border ${accent.icon}`}>
                  <card.icon className={`h-5 w-5 ${accent.counter}`} />
                </div>
                <span className={`text-xs font-medium flex items-center gap-1 ${accent.badge}`}>
                  <TrendingUp className="h-3 w-3" /> {card.change}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <h3 className={`text-4xl font-bold mt-1 tabular-nums ${accent.counter}`}>
                  {loading
                    ? <Loader2 className="h-6 w-6 animate-spin inline" />
                    : <AnimatedCounter value={card.value} />
                  }
                </h3>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link href={card.href} className="text-sm font-medium flex items-center text-slate-500 hover:text-emerald-600 transition-colors">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-600 to-teal-600 p-6 overflow-hidden relative shadow-lg"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 blur-2xl rounded-full -translate-x-1/2 translate-y-1/2" />
          <h3 className="text-xl font-semibold text-white mb-1 relative z-10">Quick Predict</h3>
          <p className="text-emerald-100 text-sm mb-6 relative z-10">Run a new machine learning inference instantly.</p>
          <Link
            href="/dashboard/predictions/new"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-white text-emerald-700 font-semibold hover:bg-emerald-50 transition-all shadow relative z-10 text-sm"
          >
            <Play className="h-4 w-4 mr-2" /> Start Workflow
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Getting Started</h3>
          <ol className="space-y-3 mt-4">
            {[
              { step: 1, label: 'Upload a Dataset', href: '/dashboard/datasets', done: stats.datasets > 0 },
              { step: 2, label: 'Register an ML Model', href: '/dashboard/models', done: stats.models > 0 },
              { step: 3, label: 'Run your first Prediction', href: '/dashboard/predictions/new', done: stats.predictions > 0 },
            ].map((item) => (
              <li key={item.step}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 group text-sm ${item.done ? 'opacity-50' : ''}`}
                >
                  <span className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors
                    ${item.done
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 text-slate-400 group-hover:border-emerald-500 group-hover:text-emerald-600'
                    }`}
                  >
                    {item.done ? '✓' : item.step}
                  </span>
                  <span className={`font-medium transition-colors ${item.done ? 'text-slate-400 line-through' : 'text-slate-700 group-hover:text-emerald-600'}`}>
                    {item.label}
                  </span>
                  {!item.done && <ArrowRight className="ml-auto h-4 w-4 text-slate-400 group-hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-all" />}
                </Link>
              </li>
            ))}
          </ol>
        </motion.div>
      </div>
    </div>
  );
}
