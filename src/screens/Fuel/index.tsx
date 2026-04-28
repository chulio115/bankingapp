import { useState, useRef, useMemo } from 'react';
import { useFuelStore } from '../../store/useFuelStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatEuro, generateId } from '../../utils/formatters';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Modal from '../../components/ui/Modal';
import type { FuelEntry } from '../../types/finance';
import { createWorker } from 'tesseract.js';

const cardStyle = { background: '#141428', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px' };
const labelStyle = { display: 'block' as const, fontSize: 11, color: '#555577', textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontWeight: 500, marginBottom: 6 };
const inputStyle = { width: '100%', background: '#0e0e20', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', fontSize: 15, color: '#e2e2ff', outline: 'none', fontFamily: 'inherit' };

export default function Fuel() {
  const { entries, addEntry, deleteEntry } = useFuelStore();
  const { addExpense, currentMonth } = useFinanceStore();
  const [showAdd, setShowAdd] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [liters, setLiters] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [odometer, setOdometer] = useState('');
  const [stationName, setStationName] = useState('');
  const [isFullTank, setIsFullTank] = useState(true);

  // Stats
  const monthEntries = useMemo(() => entries.filter((e) => e.month === currentMonth), [entries, currentMonth]);
  const monthTotal = useMemo(() => monthEntries.reduce((s, e) => s + e.totalAmount, 0), [monthEntries]);
  const monthAvgPrice = useMemo(() => {
    if (monthEntries.length === 0) return 0;
    return monthEntries.reduce((s, e) => s + e.pricePerLiter, 0) / monthEntries.length;
  }, [monthEntries]);

  // Chart: Preis/L Entwicklung (letzte 20 Einträge)
  const priceTrend = useMemo(() =>
    [...entries].reverse().slice(-20).map((e) => ({
      date: new Date(e.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
      preis: e.pricePerLiter,
    })),
  [entries]);

  // Chart: Monatskosten (letzte 6 Monate)
  const monthlyCosts = useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach((e) => { map[e.month] = (map[e.month] || 0) + e.totalAmount; });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([month, total]) => ({
      monat: month.slice(5),
      betrag: Math.round(total * 100) / 100,
    }));
  }, [entries]);

  // Verbrauch L/100km
  const consumption = useMemo(() => {
    const withOdo = entries.filter((e) => e.odometer && e.isFullTank).sort((a, b) => (a.odometer || 0) - (b.odometer || 0));
    if (withOdo.length < 2) return null;
    const last = withOdo[withOdo.length - 1];
    const prev = withOdo[withOdo.length - 2];
    const km = (last.odometer || 0) - (prev.odometer || 0);
    if (km <= 0) return null;
    return Math.round((last.liters / km) * 10000) / 100;
  }, [entries]);

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setPricePerLiter(''); setLiters(''); setTotalAmount('');
    setOdometer(''); setStationName(''); setIsFullTank(true);
    setOcrError('');
  };

  // Auto-calculate total
  const handlePriceOrLitersChange = (p: string, l: string) => {
    setPricePerLiter(p); setLiters(l);
    const pn = parseFloat(p.replace(',', '.'));
    const ln = parseFloat(l.replace(',', '.'));
    if (!isNaN(pn) && !isNaN(ln) && pn > 0 && ln > 0) {
      setTotalAmount((pn * ln).toFixed(2));
    }
  };

  // OCR
  const handlePhoto = async (file: File) => {
    setOcrLoading(true);
    setOcrError('');
    try {
      const worker = await createWorker('deu');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      // Parse Preis/L: pattern like 1,729 or 1.729 followed by EUR/L or €/L
      const priceMatch = text.match(/(\d[.,]\d{2,3})\s*(?:EUR\/L|€\/L|eur\/l)/i)
        || text.match(/Preis\/L[:\s]*(\d[.,]\d{2,3})/i)
        || text.match(/(\d[.,]\d{3})\s/);
      if (priceMatch) setPricePerLiter(priceMatch[1].replace('.', ','));

      // Parse Menge/Liter
      const literMatch = text.match(/(\d{1,3}[.,]\d{1,2})\s*(?:L(?:iter)?|l)\b/i)
        || text.match(/Menge[:\s]*(\d{1,3}[.,]\d{1,2})/i);
      if (literMatch) setLiters(literMatch[1].replace('.', ','));

      // Parse Gesamtbetrag: EUR followed by amount or SUMME/TOTAL
      const totalMatch = text.match(/(?:SUMME|TOTAL|Betrag|EUR)[:\s]*(\d{1,4}[.,]\d{2})/i)
        || text.match(/(\d{2,4}[.,]\d{2})\s*(?:EUR|€)/i);
      if (totalMatch) setTotalAmount(totalMatch[1].replace('.', ','));

      // Parse Tankstelle (first line often has station name)
      const lines = text.split('\n').filter((l) => l.trim().length > 3);
      if (lines.length > 0) {
        const first = lines[0].trim();
        if (!/\d{4}/.test(first) && first.length < 50) setStationName(first);
      }

      if (!priceMatch && !literMatch && !totalMatch) {
        setOcrError('Konnte keine Tankdaten erkennen. Bitte manuell eintragen.');
      }
    } catch (e) {
      console.error('OCR error:', e);
      setOcrError('Fehler beim Lesen des Belegs');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSave = async () => {
    const pn = parseFloat(pricePerLiter.replace(',', '.'));
    const ln = parseFloat(liters.replace(',', '.'));
    const tn = parseFloat(totalAmount.replace(',', '.'));
    if (isNaN(pn) || isNaN(ln) || isNaN(tn) || pn <= 0 || ln <= 0 || tn <= 0) return;

    const month = date.slice(0, 7);
    const expenseId = generateId();
    const fuelId = generateId();

    // Auto-create expense
    await addExpense({
      id: expenseId,
      name: stationName ? `Tanken – ${stationName}` : 'Tanken',
      amount: tn,
      category: 'tanken',
      month,
      isRecurring: false,
      notes: `${ln}L @ ${pn.toFixed(3)}€/L`,
    });

    const entry: FuelEntry = {
      id: fuelId, date, pricePerLiter: pn, liters: ln, totalAmount: tn,
      odometer: odometer ? parseInt(odometer) : undefined,
      isFullTank, stationName: stationName || undefined,
      expenseId, month,
    };
    await addEntry(entry);
    resetForm();
    setShowAdd(false);
  };

  const handleDelete = async (entry: FuelEntry) => {
    await deleteEntry(entry.id);
    if (entry.expenseId) {
      const { deleteExpense } = useFinanceStore.getState();
      await deleteExpense(entry.expenseId);
    }
  };

  return (
    <div style={{ padding: '16px 20px 120px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e2ff', marginBottom: 20, letterSpacing: '-0.01em' }}>Tanken</h1>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, color: '#555577', marginBottom: 4 }}>Diesen Monat</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#5DCAA5' }}>{formatEuro(monthTotal)}</div>
          <div style={{ fontSize: 11, color: '#555577', marginTop: 2 }}>{monthEntries.length}x getankt</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, color: '#555577', marginBottom: 4 }}>Ø Preis/L</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#e2e2ff' }}>{monthAvgPrice > 0 ? `${monthAvgPrice.toFixed(3)}€` : '–'}</div>
          {consumption && <div style={{ fontSize: 11, color: '#5DCAA5', marginTop: 2 }}>{consumption} L/100km</div>}
        </div>
      </div>

      {/* All-Time Total */}
      <div style={{ ...cardStyle, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: '#555577', marginBottom: 4 }}>Gesamt (alle Monate)</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e2ff' }}>{formatEuro(entries.reduce((s, e) => s + e.totalAmount, 0))}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#555577', marginBottom: 4 }}>Einträge</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e2ff' }}>{entries.length}</div>
        </div>
      </div>

      {/* Price Trend Chart */}
      {priceTrend.length >= 2 && (
        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 12 }}>Preis/L Entwicklung</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={priceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#555577' }} axisLine={false} tickLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#555577' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ background: '#1a1a36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, color: '#e2e2ff' }} formatter={(v) => [`${Number(v).toFixed(3)}€/L`, 'Preis']} />
              <Line type="monotone" dataKey="preis" stroke="#5DCAA5" strokeWidth={2} dot={{ r: 3, fill: '#5DCAA5' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Monthly Costs Chart */}
      {monthlyCosts.length >= 2 && (
        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 12 }}>Monatskosten</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={monthlyCosts}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="monat" tick={{ fontSize: 10, fill: '#555577' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#555577' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ background: '#1a1a36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, color: '#e2e2ff' }} formatter={(v) => [formatEuro(Number(v)), 'Kosten']} />
              <Bar dataKey="betrag" fill="#5DCAA5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={() => { resetForm(); setShowAdd(true); }}
        style={{ width: '100%', padding: 14, borderRadius: 14, border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', background: 'linear-gradient(135deg, #3a8a6a 0%, #5DCAA5 100%)', boxShadow: '0 4px 16px rgba(93, 202, 165, 0.25)', marginBottom: 20 }}
      >
        + Tankvorgang erfassen
      </button>

      {/* Recent Entries */}
      <div style={{ fontSize: 11, color: '#555577', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 10 }}>Letzte Einträge</div>
      {entries.length === 0 && <div style={{ color: '#444466', fontSize: 13, padding: 16, textAlign: 'center' }}>Noch keine Tankeinträge</div>}
      {entries.slice(0, 20).map((entry) => (
        <div key={entry.id} style={{ ...cardStyle, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e2ff' }}>
              {new Date(entry.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
              {entry.stationName && <span style={{ color: '#555577', fontWeight: 400 }}> – {entry.stationName}</span>}
            </div>
            <div style={{ fontSize: 12, color: '#555577', marginTop: 2 }}>
              {entry.liters.toFixed(1)}L @ {entry.pricePerLiter.toFixed(3)}€/L
              {entry.odometer && <span> · {entry.odometer.toLocaleString('de-DE')} km</span>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#5DCAA5' }}>{formatEuro(entry.totalAmount)}</span>
            <button onClick={() => handleDelete(entry)} style={{ background: 'none', border: 'none', color: '#F0997B', fontSize: 16, cursor: 'pointer', padding: 4 }}>×</button>
          </div>
        </div>
      ))}

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Tankvorgang">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Photo Upload */}
          <div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhoto(f); }} />
            <button onClick={() => fileRef.current?.click()} disabled={ocrLoading}
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px dashed rgba(93,202,165,0.3)', background: 'rgba(93,202,165,0.05)', color: '#5DCAA5', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {ocrLoading ? 'Beleg wird gelesen...' : '📸 Tankbeleg fotografieren'}
            </button>
            {ocrError && <div style={{ fontSize: 12, color: '#F0997B', marginTop: 6 }}>{ocrError}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Preis/L (€)</label>
              <input type="text" inputMode="decimal" value={pricePerLiter} placeholder="1,729"
                onChange={(e) => handlePriceOrLitersChange(e.target.value, liters)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Menge (L)</label>
              <input type="text" inputMode="decimal" value={liters} placeholder="42,31"
                onChange={(e) => handlePriceOrLitersChange(pricePerLiter, e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Gesamtbetrag (€)</label>
            <input type="text" inputMode="decimal" value={totalAmount} placeholder="73,15"
              onChange={(e) => setTotalAmount(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Datum</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>km-Stand</label>
              <input type="text" inputMode="numeric" value={odometer} placeholder="optional"
                onChange={(e) => setOdometer(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Tankstelle</label>
            <input type="text" value={stationName} placeholder="optional"
              onChange={(e) => setStationName(e.target.value)} style={inputStyle} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#e2e2ff', cursor: 'pointer' }}>
            <input type="checkbox" checked={isFullTank} onChange={(e) => setIsFullTank(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: '#5DCAA5' }} />
            Volltankung
          </label>

          <button onClick={handleSave}
            disabled={!pricePerLiter || !liters || !totalAmount}
            style={{ width: '100%', fontSize: 14, fontWeight: 600, padding: '14px 0', borderRadius: 12, color: '#fff', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #3a8a6a 0%, #5DCAA5 100%)', boxShadow: '0 4px 16px rgba(93, 202, 165, 0.25)', opacity: (!pricePerLiter || !liters || !totalAmount) ? 0.5 : 1 }}>
            Speichern & als Ausgabe verbuchen
          </button>
        </div>
      </Modal>
    </div>
  );
}
