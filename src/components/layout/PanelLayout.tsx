import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { NavbarPanel } from '@/components/layout/NavbarPanel';

export default function PanelLayout() {
  return (
    <div className="min-h-screen flex bg-main">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <NavbarPanel />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
