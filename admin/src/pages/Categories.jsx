import { useEffect, useState } from 'react';
import { getCategoriesApi, createCategoryApi, updateCategoryApi, deleteCategoryApi } from '../api/categories';
import ImageUploader from '../components/ImageUploader';
import Loader from '../components/Loader';

const emptyForm = { name: '', description: '' };

export default function Categories() {
  const [categories, setCategories] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => getCategoriesApi().then((data) => setCategories(data.categories));

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setImage(null);
    setEditingId(null);
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setForm({ name: cat.name, description: cat.description || '' });
    setImage(cat.image?.url ? cat.image : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, image: image || undefined };
      if (editingId) {
        await updateCategoryApi(editingId, payload);
      } else {
        await createCategoryApi(payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!confirm(`Delete "${cat.name}"?`)) return;
    await deleteCategoryApi(cat._id);
    load();
  };

  if (!categories) return <Loader />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Categories</h1>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((c) => (
                <tr key={c._id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.slug}</td>
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
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                    No categories yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 h-fit">
        <h2 className="font-semibold text-gray-900 mb-4">{editingId ? 'Edit Category' : 'New Category'}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <ImageUploader images={image ? [image] : []} onChange={(imgs) => setImage(imgs[0] || null)} multiple={false} />
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Description"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-gray-600 text-sm px-2">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
