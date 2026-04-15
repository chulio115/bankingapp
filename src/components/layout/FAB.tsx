interface FABProps {
  onClick: () => void;
}

export default function FAB({ onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed', bottom: 100, right: 20, width: 52, height: 52,
        borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 30, border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg, #7c6fe0 0%, #9b8ff0 100%)',
        boxShadow: '0 8px 24px rgba(124, 111, 224, 0.3)',
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );
}
