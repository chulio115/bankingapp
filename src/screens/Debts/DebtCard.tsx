import type { Expense } from '../../types/finance';
import { formatEuro } from '../../utils/formatters';
import { remainingMonths, debtProgress } from '../../utils/calculations';

interface DebtCardProps {
  expense: Expense;
  onClick: () => void;
}

export default function DebtCard({ expense, onClick }: DebtCardProps) {
  const details = expense.debtDetails;
  if (!details) return null;

  const progress = debtProgress(details.totalAmount, details.remainingAmount);
  const months = remainingMonths(details.endDate);
  const progressColor = progress > 70 ? '#5DCAA5' : progress > 40 ? '#E8C547' : '#7c6fe0';
  const paid = details.totalAmount - details.remainingAmount;

  return (
    <div
      onClick={onClick}
      style={{ background: '#141428', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px 16px 14px', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s' }}
    >
      {/* Left accent */}
      <div style={{ position: 'absolute', left: 0, top: 12, bottom: 12, width: 3, borderRadius: 2, backgroundColor: progressColor }} />

      <div style={{ paddingLeft: 10 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e2ff' }}>{expense.name}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: progressColor }}>{formatEuro(details.monthlyRate)}<span style={{ fontSize: 11, fontWeight: 400, color: '#666688' }}>/Mo</span></span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{ height: '100%', width: `${Math.min(100, progress)}%`, background: `linear-gradient(90deg, ${progressColor}, ${progressColor}99)`, borderRadius: 3, transition: 'width 0.7s ease-out' }} />
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 11, color: '#666688' }}>{formatEuro(paid)} <span style={{ color: '#5DCAA5' }}>bezahlt</span></span>
            <span style={{ fontSize: 11, color: '#666688' }}>{formatEuro(details.remainingAmount)} offen</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: months > 48 ? '#F0997B' : months > 12 ? '#E8C547' : '#5DCAA5' }}>
            {months > 0 ? `${months} Mo.` : 'Fertig!'}
          </span>
        </div>
      </div>
    </div>
  );
}
