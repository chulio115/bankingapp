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

function LoginScreen({ onLogin }: { onLogin: (email: string, password: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #141428 0%, #1a1a36 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-3xl font-bold text-[#b8b2f0]">H</span>
        </div>
        <h1 className="text-2xl font-bold text-[#e2e2ff] mb-2 text-center tracking-tight">Haushalt</h1>
        <p className="text-sm text-[#555577] mb-8 text-center">Deine persönliche Finanzübersicht</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[#555577] mb-1.5 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0e0e20] border border-[#1a1a3a] rounded-xl px-4 py-3 text-[#e2e2ff] text-base focus:outline-none focus:border-[#7c6fe0]"
              autoCapitalize="none"
              autoCorrect="off"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-[#555577] mb-1.5 ml-1">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0e0e20] border border-[#1a1a3a] rounded-xl px-4 py-3 text-[#e2e2ff] text-base focus:outline-none focus:border-[#7c6fe0]"
              required
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #7c6fe0 0%, #9b8ff0 100%)' }}
          >
            {loading ? 'Anmelden...' : 'Anmelden'}
          </button>
        </form>
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
    try {
      const user = await (netlifyIdentity as any).auth.login(email, password, true);
      const userData = {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
      };
      setUser(userData);
      setLoading(true);
      await ensureUser(user.id, user.email || '', userData.name);
      await loadData(user.id);
    } catch (err) {
      console.error('Login error:', err);
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
