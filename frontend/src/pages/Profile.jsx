import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '' });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateProfile(form);
      setMessage('Profile updated successfully.');
    } catch {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto py-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">My Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input disabled value={user.email} className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 mt-1" />
        </div>
        <div>
          <label className="text-sm text-gray-600">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded border border-gray-300 px-3 py-2 mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded border border-gray-300 px-3 py-2 mt-1"
          />
        </div>
        {message && <p className="text-sm text-gray-600">{message}</p>}
        <button
          type="submit"
          disabled={saving}
          className="bg-gray-900 text-white font-medium py-2.5 rounded-full disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
