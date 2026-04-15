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
    <div className="p-3.5 pb-24">
      <PageHeader
        title="Alle Positionen"
        right={
          <button
            onClick={handleAdd}
            className="text-[11px] text-[#AFA9EC] font-medium"
          >
            + Neu
          </button>
        }
      />

      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-hide">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`text-[9px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              filter === tab.id
                ? 'bg-[#7F77DD]/20 text-[#AFA9EC] border border-[#7F77DD]/40'
                : 'bg-[#1a1a2e] text-[#8888aa] border border-[#2a2a44]'
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
            <div className="mb-4">
              <div className="text-[10px] text-[#8888aa] uppercase tracking-wider mb-2">
                Einnahmen
              </div>
              {filteredIncomes.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => handleEdit(inc, 'income')}
                  className="flex items-center justify-between py-2.5 border-b border-[#2a2a44]/50 cursor-pointer active:opacity-70"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-[#5DCAA5]" />
                    <span className="text-[12px] text-[#e8e8ff]">{inc.name}</span>
                  </div>
                  <span className="text-[12px] font-medium text-[#5DCAA5]">
                    + {formatEuro(inc.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {Object.entries(expensesByCategory).map(([catId, items]) => {
            const cat = categories.find((c) => c.id === catId);
            return (
              <div key={catId} className="mb-4">
                <div className="text-[10px] text-[#8888aa] uppercase tracking-wider mb-2">
                  {cat?.label || catId}
                </div>
                {items.map((exp) => (
                  <div
                    key={exp.id}
                    onClick={() => handleEdit(exp, 'expense')}
                    className="flex items-center justify-between py-2.5 border-b border-[#2a2a44]/50 cursor-pointer active:opacity-70"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat?.dotColor || '#8888aa' }}
                      />
                      <span className="text-[12px] text-[#e8e8ff]">{exp.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-[#e8e8ff]">
                        {formatEuro(exp.amount)}
                      </span>
                      {cat && (
                        <Badge
                          label={cat.label.length > 5 ? cat.label.substring(0, 5) : cat.label}
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
