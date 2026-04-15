interface BadgeProps {
  label: string;
  bgColor: string;
  textColor: string;
  className?: string;
}

export default function Badge({ label, bgColor, textColor, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-[11px] font-medium rounded-lg px-2.5 py-1 border ${className}`}
      style={{ backgroundColor: bgColor, color: textColor, borderColor: `${textColor}22` }}
    >
      {label}
    </span>
  );
}
