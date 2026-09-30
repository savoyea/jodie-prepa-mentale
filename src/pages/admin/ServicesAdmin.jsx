import { useState } from 'react';
import { Plus, Trash2, Edit2, Save } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext.jsx';
import { useAdmin } from '../../contexts/AdminContext.jsx';
import { SLOT_DURATIONS } from '../../utils.js';

const COLOR_MAP = {
  sage:      '#e6bfc2',
  terracotta:'#a31621',
  ochre:     '#c8989c',
  olive:     '#7d1019',
};

export default function ServicesAdmin() {
  const { services, updateServices } = useSite();
  const { showToast } = useAdmin();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', duration: 60, price: 0, priceLabel: '', description: '', color: 'sage', surDevis: false });

  const startEdit = (s) => { setEditing(s.id); setForm({ surDevis: false, ...s }); };
  const startNew = () => { setEditing('new'); setForm({ name: '', duration: 60, price: 0, priceLabel: '', description: '', color: 'sage', surDevis: false }); };

  const save = () => {
    if (!form.name.trim()) { showToast("Le nom est requis"); return; }
    if (editing === 'new') {
      updateServices([...services, { ...form, id: 's' + Date.now() }]);
      showToast("Service créé");
    } else {
      updateServices(services.map(s => s.id === editing ? { ...s, ...form } : s));
      showToast("Service mis à jour");
    }
    setEditing(null);
  };

  const remove = (id) => {
    updateServices(services.filter(s => s.id !== id));
    showToast("Service supprimé");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-serif text-4xl" style={{ color: 'var(--color-ink)' }}>Services & Tarifs</h1>
        <button onClick={startNew} className="px-4 py-2 rounded-full text-sm font-mono uppercase tracking-widest flex items-center gap-2" style={{ background: 'var(--color-ink)', color: 'var(--color-cream)' }}>
          <Plus size={14} /> Nouveau
        </button>
      </div>
      <p className="text-sm mb-8" style={{ color: 'var(--color-ink-soft)' }}>Configurez les prestations proposées à vos clients.</p>

      {editing && (
        <div className="p-6 rounded-2xl mb-6" style={{ background: 'var(--color-cream)', border: '2px solid var(--color-sage-dark)' }}>
          <h3 className="font-serif text-2xl mb-4" style={{ color: 'var(--color-ink)' }}>{editing === 'new' ? 'Nouveau service' : 'Modifier le service'}</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <Label>Nom du service</Label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex : Séance individuelle" className="w-full px-3 py-2 rounded-lg border outline-none" style={inputStyle} />
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <button type="button" onClick={() => setForm({ ...form, surDevis: !form.surDevis, priceLabel: !form.surDevis ? 'Sur devis' : form.priceLabel })}
                className="relative w-10 h-5 rounded-full transition-all flex-shrink-0"
                style={{ background: form.surDevis ? 'var(--color-sage-dark)' : 'var(--color-line)' }}>
                <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ transform: form.surDevis ? 'translateX(20px)' : 'none' }} />
              </button>
              <span className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                Sur devis <span className="text-xs opacity-60">(formulaire de demande textuelle, pas de créneau)</span>
              </span>
            </div>

            {!form.surDevis && (
              <>
                <div>
                  <Label>Durée (minutes)</Label>
                  <select value={form.duration} onChange={e => setForm({...form, duration: parseInt(e.target.value) || 60})} className="w-full px-3 py-2 rounded-lg border outline-none" style={inputStyle}>
                    {SLOT_DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Prix (€)</Label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: parseInt(e.target.value) || 0})} placeholder="55" className="w-full px-3 py-2 rounded-lg border outline-none" style={inputStyle} />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <Label>Affichage du prix</Label>
              <input value={form.priceLabel} onChange={e => setForm({...form, priceLabel: e.target.value})} placeholder={form.surDevis ? 'Sur devis' : 'Ex : À partir de 55 €'} className="w-full px-3 py-2 rounded-lg border outline-none" style={inputStyle} />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Décrivez la prestation…" rows={3} className="w-full px-3 py-2 rounded-lg border resize-none outline-none" style={inputStyle} />
            </div>
            <div className="md:col-span-2">
              <Label>Couleur</Label>
              <div className="flex gap-2">
                {Object.entries(COLOR_MAP).map(([c, hex]) => (
                  <button key={c} onClick={() => setForm({...form, color: c})} className="w-8 h-8 rounded-full transition-transform"
                    style={{ background: hex, transform: form.color === c ? 'scale(1.2)' : 'scale(1)', boxShadow: form.color === c ? '0 0 0 2px var(--color-ink)' : 'none' }} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} className="px-5 py-2 rounded-full text-sm font-mono uppercase tracking-widest flex items-center gap-2" style={{ background: 'var(--color-sage-dark)', color: 'var(--color-cream)' }}>
              <Save size={14} /> Enregistrer
            </button>
            <button onClick={() => setEditing(null)} className="px-5 py-2 rounded-full text-sm font-mono uppercase tracking-widest border" style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink-soft)' }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {services.map(s => (
          <div key={s.id} className="p-5 rounded-2xl flex gap-4" style={{ background: 'var(--color-cream)' }}>
            <div className="w-12 h-12 rounded-full flex-shrink-0" style={{ background: COLOR_MAP[s.color] || COLOR_MAP.sage }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-serif text-xl" style={{ color: 'var(--color-ink)' }}>{s.name}</div>
                {s.surDevis && <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: 'var(--color-ochre)', color: 'var(--color-cream)' }}>Sur devis</span>}
              </div>
              <div className="text-xs font-mono mb-2" style={{ color: 'var(--color-ink-soft)' }}>{!s.surDevis && `${s.duration} min · `}{s.priceLabel}</div>
              <p className="text-sm mb-3" style={{ color: 'var(--color-ink-soft)' }}>{s.description}</p>
              <div className="flex gap-3">
                <button onClick={() => startEdit(s)} className="text-xs font-mono uppercase tracking-widest flex items-center gap-1 hover:underline" style={{ color: 'var(--color-ink-soft)' }}><Edit2 size={10} /> Modifier</button>
                <button onClick={() => remove(s.id)} className="text-xs font-mono uppercase tracking-widest flex items-center gap-1 hover:underline" style={{ color: 'var(--color-sage-dark)' }}><Trash2 size={10} /> Supprimer</button>
              </div>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <div className="md:col-span-2 text-center py-12 rounded-2xl text-sm" style={{ background: 'var(--color-cream)', color: 'var(--color-ink-soft)' }}>
            Aucun service — cliquez sur Nouveau pour commencer
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = { background: 'var(--color-cream-light)', borderColor: 'var(--color-line)' };
const Label = ({ children }) => (
  <div className="text-xs uppercase tracking-widest mb-1.5 font-mono" style={{ color: 'var(--color-ink-soft)' }}>{children}</div>
);
