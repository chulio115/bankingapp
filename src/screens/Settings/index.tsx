import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatMonthShort, getAdjacentMonth } from '../../utils/formatters';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import type { CategoryConfig } from '../../types/finance';

const PALETTE_COLORS = [
  { textColor: '#AFA9EC', bgColor: '#2a2a55' },
  { textColor: '#85B7EB', bgColor: '#1a2a33' },
  { textColor: '#97C459', bgColor: '#2a3322' },
  { textColor: '#D4537E', bgColor: '#2a2233' },
  { textColor: '#EF9F27', bgColor: '#2a2a22' },
  { textColor: '#5DCAA5', bgColor: '#1a2a2a' },
  { textColor: '#F0997B', bgColor: '#2a2222' },
  { textColor: '#E8E8FF', bgColor: '#2a2a3a' },
];

export default function Settings() {
  const { user } = useAuthStore();
  const { currentMonth, setCurrentMonth, categories, addCategory, incomes, expenses } = useFinanceStore();
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);

  const handleLogout = () => {
    if (window.netlifyIdentity) {
      window.netlifyIdentity.logout();
    }
  };

  const handleExport = () => {
    const data = {
      incomes,
      expenses,
      categories,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `haushalt-export-${currentMonth}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    const id = newCatName.trim().toLowerCase().replace(/\s+/g, '-');
    const color = PALETTE_COLORS[selectedColor];
    const cat: CategoryConfig = {
      id,
      label: newCatName.trim(),
      bgColor: color.bgColor,
      textColor: color.textColor,
      dotColor: color.textColor,
    };
    await addCategory(cat);
    setNewCatName('');
    setShowAddCat(false);
  };

  return (
    <div style={{ padding: '16px 20px 120px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e2ff', marginBottom: 24, letterSpacing: '-0.01em' }}>Einstellungen</h1>

      {/* Profil */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 10 }}>Profil</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#141428', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
          <span style={{ fontSize: 14, color: '#e2e2ff', fontWeight: 600 }}>{user?.name || 'User'}</span>
          <span style={{ fontSize: 12, color: '#666688' }}>{user?.email || ''}</span>
        </div>
      </div>

      {/* Kategorien */}
      <div style={{ marginBottom: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ fontSize: 11, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 10 }}>Kategorien</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {categories.map((cat) => (
            <Badge key={cat.id} label={cat.label} bgColor={cat.bgColor} textColor={cat.textColor} />
          ))}
          <button
            onClick={() => setShowAddCat(true)}
            style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 500, padding: '5px 10px', borderRadius: 8, border: '1px dashed rgba(255,255,255,0.1)', color: '#555577', background: 'none', cursor: 'pointer' }}
          >
            + Neu
          </button>
        </div>
      </div>

      {/* Monat */}
      <div style={{ marginBottom: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ fontSize: 11, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 10 }}>Monat</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#141428', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
          <span style={{ fontSize: 14, color: '#e2e2ff', fontWeight: 600 }}>{formatMonthShort(currentMonth)}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setCurrentMonth(getAdjacentMonth(currentMonth, -1))}
              style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'rgba(255,255,255,0.04)', color: '#666688', border: 'none', fontSize: 14, cursor: 'pointer' }}
            >←</button>
            <button
              onClick={() => setCurrentMonth(getAdjacentMonth(currentMonth, 1))}
              style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'rgba(255,255,255,0.04)', color: '#666688', border: 'none', fontSize: 14, cursor: 'pointer' }}
            >→</button>
          </div>
        </div>
      </div>

      {/* Daten */}
      <div style={{ marginBottom: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ fontSize: 11, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 10 }}>Daten</div>
        <button
          onClick={handleExport}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px 16px', background: '#141428', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, cursor: 'pointer' }}
        >
          <span style={{ fontSize: 14, color: '#e2e2ff', fontWeight: 500 }}>Export als JSON</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666688" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>

      {/* Abmelden */}
      <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px 16px', borderRadius: 16, border: '1px solid rgba(240,153,123,0.12)', background: 'none', cursor: 'pointer' }}
        >
          <span style={{ fontSize: 14, color: '#e2e2ff', fontWeight: 500 }}>Abmelden</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0997B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      <Modal
        isOpen={showAddCat}
        onClose={() => setShowAddCat(false)}
        title="Neue Kategorie"
      >
        <div className="space-y-5">
          <div>
            <label className="text-[11px] text-[#555577] uppercase tracking-[0.1em] font-medium mb-2 block">
              Name
            </label>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="z.B. Transport"
              className="w-full bg-[#0e0e20] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#e2e2ff] outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#555577] uppercase tracking-[0.1em] font-medium mb-2 block">
              Farbe
            </label>
            <div className="flex gap-2.5 flex-wrap">
              {PALETTE_COLORS.map((color, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(i)}
                  className="w-9 h-9 rounded-xl border-2 transition-all duration-200 flex items-center justify-center"
                  style={{
                    backgroundColor: color.bgColor,
                    borderColor: i === selectedColor ? color.textColor : 'transparent',
                    boxShadow: i === selectedColor ? `0 0 12px ${color.textColor}33` : 'none',
                  }}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: color.textColor }}
                  />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAddCategory}
            className="w-full text-sm font-semibold py-3 rounded-xl text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #7c6fe0 0%, #9b8ff0 100%)',
              boxShadow: '0 4px 16px rgba(124, 111, 224, 0.3)',
            }}
          >
            Hinzufügen
          </button>
        </div>
      </Modal>
    </div>
  );
}
