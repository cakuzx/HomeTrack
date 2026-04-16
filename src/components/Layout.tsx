import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, PlusCircle, ArrowDownCircle, LogOut, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const navItems = [
  { name: 'Análisis de compras', path: '/',              icon: LayoutDashboard },
  { name: 'Inventario',       path: '/inventory',     icon: Package },
  { name: 'Registrar Compra', path: '/purchases/new', icon: PlusCircle },
  { name: 'Salida de Stock',  path: '/stock/out',     icon: ArrowDownCircle },
];

export default function Layout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const handleLogout = async () => { await supabase.auth.signOut(); };
  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ item, onClick }: { item: typeof navItems[0]; onClick?: () => void }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    return (
      <Link
        to={item.path}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium group ${
          active
            ? 'bg-brand-green/20 text-brand-green'
            : 'text-slate-400 hover:bg-white/8 hover:text-white'
        }`}
      >
        <Icon className={`w-5 h-5 transition-colors ${active ? 'text-brand-green' : 'text-slate-500 group-hover:text-white'}`} />
        {item.name}
      </Link>
    );
  };

  const Sidebar = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full bg-brand-dark">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-green flex items-center justify-center shadow-lg shadow-brand-green/30">
              <span className="text-white text-xl font-bold">⌂</span>
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">HomeTrack</span>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5">Gestión del hogar</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:bg-white/10">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sección Nav */}
      <div className="px-3 pt-5 pb-2">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">Menú</p>
        <nav className="space-y-0.5">
          {navItems.map(item => <NavLink key={item.path} item={item} onClick={onClose} />)}
        </nav>
      </div>

      {/* Logout */}
      <div className="mt-auto px-3 pb-5 border-t border-white/10 pt-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 text-slate-500 rounded-xl hover:bg-brand-pink/20 hover:text-brand-pink transition-all text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F5FA]">

      {/* Sidebar DESKTOP */}
      <aside className="hidden md:block w-64 shrink-0 shadow-xl">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar MÓVIL */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-brand-dark shadow-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center shadow-md shadow-brand-green/30">
              <span className="text-white text-base font-bold">⌂</span>
            </div>
            <span className="text-sm font-bold text-white">HomeTrack</span>
          </div>
          <button onClick={() => setMenuOpen(true)} className="p-2 rounded-xl text-slate-400 hover:bg-white/10 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Drawer MÓVIL */}
        {menuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
            <div className="relative w-72 h-full shadow-2xl">
              <Sidebar onClose={() => setMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 pb-24 md:pb-8">
            <Outlet />
          </div>
        </main>

        {/* Bottom Nav MÓVIL */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-dark border-t border-white/10 flex items-center justify-around px-2 py-2 z-40">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${active ? 'text-brand-green' : 'text-slate-500'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.name.split(' ')[0]}</span>
              </Link>
            );
          })}
          <button onClick={handleLogout} className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-slate-500 hover:text-brand-pink transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-medium">Salir</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
