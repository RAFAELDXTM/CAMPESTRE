import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Tractor, 
  Wheat, 
  Receipt, 
  TrendingUp, 
  Wallet, 
  BarChart3,
  Menu,
  X,
  Scale,
  Landmark,
  LineChart,
  LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';

const navigation = [
  { name: 'Gestão de Lotes', href: '/', icon: LayoutDashboard },
  { name: 'Trato Diário', href: '/trato', icon: Tractor },
  { name: 'Ração', href: '/racao', icon: Wheat },
  { name: 'Lançamentos', href: '/lancamentos', icon: Receipt },
  { name: 'Vendas', href: '/vendas', icon: TrendingUp },
  { name: 'Receitas Diversas', href: '/receitas', icon: Wallet },
  { name: 'Pesagem', href: '/pesagem', icon: Scale },
  { name: 'Financeiro', href: '/financeiro', icon: Landmark },
  { name: 'Análise Avançada', href: '/analise', icon: LineChart },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar */}
      <div className={clsx("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-slate-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col">
          <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200">
            <span className="text-xl font-bold text-emerald-700">CAMPESTRE</span>
            <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-500 hover:text-slate-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-emerald-50 text-emerald-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-200">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200">
        <div className="flex items-center px-6 h-16 border-b border-slate-200">
          <span className="text-2xl font-bold text-emerald-700">CAMPESTRE</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-emerald-50 text-emerald-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold uppercase">
                {user?.email?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-slate-900 truncate w-32">{user?.email || 'Usuário'}</p>
                <p className="text-xs text-slate-500">Fazenda Principal</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-8 justify-between sticky top-0 z-40">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500 hidden sm:block">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
