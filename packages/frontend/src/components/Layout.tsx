import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { path: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { path: '/sites/new', label: '현장 등록', icon: PlusCircle },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r">
        <div className="p-6 border-b">
          <h1 className="text-lg font-bold text-primary">현장 관리 솔루션</h1>
          <p className="text-sm text-muted-foreground mt-1">B2B Field Management</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b">
          <h1 className="text-lg font-bold text-primary">현장 관리</h1>
          <div className="flex gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="p-2 rounded-lg hover:bg-accent"
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-accent">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
