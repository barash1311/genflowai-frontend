'use client';

import { useAuth } from '@/app/_providers/AuthProvider';
import { User, Bell } from 'lucide-react';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="h-16 shrink-0 border-b border-slate-200 bg-white backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4 lg:hidden">
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 tracking-tight">GenFlow AI</span>
      </div>
      
      <div className="hidden lg:flex flex-1">
        {/* Breadcrumb or Search could go here */}
      </div>

      <div className="flex items-center gap-6">
        <button className="text-slate-500 hover:text-emerald-600 transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="hidden md:flex flex-col text-sm">
            <span className="font-medium text-slate-900">{user?.email || 'Guest'}</span>
            <span className="text-xs text-slate-500 capitalize">{user?.role?.toLowerCase() || 'User'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
