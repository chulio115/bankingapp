import { useState, useMemo } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import DebtCard from './DebtCard';
import { formatEuro } from '../../utils/formatters';
import { remainingMonths, debtProgress } from '../../utils/calculations';
import ProgressBar from '../../components/ui/ProgressBar';
import type { Expense } from '../../types/finance';

const cardStyle: React.CSSProperties = { background: '#141428', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 16 };

function formatDebtFreeDate(maxEndDate: string): string {
  if (!maxEndDate) return '–';
  const d = new Date(maxEndDate);
  return d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
}

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

  // Summary calculations
  const summary = useMemo(() => {
    const totalDebt = uniqueDebts.reduce((s, d) => s + (d.debtDetails?.totalAmount || 0), 0);
    const totalRemaining = uniqueDebts.reduce((s, d) => s + (d.debtDetails?.remainingAmount || 0), 0);
    const totalPaid = totalDebt - totalRemaining;
    const monthlyTotal = uniqueDebts.reduce((s, d) => s + (d.debtDetails?.monthlyRate || 0), 0);
    const overallProgress = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0;
    const maxEndDate = uniqueDebts.reduce((max, d) => {
      const end = d.debtDetails?.endDate || '';
      return end > max ? end : max;
    }, '');
    const maxMonths = maxEndDate ? remainingMonths(maxEndDate) : 0;
    return { totalDebt, totalRemaining, totalPaid, monthlyTotal, overallProgress, maxEndDate, maxMonths };
  }, [uniqueDebts]);

  return (
    <div style={{ padding: '16px 20px 120px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e2ff', letterSpacing: '-0.01em', margin: 0 }}>Schulden</h1>
        <span style={{ fontSize: 12, color: '#555577', fontWeight: 500 }}>{uniqueDebts.length} aktiv</span>
      </div>

      {uniqueDebts.length === 0 ? (
        <EmptyState message="Keine Schulden vorhanden. Erstelle eine Ausgabe mit der Kategorie 'Schulden'." />
      ) : (
        <>
          {/* Overall Progress */}
          <div style={{ ...cardStyle, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Gesamtfortschritt</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#5DCAA5' }}>{Math.round(summary.overallProgress)}%</span>
            </div>
            <ProgressBar percent={summary.overallProgress} color="#5DCAA5" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: '#666688' }}>
              <span>{formatEuro(summary.totalPaid)} bezahlt</span>
              <span>{formatEuro(summary.totalRemaining)} offen</span>
            </div>
          </div>

          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div style={cardStyle}>
              <div style={{ fontSize: 11, color: '#555577', marginBottom: 4 }}>Gesamtschuld</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e2ff' }}>{formatEuro(summary.totalDebt)}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 11, color: '#555577', marginBottom: 4 }}>Monatl. Belastung</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#F0997B' }}>{formatEuro(summary.monthlyTotal)}</div>
            </div>
          </div>

          {/* Debt-free Date */}
          {summary.maxEndDate && (
            <div style={{ ...cardStyle, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(93,202,165,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5DCAA5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#555577', marginBottom: 2 }}>Schuldenfrei ab</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#5DCAA5' }}>{formatDebtFreeDate(summary.maxEndDate)}</div>
                <div style={{ fontSize: 11, color: '#666688', marginTop: 1 }}>Noch {summary.maxMonths} Monate</div>
              </div>
            </div>
          )}

          {/* Debt Cards */}
          <div style={{ fontSize: 11, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 10 }}>Einzelne Schulden</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {uniqueDebts.map((debt) => (
              <DebtCard
                key={debt.id}
                expense={debt}
                onClick={() => setSelectedDebt(debt)}
              />
            ))}
          </div>
        </>
      )}

      <Modal
        isOpen={!!selectedDebt}
        onClose={() => setSelectedDebt(null)}
        title={selectedDebt?.name || 'Schulden-Detail'}
      >
        {selectedDebt?.debtDetails && (() => {
          const d = selectedDebt.debtDetails!;
          const months = remainingMonths(d.endDate);
          const progress = debtProgress(d.totalAmount, d.remainingAmount);
          const paid = d.totalAmount - d.remainingAmount;
          const progressColor = progress > 70 ? '#5DCAA5' : progress > 40 ? '#E8C547' : '#7c6fe0';
          const statBox: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 14 };
          const statLabel: React.CSSProperties = { fontSize: 11, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: 4 };
          const statVal: React.CSSProperties = { fontSize: 15, fontWeight: 600 };
          const row: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' };
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Rate + Progress */}
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#e2e2ff' }}>{formatEuro(d.monthlyRate)}</div>
                <div style={{ fontSize: 12, color: '#666688', marginTop: 2 }}>monatliche Rate</div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                  <span style={{ color: '#5DCAA5' }}>{Math.round(progress)}% bezahlt</span>
                  <span style={{ color: '#666688' }}>{formatEuro(d.remainingAmount)} offen</span>
                </div>
                <ProgressBar percent={progress} color={progressColor} />
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={statBox}>
                  <div style={statLabel}>Gesamtbetrag</div>
                  <div style={{ ...statVal, color: '#e2e2ff' }}>{formatEuro(d.totalAmount)}</div>
                </div>
                <div style={statBox}>
                  <div style={statLabel}>Bereits bezahlt</div>
                  <div style={{ ...statVal, color: '#5DCAA5' }}>{formatEuro(paid)}</div>
                </div>
                <div style={statBox}>
                  <div style={statLabel}>Restlaufzeit</div>
                  <div style={{ ...statVal, color: months > 48 ? '#F0997B' : months > 12 ? '#E8C547' : '#5DCAA5' }}>{months} Monate</div>
                </div>
                <div style={statBox}>
                  <div style={statLabel}>Fertig am</div>
                  <div style={{ ...statVal, color: '#e2e2ff', fontSize: 13 }}>{d.endDate ? formatDebtFreeDate(d.endDate) : '–'}</div>
                </div>
              </div>

              {/* Timeline */}
              {d.startDate && d.endDate && (
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#555577', marginBottom: 8 }}>
                    <span>{new Date(d.startDate).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}</span>
                    <span>{new Date(d.endDate).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${progressColor}, ${progressColor}88)`, borderRadius: 3 }} />
                    <div style={{ position: 'absolute', top: -3, left: `${progress}%`, width: 12, height: 12, borderRadius: '50%', background: progressColor, border: '2px solid #141428', transform: 'translateX(-50%)' }} />
                  </div>
                </div>
              )}

              {/* Contact Info */}
              {(d.referenceNumber || d.contactPhone || d.contactName) && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
                  <div style={{ fontSize: 11, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 10 }}>Kontakt & Referenz</div>
                  {d.referenceNumber && (
                    <div style={row}>
                      <span style={{ fontSize: 12, color: '#555577' }}>Aktenzeichen</span>
                      <span style={{ fontSize: 13, color: '#c0c0dd', fontWeight: 500 }}>{d.referenceNumber}</span>
                    </div>
                  )}
                  {d.contactName && (
                    <div style={row}>
                      <span style={{ fontSize: 12, color: '#555577' }}>Kontakt</span>
                      <span style={{ fontSize: 13, color: '#c0c0dd', fontWeight: 500 }}>{d.contactName}</span>
                    </div>
                  )}
                  {d.contactPhone && (
                    <div style={{ ...row, borderBottom: 'none' }}>
                      <span style={{ fontSize: 12, color: '#555577' }}>Telefon</span>
                      <a href={`tel:${d.contactPhone}`} style={{ fontSize: 13, color: '#b8b2f0', fontWeight: 600, textDecoration: 'none' }}>{d.contactPhone}</a>
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
