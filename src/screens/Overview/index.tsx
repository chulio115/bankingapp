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
    <div className="px-5 pt-6 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth(getAdjacentMonth(currentMonth, -1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.05] text-[#666688] hover:bg-white/[0.08] active:bg-white/[0.1] text-base"
          >
            ‹
          </button>
          <h1 className="text-xl font-bold text-[#e2e2ff] tracking-tight px-1">
            {formatMonthShort(currentMonth)}
          </h1>
          <button
            onClick={() => setCurrentMonth(getAdjacentMonth(currentMonth, 1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.05] text-[#666688] hover:bg-white/[0.08] active:bg-white/[0.1] text-base"
          >
            ›
          </button>
        </div>
        <span className="text-xs text-[#555577] font-medium tracking-wide uppercase">Übersicht</span>
      </div>

      {/* Freies Geld Banner */}
      <div
        className="rounded-2xl p-6 mb-6 text-center border"
        style={{
          background: isPositive
            ? 'linear-gradient(135deg, rgba(93,202,165,0.1) 0%, rgba(93,202,165,0.03) 100%)'
            : 'linear-gradient(135deg, rgba(240,153,123,0.1) 0%, rgba(240,153,123,0.03) 100%)',
          borderColor: isPositive ? 'rgba(93,202,165,0.18)' : 'rgba(240,153,123,0.18)',
        }}
      >
        <div className="text-xs text-[#666688] font-medium tracking-wide mb-2 uppercase">
          Freies Geld
        </div>
        <div
          className="text-3xl font-bold tracking-tight"
          style={{ color: isPositive ? '#5DCAA5' : '#F0997B' }}
        >
          {isPositive ? '+ ' : ''}{formatEuro(free)}
        </div>
      </div>

      {!hasData ? (
        <EmptyState message="Noch keine Einträge für diesen Monat vorhanden." />
      ) : (
        <>
          {/* Donut Chart — only when expenses exist */}
          {expense > 0 && (
            <Card className="mb-6">
              <DonutChart data={chartData} total={expense} label="Ausgaben" />
            </Card>
          )}

          {/* Income / Expense Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div
              className="rounded-2xl p-5 border"
              style={{
                background: 'linear-gradient(135deg, rgba(93,202,165,0.08) 0%, rgba(93,202,165,0.02) 100%)',
                borderColor: 'rgba(93,202,165,0.15)',
              }}
            >
              <div className="text-lg font-bold text-[#5DCAA5] tracking-tight">
                {formatEuro(income)}
              </div>
              <div className="text-xs text-[#666688] mt-1.5 font-medium">Einnahmen</div>
            </div>
            <div
              className="rounded-2xl p-5 border"
              style={{
                background: 'linear-gradient(135deg, rgba(240,153,123,0.08) 0%, rgba(240,153,123,0.02) 100%)',
                borderColor: 'rgba(240,153,123,0.15)',
              }}
            >
              <div className="text-lg font-bold text-[#F0997B] tracking-tight">
                {formatEuro(expense)}
              </div>
              <div className="text-xs text-[#666688] mt-1.5 font-medium">Ausgaben</div>
            </div>
          </div>

          {/* Category Badges */}
          <div className="flex flex-wrap gap-2.5">
            {Object.entries(categorySums).map(([catId, sum]) => {
              const cat = categories.find((c) => c.id === catId);
              return (
                <span
                  key={catId}
                  className="inline-flex items-center text-xs font-medium rounded-xl px-3 py-2 border"
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
