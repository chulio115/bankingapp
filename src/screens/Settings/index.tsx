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
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    setInviteMessage(null);
    try {
      const token = JSON.parse(localStorage.getItem('gotrue.user') || '{}')?.token?.access_token;
      if (!token) throw new Error('Nicht eingeloggt');
      const res = await fetch('/.netlify/functions/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Einladung fehlgeschlagen');
      setInviteMessage({ type: 'success', text: `Einladung an ${inviteEmail.trim()} gesendet!` });
      setInviteEmail('');
    } catch (err) {
      setInviteMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setInviteLoading(false);
    }
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

      {/* Benutzer einladen */}
      <div style={{ marginBottom: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ fontSize: 11, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 10 }}>Benutzer einladen</div>
        <div style={{ padding: '14px 16px', background: '#141428', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email-Adresse"
              style={{ flex: 1, background: '#0e0e20', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#e2e2ff', outline: 'none', fontFamily: 'inherit' }}
            />
            <button
              onClick={handleInvite}
              disabled={inviteLoading || !inviteEmail.trim()}
              style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: inviteLoading ? '#555' : 'linear-gradient(135deg, #7c6fe0 0%, #9b8ff0 100%)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', opacity: inviteLoading || !inviteEmail.trim() ? 0.5 : 1 }}
            >
              {inviteLoading ? '...' : 'Einladen'}
            </button>
          </div>
          {inviteMessage && (
            <div style={{ marginTop: 10, fontSize: 12, color: inviteMessage.type === 'success' ? '#5DCAA5' : '#F0997B' }}>
              {inviteMessage.text}
            </div>
          )}
          <p style={{ marginTop: 10, fontSize: 11, color: '#444466', lineHeight: 1.4 }}>
            Der eingeladene Benutzer erhält eine Email mit einem Link zum Passwort setzen.
          </p>
        </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, marginBottom: 8 }}>
              Name
            </label>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="z.B. Transport"
              style={{ width: '100%', background: '#0e0e20', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px', fontSize: 15, color: '#e2e2ff', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, marginBottom: 8 }}>
              Farbe
            </label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {PALETTE_COLORS.map((color, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(i)}
                  style={{
                    width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    backgroundColor: color.bgColor,
                    border: `2px solid ${i === selectedColor ? color.textColor : 'transparent'}`,
                    boxShadow: i === selectedColor ? `0 0 12px ${color.textColor}33` : 'none',
                  }}
                >
                  <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: color.textColor }} />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAddCategory}
            style={{ width: '100%', fontSize: 14, fontWeight: 600, padding: '14px 0', borderRadius: 12, color: '#fff', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #7c6fe0 0%, #9b8ff0 100%)', boxShadow: '0 4px 16px rgba(124, 111, 224, 0.3)' }}
          >
            Hinzufügen
          </button>
        </div>
      </Modal>
    </div>
  );
}
