import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="cart-empty">
      <h1 style={{ fontSize: 56, color: 'var(--red)', marginBottom: 8 }}>404</h1>
      <p style={{ marginBottom: 24 }}>Page not found.</p>
      <Link to="/" className="btn-primary">Go back home</Link>
    </div>
  );
}
