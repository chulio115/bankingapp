import { useState, useEffect } from 'react';
import netlifyIdentity from 'netlify-identity-widget';
import { useAuthStore } from './store/useAuthStore';
import { useFinanceStore } from './store/useFinanceStore';
import { useFuelStore } from './store/useFuelStore';
import { ensureUser } from './lib/db';
import BottomNav from './components/layout/BottomNav';
import Overview from './screens/Overview/index';
import Positions from './screens/Positions/index';
import Debts from './screens/Debts/index';
import Settings from './screens/Settings/index';
import Fuel from './screens/Fuel/index';

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

function LoginScreen({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('invite_token=')) {
      const token = hash.split('invite_token=')[1]?.split('&')[0];
      if (token) setInviteToken(token);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      await onLogin(email, password);
    } catch (err) {
      setError((err as Error)?.message || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!invitePassword || invitePassword.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen haben');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const siteUrl = window.location.origin;
      const res = await fetch(`${siteUrl}/.netlify/identity/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: inviteToken, type: 'invite', password: invitePassword }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as Record<string, string>).msg || 'Aktivierung fehlgeschlagen');
      }
      setInviteSuccess(true);
      setInviteToken('');
      window.location.hash = '';
    } catch (err) {
      setError((err as Error)?.message || 'Aktivierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: 10, fontSize: 16, background: '#0e0e20', border: '1px solid #333', color: '#e2e2ff', borderRadius: 8 };
  const btnStyle = (disabled: boolean) => ({ width: '100%', padding: 12, fontSize: 16, background: disabled ? '#555' : '#7c6fe0', color: '#fff', border: 'none', borderRadius: 8, opacity: disabled ? 0.7 : 1, cursor: disabled ? 'default' : 'pointer' as const });

  if (inviteToken) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a1a', padding: 20, paddingTop: '20vh' }}>
        <div style={{ maxWidth: 320, margin: '0 auto' }}>
          <h2 style={{ color: '#e2e2ff', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Willkommen!</h2>
          <p style={{ color: '#555577', fontSize: 14, marginBottom: 24 }}>Setze ein Passwort um deinen Account zu aktivieren.</p>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 5, color: '#e2e2ff' }}>Neues Passwort</label>
            <input type="password" value={invitePassword} onChange={(e) => setInvitePassword(e.target.value)} placeholder="Mind. 6 Zeichen" style={inputStyle} />
          </div>
          {error && <div style={{ color: '#F0997B', fontSize: 14, marginBottom: 15 }}>{error}</div>}
          <button onClick={handleAcceptInvite} disabled={loading || !invitePassword} style={btnStyle(loading || !invitePassword)}>
            {loading ? 'Aktivieren...' : 'Account aktivieren'}
          </button>
        </div>
      </div>
    );
  }

  if (inviteSuccess) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a1a', padding: 20, paddingTop: '20vh' }}>
        <div style={{ maxWidth: 320, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <h2 style={{ color: '#5DCAA5', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Account aktiviert!</h2>
          <p style={{ color: '#555577', fontSize: 14, marginBottom: 24 }}>Du kannst dich jetzt mit deiner Email und dem Passwort einloggen.</p>
          <button onClick={() => setInviteSuccess(false)} style={btnStyle(false)}>Zum Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a1a', padding: 20, paddingTop: '12vh', paddingBottom: 40 }}>
      <div style={{ maxWidth: 360, margin: '0 auto' }}>
        {/* Logo/Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #7c6fe0 0%, #9b8ff0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(124,111,224,0.3)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e2e2ff', marginBottom: 4, letterSpacing: '-0.01em' }}>Finanz-Tracker</h1>
          <p style={{ fontSize: 13, color: '#555577' }}>Deine Finanzen im Griff</p>
        </div>

        {/* Login Form */}
        <div style={{ background: '#141428', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: '#8888aa', fontWeight: 500 }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="deine@email.de" style={{ ...inputStyle, marginBottom: 0 }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: '#8888aa', fontWeight: 500 }}>Passwort</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, marginBottom: 0 }} />
          </div>
          {error && <div style={{ color: '#F0997B', fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <button onClick={handleSubmit} disabled={loading || !email || !password} style={{ ...btnStyle(loading || !email || !password), background: 'linear-gradient(135deg, #7c6fe0 0%, #9b8ff0 100%)', boxShadow: '0 4px 16px rgba(124,111,224,0.3)' }}>
            {loading ? 'Anmelden...' : 'Anmelden'}
          </button>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(93,202,165,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5DCAA5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e2ff', marginBottom: 2 }}>Einfache Übersicht</div>
              <div style={{ fontSize: 12, color: '#666688' }}>Alle Einnahmen & Ausgaben auf einen Blick</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(124,111,224,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c6fe0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e2ff', marginBottom: 2 }}>Monatliche Planung</div>
              <div style={{ fontSize: 12, color: '#666688' }}>Wiederkehrende Positionen automatisch</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(240,153,123,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F0997B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e2ff', marginBottom: 2 }}>Schulden-Tracking</div>
              <div style={{ fontSize: 12, color: '#666688' }}>Fortschritt & Schuldenfrei-Datum</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(74,191,160,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ABFA0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" /><polyline points="3 10 12 3 21 10" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e2ff', marginBottom: 2 }}>Privat & Sicher</div>
              <div style={{ fontSize: 12, color: '#666688' }}>Nur für dich und deine Partner:in</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(74,191,160,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ABFA0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 22v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" /><path d="M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5" /><path d="M12 2v6" /><path d="M8 6l4-4 4 4" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e2ff', marginBottom: 2 }}>Tanken-Tracking</div>
              <div style={{ fontSize: 12, color: '#666688' }}>Tankquellen-OCR & Verbrauchs-Charts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { user, setUser, isLoading, setLoading } = useAuthStore();
  const loadData = useFinanceStore((state) => state.loadData);
  const loadFuelEntries = useFuelStore((state) => state.loadEntries);
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
        .then(() => Promise.all([loadData(existingUser.id), loadFuelEntries(existingUser.id)]))
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
      await Promise.all([loadData(user.id), loadFuelEntries(user.id)]);
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
      {activeTab === 'fuel' && <Fuel />}
      {activeTab === 'debts' && <Debts />}
      {activeTab === 'settings' && <Settings />}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
