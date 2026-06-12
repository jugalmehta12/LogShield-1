import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

function AppShell({ navItems, activePage, onNavigate, children }) {
  const pageTitles = {
    dashboard: ['Dashboard', 'Operational overview for log intake, storage, and readiness metrics.'],
    logs: ['Logs', 'Incoming log inventory and search-friendly data previews.'],
    alerts: ['Alerts', 'Initial alert workspace reserved for future triage workflows.'],
    settings: ['Settings', 'Application and environment configuration controls.'],
  };

  const [title, subtitle] = pageTitles[activePage] ?? pageTitles.dashboard;

  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[320px_1fr]">
        <Sidebar navItems={navItems} activePage={activePage} onNavigate={onNavigate} />
        <main className="flex min-h-screen flex-col">
          <Topbar title={title} subtitle={subtitle} />
          <div className="flex-1 p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AppShell;
