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

  const inputClass = 'w-full bg-[#1a1a2e] border border-[#2a2a44] rounded-lg px-3 py-2 text-[12px] text-[#e8e8ff] outline-none focus:border-[#7F77DD] transition-colors';
  const labelClass = 'text-[10px] text-[#8888aa] uppercase tracking-wider mb-1 block';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? 'Position bearbeiten' : 'Neue Position'}
    >
      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setType('income')}
            className={`flex-1 text-[11px] font-medium py-2 rounded-lg border transition-colors ${
              type === 'income'
                ? 'bg-[#5DCAA5]/10 border-[#5DCAA5]/40 text-[#5DCAA5]'
                : 'bg-[#1a1a2e] border-[#2a2a44] text-[#8888aa]'
            }`}
          >
            Einnahme
          </button>
          <button
            onClick={() => setType('expense')}
            className={`flex-1 text-[11px] font-medium py-2 rounded-lg border transition-colors ${
              type === 'expense'
                ? 'bg-[#F0997B]/10 border-[#F0997B]/40 text-[#F0997B]'
                : 'bg-[#1a1a2e] border-[#2a2a44] text-[#8888aa]'
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

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="accent-[#7F77DD]"
              />
              <span className="text-[11px] text-[#e8e8ff]">Wiederkehrend</span>
            </label>

            {category === 'schulden' && (
              <div className="space-y-3 border-t border-[#2a2a44] pt-3">
                <div className="text-[10px] text-[#8888aa] uppercase tracking-wider">
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

        <div className="flex gap-2 pt-2">
          {editItem && (
            <button
              onClick={handleDelete}
              className="flex-1 text-[11px] font-medium py-2.5 rounded-lg bg-[#F0997B]/10 text-[#F0997B] border border-[#F0997B]/30"
            >
              Löschen
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 text-[11px] font-medium py-2.5 rounded-lg bg-[#7F77DD] text-[#e8e8ff]"
          >
            {editItem ? 'Speichern' : 'Hinzufügen'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
