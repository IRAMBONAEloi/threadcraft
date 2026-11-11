import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      const token = searchParams.get('token');

      if (!token) {
        navigate('/login?error=no_token');
        return;
      }

      // Save token to storage
      localStorage.setItem('token', token);

      // Fetch user profile to confirm the token works
      try {
        const user = await authApi.getMe();
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/');
      } catch (error) {
        navigate('/login?error=invalid_token');
      }
    }

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <p className="font-mono text-text-dim">Signing you in...</p>
    </div>
  );
}