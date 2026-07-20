import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
      <div className="w-full max-w-sm bg-[#181818] border border-[#2A2A2A] rounded-xl p-8">
        <h1 className="text-xl font-bold text-white mb-1">
          Cas<span className="text-[#D90429]">ciz</span> Admin
        </h1>
        <p className="text-sm text-[#B0B0B0] mb-6">Sign in to manage your store.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded border border-[#2A2A2A] bg-[#0D0D0D] text-white placeholder-[#7a7a7a] px-3 py-2 outline-none focus:border-[#D90429] transition-colors"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded border border-[#2A2A2A] bg-[#0D0D0D] text-white placeholder-[#7a7a7a] px-3 py-2 outline-none focus:border-[#D90429] transition-colors"
          />
          {error && <p className="text-[#FF1F3D] text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#D90429] hover:bg-[#FF1F3D] text-white font-medium py-2.5 rounded-lg disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
