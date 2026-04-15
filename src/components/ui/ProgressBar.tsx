interface ProgressBarProps {
  percent: number;
  color?: string;
  className?: string;
}

export default function ProgressBar({ percent, color = '#5DCAA5', className = '' }: ProgressBarProps) {
  return (
    <div className={`w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${Math.min(100, Math.max(0, percent))}%`,
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}40`,
        }}
      />
    </div>
  );
}
