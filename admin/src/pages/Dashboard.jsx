import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardSummaryApi } from '../api/dashboard';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getDashboardSummaryApi().then(setSummary);
  }, []);

  if (!summary) return <Loader />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={summary.totalOrders} />
        <StatCard label="Total Revenue" value={`₹${summary.totalRevenue}`} hint="Paid orders only" />
        <StatCard label="Customers" value={summary.totalCustomers} />
        <StatCard label="Active Products" value={summary.totalProducts} />
      </div>

      {summary.lowStockCount > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm flex items-center justify-between">
          <span>{summary.lowStockCount} product(s) are low on stock.</span>
          <Link to="/inventory" className="font-medium underline">
            View inventory →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Orders by Status</h2>
          <div className="flex flex-col gap-2 text-sm">
            {Object.entries(summary.ordersByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between">
                <span className="capitalize text-gray-600">{status}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Recent Orders</h2>
          <div className="flex flex-col divide-y divide-gray-100">
            {summary.recentOrders.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="flex justify-between py-2 text-sm hover:text-gray-900"
              >
                <span className="text-gray-600">{order.user?.name || 'Unknown'}</span>
                <span className="font-medium text-gray-900">₹{order.totalPrice}</span>
              </Link>
            ))}
            {summary.recentOrders.length === 0 && <p className="text-gray-400 text-sm">No orders yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
