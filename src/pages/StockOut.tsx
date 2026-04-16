import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import type { Database } from '../types/supabase';
import { ArrowDownCircle, Package, Save, Loader2, StickyNote, Hash } from 'lucide-react';

type Product = Database['public']['Tables']['products']['Row'];

const REASONS = [
  'Consumo del hogar',
  'Vencido / caducado',
  'Dañado / roto',
  'Regalado',
  'Pérdida',
  'Otro',
];

function getNewStatus(newQty: number, minQty: number | null): string {
  if (newQty <= 0)                       return 'out_of_stock';
  if (newQty <= (minQty ?? 1))           return 'low';
  return 'available';
}

export default function StockOut() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const emptyForm = {
    product_id: '',
    quantity: 1,
    reason: 'Consumo del hogar',
    notes: '',
  };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (data) setProducts(data);
        setLoadingProducts(false);
      });
  }, []);

  const selectedProduct = products.find(p => p.id === formData.product_id);
  const remaining = selectedProduct
    ? (selectedProduct.current_quantity ?? 0) - formData.quantity
    : null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!session?.user) { setError('Usuario no autenticado'); return; }
    if (!formData.product_id) { setError('Selecciona un producto.'); return; }
    if (!selectedProduct) { setError('Producto no encontrado.'); return; }

    const currentQty = selectedProduct.current_quantity ?? 0;
    if (formData.quantity <= 0) { setError('La cantidad debe ser mayor a 0.'); return; }
    if (formData.quantity > currentQty) {
      setError(`Stock insuficiente. Solo hay ${currentQty} ${selectedProduct.unit} disponibles.`);
      return;
    }

    setLoading(true);

    const newQty = currentQty - formData.quantity;
    const newStatus = getNewStatus(newQty, selectedProduct.min_quantity);

    const { error: updateError } = await supabase
      .from('products')
      .update({ current_quantity: newQty, status: newStatus })
      .eq('id', formData.product_id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Refrescar lista de productos con nuevo stock
    const { data: updated } = await supabase.from('products').select('*').order('name');
    if (updated) setProducts(updated);

    setSuccess(
      `✓ Se descontaron ${formData.quantity} ${selectedProduct.unit} de "${selectedProduct.name}". Stock restante: ${newQty} ${selectedProduct.unit}.${
        newStatus === 'out_of_stock' ? ' ⚠️ Producto agotado.' : newStatus === 'low' ? ' ⚠️ Stock bajo.' : ''
      }`
    );
    setFormData(emptyForm);
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FF4D6B1A' }}>
          <ArrowDownCircle className="w-6 h-6 text-brand-pink" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-brand-dark tracking-tight">Salida de Stock</h2>
          <p className="text-slate-500 text-sm mt-0.5">Descuenta unidades del inventario.</p>
        </div>
      </div>

      {/* Éxito */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 flex items-start gap-3">
          <span className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600 shrink-0 mt-0.5">✓</span>
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* Formulario */}
      <div className="glass rounded-2xl p-5 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Producto */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-pink" /> Producto
            </label>
            <select
              name="product_id"
              required
              value={formData.product_id}
              onChange={handleChange}
              disabled={loadingProducts}
              className="w-full py-3 px-4 text-sm border border-slate-200 rounded-xl bg-white/70 focus:bg-white focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink outline-none transition disabled:opacity-50"
            >
              <option value="">{loadingProducts ? 'Cargando...' : 'Selecciona un producto...'}</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — Stock: {p.current_quantity ?? 0} {p.unit}
                </option>
              ))}
            </select>

            {/* Preview stock */}
            {selectedProduct && (
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                  <p className="text-slate-400">Stock actual</p>
                  <p className="font-bold text-brand-dark mt-0.5">{selectedProduct.current_quantity ?? 0} <span className="font-normal text-slate-400">{selectedProduct.unit}</span></p>
                </div>
                <div className="bg-brand-pink/10 rounded-xl p-2.5 text-center border border-brand-pink/20">
                  <p className="text-brand-pink">A descontar</p>
                  <p className="font-bold text-brand-dark mt-0.5">{formData.quantity} <span className="font-normal text-slate-400">{selectedProduct.unit}</span></p>
                </div>
                <div className={`rounded-xl p-2.5 text-center border ${
                  remaining !== null && remaining <= 0
                    ? 'bg-red-50 border-red-200'
                    : remaining !== null && remaining <= (selectedProduct.min_quantity ?? 1)
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-green-50 border-green-100'
                }`}>
                  <p className="text-slate-400">Restará</p>
                  <p className={`font-bold mt-0.5 ${
                    remaining !== null && remaining <= 0 ? 'text-brand-pink' :
                    remaining !== null && remaining <= (selectedProduct.min_quantity ?? 1) ? 'text-brand-yellow' :
                    'text-brand-green'
                  }`}>
                    {remaining !== null ? `${Math.max(remaining, 0)} ${selectedProduct.unit}` : '—'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
              <Hash className="w-4 h-4 text-brand-pink" /> Cantidad a descontar
            </label>
            <input
              type="number"
              name="quantity"
              required
              min="0.01"
              step="0.01"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full py-3 px-4 text-sm border border-slate-200 rounded-xl bg-white/70 focus:bg-white focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink outline-none transition"
            />
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Motivo</label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full py-3 px-4 text-sm border border-slate-200 rounded-xl bg-white/70 focus:bg-white focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink outline-none transition"
            >
              {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-slate-400" /> Notas
              <span className="text-xs font-normal text-slate-400">(opcional)</span>
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Detalles adicionales sobre esta salida..."
              className="w-full py-3 px-4 text-sm border border-slate-200 rounded-xl bg-white/70 focus:bg-white focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink outline-none transition resize-none"
            />
          </div>

          {error && (
            <div className="text-sm text-brand-pink p-3 bg-red-50 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              ← Ver Inventario
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 py-3 px-5 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-all shadow-sm"
              style={{ background: '#FF4D6B' }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Registrar Salida
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
