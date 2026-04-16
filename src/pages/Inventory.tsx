import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { Plus, Search, Package, CalendarDays } from 'lucide-react';

type Product = Database['public']['Tables']['products']['Row'] & {
  expiry_date?: string | null;
};

const statusConfig: Record<string, { label: string; color: string }> = {
  available:    { label: 'Disponible',   color: 'bg-green-100 text-green-700' },
  low:          { label: 'Stock Bajo',   color: 'bg-amber-100 text-amber-700' },
  out_of_stock: { label: 'Agotado',      color: 'bg-red-100 text-red-700' },
  to_buy:       { label: 'Por Comprar',  color: 'bg-blue-100 text-blue-700' },
};

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function expiryColor(dateStr: string | null | undefined) {
  if (!dateStr) return 'text-slate-400';
  const diff = (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (diff < 0)   return 'text-red-600 font-semibold';   // vencido
  if (diff <= 7)  return 'text-red-500 font-semibold';   // <= 7 días
  if (diff <= 30) return 'text-amber-600 font-semibold'; // <= 30 días
  return 'text-slate-500';
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? products.filter(
            p =>
              p.name.toLowerCase().includes(q) ||
              (p.category ?? '').toLowerCase().includes(q)
          )
        : products
    );
  }, [search, products]);

  const fetchProducts = async () => {
    setLoading(true);

    // Traer productos
    const { data: prods } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (!prods) { setLoading(false); return; }

    // Para cada producto, traer la fecha de fin de la compra más reciente
    const productIds = prods.map(p => p.id);
    const { data: purchases } = await supabase
      .from('purchases')
      .select('product_id, expiry_date, created_at')
      .in('product_id', productIds)
      .not('expiry_date', 'is', null)
      .order('created_at', { ascending: false });

    // Mapear la expiry_date más reciente por producto
    const expiryMap: Record<string, string | null> = {};
    if (purchases) {
      for (const p of purchases) {
        if (!expiryMap[p.product_id]) {
          expiryMap[p.product_id] = p.expiry_date;
        }
      }
    }

    const enriched: Product[] = prods.map(p => ({
      ...p,
      expiry_date: expiryMap[p.id] ?? null,
    }));

    setProducts(enriched);
    setFiltered(enriched);
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Inventario</h2>
          <p className="text-slate-500 mt-0.5 text-sm">Gestiona todos los productos de tu hogar.</p>
        </div>
        <Link
          to="/inventory/new"
          className="shrink-0 inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo</span>
        </Link>
      </div>

      {/* Buscador */}
      <div className="glass p-3 rounded-2xl flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
          placeholder="Buscar por nombre o categoría..."
        />
      </div>

      {loading ? (
        <div className="glass rounded-2xl p-10 text-center text-slate-400 text-sm">
          Cargando inventario...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <div className="mx-auto w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Package className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            {search ? 'Sin resultados' : 'No hay productos'}
          </h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            {search
              ? 'Prueba con otro término de búsqueda.'
              : 'Agrega tu primer producto para empezar a llevar el control.'}
          </p>
          {!search && (
            <Link
              to="/inventory/new"
              className="mt-4 inline-flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Nuevo Producto
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* ── Tabla DESKTOP (md+) ── */}
          <div className="hidden md:block glass rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60">
                  <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoría</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Se acaba</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(product => {
                  const st = statusConfig[product.status ?? 'available'] ?? statusConfig['available'];
                  const dateFormatted = formatDate(product.expiry_date);
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-5 text-sm font-semibold text-slate-800">{product.name}</td>
                      <td className="py-3.5 px-5 text-sm text-slate-500">{product.category ?? '—'}</td>
                      <td className="py-3.5 px-5 text-sm text-slate-600">
                        {product.current_quantity ?? 0} <span className="text-slate-400 text-xs">{product.unit}</span>
                      </td>
                      <td className="py-3.5 px-5 text-sm">
                        {dateFormatted ? (
                          <span className={`flex items-center gap-1.5 ${expiryColor(product.expiry_date)}`}>
                            <CalendarDays className="w-3.5 h-3.5" />
                            {dateFormatted}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Tarjetas MÓVIL (< md) ── */}
          <div className="md:hidden space-y-3">
            {filtered.map(product => {
              const st = statusConfig[product.status ?? 'available'] ?? statusConfig['available'];
              const dateFormatted = formatDate(product.expiry_date);
              return (
                <div key={product.id} className="glass rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-800 text-sm truncate">{product.name}</p>
                      <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {product.category ?? '—'} · {product.current_quantity ?? 0} {product.unit}
                    </p>
                    {dateFormatted && (
                      <p className={`text-xs mt-1 flex items-center gap-1 ${expiryColor(product.expiry_date)}`}>
                        <CalendarDays className="w-3 h-3" />
                        Se acaba: {dateFormatted}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
