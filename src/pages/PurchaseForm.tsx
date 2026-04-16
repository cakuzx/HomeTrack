import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Save, Loader2, ShoppingBag, Store, CalendarDays, Package, Hash, DollarSign, StickyNote } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import type { Database } from '../types/supabase';

type Product = Database['public']['Tables']['products']['Row'];

export default function PurchaseForm() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emptyForm = {
    product_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    quantity: 1,
    price: 0,
    store: '',
    notes: '',
  };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data } = await supabase
      .from('products')
      .select('id, name, unit, current_quantity, category')
      .order('name');
    if (data) setProducts(data);
    setLoadingProducts(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!session?.user) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }
    if (!formData.product_id) {
      setError('Debes seleccionar un producto.');
      setLoading(false);
      return;
    }

    const insertPayload: Record<string, unknown> = {
      product_id: formData.product_id,
      user_id: session.user.id,
      purchase_date: formData.purchase_date,
      quantity: formData.quantity,
      price: formData.price,
      store: formData.store || null,
      notes: formData.notes || null,
      expiry_date: formData.expiry_date || null,
    };

    const { error: insertError } = await supabase.from('purchases').insert([insertPayload]);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Actualizar cantidad actual del producto
    const product = products.find(p => p.id === formData.product_id);
    if (product) {
      await supabase
        .from('products')
        .update({ current_quantity: (product.current_quantity || 0) + formData.quantity })
        .eq('id', product.id);
    }

    setSuccess(true);
    setFormData(emptyForm);
    setLoading(false);
  };

  const selectedProduct = products.find(p => p.id === formData.product_id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-xl">
            <ShoppingBag className="w-7 h-7 text-blue-600" />
          </div>
          Registrar Compra
        </h2>
        <p className="text-slate-500 mt-2 ml-14">
          Añade una nueva compra para actualizar el inventario automáticamente.
        </p>
      </div>

      {/* Mensaje de éxito */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-green-600 font-bold">✓</span>
          </div>
          <div>
            <p className="font-semibold">¡Compra registrada!</p>
            <p className="text-sm text-green-600">El inventario fue actualizado correctamente.</p>
          </div>
        </div>
      )}

      {/* Formulario */}
      <div className="glass rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Selección de Producto */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" /> Producto
            </label>
            <select
              name="product_id"
              required
              value={formData.product_id}
              onChange={handleChange}
              disabled={loadingProducts}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-xl py-3 px-4 border bg-white/60 focus:bg-white transition-colors disabled:opacity-50"
            >
              <option value="">
                {loadingProducts ? 'Cargando productos...' : 'Selecciona un producto...'}
              </option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.category ? `(${p.category})` : ''} — Stock: {p.current_quantity ?? 0} {p.unit}
                </option>
              ))}
            </select>
            {selectedProduct && (
              <p className="mt-2 text-xs text-slate-500">
                Stock actual: <span className="font-semibold text-slate-700">{selectedProduct.current_quantity ?? 0} {selectedProduct.unit}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Cantidad */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Hash className="w-4 h-4 text-blue-500" /> Cantidad
              </label>
              <input
                type="number"
                name="quantity"
                required
                min="0.01"
                step="0.01"
                value={formData.quantity}
                onChange={handleChange}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-xl py-3 px-4 border bg-white/60 focus:bg-white transition-colors"
              />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-500" /> Precio Total ($)
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-xl py-3 px-4 border bg-white/60 focus:bg-white transition-colors"
              />
            </div>

            {/* Fecha de Compra */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-500" /> Fecha de Compra
              </label>
              <input
                type="date"
                name="purchase_date"
                required
                value={formData.purchase_date}
                onChange={handleChange}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-xl py-3 px-4 border bg-white/60 focus:bg-white transition-colors"
              />
            </div>

            {/* Fecha de caducidad */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-slate-400" /> Fecha Estimada de Fin
                <span className="text-xs text-slate-400 font-normal">(opcional)</span>
              </label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-xl py-3 px-4 border bg-white/60 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Tienda */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Store className="w-4 h-4 text-blue-500" /> Tienda
              <span className="text-xs text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              name="store"
              value={formData.store}
              onChange={handleChange}
              placeholder="Ej. Walmart, Chedraui, Mercado..."
              className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-xl py-3 px-4 border bg-white/60 focus:bg-white transition-colors"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-blue-500" /> Notas
              <span className="text-xs text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Observaciones, marca preferida, descuentos..."
              className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-xl py-3 px-4 border bg-white/60 focus:bg-white transition-colors resize-none"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm p-4 bg-red-50 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="pt-2 flex items-center justify-between">
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
              className="inline-flex items-center gap-2 py-3 px-6 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all duration-200"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Guardar Compra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
