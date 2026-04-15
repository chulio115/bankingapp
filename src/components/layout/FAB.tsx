interface FABProps {
  onClick: () => void;
}

export default function FAB({ onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-28 right-5 w-14 h-14 rounded-2xl flex items-center justify-center z-30 active:scale-90 transition-all duration-200 hover:shadow-[0_0_24px_rgba(124,111,224,0.4)]"
      style={{
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
