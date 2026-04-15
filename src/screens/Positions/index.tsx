import { useState, useMemo } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatEuro } from '../../utils/formatters';
import { incomesForMonth, expensesForMonth } from '../../utils/calculations';
import FAB from '../../components/layout/FAB';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import PositionModal from './PositionModal';
import type { Income, Expense } from '../../types/finance';

type FilterType = 'alle' | 'einnahmen' | 'ausgaben' | string;

export default function Positions() {
  const { currentMonth, incomes, expenses, categories } = useFinanceStore();
  const [filter, setFilter] = useState<FilterType>('alle');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<((Income | Expense) & { type: 'income' | 'expense' }) | undefined>();

  const monthIncomes = useMemo(
    () => incomesForMonth(incomes, currentMonth),
    [incomes, currentMonth],
  );
  const monthExpenses = useMemo(
    () => expensesForMonth(expenses, currentMonth),
    [expenses, currentMonth],
  );

  const filteredIncomes = filter === 'alle' || filter === 'einnahmen' ? monthIncomes : [];
  const filteredExpenses = useMemo(() => {
    if (filter === 'einnahmen') return [];
    if (filter === 'alle' || filter === 'ausgaben') return monthExpenses;
    return monthExpenses.filter((e) => e.category === filter);
  }, [filter, monthExpenses]);

  const expensesByCategory = useMemo(() => {
    const groups: Record<string, Expense[]> = {};
    filteredExpenses.forEach((e) => {
      if (!groups[e.category]) groups[e.category] = [];
      groups[e.category].push(e);
    });
    return groups;
  }, [filteredExpenses]);

  const hasData = monthIncomes.length > 0 || monthExpenses.length > 0;

  const handleEdit = (item: Income | Expense, type: 'income' | 'expense') => {
    setEditItem({ ...item, type });
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditItem(undefined);
    setModalOpen(true);
  };

  const filterTabs: { id: FilterType; label: string }[] = [
    { id: 'alle', label: 'Alle' },
    { id: 'einnahmen', label: 'Einnahmen' },
    { id: 'ausgaben', label: 'Ausgaben' },
    ...categories.map((c) => ({ id: c.id, label: c.label })),
  ];

  return (
    <div style={{ padding: '16px 20px 120px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e2ff', letterSpacing: '-0.01em', margin: 0 }}>Alle Positionen</h1>
        <button
          onClick={handleAdd}
          style={{ fontSize: 14, color: '#b8b2f0', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          + Neu
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 8, WebkitOverflowScrolling: 'touch' }} className="scrollbar-hide">
        {filterTabs.map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                fontSize: 12, fontWeight: 500, padding: '6px 14px', borderRadius: 12, whiteSpace: 'nowrap', cursor: 'pointer',
                background: isActive ? 'rgba(124,111,224,0.12)' : 'rgba(255,255,255,0.03)',
                color: isActive ? '#b8b2f0' : '#555577',
                border: `1px solid ${isActive ? 'rgba(124,111,224,0.3)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {!hasData ? (
        <EmptyState
          message="Noch keine Positionen vorhanden."
          actionLabel="+ Neue Position"
          onAction={handleAdd}
        />
      ) : (
        <div>
          {filteredIncomes.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 10 }}>
                Einnahmen
              </div>
              {filteredIncomes.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => handleEdit(inc, 'income')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#5DCAA5', boxShadow: '0 0 6px rgba(93,202,165,0.4)' }} />
                    <span style={{ fontSize: 14, color: '#e2e2ff', fontWeight: 500 }}>{inc.name}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#5DCAA5' }}>
                    + {formatEuro(inc.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {Object.entries(expensesByCategory).map(([catId, items]) => {
            const cat = categories.find((c) => c.id === catId);
            return (
              <div key={catId} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 10 }}>
                  Ausgaben
                </div>
                {items.map((exp) => (
                  <div
                    key={exp.id}
                    onClick={() => handleEdit(exp, 'expense')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cat?.dotColor || '#555577', boxShadow: `0 0 6px ${cat?.dotColor || '#555577'}66` }} />
                      <span style={{ fontSize: 14, color: '#e2e2ff', fontWeight: 500 }}>{exp.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, color: '#c0c0dd' }}>{formatEuro(exp.amount)}</span>
                      {cat && <Badge label={cat.label.length > 6 ? cat.label.substring(0, 6) : cat.label} bgColor={cat.bgColor} textColor={cat.textColor} />}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <FAB onClick={handleAdd} />
      <PositionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editItem={editItem}
      />
    </div>
  );
}
