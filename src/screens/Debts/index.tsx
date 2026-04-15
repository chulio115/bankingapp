import { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
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
    <div style={{ padding: '16px 20px 120px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e2ff', letterSpacing: '-0.01em', margin: 0 }}>Schulden</h1>
        <span style={{ fontSize: 12, color: '#555577', fontWeight: 500 }}>{uniqueDebts.length} aktiv</span>
      </div>

      {uniqueDebts.length === 0 ? (
        <EmptyState message="Keine Schulden vorhanden." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
        {selectedDebt?.debtDetails && (() => {
          const d = selectedDebt.debtDetails!;
          const months = remainingMonths(d.endDate);
          const statBox: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 14 };
          const statLabel: React.CSSProperties = { fontSize: 11, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, marginBottom: 4 };
          const statVal: React.CSSProperties = { fontSize: 14, fontWeight: 500 };
          const row: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' };
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 16, color: '#e2e2ff', fontWeight: 600 }}>{selectedDebt.name}</span>
                <span style={{ fontSize: 14, color: '#c0c0dd', fontWeight: 500 }}>{formatEuro(d.monthlyRate)} / mo</span>
              </div>

              <ProgressBar percent={debtProgress(d.totalAmount, d.remainingAmount)} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={statBox}>
                  <div style={statLabel}>Gesamtbetrag</div>
                  <div style={{ ...statVal, color: '#e2e2ff' }}>{formatEuro(d.totalAmount)}</div>
                </div>
                <div style={statBox}>
                  <div style={statLabel}>Restbetrag</div>
                  <div style={{ ...statVal, color: '#F0997B' }}>{formatEuro(d.remainingAmount)}</div>
                </div>
                <div style={statBox}>
                  <div style={statLabel}>Restlaufzeit</div>
                  <div style={{ ...statVal, color: months > 48 ? '#F0997B' : '#5DCAA5' }}>{months} Monate</div>
                </div>
                <div style={statBox}>
                  <div style={statLabel}>Bezahlt</div>
                  <div style={{ ...statVal, color: '#5DCAA5' }}>{formatEuro(d.totalAmount - d.remainingAmount)}</div>
                </div>
              </div>

              {(d.referenceNumber || d.contactPhone || d.contactName) && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
                  {d.referenceNumber && (
                    <div style={row}>
                      <span style={{ fontSize: 12, color: '#555577' }}>Aktenzeichen</span>
                      <span style={{ fontSize: 14, color: '#c0c0dd' }}>{d.referenceNumber}</span>
                    </div>
                  )}
                  {d.contactPhone && (
                    <div style={row}>
                      <span style={{ fontSize: 12, color: '#555577' }}>Telefon</span>
                      <a href={`tel:${d.contactPhone}`} style={{ fontSize: 14, color: '#b8b2f0', fontWeight: 500, textDecoration: 'none' }}>{d.contactPhone}</a>
                    </div>
                  )}
                  {d.contactName && (
                    <div style={row}>
                      <span style={{ fontSize: 12, color: '#555577' }}>Kontakt</span>
                      <span style={{ fontSize: 14, color: '#c0c0dd' }}>{d.contactName}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
