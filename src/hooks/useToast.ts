'use client';

import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let currentToasts: Toast[] = [];

function notify(toast: Toast) {
  currentToasts = [...currentToasts, toast];
  toastListeners.forEach(l => l(currentToasts));
  setTimeout(() => {
    currentToasts = currentToasts.filter(t => t.id !== toast.id);
    toastListeners.forEach(l => l(currentToasts));
  }, 4000);
}

export function toast(message: string, type: ToastType = 'info') {
  const id = Math.random().toString(36).slice(2);
  notify({ id, message, type });
}

export function useToastState() {
  const [toasts, setToasts] = useState<Toast[]>(currentToasts);
  if (!toastListeners.includes(setToasts)) {
    toastListeners.push(setToasts);
  }
  return toasts;
}
