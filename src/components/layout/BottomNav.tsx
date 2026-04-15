import type { ReactNode } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const OverviewIcon = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

const PositionsIcon = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="14" y2="18" />
  </svg>
);

const DebtsIcon = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const SettingsIcon = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const inactiveColor = '#8888aa';
  const activeColor = '#AFA9EC';

  const items: NavItem[] = [
    { id: 'overview', label: 'Übersicht', icon: <OverviewIcon color={activeTab === 'overview' ? activeColor : inactiveColor} /> },
    { id: 'positions', label: 'Positionen', icon: <PositionsIcon color={activeTab === 'positions' ? activeColor : inactiveColor} /> },
    { id: 'debts', label: 'Schulden', icon: <DebtsIcon color={activeTab === 'debts' ? activeColor : inactiveColor} /> },
    { id: 'settings', label: 'Einstellungen', icon: <SettingsIcon color={activeTab === 'settings' ? activeColor : inactiveColor} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#12122a] border-t border-[#2a2a44] z-40">
      <div className="max-w-[430px] mx-auto flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className="flex flex-col items-center gap-1 min-w-[60px]"
          >
            {item.icon}
            <span
              className="text-[9px] font-medium"
              style={{ color: activeTab === item.id ? activeColor : inactiveColor }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
