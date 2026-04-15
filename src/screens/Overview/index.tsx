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

  return (
    <div className="p-3.5 pb-24">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth(getAdjacentMonth(currentMonth, -1))}
            className="text-[#8888aa] text-sm p-1"
          >
            ‹
          </button>
          <h1 className="text-[13px] font-medium text-[#e8e8ff]">
            {formatMonthShort(currentMonth)}
          </h1>
          <button
            onClick={() => setCurrentMonth(getAdjacentMonth(currentMonth, 1))}
            className="text-[#8888aa] text-sm p-1"
          >
            ›
          </button>
        </div>
        <span className="text-[10px] text-[#8888aa] uppercase tracking-wider">Übersicht</span>
      </div>

      <div
        className="rounded-lg border p-4 mb-4 text-center"
        style={{
          backgroundColor: '#1a1a3e',
          borderColor: '#3a3a66',
        }}
      >
        <div className="text-[10px] text-[#8888aa] uppercase tracking-wider mb-1">
          Freies Geld
        </div>
        <div
          className="text-xl font-semibold"
          style={{ color: free >= 0 ? '#5DCAA5' : '#F0997B' }}
        >
          {free >= 0 ? '+ ' : ''}{formatEuro(free)}
        </div>
      </div>

      {!hasData ? (
        <EmptyState message="Noch keine Einträge für diesen Monat vorhanden." />
      ) : (
        <>
          <Card className="mb-4">
            <DonutChart data={chartData} total={expense} label="Ausgaben" />
          </Card>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card>
              <div className="text-sm font-semibold text-[#5DCAA5]">
                {formatEuro(income)}
              </div>
              <div className="text-[10px] text-[#8888aa] mt-0.5">Einnahmen</div>
            </Card>
            <Card>
              <div className="text-sm font-semibold text-[#F0997B]">
                {formatEuro(expense)}
              </div>
              <div className="text-[10px] text-[#8888aa] mt-0.5">Ausgaben</div>
            </Card>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(categorySums).map(([catId, sum]) => {
              const cat = categories.find((c) => c.id === catId);
              return (
                <span
                  key={catId}
                  className="text-[9px] font-medium rounded px-2 py-1"
                  style={{
                    backgroundColor: cat?.bgColor || '#2a2a44',
                    color: cat?.textColor || '#8888aa',
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
