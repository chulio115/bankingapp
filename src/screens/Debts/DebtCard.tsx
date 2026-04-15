import type { Expense } from '../../types/finance';
import { formatEuro } from '../../utils/formatters';
import { remainingMonths, debtProgress } from '../../utils/calculations';
import ProgressBar from '../../components/ui/ProgressBar';

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

  return (
    <div
      onClick={onClick}
      className="bg-[#141428] border border-white/[0.06] rounded-2xl p-5 mb-3 cursor-pointer active:scale-[0.98] hover:border-white/[0.1] transition-all duration-200 relative overflow-hidden"
    >
      {/* Left accent border */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
        style={{ backgroundColor: progressColor }}
      />

      <div className="pl-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-[#e2e2ff]">{expense.name}</span>
          <span className="text-sm text-[#c0c0dd] font-medium">
            {formatEuro(details.monthlyRate)} / mo
          </span>
        </div>

        <ProgressBar percent={progress} color={progressColor} className="mb-3" />

        <div className="flex items-center justify-between">
          <span className="text-xs text-[#666688]">
            {formatEuro(details.remainingAmount)} offen
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: months > 48 ? '#F0997B' : '#5DCAA5' }}
          >
            {months} Mo. rest
          </span>
        </div>

        {(details.referenceNumber || details.contactPhone) && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.04]">
            {details.referenceNumber && (
              <span className="text-[11px] text-[#555577]">
                Az.: {details.referenceNumber}
              </span>
            )}
            {details.contactPhone && (
              <a
                href={`tel:${details.contactPhone}`}
                className="text-[11px] text-[#555577] flex items-center gap-1.5 hover:text-[#b8b2f0]"
                onClick={(e) => e.stopPropagation()}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                {details.contactPhone}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
