import { Outlet } from 'react-router-dom';
import { DashSidebar } from '@/components/layout/DashSidebar';
import { DashHeader } from '@/components/layout/DashHeader';

export default function DashLayout() {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg)' }}>
      <DashSidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[240px]">
        <DashHeader />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
