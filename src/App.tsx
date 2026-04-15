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
    <div className="min-h-screen bg-[#0d0d1f] flex items-center justify-center">
      <div className="text-center px-8">
        <h1 className="text-2xl font-semibold text-[#e8e8ff] mb-2">Haushalt</h1>
        <p className="text-[12px] text-[#8888aa] mb-8">
          Deine persönliche Finanzübersicht
        </p>
        <button
          onClick={() => netlifyIdentity.open()}
          className="text-[12px] font-medium px-6 py-3 rounded-lg bg-[#7F77DD] text-[#e8e8ff]"
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
      <div className="min-h-screen bg-[#0d0d1f] flex items-center justify-center">
        <div className="text-[#8888aa] text-xs">Laden...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0d0d1f] max-w-[430px] mx-auto relative">
      {activeTab === 'overview' && <Overview />}
      {activeTab === 'positions' && <Positions />}
      {activeTab === 'debts' && <Debts />}
      {activeTab === 'settings' && <Settings />}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
