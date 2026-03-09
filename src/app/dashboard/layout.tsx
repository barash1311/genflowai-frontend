import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden selection:bg-emerald-500/30">
      <Sidebar />
      <div className="flex flex-col flex-1 relative w-full overflow-hidden">
        {/* Global animated background effect for authenticated area */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/5 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none animate-pulse duration-10000"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-600/5 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none animate-pulse duration-7000"></div>

        <Header />
        
        <main className="flex-1 overflow-y-auto w-full z-10 p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
