import { useEffect, useState } from 'react';
import { getSalesAnalyticsApi } from '../api/dashboard';
import Loader from '../components/Loader';

export default function Analytics() {
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    getSalesAnalyticsApi(period).then(setData);
  }, [period]);

  const maxRevenue = data ? Math.max(...data.sales.map((s) => s.revenue), 1) : 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="12m">Last 12 months</option>
        </select>
      </div>

      {!data ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Revenue by Day</h2>
            {data.sales.length === 0 ? (
              <p className="text-gray-400 text-sm">No paid orders in this period.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {data.sales.map((s) => (
                  <div key={s._id} className="flex items-center gap-3 text-sm">
                    <span className="w-24 text-gray-500 shrink-0">{s._id}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gray-900 h-full rounded-full"
                        style={{ width: `${(s.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="w-20 text-right text-gray-900 font-medium">₹{s.revenue}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Top Products</h2>
            {data.topProducts.length === 0 ? (
              <p className="text-gray-400 text-sm">No sales data yet.</p>
            ) : (
              <div className="flex flex-col divide-y divide-gray-100">
                {data.topProducts.map((p) => (
                  <div key={p._id} className="flex justify-between py-2 text-sm">
                    <span className="text-gray-700">
                      {p.name} <span className="text-gray-400">× {p.unitsSold}</span>
                    </span>
                    <span className="font-medium text-gray-900">₹{p.revenue}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
