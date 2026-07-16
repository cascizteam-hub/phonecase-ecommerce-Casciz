import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getUsersApi } from '../api/users';
import Loader from '../components/Loader';

export default function Customers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');

  useEffect(() => {
    getUsersApi({ keyword: searchParams.get('keyword') || undefined, limit: 50 }).then(setData);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (keyword) next.set('keyword', keyword);
    else next.delete('keyword');
    setSearchParams(next);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Customers</h1>

      <form onSubmit={handleSearch} className="mb-4">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search by name or email…"
          className="rounded border border-gray-300 px-3 py-1.5 text-sm w-64"
        />
      </form>

      {!data ? (
        <Loader />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.users.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{u.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/customers/${u._id}`} className="text-gray-600 hover:text-gray-900">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {data.users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
