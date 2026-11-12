import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState('');
  const [code, setCode] = useState('');

  const { login, verifyEmailOtp } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
  e.preventDefault();
  setError('');
  
  try {
    const result = await login(email, password);
    
    if (result.requires2FA) {
      setRequires2FA(true);
      setUserId(result.userId);
    } else if (result.user.role === 'OWNER') {
      navigate('/admin');
    } else {
      navigate('/account');
    }
  } catch (err: any) {
    setError(err.response?.data?.error?.message || 'Login failed');
  }
}

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    try {
     const result= await verifyEmailOtp(userId, code);
     if (result.user.role === 'OWNER'){
        navigate('/admin');
     }else{
        navigate('/account');
     }
      
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid code');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl border border-gray-800">
        <h2 className="text-2xl font-sora font-bold text-center mb-6">
          {requires2FA ? 'Two-Factor Authentication' : 'Welcome Back'}
        </h2>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {!requires2FA ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-text-dim mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-bg border border-gray-700 rounded-lg p-3 text-text outline-none focus:border-violet"
              />
            </div>
            <div>
              <label className="block text-sm text-text-dim mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-bg border border-gray-700 rounded-lg p-3 text-text outline-none focus:border-violet"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-violet hover:bg-violet/90 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Login
            </button>
            <div className="relative flex items-center justify-center my-6">
  <div className="border-t border-white/10 w-full"></div>
  <span className="bg-card px-3 text-xs text-text-dim font-mono uppercase tracking-widest absolute">OR</span>
</div>

        <a 
        href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`}
        className="w-full flex items-center justify-center gap-3 bg-white text-bg font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors"
        >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
        </a>


          </form>
        ) : (
          <form onSubmit={handleVerify2FA} className="space-y-4">
            <p className="text-sm text-text-dim text-center mb-4">
              We sent a 6-digit code to your email. Enter it below.
            </p>
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
                className="w-full bg-bg border border-gray-700 rounded-lg p-3 text-text text-center text-2xl tracking-widest outline-none focus:border-violet"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-mint hover:bg-mint/90 text-bg font-semibold py-3 rounded-lg transition-colors"
            >
              Verify Code
            </button>
          </form>
        )}

        {!requires2FA && (
          <p className="text-sm text-text-dim text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet hover:underline">
              Register
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}