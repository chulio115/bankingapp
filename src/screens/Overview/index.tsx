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
    <div style={{ padding: '16px 20px 120px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setCurrentMonth(getAdjacentMonth(currentMonth, -1))}
            style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'rgba(255,255,255,0.05)', color: '#666688', border: 'none', fontSize: 16, cursor: 'pointer' }}
          >‹</button>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e2ff', letterSpacing: '-0.01em', margin: 0 }}>
            {formatMonthShort(currentMonth)}
          </h1>
          <button
            onClick={() => setCurrentMonth(getAdjacentMonth(currentMonth, 1))}
            style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'rgba(255,255,255,0.05)', color: '#666688', border: 'none', fontSize: 16, cursor: 'pointer' }}
          >›</button>
        </div>
        <span style={{ fontSize: 11, color: '#555577', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Übersicht</span>
      </div>

      {/* Freies Geld Banner */}
      <div
        style={{
          borderRadius: 16, padding: '20px 16px', marginBottom: 20, textAlign: 'center',
          background: isPositive
            ? 'linear-gradient(135deg, rgba(93,202,165,0.1) 0%, rgba(93,202,165,0.03) 100%)'
            : 'linear-gradient(135deg, rgba(240,153,123,0.1) 0%, rgba(240,153,123,0.03) 100%)',
          border: `1px solid ${isPositive ? 'rgba(93,202,165,0.18)' : 'rgba(240,153,123,0.18)'}`,
        }}
      >
        <div style={{ fontSize: 11, color: '#666688', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          Freies Geld
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: isPositive ? '#5DCAA5' : '#F0997B', letterSpacing: '-0.02em' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ borderRadius: 16, padding: '16px 14px', background: 'linear-gradient(135deg, rgba(93,202,165,0.08) 0%, rgba(93,202,165,0.02) 100%)', border: '1px solid rgba(93,202,165,0.15)' }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#5DCAA5', letterSpacing: '-0.01em' }}>{formatEuro(income)}</div>
              <div style={{ fontSize: 12, color: '#666688', marginTop: 4, fontWeight: 500 }}>Einnahmen</div>
            </div>
            <div style={{ borderRadius: 16, padding: '16px 14px', background: 'linear-gradient(135deg, rgba(240,153,123,0.08) 0%, rgba(240,153,123,0.02) 100%)', border: '1px solid rgba(240,153,123,0.15)' }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#F0997B', letterSpacing: '-0.01em' }}>{formatEuro(expense)}</div>
              <div style={{ fontSize: 12, color: '#666688', marginTop: 4, fontWeight: 500 }}>Ausgaben</div>
            </div>
          </div>

          {/* Category Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(categorySums).map(([catId, sum]) => {
              const cat = categories.find((c) => c.id === catId);
              return (
                <span
                  key={catId}
                  style={{ display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 500, borderRadius: 10, padding: '6px 12px', backgroundColor: cat?.bgColor || '#1a1a2e', color: cat?.textColor || '#666688', border: `1px solid ${cat?.textColor || '#666688'}18` }}
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
