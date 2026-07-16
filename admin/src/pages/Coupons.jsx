import { useEffect, useState } from 'react';
import { getCouponsApi, createCouponApi, updateCouponApi, deleteCouponApi } from '../api/coupons';
import Loader from '../components/Loader';

const emptyForm = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  maxDiscountAmount: '',
  minOrderAmount: '',
  usageLimit: '',
  expiresAt: '',
  isActive: true,
};

export default function Coupons() {
  const [coupons, setCoupons] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => getCouponsApi().then((data) => setCoupons(data.coupons));

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (c) => {
    setEditingId(c._id);
    setForm({
      code: c.code,
      description: c.description || '',
      discountType: c.discountType,
      discountValue: c.discountValue,
      maxDiscountAmount: c.maxDiscountAmount || '',
      minOrderAmount: c.minOrderAmount || '',
      usageLimit: c.usageLimit ?? '',
      expiresAt: c.expiresAt?.slice(0, 10) || '',
      isActive: c.isActive,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      };
      if (editingId) {
        await updateCouponApi(editingId, payload);
      } else {
        await createCouponApi(payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c) => {
    if (!confirm(`Delete coupon "${c.code}"?`)) return;
    await deleteCouponApi(c._id);
    load();
  };

  if (!coupons) return <Loader />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Coupons</h1>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Used</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.code}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.usedCount}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ''}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(c.expiresAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button onClick={() => handleEdit(c)} className="text-gray-600 hover:text-gray-900">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(c)} className="text-red-600 hover:text-red-700">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No coupons yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 h-fit">
        <h2 className="font-semibold text-gray-900 mb-4">{editingId ? 'Edit Coupon' : 'New Coupon'}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-sm">
          <input
            required
            placeholder="Code (e.g. SAVE10)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="rounded border border-gray-300 px-3 py-2"
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded border border-gray-300 px-3 py-2"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.discountType}
              onChange={(e) => setForm({ ...form, discountType: e.target.value })}
              className="rounded border border-gray-300 px-3 py-2"
            >
              <option value="percentage">Percentage</option>
              <option value="flat">Flat</option>
            </select>
            <input
              required
              type="number"
              placeholder="Value"
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
              className="rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Max discount"
              value={form.maxDiscountAmount}
              onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
              className="rounded border border-gray-300 px-3 py-2"
            />
            <input
              type="number"
              placeholder="Min order amount"
              value={form.minOrderAmount}
              onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
              className="rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <input
            type="number"
            placeholder="Usage limit (blank = unlimited)"
            value={form.usageLimit}
            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
            className="rounded border border-gray-300 px-3 py-2"
          />
          <input
            required
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            className="rounded border border-gray-300 px-3 py-2"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>

          {error && <p className="text-red-600 text-xs">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-gray-600 px-2">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
