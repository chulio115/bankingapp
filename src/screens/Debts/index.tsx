import { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import PageHeader from '../../components/layout/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import DebtCard from './DebtCard';
import { formatEuro } from '../../utils/formatters';
import { remainingMonths, debtProgress } from '../../utils/calculations';
import ProgressBar from '../../components/ui/ProgressBar';
import type { Expense } from '../../types/finance';

export default function Debts() {
  const { expenses } = useFinanceStore();
  const [selectedDebt, setSelectedDebt] = useState<Expense | null>(null);

  const debtExpenses = expenses.filter(
    (e) => e.category === 'schulden' && e.debtDetails,
  );

  const uniqueDebts = debtExpenses.reduce<Expense[]>((acc, curr) => {
    if (!acc.find((d) => d.name === curr.name)) acc.push(curr);
    return acc;
  }, []);

  return (
    <div className="px-5 pt-4 pb-28">
      <PageHeader
        title="Schulden"
        right={
          <span className="text-xs text-[#555577] font-medium">
            {uniqueDebts.length} aktiv
          </span>
        }
      />

      {uniqueDebts.length === 0 ? (
        <EmptyState message="Keine Schulden vorhanden." />
      ) : (
        <div className="space-y-3">
          {uniqueDebts.map((debt) => (
            <DebtCard
              key={debt.id}
              expense={debt}
              onClick={() => setSelectedDebt(debt)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selectedDebt}
        onClose={() => setSelectedDebt(null)}
        title="Schulden-Detail"
      >
        {selectedDebt?.debtDetails && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-base text-[#e2e2ff] font-semibold">
                {selectedDebt.name}
              </span>
              <span className="text-sm text-[#c0c0dd] font-medium">
                {formatEuro(selectedDebt.debtDetails.monthlyRate)} / mo
              </span>
            </div>

            <ProgressBar
              percent={debtProgress(
                selectedDebt.debtDetails.totalAmount,
                selectedDebt.debtDetails.remainingAmount,
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.03] rounded-xl p-3">
                <div className="text-[11px] text-[#555577] uppercase tracking-[0.1em] font-medium mb-1">
                  Gesamtbetrag
                </div>
                <div className="text-sm text-[#e2e2ff] font-medium">
                  {formatEuro(selectedDebt.debtDetails.totalAmount)}
                </div>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3">
                <div className="text-[11px] text-[#555577] uppercase tracking-[0.1em] font-medium mb-1">
                  Restbetrag
                </div>
                <div className="text-sm text-[#F0997B] font-medium">
                  {formatEuro(selectedDebt.debtDetails.remainingAmount)}
                </div>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3">
                <div className="text-[11px] text-[#555577] uppercase tracking-[0.1em] font-medium mb-1">
                  Restlaufzeit
                </div>
                <div
                  className="text-sm font-medium"
                  style={{
                    color:
                      remainingMonths(selectedDebt.debtDetails.endDate) > 48
                        ? '#F0997B'
                        : '#5DCAA5',
                  }}
                >
                  {remainingMonths(selectedDebt.debtDetails.endDate)} Monate
                </div>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3">
                <div className="text-[11px] text-[#555577] uppercase tracking-[0.1em] font-medium mb-1">
                  Bezahlt
                </div>
                <div className="text-sm text-[#5DCAA5] font-medium">
                  {formatEuro(
                    selectedDebt.debtDetails.totalAmount -
                      selectedDebt.debtDetails.remainingAmount,
                  )}
                </div>
              </div>
            </div>

            {(selectedDebt.debtDetails.referenceNumber || selectedDebt.debtDetails.contactPhone || selectedDebt.debtDetails.contactName) && (
              <div className="border-t border-white/[0.06] pt-4 space-y-3">
                {selectedDebt.debtDetails.referenceNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#555577]">Aktenzeichen</span>
                    <span className="text-sm text-[#c0c0dd]">
                      {selectedDebt.debtDetails.referenceNumber}
                    </span>
                  </div>
                )}
                {selectedDebt.debtDetails.contactPhone && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#555577]">Telefon</span>
                    <a
                      href={`tel:${selectedDebt.debtDetails.contactPhone}`}
                      className="text-sm text-[#b8b2f0] font-medium"
                    >
                      {selectedDebt.debtDetails.contactPhone}
                    </a>
                  </div>
                )}
                {selectedDebt.debtDetails.contactName && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#555577]">Kontakt</span>
                    <span className="text-sm text-[#c0c0dd]">
                      {selectedDebt.debtDetails.contactName}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
