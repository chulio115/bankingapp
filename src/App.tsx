import { useState, useEffect } from 'react';
import netlifyIdentity from 'netlify-identity-widget';
import { useAuthStore } from './store/useAuthStore';
import { useFinanceStore } from './store/useFinanceStore';
import { ensureUser, hasNeon } from './lib/db';
import BottomNav from './components/layout/BottomNav';
import Overview from './screens/Overview/index';
import Positions from './screens/Positions/index';
import Debts from './screens/Debts/index';
import Settings from './screens/Settings/index';

async function goTrueLogin(email: string, password: string) {
  const res = await fetch('/.netlify/identity/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=password&username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
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

function LoginScreen({ onLogin }: { onLogin: (u: { id: string; email: string; name: string }) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      const user = await goTrueLogin(email, password);
      onLogin(user);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#0a0a1a', paddingTop: '20vh', paddingLeft: 20, paddingRight: 20, paddingBottom: 40 }}>
      <div style={{ width: '100%', maxWidth: 320, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, margin: '0 auto 24px', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #141428 0%, #1a1a36 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: '#b8b2f0' }}>H</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e2e2ff', letterSpacing: '-0.01em', margin: '0 0 8px' }}>Haushalt</h1>
        <p style={{ fontSize: 14, color: '#555577', marginBottom: 40, lineHeight: 1.5 }}>
          Deine persönliche Finanzübersicht
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoCapitalize="none"
            autoCorrect="off"
            style={{ width: '100%', boxSizing: 'border-box', background: '#0e0e20', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px', fontSize: 16, color: '#e2e2ff', outline: 'none', fontFamily: 'inherit', WebkitAppearance: 'none' }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passwort"
            style={{ width: '100%', boxSizing: 'border-box', background: '#0e0e20', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px', fontSize: 16, color: '#e2e2ff', outline: 'none', fontFamily: 'inherit', WebkitAppearance: 'none' }}
          />
          {error && <div style={{ fontSize: 12, color: '#F0997B' }}>{error}</div>}
          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            style={{ fontSize: 14, fontWeight: 600, padding: '14px 0', borderRadius: 12, color: '#fff', border: 'none', background: 'linear-gradient(135deg, #7c6fe0 0%, #9b8ff0 100%)', boxShadow: '0 8px 24px rgba(124, 111, 224, 0.3)', opacity: loading || !email || !password ? 0.5 : 1 }}
          >
            {loading ? 'Laden...' : 'Anmelden'}
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { user, setUser, isLoading, setLoading } = useAuthStore();
  const loadData = useFinanceStore((state) => state.loadData);
  const [activeTab, setActiveTab] = useState('overview');
  const [dbError, setDbError] = useState<string | null>(null);

  const initUser = async (userId: string, email: string, name: string) => {
    try {
      await ensureUser(userId, email, name);
      await loadData(userId);
      setDbError(null);
    } catch (err) {
      console.error('DB Error:', err);
      setDbError(String((err as Error)?.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const existingUser = netlifyIdentity.currentUser();
    if (existingUser) {
      const userData = {
        id: existingUser.id,
        name: existingUser.user_metadata?.full_name || existingUser.email?.split('@')[0] || 'User',
        email: existingUser.email || '',
      };
      setUser(userData);
      initUser(existingUser.id, existingUser.email || '', userData.name);
    } else {
      setLoading(false);
    }

    netlifyIdentity.on('logout', () => {
      setUser(null);
      localStorage.removeItem('gotrue.user');
    });
  }, []);

  const handleLogin = async (u: { id: string; email: string; name: string }) => {
    setUser({ id: u.id, name: u.name, email: u.email });
    setLoading(true);
    await initUser(u.id, u.email, u.name);
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100dvh', background: '#0a0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, margin: '0 auto 12px', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #141428 0%, #1a1a36 100%)' }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#b8b2f0' }}>H</span>
          </div>
          <div style={{ fontSize: 12, color: '#555577' }}>Laden...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      {!hasNeon && (
        <div style={{ background: '#F0997B22', border: '1px solid #F0997B44', borderRadius: 10, margin: '12px 16px 0', padding: '10px 14px', fontSize: 12, color: '#F0997B' }}>
          ⚠️ Keine DB-Verbindung – VITE_NEON_DATABASE_URL fehlt
        </div>
      )}
      {hasNeon && dbError && (
        <div style={{ background: '#F0997B22', border: '1px solid #F0997B44', borderRadius: 10, margin: '12px 16px 0', padding: '10px 14px', fontSize: 11, color: '#F0997B', wordBreak: 'break-all' }}>
          ⚠️ DB-Fehler: {dbError}
        </div>
      )}
      {hasNeon && !dbError && (
        <div style={{ background: 'rgba(93,202,165,0.08)', border: '1px solid rgba(93,202,165,0.2)', borderRadius: 10, margin: '12px 16px 0', padding: '8px 14px', fontSize: 11, color: '#5DCAA5', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>●</span> Verbunden mit Neon DB
        </div>
      )}
      {activeTab === 'overview' && <Overview />}
      {activeTab === 'positions' && <Positions />}
      {activeTab === 'debts' && <Debts />}
      {activeTab === 'settings' && <Settings />}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
