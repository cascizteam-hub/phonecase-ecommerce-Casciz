import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [tab, setTab] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get('redirect') || location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginForm);
      showToast('Login successful!');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (regForm.password !== regForm.confirm) {
      setError('Passwords do not match!');
      return;
    }
    setLoading(true);
    try {
      await register({ name: regForm.name, email: regForm.email, password: regForm.password });
      showToast('Account created successfully!');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>My Account</h1>
        <div className="breadcrumb"><Link to="/">Home</Link> <span>/</span> <span>Account</span></div>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-tabs">
            <button type="button" className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Login</button>
            <button type="button" className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>Register</button>
          </div>

          {tab === 'login' ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" required placeholder="your@email.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" required placeholder="Enter your password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
              </div>
              <div className="form-row">
                <label><input type="checkbox" /> Remember me</label>
                <a href="#">Forgot password?</a>
              </div>
              {error && <p style={{ color: '#e74c3c', fontSize: 13 }}>{error}</p>}
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Logging in…' : 'Login'}</button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegister}>
              <div className="form-group">
                <label>Full Name</label>
                <input required placeholder="John Doe" value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" required placeholder="your@email.com" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" required minLength={6} placeholder="Create a password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" required placeholder="Confirm your password" value={regForm.confirm} onChange={(e) => setRegForm({ ...regForm, confirm: e.target.value })} />
              </div>
              <div className="form-row">
                <label><input type="checkbox" required /> I agree to the <a href="#">Terms &amp; Conditions</a></label>
              </div>
              {error && <p style={{ color: '#e74c3c', fontSize: 13 }}>{error}</p>}
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creating account…' : 'Create Account'}</button>
            </form>
          )}

          <div className="auth-divider">or continue with</div>
          <div className="social-auth">
            <button type="button" onClick={() => showToast('Google login coming soon!')}>
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Google
            </button>
            <button type="button" onClick={() => showToast('Facebook login coming soon!')}>
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              Facebook
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
