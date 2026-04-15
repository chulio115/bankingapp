import { useState, useEffect } from 'react';
import netlifyIdentity from 'netlify-identity-widget';
import { useAuthStore } from './store/useAuthStore';
import { useFinanceStore } from './store/useFinanceStore';
import { ensureUser } from './lib/db';
import BottomNav from './components/layout/BottomNav';
import Overview from './screens/Overview/index';
import Positions from './screens/Positions/index';
import Debts from './screens/Debts/index';
import Settings from './screens/Settings/index';

async function goTrueLogin(email: string, password: string) {
  const res = await fetch('/.netlify/identity/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=password&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error_description || err.msg || 'Login fehlgeschlagen');
  }
  const tokenData = await res.json();

  const userRes = await fetch('/.netlify/identity/user', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!userRes.ok) throw new Error('Benutzer konnte nicht geladen werden');
  const userData = await userRes.json();

  localStorage.setItem('gotrue.user', JSON.stringify({
    ...userData,
    token: {
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + tokenData.expires_in * 1000,
    },
  }));

  return { id: userData.id, email: userData.email, name: userData.user_metadata?.full_name || userData.email?.split('@')[0] || 'User' };
}

function LoginScreen({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    console.log('[Login] Submitting...', { email });
    setLoading(true);
    setError('');
    try {
      await onLogin(email, password);
      console.log('[Login] Success');
    } catch (err) {
      console.error('[Login] Error:', err);
      setError((err as Error)?.message || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a1a', padding: 20, paddingTop: '20vh' }}>
      <div style={{ maxWidth: 320, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 5, color: '#e2e2ff' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: 10, fontSize: 16, background: '#0e0e20', border: '1px solid #333', color: '#e2e2ff' }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 5, color: '#e2e2ff' }}>Passwort</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: 10, fontSize: 16, background: '#0e0e20', border: '1px solid #333', color: '#e2e2ff' }}
          />
        </div>
        {error && <div style={{ color: '#F0997B', fontSize: 14, marginBottom: 15 }}>{error}</div>}
        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password}
          style={{ width: '100%', padding: 12, fontSize: 16, background: loading ? '#555' : '#7c6fe0', color: '#fff', border: 'none', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Anmelden...' : 'Anmelden'}
        </button>
      </div>
    </div>
  );
}

function App() {
  const { user, setUser, isLoading, setLoading } = useAuthStore();
  const loadData = useFinanceStore((state) => state.loadData);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const existingUser = netlifyIdentity.currentUser();
    if (existingUser) {
      const userData = {
        id: existingUser.id,
        name: existingUser.user_metadata?.full_name || existingUser.email?.split('@')[0] || 'User',
        email: existingUser.email || '',
      };
      setUser(userData);
      ensureUser(existingUser.id, existingUser.email || '', userData.name)
        .then(() => loadData(existingUser.id))
        .then(() => setLoading(false))
        .catch((err) => {
          console.error('Error loading data for existing user:', err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    netlifyIdentity.on('logout', () => {
      setUser(null);
    });
  }, []);

  const handleLogin = async (email: string, password: string) => {
    console.log('[App] handleLogin called', { email });
    try {
      const user = await goTrueLogin(email, password);
      console.log('[App] goTrueLogin success', user);
      setUser(user);
      setLoading(true);
      await ensureUser(user.id, user.email, user.name);
      await loadData(user.id);
    } catch (err) {
      console.error('[App] Login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #141428 0%, #1a1a36 100%)' }}>
            <span className="text-lg font-bold text-[#b8b2f0]">H</span>
          </div>
          <div className="text-[#555577] text-xs">Laden...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      {activeTab === 'overview' && <Overview />}
      {activeTab === 'positions' && <Positions />}
      {activeTab === 'debts' && <Debts />}
      {activeTab === 'settings' && <Settings />}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
