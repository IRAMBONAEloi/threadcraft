import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    async function handleCallback() {
      const token = searchParams.get('token');

      if (!token) {
        navigate('/login?error=no_token');
        return;
      }

      try {
        const user = await loginWithToken(token);


        if (user.role === 'OWNER') {
            navigate('/admin');
        }else {
             navigate('/account');
        }
       
      } catch (error) {
        navigate('/login?error=invalid_token');
      }
    }

    handleCallback();
  }, [navigate, searchParams, loginWithToken]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <p className="font-mono text-text-dim">Signing you in...</p>
    </div>
  );
}