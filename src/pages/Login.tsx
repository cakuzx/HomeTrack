import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function Login() {
  const { session } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'info' } | null>(null);

  if (session) return <Navigate to="/" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage({ text: error.message, type: 'error' });
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!email || !password) { setMessage({ text: 'Ingresa tu correo y contraseña primero.', type: 'error' }); return; }
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage({ text: error.message, type: 'error' });
    else setMessage({ text: '¡Cuenta creada! Revisa tu correo para confirmarla.', type: 'info' });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F5FA] flex flex-col justify-center px-4 py-10 relative overflow-hidden">
      {/* Blobs de fondo */}
      <div className="pointer-events-none absolute -top-40 -right-20 w-96 h-96 rounded-full bg-brand-green opacity-10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-brand-purple opacity-10 blur-3xl" />

      {/* Logo */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-dark shadow-2xl mb-5">
          <span className="text-brand-green text-4xl">⌂</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-brand-dark tracking-tight">
          Bienvenido a HomeTrack
        </h1>
        <p className="mt-2 text-sm text-slate-500">Controla tu inventario y gastos del hogar</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm mx-auto glass rounded-2xl px-6 py-8">
        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-white/70 focus:bg-white focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-white/70 focus:bg-white focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green outline-none transition"
              />
            </div>
          </div>

          {message && (
            <div className={`text-sm p-3 rounded-xl border ${
              message.type === 'error' ? 'text-brand-pink bg-red-50 border-red-100' : 'text-green-700 bg-green-50 border-green-100'
            }`}>
              {message.text}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-1">
            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand-dark hover:opacity-90 disabled:opacity-60 transition-all shadow-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Entrar
            </button>
            <button
              type="button" onClick={handleSignUp} disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-brand-dark border-2 border-brand-green/50 bg-brand-green/10 hover:bg-brand-green/20 disabled:opacity-60 transition-all"
            >
              Registrarse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
