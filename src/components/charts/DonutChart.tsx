import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatEuro } from '../../utils/formatters';

interface DonutChartProps {
  data: { name: string; value: number; fill: string }[];
  total: number;
  label: string;
}

export default function DonutChart({ data, total, label }: DonutChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px] text-[#555577] text-sm">
        Keine Daten
      </div>
    );
  }

  return (
    <div className="relative w-full h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="58%"
            outerRadius="88%"
            paddingAngle={3}
            strokeWidth={0}
            dataKey="value"
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-bold text-[#e2e2ff] tracking-tight">
          {formatEuro(total)}
        </span>
        <span className="text-xs text-[#666688] mt-0.5">{label}</span>
      </div>
    </div>
  );
}
