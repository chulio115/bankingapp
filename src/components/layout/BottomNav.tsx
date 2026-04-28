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
  fuel: (c) => (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" /><path d="M15 10h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2v0" /><path d="M21 10V7l-2-2" /><rect x="6" y="8" width="6" height="5" rx="1" />
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
  { id: 'fuel', label: 'Tanken' },
  { id: 'debts', label: 'Schulden' },
  { id: 'settings', label: 'Einstell.' },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="glass nav-bottom-safe"
      style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', paddingTop: 8 }}>
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
