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
    <div className="p-3.5 pb-24">
      <PageHeader
        title="Schulden"
        right={
          <span className="text-[10px] text-[#8888aa]">
            {uniqueDebts.length} aktiv
          </span>
        }
      />

      {uniqueDebts.length === 0 ? (
        <EmptyState message="Keine Schulden vorhanden." />
      ) : (
        uniqueDebts.map((debt) => (
          <DebtCard
            key={debt.id}
            expense={debt}
            onClick={() => setSelectedDebt(debt)}
          />
        ))
      )}

      <Modal
        isOpen={!!selectedDebt}
        onClose={() => setSelectedDebt(null)}
        title="Schulden-Detail"
      >
        {selectedDebt?.debtDetails && (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[12px] text-[#e8e8ff] font-medium">
                {selectedDebt.name}
              </span>
              <span className="text-[12px] text-[#e8e8ff]">
                {formatEuro(selectedDebt.debtDetails.monthlyRate)} / mo
              </span>
            </div>

            <ProgressBar
              percent={debtProgress(
                selectedDebt.debtDetails.totalAmount,
                selectedDebt.debtDetails.remainingAmount,
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-[#8888aa] uppercase tracking-wider mb-0.5">
                  Gesamtbetrag
                </div>
                <div className="text-[12px] text-[#e8e8ff]">
                  {formatEuro(selectedDebt.debtDetails.totalAmount)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#8888aa] uppercase tracking-wider mb-0.5">
                  Restbetrag
                </div>
                <div className="text-[12px] text-[#F0997B]">
                  {formatEuro(selectedDebt.debtDetails.remainingAmount)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#8888aa] uppercase tracking-wider mb-0.5">
                  Restlaufzeit
                </div>
                <div
                  className="text-[12px]"
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
              <div>
                <div className="text-[10px] text-[#8888aa] uppercase tracking-wider mb-0.5">
                  Bezahlt
                </div>
                <div className="text-[12px] text-[#5DCAA5]">
                  {formatEuro(
                    selectedDebt.debtDetails.totalAmount -
                      selectedDebt.debtDetails.remainingAmount,
                  )}
                </div>
              </div>
            </div>

            {selectedDebt.debtDetails.referenceNumber && (
              <div>
                <div className="text-[10px] text-[#8888aa] uppercase tracking-wider mb-0.5">
                  Aktenzeichen
                </div>
                <div className="text-[12px] text-[#e8e8ff]">
                  {selectedDebt.debtDetails.referenceNumber}
                </div>
              </div>
            )}

            {selectedDebt.debtDetails.contactPhone && (
              <div>
                <div className="text-[10px] text-[#8888aa] uppercase tracking-wider mb-0.5">
                  Telefon
                </div>
                <a
                  href={`tel:${selectedDebt.debtDetails.contactPhone}`}
                  className="text-[12px] text-[#AFA9EC]"
                >
                  {selectedDebt.debtDetails.contactPhone}
                </a>
              </div>
            )}

            {selectedDebt.debtDetails.contactName && (
              <div>
                <div className="text-[10px] text-[#8888aa] uppercase tracking-wider mb-0.5">
                  Kontakt
                </div>
                <div className="text-[12px] text-[#e8e8ff]">
                  {selectedDebt.debtDetails.contactName}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
