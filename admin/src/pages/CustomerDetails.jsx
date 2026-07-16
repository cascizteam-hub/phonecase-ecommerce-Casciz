import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getUserApi, updateUserApi } from '../api/users';
import Loader from '../components/Loader';

export default function CustomerDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => getUserApi(id).then(setData);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!data) return <Loader />;

  const { user, orders } = data;

  const toggleActive = async () => {
    setSaving(true);
    try {
      await updateUserApi(user._id, { isActive: !user.isActive });
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h1>
      <p className="text-gray-500 mb-6">
        {user.email} {user.phone && `· ${user.phone}`}
      </p>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Role</p>
          <p className="font-medium text-gray-900 capitalize">{user.role}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <p className="font-medium text-gray-900">{user.isActive ? 'Active' : 'Deactivated'}</p>
        </div>
        <button
          onClick={toggleActive}
          disabled={saving}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            user.isActive ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
          }`}
        >
          {user.isActive ? 'Deactivate' : 'Reactivate'}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Order History</h2>
        <div className="flex flex-col divide-y divide-gray-100">
          {orders.map((o) => (
            <Link
              key={o._id}
              to={`/orders/${o._id}`}
              className="flex justify-between py-2 text-sm hover:text-gray-900"
            >
              <span className="text-gray-600">
                #{o._id.slice(-8)} · {new Date(o.createdAt).toLocaleDateString()}
              </span>
              <span className="font-medium text-gray-900">₹{o.totalPrice}</span>
            </Link>
          ))}
          {orders.length === 0 && <p className="text-gray-400 text-sm">No orders yet.</p>}
        </div>
      </div>
    </div>
  );
}
