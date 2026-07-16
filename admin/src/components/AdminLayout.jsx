import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/products', label: 'Products' },
  { to: '/categories', label: 'Categories' },
  { to: '/orders', label: 'Orders' },
  { to: '/customers', label: 'Customers' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/coupons', label: 'Coupons' },
  { to: '/settings', label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 shrink-0 bg-gray-900 text-gray-200 flex flex-col">
        <div className="px-5 py-5 text-white font-bold text-lg border-b border-gray-800">
          CaseCraft Admin
        </div>
        <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-800 text-sm">
          <p className="text-white font-medium">{user?.name}</p>
          <p className="text-gray-500 text-xs mb-2">{user?.email}</p>
          <button onClick={logout} className="text-red-400 hover:text-red-300 text-sm">
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}
