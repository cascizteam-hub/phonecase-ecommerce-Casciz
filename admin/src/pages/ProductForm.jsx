import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductApi, createProductApi, updateProductApi } from '../api/products';
import { getCategoriesApi } from '../api/categories';
import ImageUploader from '../components/ImageUploader';
import Loader from '../components/Loader';

const emptyVariant = { model: '', color: '', sku: '', stock: 0, priceOverride: '' };

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    brand: '',
    category: '',
    price: '',
    discountPrice: '',
    material: '',
    tags: '',
    isFeatured: false,
    isActive: true,
  });
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([{ ...emptyVariant }]);

  useEffect(() => {
    getCategoriesApi().then((data) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getProductApi(id).then(({ product }) => {
      setForm({
        name: product.name,
        description: product.description,
        brand: product.brand || '',
        category: product.category?._id || '',
        price: product.price,
        discountPrice: product.discountPrice || '',
        material: product.material || '',
        tags: (product.tags || []).join(', '),
        isFeatured: product.isFeatured,
        isActive: product.isActive,
      });
      setImages(product.images || []);
      setVariants(product.variants?.length ? product.variants : [{ ...emptyVariant }]);
      setLoading(false);
    });
  }, [id, isEdit]);

  const updateVariant = (index, field, value) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const addVariant = () => setVariants((prev) => [...prev, { ...emptyVariant }]);
  const removeVariant = (index) => setVariants((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      images,
      variants: variants
        .filter((v) => v.model && v.sku)
        .map((v) => ({
          ...v,
          stock: Number(v.stock) || 0,
          priceOverride: v.priceOverride ? Number(v.priceOverride) : undefined,
        })),
    };

    try {
      if (isEdit) {
        await updateProductApi(id, payload);
      } else {
        await createProductApi(payload);
      }
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Product' : 'New Product'}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-gray-600">Product Images</label>
          <div className="mt-1">
            <ImageUploader images={images} onChange={setImages} />
          </div>
        </div>

        <input
          required
          placeholder="Product name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2"
        />
        <textarea
          required
          placeholder="Description"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Brand"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            className="rounded border border-gray-300 px-3 py-2"
          />
          <select
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded border border-gray-300 px-3 py-2"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            required
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="rounded border border-gray-300 px-3 py-2"
          />
          <input
            type="number"
            placeholder="Discount price (optional)"
            value={form.discountPrice}
            onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
            className="rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <input
          placeholder="Material"
          value={form.material}
          onChange={(e) => setForm({ ...form, material: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2"
        />
        <input
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2"
        />

        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            />
            Featured
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-900">Variants</label>
            <button type="button" onClick={addVariant} className="text-sm text-gray-600 underline">
              + Add variant
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 items-center">
                <input
                  placeholder="Model"
                  value={v.model}
                  onChange={(e) => updateVariant(i, 'model', e.target.value)}
                  className="rounded border border-gray-300 px-2 py-1.5 text-sm col-span-1"
                />
                <input
                  placeholder="Color"
                  value={v.color}
                  onChange={(e) => updateVariant(i, 'color', e.target.value)}
                  className="rounded border border-gray-300 px-2 py-1.5 text-sm col-span-1"
                />
                <input
                  placeholder="SKU"
                  value={v.sku}
                  onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                  className="rounded border border-gray-300 px-2 py-1.5 text-sm col-span-1"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={v.stock}
                  onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                  className="rounded border border-gray-300 px-2 py-1.5 text-sm col-span-1"
                />
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="text-red-600 text-sm col-span-1"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-gray-900 text-white font-medium px-5 py-2.5 rounded-lg disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Product'}
          </button>
          <button type="button" onClick={() => navigate('/products')} className="text-gray-600 px-5 py-2.5">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
