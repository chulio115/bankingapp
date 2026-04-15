import { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { useFinanceStore } from '../../store/useFinanceStore';
import { generateId } from '../../utils/formatters';
import type { Income, Expense, DebtDetails } from '../../types/finance';

type PositionType = 'income' | 'expense';

interface PositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: (Income | Expense) & { type: PositionType };
}

export default function PositionModal({ isOpen, onClose, editItem }: PositionModalProps) {
  const { currentMonth, categories, addIncome, updateIncome, deleteIncome, addExpense, updateExpense, deleteExpense } = useFinanceStore();

  const [type, setType] = useState<PositionType>('expense');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('abo');
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState('');
  const [debtDetails, setDebtDetails] = useState<DebtDetails>({
    totalAmount: 0,
    remainingAmount: 0,
    monthlyRate: 0,
    startDate: '',
    endDate: '',
    referenceNumber: '',
    contactPhone: '',
    contactName: '',
  });

  useEffect(() => {
    if (editItem) {
      setType(editItem.type);
      setName(editItem.name);
      setAmount(String(editItem.amount));
      setNotes(editItem.notes || '');
      if (editItem.type === 'expense') {
        const exp = editItem as Expense;
        setCategory(exp.category);
        setIsRecurring(exp.isRecurring);
        if (exp.debtDetails) {
          setDebtDetails(exp.debtDetails);
        }
      }
    } else {
      setType('expense');
      setName('');
      setAmount('');
      setCategory('abo');
      setIsRecurring(false);
      setNotes('');
      setDebtDetails({
        totalAmount: 0,
        remainingAmount: 0,
        monthlyRate: 0,
        startDate: '',
        endDate: '',
        referenceNumber: '',
        contactPhone: '',
        contactName: '',
      });
    }
  }, [editItem, isOpen]);

  const handleSave = () => {
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!name.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (type === 'income') {
      const income: Income = {
        id: editItem?.id || generateId(),
        name: name.trim(),
        amount: parsedAmount,
        month: currentMonth,
        notes: notes.trim() || undefined,
      };
      if (editItem) updateIncome(income);
      else addIncome(income);
    } else {
      const expense: Expense = {
        id: editItem?.id || generateId(),
        name: name.trim(),
        amount: parsedAmount,
        category,
        month: currentMonth,
        isRecurring,
        notes: notes.trim() || undefined,
        debtDetails: category === 'schulden' ? debtDetails : undefined,
      };
      if (editItem) updateExpense(expense);
      else addExpense(expense);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!editItem) return;
    if (editItem.type === 'income') deleteIncome(editItem.id);
    else deleteExpense(editItem.id);
    onClose();
  };

  const inputClass = 'w-full bg-[#0e0e20] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#e2e2ff] outline-none transition-all';
  const labelClass = 'text-[11px] text-[#555577] uppercase tracking-[0.1em] font-medium mb-2 block';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? 'Position bearbeiten' : 'Neue Position'}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setType('income')}
            className={`flex-1 text-sm font-medium py-2.5 rounded-xl border transition-all duration-200 ${
              type === 'income'
                ? 'bg-[#5DCAA5]/10 border-[#5DCAA5]/30 text-[#5DCAA5]'
                : 'bg-white/[0.03] border-white/[0.06] text-[#555577] hover:bg-white/[0.05]'
            }`}
          >
            Einnahme
          </button>
          <button
            onClick={() => setType('expense')}
            className={`flex-1 text-sm font-medium py-2.5 rounded-xl border transition-all duration-200 ${
              type === 'expense'
                ? 'bg-[#F0997B]/10 border-[#F0997B]/30 text-[#F0997B]'
                : 'bg-white/[0.03] border-white/[0.06] text-[#555577] hover:bg-white/[0.05]'
            }`}
          >
            Ausgabe
          </button>
        </div>

        <div>
          <label className={labelClass}>Bezeichnung</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Gehalt, Netflix..."
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Betrag (€)</label>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            className={inputClass}
          />
        </div>

        {type === 'expense' && (
          <>
            <div>
              <label className={labelClass}>Kategorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer py-1">
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                isRecurring ? 'bg-[#7c6fe0] border-[#7c6fe0]' : 'border-white/[0.15] bg-transparent'
              }`}>
                {isRecurring && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="sr-only"
              />
              <span className="text-sm text-[#c0c0dd]">Wiederkehrend</span>
            </label>

            {category === 'schulden' && (
              <div className="space-y-4 border-t border-white/[0.06] pt-4">
                <div className="text-[11px] text-[#555577] uppercase tracking-[0.1em] font-medium">
                  Schulden-Details
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelClass}>Gesamtbetrag</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={debtDetails.totalAmount || ''}
                      onChange={(e) =>
                        setDebtDetails({ ...debtDetails, totalAmount: parseFloat(e.target.value.replace(',', '.')) || 0 })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Restbetrag</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={debtDetails.remainingAmount || ''}
                      onChange={(e) =>
                        setDebtDetails({ ...debtDetails, remainingAmount: parseFloat(e.target.value.replace(',', '.')) || 0 })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Monatliche Rate</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={debtDetails.monthlyRate || ''}
                    onChange={(e) =>
                      setDebtDetails({ ...debtDetails, monthlyRate: parseFloat(e.target.value.replace(',', '.')) || 0 })
                    }
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelClass}>Start</label>
                    <input
                      type="date"
                      value={debtDetails.startDate}
                      onChange={(e) => setDebtDetails({ ...debtDetails, startDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Ende</label>
                    <input
                      type="date"
                      value={debtDetails.endDate}
                      onChange={(e) => setDebtDetails({ ...debtDetails, endDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Aktenzeichen</label>
                  <input
                    type="text"
                    value={debtDetails.referenceNumber || ''}
                    onChange={(e) => setDebtDetails({ ...debtDetails, referenceNumber: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Telefon</label>
                  <input
                    type="tel"
                    value={debtDetails.contactPhone || ''}
                    onChange={(e) => setDebtDetails({ ...debtDetails, contactPhone: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Kontaktname</label>
                  <input
                    type="text"
                    value={debtDetails.contactName || ''}
                    onChange={(e) => setDebtDetails({ ...debtDetails, contactName: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </>
        )}

        <div>
          <label className={labelClass}>Notizen (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex gap-3 pt-3">
          {editItem && (
            <button
              onClick={handleDelete}
              className="flex-1 text-sm font-medium py-3 rounded-xl bg-[#F0997B]/8 text-[#F0997B] border border-[#F0997B]/15 hover:bg-[#F0997B]/12"
            >
              Löschen
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 text-sm font-semibold py-3 rounded-xl text-white"
            style={{
              background: 'linear-gradient(135deg, #7c6fe0 0%, #9b8ff0 100%)',
              boxShadow: '0 4px 16px rgba(124, 111, 224, 0.3)',
            }}
          >
            {editItem ? 'Speichern' : 'Hinzufügen'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
