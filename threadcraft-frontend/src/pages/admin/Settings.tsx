import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function AdminSettings() {
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleGenerate() {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/auth/2fa/setup');
      setQrCode(response.data.data.qrCodeUrl);
      setSecret(response.data.data.secret);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to generate 2FA secret');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await apiClient.post('/auth/2fa/verify', { userId: user?.id, code });
      setSuccess('2FA has been successfully enabled!');
      setQrCode(null);
      setSecret(null);
      setCode('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg pt-20 px-6">
      <div className="max-w-2xl mx-auto">
        
        <Link to="/admin" className="text-text-dim text-sm hover:text-white mb-2 block">
          ← Back to Dashboard
        </Link>
        <h1 className="font-sora font-bold text-3xl text-white mb-8">Settings</h1>

        <div className="bg-card p-8 rounded-2xl border border-white/5">
          <h2 className="font-sora font-bold text-xl text-white mb-2">Two-Factor Authentication</h2>
          <p className="text-text-dim text-sm mb-6">
            Protect your owner account with an extra layer of security. Once enabled, you'll need a 6-digit code from your authenticator app to log in.
          </p>

          {error && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>
          )}

          {success && (
            <div className="bg-mint/10 text-mint p-3 rounded-lg mb-4 text-sm">{success}</div>
          )}

          {!qrCode && !success && (
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="bg-violet hover:bg-violet/90 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {isLoading ? 'Generating...' : 'Enable 2FA'}
            </button>
          )}

          {qrCode && (
            <div className="space-y-4">
              <p className="text-white font-semibold">1. Scan this QR code with Google Authenticator:</p>
              <div className="bg-white p-4 rounded-xl inline-block">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>

              <p className="text-white font-semibold">2. Or enter this secret manually:</p>
              <div className="bg-bg p-3 rounded-lg font-mono text-sm text-mint break-all">
                {secret}
              </div>

              <form onSubmit={handleVerify} className="pt-4 border-t border-white/10">
                <p className="text-white font-semibold mb-3">3. Enter the 6-digit code from your app to confirm:</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    maxLength={6}
                    placeholder="000000"
                    className="flex-1 bg-bg border border-white/10 rounded-lg p-3 text-white text-center text-xl tracking-widest outline-none focus:border-violet"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-mint hover:bg-mint/90 text-bg font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    {isLoading ? '...' : 'Confirm'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}