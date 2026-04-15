interface BadgeProps {
  label: string;
  bgColor: string;
  textColor: string;
  className?: string;
}

export default function Badge({ label, bgColor, textColor, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-block text-[9px] font-medium rounded px-1.5 py-0.5 ${className}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {label}
    </span>
  );
}
