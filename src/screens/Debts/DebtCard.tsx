import type { Expense } from '../../types/finance';
import { formatEuro } from '../../utils/formatters';
import { remainingMonths, debtProgress } from '../../utils/calculations';
import Card from '../../components/ui/Card';
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

  return (
    <Card onClick={onClick} className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-medium text-[#e8e8ff]">{expense.name}</span>
        <span className="text-[12px] text-[#e8e8ff]">
          {formatEuro(details.monthlyRate)} / mo
        </span>
      </div>

      <ProgressBar percent={progress} className="mb-2" />

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#8888aa]">
          {formatEuro(details.remainingAmount)} offen
        </span>
        <span
          className="text-[10px] font-medium"
          style={{ color: months > 48 ? '#F0997B' : '#5DCAA5' }}
        >
          {months} Mo. rest
        </span>
      </div>

      {(details.referenceNumber || details.contactPhone) && (
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[#2a2a44]">
          {details.referenceNumber && (
            <span className="text-[9px] text-[#8888aa]">
              Az.: {details.referenceNumber}
            </span>
          )}
          {details.contactPhone && (
            <a
              href={`tel:${details.contactPhone}`}
              className="text-[9px] text-[#8888aa] flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              ✆ {details.contactPhone}
            </a>
          )}
        </div>
      )}
    </Card>
  );
}
