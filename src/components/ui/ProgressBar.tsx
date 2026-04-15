interface ProgressBarProps {
  percent: number;
  className?: string;
}

export default function ProgressBar({ percent, className = '' }: ProgressBarProps) {
  return (
    <div className={`w-full h-1 bg-[#2a2a44] rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-[#5DCAA5] rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}
