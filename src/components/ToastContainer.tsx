'use client';

import { useToastState, Toast } from '@/hooks/useToast';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

function ToastIcon({ type }: { type: Toast['type'] }) {
  switch (type) {
    case 'success': return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
    case 'error':   return <XCircle className="h-5 w-5 text-red-500 shrink-0" />;
    case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
    default:        return <Info className="h-5 w-5 text-blue-500 shrink-0" />;
  }
}

const borderMap: Record<Toast['type'], string> = {
  success: 'border-l-4 border-l-emerald-500',
  error:   'border-l-4 border-l-red-500',
  warning: 'border-l-4 border-l-amber-500',
  info:    'border-l-4 border-l-blue-500',
};

export function ToastContainer() {
  const toasts = useToastState();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80 max-w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={cn(
              'bg-white shadow-xl rounded-xl p-4 flex items-start gap-3 pointer-events-auto',
              borderMap[t.type]
            )}
          >
            <ToastIcon type={t.type} />
            <p className="flex-1 text-sm text-slate-700 font-medium leading-snug">{t.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
