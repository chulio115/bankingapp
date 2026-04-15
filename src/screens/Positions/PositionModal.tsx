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
      if (editItem.type === 'income') {
        setIsRecurring((editItem as Income).isRecurring || false);
      } else {
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

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!name.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (type === 'income') {
      const income: Income = {
        id: editItem?.id || generateId(),
        name: name.trim(),
        amount: parsedAmount,
        month: currentMonth,
        isRecurring: isRecurring || undefined,
        notes: notes.trim() || undefined,
      };
      if (editItem) await updateIncome(income);
      else await addIncome(income);
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
      if (editItem) await updateExpense(expense);
      else await addExpense(expense);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!editItem) return;
    if (editItem.type === 'income') await deleteIncome(editItem.id);
    else await deleteExpense(editItem.id);
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#0e0e20', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12, padding: '14px 16px', fontSize: 15, color: '#e2e2ff', outline: 'none',
    fontFamily: 'inherit',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, color: '#555577', textTransform: 'uppercase',
    letterSpacing: '0.1em', fontWeight: 500, marginBottom: 8,
  };
  const sectionTitle: React.CSSProperties = {
    fontSize: 11, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em',
    fontWeight: 600, marginBottom: 12,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? 'Position bearbeiten' : 'Neue Position'}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Type Toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button
            onClick={() => setType('income')}
            style={{
              padding: '12px 0', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              background: type === 'income' ? 'rgba(93,202,165,0.12)' : 'rgba(255,255,255,0.03)',
              color: type === 'income' ? '#5DCAA5' : '#555577',
              border: `1px solid ${type === 'income' ? 'rgba(93,202,165,0.3)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >Einnahme</button>
          <button
            onClick={() => setType('expense')}
            style={{
              padding: '12px 0', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              background: type === 'expense' ? 'rgba(240,153,123,0.12)' : 'rgba(255,255,255,0.03)',
              color: type === 'expense' ? '#F0997B' : '#555577',
              border: `1px solid ${type === 'expense' ? 'rgba(240,153,123,0.3)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >Ausgabe</button>
        </div>

        {/* Bezeichnung */}
        <div>
          <label style={labelStyle}>Bezeichnung</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="z.B. Gehalt, Netflix..." style={inputStyle} />
        </div>

        {/* Betrag */}
        <div>
          <label style={labelStyle}>Betrag (€)</label>
          <input type="text" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" style={inputStyle} />
        </div>

        {/* Kategorie — nur bei Ausgaben */}
        {type === 'expense' && (
          <div>
            <label style={labelStyle}>Kategorie</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666688' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Wiederkehrend — für BEIDE Types */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '4px 0' }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isRecurring ? '#7c6fe0' : 'transparent',
            border: `2px solid ${isRecurring ? '#7c6fe0' : 'rgba(255,255,255,0.15)'}`,
          }}>
            {isRecurring && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            )}
          </div>
          <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
          <span style={{ fontSize: 14, color: '#c0c0dd' }}>Wiederkehrend (monatlich)</span>
        </label>

        {/* Schulden-Details — nur bei Kategorie "schulden" */}
        {type === 'expense' && category === 'schulden' && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
            <div style={sectionTitle}>Schulden-Details</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Gesamtschuld (€)</label>
                <input type="text" inputMode="decimal" value={debtDetails.totalAmount || ''} onChange={(e) => setDebtDetails({ ...debtDetails, totalAmount: parseFloat(e.target.value.replace(',', '.')) || 0 })} placeholder="z.B. 42.000" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Restschuld (€)</label>
                <input type="text" inputMode="decimal" value={debtDetails.remainingAmount || ''} onChange={(e) => setDebtDetails({ ...debtDetails, remainingAmount: parseFloat(e.target.value.replace(',', '.')) || 0 })} placeholder="z.B. 35.000" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Monatliche Rate (€)</label>
              <input type="text" inputMode="decimal" value={debtDetails.monthlyRate || ''} onChange={(e) => setDebtDetails({ ...debtDetails, monthlyRate: parseFloat(e.target.value.replace(',', '.')) || 0 })} placeholder="z.B. 515" style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Startdatum</label>
                <input type="date" value={debtDetails.startDate} onChange={(e) => setDebtDetails({ ...debtDetails, startDate: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Enddatum</label>
                <input type="date" value={debtDetails.endDate} onChange={(e) => setDebtDetails({ ...debtDetails, endDate: e.target.value })} style={inputStyle} />
              </div>
            </div>

            {/* Kontakt-Infos */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 14, marginTop: 4 }}>
              <div style={sectionTitle}>Kontakt & Referenz</div>

              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Aktenzeichen</label>
                <input type="text" value={debtDetails.referenceNumber || ''} onChange={(e) => setDebtDetails({ ...debtDetails, referenceNumber: e.target.value })} placeholder="z.B. DE-2023-441" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Kontaktname</label>
                  <input type="text" value={debtDetails.contactName || ''} onChange={(e) => setDebtDetails({ ...debtDetails, contactName: e.target.value })} placeholder="Name" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Telefon</label>
                  <input type="tel" value={debtDetails.contactPhone || ''} onChange={(e) => setDebtDetails({ ...debtDetails, contactPhone: e.target.value })} placeholder="0800 ..." style={inputStyle} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notizen */}
        <div>
          <label style={labelStyle}>Notizen (optional)</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Zusätzliche Infos..." style={inputStyle} />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
          {editItem && (
            <button
              onClick={handleDelete}
              style={{ flex: 1, fontSize: 14, fontWeight: 500, padding: '14px 0', borderRadius: 12, background: 'rgba(240,153,123,0.08)', color: '#F0997B', border: '1px solid rgba(240,153,123,0.15)', cursor: 'pointer' }}
            >Löschen</button>
          )}
          <button
            onClick={handleSave}
            style={{ flex: 1, fontSize: 14, fontWeight: 600, padding: '14px 0', borderRadius: 12, color: '#fff', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #7c6fe0 0%, #9b8ff0 100%)', boxShadow: '0 4px 16px rgba(124, 111, 224, 0.3)' }}
          >{editItem ? 'Speichern' : 'Hinzufügen'}</button>
        </div>
      </div>
    </Modal>
  );
}
