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

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      await (netlifyIdentity as any).auth.login(email, password, true);
      window.location.reload();
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#0a0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 320, textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ width: 80, height: 80, margin: '0 auto 24px', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #141428 0%, #1a1a36 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: '#b8b2f0' }}>H</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e2e2ff', marginBottom: 8, letterSpacing: '-0.01em', margin: 0 }}>Haushalt</h1>
        <p style={{ fontSize: 14, color: '#555577', marginBottom: 40, lineHeight: 1.5 }}>
          Deine persönliche Finanzübersicht
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="text"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={{ width: '100%', background: '#0e0e20', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px', fontSize: 15, color: '#e2e2ff', outline: 'none', fontFamily: 'inherit' }}
          />
          <input
            type="text"
            inputMode="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passwort"
            style={{ width: '100%', background: '#0e0e20', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px', fontSize: 15, color: '#e2e2ff', outline: 'none', fontFamily: 'inherit' }}
          />
          {error && <div style={{ fontSize: 12, color: '#F0997B' }}>{error}</div>}
          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            style={{ fontSize: 14, fontWeight: 600, padding: '14px 0', borderRadius: 12, color: '#fff', border: 'none', cursor: loading || !email || !password ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #7c6fe0 0%, #9b8ff0 100%)', boxShadow: '0 8px 24px rgba(124, 111, 224, 0.3)', opacity: loading || !email || !password ? 0.5 : 1 }}
          >
            {loading ? 'Laden...' : 'Anmelden'}
          </button>
        </div>

        <div style={{ marginTop: 24, fontSize: 12, color: '#555577' }}>
          Noch kein Account?{' '}
          <a href="https://app.netlify.com/identity" target="_blank" rel="noopener noreferrer" style={{ color: '#b8b2f0', textDecoration: 'none' }}>
            Hier registrieren
          </a>
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
          console.error('DB Error (existing user):', err);
          setDbError(String(err?.message || err));
          setLoading(false);
        });
    }

    netlifyIdentity.on('login', (u) => {
      if (u) {
        const userData = {
          id: u.id,
          name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
          email: u.email || '',
        };
        setUser(userData);
        ensureUser(u.id, u.email || '', userData.name)
          .then(() => loadData(u.id))
          .then(() => setLoading(false))
          .catch((err) => {
            console.error('DB Error (login):', err);
            setDbError(String(err?.message || err));
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
      netlifyIdentity.close();
    });

    netlifyIdentity.on('logout', () => {
      setUser(null);
    });

    netlifyIdentity.on('close', () => {
      const u = netlifyIdentity.currentUser();
      if (u) {
        const userData = {
          id: u.id,
          name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
          email: u.email || '',
        };
        setUser(userData);
        ensureUser(u.id, u.email || '', userData.name)
          .then(() => loadData(u.id))
          .then(() => setLoading(false))
          .catch((err) => {
            console.error('DB Error (close):', err);
            setDbError(String(err?.message || err));
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    // init AFTER setting up event handlers — will NOT auto-open if user already resolved above
    if (!existingUser) {
      netlifyIdentity.init();
      // Fallback: if init doesn't fire (e.g. no Netlify backend in local dev), stop loading after 2s
      const timeout = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [setUser, setLoading, loadData]);

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
    return <LoginScreen />;
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
