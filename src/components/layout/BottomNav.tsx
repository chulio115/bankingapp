import type { ReactElement } from 'react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ICON_SIZE = 20;

const icons: Record<string, (color: string) => ReactElement> = {
  overview: (c) => (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  positions: (c) => (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="14" y2="18" />
    </svg>
  ),
  debts: (c) => (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  settings: (c) => (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

const tabs = [
  { id: 'overview', label: 'Übersicht' },
  { id: 'positions', label: 'Positionen' },
  { id: 'debts', label: 'Schulden' },
  { id: 'settings', label: 'Einstell.' },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/[0.06]"
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))' }}
    >
      <div
        className="max-w-[430px] mx-auto"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', paddingTop: 8 }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          const color = active ? '#b8b2f0' : '#555577';
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 0', opacity: active ? 1 : 0.55, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {icons[tab.id](color)}
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 500, color, lineHeight: 1, whiteSpace: 'nowrap' }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
