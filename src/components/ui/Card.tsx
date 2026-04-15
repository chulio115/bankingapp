import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`bg-[#141428] border border-white/[0.06] rounded-2xl p-4 transition-all duration-200 ${
        onClick ? 'cursor-pointer active:scale-[0.98] hover:border-white/[0.1] hover:bg-[#181830]' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
