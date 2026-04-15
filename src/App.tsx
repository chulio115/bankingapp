import { useState, useEffect } from 'react';
import netlifyIdentity from 'netlify-identity-widget';
import { useAuthStore } from './store/useAuthStore';
import BottomNav from './components/layout/BottomNav';
import Overview from './screens/Overview/index';
import Positions from './screens/Positions/index';
import Debts from './screens/Debts/index';
import Settings from './screens/Settings/index';

function LoginScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
      <div className="text-center px-8">
        {/* Logo */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #141428 0%, #1a1a36 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-3xl font-bold text-[#b8b2f0]">H</span>
        </div>
        <h1 className="text-2xl font-bold text-[#e2e2ff] mb-2 tracking-tight">Haushalt</h1>
        <p className="text-sm text-[#555577] mb-10 leading-relaxed">
          Deine persönliche Finanzübersicht
        </p>
        <button
          onClick={() => netlifyIdentity.open()}
          className="text-sm font-semibold px-8 py-3.5 rounded-2xl text-white"
          style={{
            background: 'linear-gradient(135deg, #7c6fe0 0%, #9b8ff0 100%)',
            boxShadow: '0 8px 24px rgba(124, 111, 224, 0.3)',
          }}
        >
          Anmelden
        </button>
      </div>
    </div>
  );
}

function App() {
  const { user, setUser, isLoading, setLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    netlifyIdentity.init();

    const handleLogin = (u: netlifyIdentity.User | undefined) => {
      if (u) {
        setUser({
          name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
          email: u.email || '',
        });
      }
      setLoading(false);
      netlifyIdentity.close();
    };

    const handleLogout = () => {
      setUser(null);
    };

    netlifyIdentity.on('login', handleLogin);
    netlifyIdentity.on('logout', handleLogout);
    // netlify-identity-widget emits 'init' but types don't include it
    (netlifyIdentity as unknown as { on: (event: string, cb: (u?: netlifyIdentity.User) => void) => void })
      .on('init', (u?: netlifyIdentity.User) => {
        if (u) {
          setUser({
            name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
            email: u.email || '',
          });
        }
        setLoading(false);
      });

    // Fallback: if init doesn't fire (e.g. no Netlify backend in local dev), stop loading after 2s
    const timeout = setTimeout(() => setLoading(false), 2000);

    return () => {
      clearTimeout(timeout);
      netlifyIdentity.off('login', handleLogin);
      netlifyIdentity.off('logout', handleLogout);
    };
  }, [setUser, setLoading]);

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
    <div className="min-h-screen bg-[#0a0a1a] max-w-[430px] mx-auto relative">
      {activeTab === 'overview' && <Overview />}
      {activeTab === 'positions' && <Positions />}
      {activeTab === 'debts' && <Debts />}
      {activeTab === 'settings' && <Settings />}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
