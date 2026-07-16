import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { changePasswordApi } from '../api/auth';

export default function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      await changePasswordApi(form);
      setMessage('Password updated successfully.');
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-sm">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-2">Admin Account</h2>
        <p className="text-sm text-gray-600">{user?.name}</p>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            required
            type="password"
            placeholder="Current password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            required
            type="password"
            minLength={6}
            placeholder="New password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
          {message && <p className="text-green-600 text-sm">{message}</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 self-start"
          >
            {saving ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
