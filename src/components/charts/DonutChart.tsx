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
      <div className="flex items-center justify-center h-[200px] text-[#8888aa] text-xs">
        Keine Daten
      </div>
    );
  }

  return (
    <div className="relative w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={2}
            strokeWidth={0}
            dataKey="value"
            animationDuration={600}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[16px] font-semibold text-[#e8e8ff]">
          {formatEuro(total)}
        </span>
        <span className="text-[10px] text-[#8888aa]">{label}</span>
      </div>
    </div>
  );
}
