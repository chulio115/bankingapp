import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  right?: ReactNode;
}

export default function PageHeader({ title, right }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-[13px] font-medium text-[#e8e8ff]">{title}</h1>
      {right && <div>{right}</div>}
    </div>
  );
}
