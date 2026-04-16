import { Link } from 'react-router-dom';
import { AlertCircle, ShoppingCart, TrendingDown, PlusCircle } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-brand-dark tracking-tight">Análisis de compras</h2>
        <p className="text-slate-500 mt-1 text-sm">Resumen del estado de tu hogar.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="glass p-5 rounded-2xl flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Gasto del Mes</p>
            <h3 className="text-2xl font-bold text-brand-dark">$0.00</h3>
          </div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#38CE3C1A' }}>
            <TrendingDown className="w-5 h-5 text-brand-green" />
          </div>
        </div>

        <div className="glass p-5 rounded-2xl flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Por Agotarse</p>
            <h3 className="text-2xl font-bold text-brand-dark">0</h3>
          </div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#FFDE731A' }}>
            <AlertCircle className="w-5 h-5 text-brand-yellow" />
          </div>
        </div>

        <div className="glass p-5 rounded-2xl flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Lista de Compras</p>
            <h3 className="text-2xl font-bold text-brand-dark">0</h3>
          </div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#8E32E91A' }}>
            <ShoppingCart className="w-5 h-5 text-brand-purple" />
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/inventory/new"
          className="glass p-5 rounded-2xl flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all group text-center"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: '#38CE3C1A' }}>
            <PlusCircle className="w-6 h-6 text-brand-green" />
          </div>
          <span className="text-sm font-semibold text-brand-dark">Nuevo Producto</span>
        </Link>

        <Link
          to="/purchases/new"
          className="glass p-5 rounded-2xl flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all group text-center"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: '#8E32E91A' }}>
            <ShoppingCart className="w-6 h-6 text-brand-purple" />
          </div>
          <span className="text-sm font-semibold text-brand-dark">Registrar Compra</span>
        </Link>
      </div>

      {/* Actividad reciente */}
      <div className="glass p-5 rounded-2xl">
        <h3 className="text-base font-bold text-brand-dark mb-4">Actividad Reciente</h3>
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">Aún no hay actividad registrada.</p>
        </div>
      </div>
    </div>
  );
}
