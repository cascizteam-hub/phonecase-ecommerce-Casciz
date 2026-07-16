import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-gray-500 mb-6">Page not found.</p>
      <Link to="/" className="text-gray-900 font-medium underline">
        Go back home
      </Link>
    </div>
  );
}
