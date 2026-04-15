import { useState, useMemo } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatEuro } from '../../utils/formatters';
import PageHeader from '../../components/layout/PageHeader';
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
    () => incomes.filter((i) => i.month === currentMonth),
    [incomes, currentMonth],
  );
  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.month === currentMonth),
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
    <div className="px-5 pt-6 pb-32">
      <PageHeader
        title="Alle Positionen"
        right={
          <button
            onClick={handleAdd}
            className="text-sm text-[#b8b2f0] font-semibold hover:text-[#d0ccf8]"
          >
            + Neu
          </button>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`text-xs font-medium px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all duration-200 ${
              filter === tab.id
                ? 'bg-[#7c6fe0]/15 text-[#b8b2f0] border border-[#7c6fe0]/30'
                : 'bg-white/[0.03] text-[#555577] border border-white/[0.06] hover:bg-white/[0.06]'
            }`}
          >
            {tab.label}
          </button>
        ))}
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
            <div className="mb-6">
              <div className="text-[11px] text-[#555577] uppercase tracking-[0.12em] font-semibold mb-3">
                Einnahmen
              </div>
              {filteredIncomes.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => handleEdit(inc, 'income')}
                  className="flex items-center justify-between py-3.5 border-b border-white/[0.04] cursor-pointer active:opacity-70 hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#5DCAA5] shadow-[0_0_6px_rgba(93,202,165,0.4)]" />
                    <span className="text-sm text-[#e2e2ff] font-medium">{inc.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-[#5DCAA5]">
                    + {formatEuro(inc.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {Object.entries(expensesByCategory).map(([catId, items]) => {
            const cat = categories.find((c) => c.id === catId);
            return (
              <div key={catId} className="mb-6">
                <div className="text-[11px] text-[#555577] uppercase tracking-[0.12em] font-semibold mb-3">
                  Ausgaben
                </div>
                {items.map((exp) => (
                  <div
                    key={exp.id}
                    onClick={() => handleEdit(exp, 'expense')}
                    className="flex items-center justify-between py-3.5 border-b border-white/[0.04] cursor-pointer active:opacity-70 hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: cat?.dotColor || '#555577',
                          boxShadow: `0 0 6px ${cat?.dotColor || '#555577'}66`,
                        }}
                      />
                      <span className="text-sm text-[#e2e2ff] font-medium">{exp.name}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm text-[#c0c0dd]">
                        {formatEuro(exp.amount)}
                      </span>
                      {cat && (
                        <Badge
                          label={cat.label.length > 6 ? cat.label.substring(0, 6) : cat.label}
                          bgColor={cat.bgColor}
                          textColor={cat.textColor}
                        />
                      )}
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
