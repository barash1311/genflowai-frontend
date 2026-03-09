'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Database, BrainCircuit, Activity, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/_providers/AuthProvider';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Datasets', href: '/dashboard/datasets', icon: Database },
  { name: 'Models', href: '/dashboard/models', icon: BrainCircuit },
  { name: 'Predictions', href: '/dashboard/predictions', icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-[calc(100vh-4rem)] md:h-screen sticky top-0 backdrop-blur-xl">
      <div className="flex items-center justify-center h-16 border-b border-slate-200 shrink-0">
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 tracking-tight">GenFlow AI</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname !== '/dashboard' && pathname.startsWith(item.href) && item.href !== '/dashboard');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm rounded-xl transition-all group",
                isActive 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("h-5 w-5 mr-3 transition-colors", isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600")} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-200">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors group"
        >
          <LogOut className="h-5 w-5 mr-3 text-slate-400 group-hover:text-red-500" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
