import type { ReactNode } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: (active: boolean) => ReactNode;
}

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const OverviewIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#b8b2f0' : '#555577'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const PositionsIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#b8b2f0' : '#555577'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="14" y2="18" />
  </svg>
);

const DebtsIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#b8b2f0' : '#555577'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const SettingsIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#b8b2f0' : '#555577'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const items: NavItem[] = [
    { id: 'overview', label: 'Übersicht', icon: (a) => <OverviewIcon active={a} /> },
    { id: 'positions', label: 'Positionen', icon: (a) => <PositionsIcon active={a} /> },
    { id: 'debts', label: 'Schulden', icon: (a) => <DebtsIcon active={a} /> },
    { id: 'settings', label: 'Einstellungen', icon: (a) => <SettingsIcon active={a} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div className="glass border-t border-white/[0.06]">
        <div className="max-w-[430px] mx-auto flex items-center justify-around pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {items.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center gap-1.5 min-w-[70px] py-1.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                }`}
              >
                {item.icon(isActive)}
                <span
                  className={`text-[10px] tracking-wide ${isActive ? 'font-semibold text-[#b8b2f0]' : 'font-medium text-[#555577]'}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
