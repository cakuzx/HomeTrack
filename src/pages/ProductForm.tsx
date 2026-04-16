import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';

const CATEGORIES = ['Alimentos', 'Limpieza', 'Higiene', 'Bebidas', 'Mascotas', 'Otros'];
const UNITS = ['unidades', 'kg', 'gramos', 'litros', 'ml', 'cajas', 'bolsas'];

export default function ProductForm() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emptyForm = {
    name: '',
    category: '',
    unit: 'unidades',
    current_quantity: 0,
    min_quantity: 1,
    notes: '',
    status: 'available',
  };
  const [formData, setFormData] = useState(emptyForm);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'current_quantity' || name === 'min_quantity' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!session?.user) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('products').insert([
      { ...formData, user_id: session.user.id },
    ]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
      setFormData(emptyForm);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/inventory')}
          className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Nuevo Producto</h2>
          <p className="text-slate-500 text-sm mt-0.5">Registra un artículo en tu inventario.</p>
        </div>
      </div>

      {/* Éxito */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 flex items-center gap-3">
          <span className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600 shrink-0">✓</span>
          <div>
            <p className="font-semibold text-sm">¡Producto guardado!</p>
            <p className="text-xs text-green-600">Puedes agregar otro o regresar al inventario.</p>
          </div>
        </div>
      )}

      {/* Formulario */}
      <div className="glass rounded-2xl p-5 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre del Producto *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej. Leche Deslactosada"
              className="w-full py-3 px-4 text-sm border border-slate-300 rounded-xl bg-white/60 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Categoría y Unidad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Categoría</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full py-3 px-4 text-sm border border-slate-300 rounded-xl bg-white/60 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="">Sin categoría</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unidad</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full py-3 px-4 text-sm border border-slate-300 rounded-xl bg-white/60 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                {UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cantidades */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stock Inicial</label>
              <input
                type="number"
                name="current_quantity"
                min="0"
                step="0.01"
                value={formData.current_quantity}
                onChange={handleChange}
                className="w-full py-3 px-4 text-sm border border-slate-300 rounded-xl bg-white/60 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mínimo (Alerta)</label>
              <input
                type="number"
                name="min_quantity"
                min="0"
                step="0.01"
                value={formData.min_quantity}
                onChange={handleChange}
                className="w-full py-3 px-4 text-sm border border-slate-300 rounded-xl bg-white/60 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Notas <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Marca preferida, dónde comprarlo..."
              className="w-full py-3 px-4 text-sm border border-slate-300 rounded-xl bg-white/60 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 p-3 bg-red-50 rounded-xl border border-red-100">
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
              className="inline-flex items-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-all shadow-sm shadow-blue-100"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Save className="w-4 h-4" />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
