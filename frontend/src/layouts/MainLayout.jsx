import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useRealtimeSocket } from '../hooks/useRealtimeSocket';

function MainLayout() {
  const { connectionStatus } = useRealtimeSocket();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_24%),radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_20%),linear-gradient(180deg,#020617_0%,#050816_48%,#020617_100%)] text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[300px_1fr]">
        <Sidebar />

        <main className="flex min-h-screen flex-col">
          <Navbar connectionStatus={connectionStatus} />
          <div className="flex-1 p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;