import { useFinanceStore } from '../../store/useFinanceStore';
import { formatEuro, formatMonthShort, getAdjacentMonth } from '../../utils/formatters';
import { freeMoney, totalIncome, totalExpenses, getCategoryChartData, sumByCategory } from '../../utils/calculations';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import DonutChart from '../../components/charts/DonutChart';

export default function Overview() {
  const { currentMonth, setCurrentMonth, incomes, expenses, categories } = useFinanceStore();

  const income = totalIncome(incomes, currentMonth);
  const expense = totalExpenses(expenses, currentMonth);
  const free = freeMoney(incomes, expenses, currentMonth);
  const chartData = getCategoryChartData(expenses, currentMonth, categories);
  const categorySums = sumByCategory(expenses, currentMonth);

  const hasData = income > 0 || expense > 0;
  const isPositive = free >= 0;

  return (
    <div className="px-5 pt-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(getAdjacentMonth(currentMonth, -1))}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.04] text-[#666688] hover:bg-white/[0.08] text-sm"
          >
            ‹
          </button>
          <h1 className="text-lg font-bold text-[#e2e2ff] tracking-tight px-1">
            {formatMonthShort(currentMonth)}
          </h1>
          <button
            onClick={() => setCurrentMonth(getAdjacentMonth(currentMonth, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.04] text-[#666688] hover:bg-white/[0.08] text-sm"
          >
            ›
          </button>
        </div>
        <span className="text-xs text-[#555577] font-medium tracking-wide">Übersicht</span>
      </div>

      {/* Freies Geld Banner */}
      <div
        className="rounded-2xl p-5 mb-5 text-center border"
        style={{
          background: isPositive
            ? 'linear-gradient(135deg, rgba(93,202,165,0.08) 0%, rgba(93,202,165,0.03) 100%)'
            : 'linear-gradient(135deg, rgba(240,153,123,0.08) 0%, rgba(240,153,123,0.03) 100%)',
          borderColor: isPositive ? 'rgba(93,202,165,0.15)' : 'rgba(240,153,123,0.15)',
        }}
      >
        <div className="text-xs text-[#666688] font-medium tracking-wide mb-1.5">
          Freies Geld
        </div>
        <div
          className="text-2xl font-bold tracking-tight"
          style={{ color: isPositive ? '#5DCAA5' : '#F0997B' }}
        >
          {isPositive ? '+ ' : ''}{formatEuro(free)}
        </div>
      </div>

      {!hasData ? (
        <EmptyState message="Noch keine Einträge für diesen Monat vorhanden." />
      ) : (
        <>
          {/* Donut Chart */}
          <Card className="mb-5">
            <DonutChart data={chartData} total={expense} label="Ausgaben" />
          </Card>

          {/* Income / Expense Stats */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div
              className="rounded-2xl p-4 border"
              style={{
                background: 'linear-gradient(135deg, rgba(93,202,165,0.06) 0%, rgba(93,202,165,0.02) 100%)',
                borderColor: 'rgba(93,202,165,0.12)',
              }}
            >
              <div className="text-base font-bold text-[#5DCAA5] tracking-tight">
                {formatEuro(income)}
              </div>
              <div className="text-xs text-[#666688] mt-1">Einnahmen</div>
            </div>
            <div
              className="rounded-2xl p-4 border"
              style={{
                background: 'linear-gradient(135deg, rgba(240,153,123,0.06) 0%, rgba(240,153,123,0.02) 100%)',
                borderColor: 'rgba(240,153,123,0.12)',
              }}
            >
              <div className="text-base font-bold text-[#F0997B] tracking-tight">
                {formatEuro(expense)}
              </div>
              <div className="text-xs text-[#666688] mt-1">Ausgaben</div>
            </div>
          </div>

          {/* Category Badges */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(categorySums).map(([catId, sum]) => {
              const cat = categories.find((c) => c.id === catId);
              return (
                <span
                  key={catId}
                  className="inline-flex items-center text-[11px] font-medium rounded-lg px-2.5 py-1.5 border"
                  style={{
                    backgroundColor: cat?.bgColor || '#1a1a2e',
                    color: cat?.textColor || '#666688',
                    borderColor: `${cat?.textColor || '#666688'}18`,
                  }}
                >
                  {cat?.label || catId} {formatEuro(sum)}
                </span>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
