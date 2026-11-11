import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    try {
      await register({ firstName, lastName, email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl border border-gray-800">
        <h2 className="text-2xl font-sora font-bold text-center mb-6">
          Create an Account
        </h2>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-text-dim mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full bg-bg border border-gray-700 rounded-lg p-3 text-text outline-none focus:border-violet"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-text-dim mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full bg-bg border border-gray-700 rounded-lg p-3 text-text outline-none focus:border-violet"
              />
            </div>
          </div>
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
              minLength={8}
              className="w-full bg-bg border border-gray-700 rounded-lg p-3 text-text outline-none focus:border-violet"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-violet hover:bg-violet/90 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Register
          </button>
        </form>

        <p className="text-sm text-text-dim text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-violet hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}