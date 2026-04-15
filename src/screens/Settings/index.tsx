import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatMonthShort, getAdjacentMonth } from '../../utils/formatters';
import PageHeader from '../../components/layout/PageHeader';
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

  const handleAddCategory = () => {
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
    addCategory(cat);
    setNewCatName('');
    setShowAddCat(false);
  };

  const sectionLabel = 'text-[10px] text-[#8888aa] uppercase tracking-wider mb-2';

  return (
    <div className="p-3.5 pb-24">
      <PageHeader title="Einstellungen" />

      <div className="mb-5">
        <div className={sectionLabel}>Profil</div>
        <div className="flex items-center justify-between py-2">
          <span className="text-[13px] text-[#e8e8ff]">{user?.name || 'User'}</span>
          <span className="text-[11px] text-[#8888aa]">{user?.email || ''}</span>
        </div>
      </div>

      <div className="border-t border-[#2a2a44] pt-4 mb-5">
        <div className={sectionLabel}>Kategorien</div>
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              label={cat.label}
              bgColor={cat.bgColor}
              textColor={cat.textColor}
            />
          ))}
          <button
            onClick={() => setShowAddCat(true)}
            className="text-[9px] font-medium px-2 py-0.5 rounded border border-[#2a2a44] text-[#8888aa]"
          >
            + Neu
          </button>
        </div>
      </div>

      <div className="border-t border-[#2a2a44] pt-4 mb-5">
        <div className={sectionLabel}>Monat</div>
        <div className="flex items-center justify-between py-2">
          <span className="text-[13px] text-[#e8e8ff] font-medium">
            {formatMonthShort(currentMonth)}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentMonth(getAdjacentMonth(currentMonth, -1))}
              className="text-[#8888aa] text-sm"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentMonth(getAdjacentMonth(currentMonth, 1))}
              className="text-[#8888aa] text-sm"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-[#2a2a44] pt-4 mb-5">
        <div className={sectionLabel}>Daten</div>
        <button
          onClick={handleExport}
          className="flex items-center justify-between w-full py-2"
        >
          <span className="text-[13px] text-[#e8e8ff]">Export als JSON</span>
          <span className="text-[#8888aa]">↓</span>
        </button>
      </div>

      <div className="border-t border-[#2a2a44] pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center justify-between w-full py-2"
        >
          <span className="text-[13px] text-[#e8e8ff]">Abmelden</span>
          <span className="text-[#F0997B]">→</span>
        </button>
      </div>

      <Modal
        isOpen={showAddCat}
        onClose={() => setShowAddCat(false)}
        title="Neue Kategorie"
      >
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-[#8888aa] uppercase tracking-wider mb-1 block">
              Name
            </label>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="z.B. Transport"
              className="w-full bg-[#1a1a2e] border border-[#2a2a44] rounded-lg px-3 py-2 text-[12px] text-[#e8e8ff] outline-none focus:border-[#7F77DD]"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#8888aa] uppercase tracking-wider mb-1 block">
              Farbe
            </label>
            <div className="flex gap-2 flex-wrap">
              {PALETTE_COLORS.map((color, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(i)}
                  className="w-7 h-7 rounded-full border-2 transition-colors"
                  style={{
                    backgroundColor: color.bgColor,
                    borderColor: i === selectedColor ? color.textColor : 'transparent',
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full mx-auto"
                    style={{ backgroundColor: color.textColor }}
                  />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAddCategory}
            className="w-full text-[11px] font-medium py-2.5 rounded-lg bg-[#7F77DD] text-[#e8e8ff]"
          >
            Hinzufügen
          </button>
        </div>
      </Modal>
    </div>
  );
}
