import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }

    authApi.verifyEmail(token)
      .then((data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setStatus('success');
        setTimeout(() => navigate('/'), 2000);
      })
      .catch(() => setStatus('error'));
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-card p-8 rounded-2xl border border-white/10 text-center">
        {status === 'loading' && <p className="text-text-dim font-mono">Verifying your email...</p>}
        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✓</div>
            <h2 className="font-sora font-bold text-2xl mb-2">Email Verified</h2>
            <p className="text-text-dim">Redirecting to the store...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h2 className="font-sora font-bold text-2xl mb-2 text-coral">Verification Failed</h2>
            <p className="text-text-dim">The link is invalid or expired.</p>
          </>
        )}
      </div>
    </div>
  );
}