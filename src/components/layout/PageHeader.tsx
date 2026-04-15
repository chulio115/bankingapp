import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  right?: ReactNode;
}

export default function PageHeader({ title, right }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 pt-1">
      <h1 className="text-lg font-bold text-[#e2e2ff] tracking-tight">{title}</h1>
      {right && <div>{right}</div>}
    </div>
  );
}
