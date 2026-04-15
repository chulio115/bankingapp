interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-3xl mb-3 opacity-40">📊</div>
      <p className="text-[#8888aa] text-xs mb-4">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-[11px] font-medium text-[#AFA9EC] border border-[#AFA9EC]/30 rounded-lg px-4 py-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
