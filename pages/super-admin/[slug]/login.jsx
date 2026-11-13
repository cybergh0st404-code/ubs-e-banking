import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Shield, ArrowRight } from 'lucide-react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { useAuth } from '../../../utils/AuthContext';

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const { getAdminSecretSlug } = await import('../../../lib/security.js');
  const configuredSlug = getAdminSecretSlug();

  if (!configuredSlug || !slug || slug !== configuredSlug) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      validSlug: configuredSlug,
    },
  };
}

const SuperAdminLogin = ({ validSlug }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, adminSlug: validSlug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Invalid super admin credentials.');
        setLoading(false);
        return;
      }
      if (data.user && data.user.role === 'superadmin') {
        login(data.user);
        setLoading(false);
        router.push('/super-admin');
        return;
      }
      if (data.user && data.user.role === 'admin') {
        login(data.user);
        setLoading(false);
        router.push('/admin');
        return;
      }
      setError('You do not have Super Administrator privileges.');
      setLoading(false);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4 space-x-3">
            <img
              src="/ubslogo.png"
              alt="UBS"
              className="h-9 sm:h-10 w-auto flex-shrink-0 object-contain"
            />
            <span className="h-6 w-px bg-neutral-300"></span>
            <div className="text-primary-navy font-bold text-xl sm:text-2xl tracking-tight leading-none">
              E-Banking
            </div>
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Shield className="w-3.5 h-3.5 text-amber-700" />
            <span>Master Control</span>
          </div>
          <h1 className="text-2xl font-bold text-primary-navy mb-2">
            Super Admin Portal
          </h1>
          <p className="text-neutral-600 text-sm">
            Enter master credentials to access full system oversight & global controls
          </p>
        </div>

        {/* Login Card */}
        <div className="card shadow-bank-lg border-t-4 border-primary-navy">
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <Input
                label="Super Admin Email Address"
                type="email"
                placeholder="superadmin@bank.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <Input
                label="Master Password"
                type="password"
                placeholder="Enter your super admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-bank text-red-700 text-sm">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full flex items-center justify-center"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In as Super Admin'}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;

