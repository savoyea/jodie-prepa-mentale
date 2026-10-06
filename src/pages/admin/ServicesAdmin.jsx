import { useState, useEffect, useRef } from 'react';
import { Plus, Save, Trash2, Edit2 } from 'lucide-react';
import { pb } from '../../lib/pocketbase.js';
import { useAdmin } from '../../contexts/AdminContext.jsx';

const PRESETS = [
  { id: 'sage',       label: 'Rose',     hex: '#e6bfc2' },
  { id: 'terracotta', label: 'Brique',   hex: '#a31621' },
  { id: 'ochre',      label: 'Ocre',     hex: '#c9a96e' },
  { id: 'olive',      label: 'Olive',    hex: '#7a8c5c' },
];

function colorToHex(c) {
  if (!c) return PRESETS[0].hex;
  const preset = PRESETS.find(p => p.id === c);
  return preset ? preset.hex : c;
}

const EMPTY = { name: '', duration: 60, price: 0, price_label: '', sur_devis: false, description: '', color: 'sage', sort_order: 0, active: true };

function Toggle({ on, onChange }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{ position: 'relative', width: '2.5rem', height: '1.5rem', borderRadius: '1rem', background: on ? 'var(--color-sage-dark)' : 'var(--color-line)', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
    >
      <div style={{ position: 'absolute', top: '0.2rem', left: on ? '1.1rem' : '0.2rem', width: '1.1rem', height: '1.1rem', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </div>
  );
}

function ServiceForm({ service, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, ...service });
  const [saving, setSaving] = useState(false);
  const colorInputRef = useRef(null);

  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const isCustomColor = form.color && form.color.startsWith('#') && !PRESETS.some(p => p.id === form.color);
  const customHex = isCustomColor ? form.color : '#888888';

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const data = {
        name: form.name,
        duration: Number(form.duration) || 60,
        price: form.sur_devis ? 0 : (Number(form.price) || 0),
        price_label: form.price_label || '',
        sur_devis: form.sur_devis || false,
        description: form.description || '',
        color: form.color || 'sage',
        sort_order: Number(form.sort_order) || 0,
        active: form.active !== false,
      };
      if (service?.id) {
        await pb.collection('services').update(service.id, data);
      } else {
        await pb.collection('services').create(data);
      }
      onSave();
    } finally {
      setSaving(false);
    }
  };

  const inp = {
    className: 'w-full px-3 py-2 rounded-lg border',
    style: { background: 'var(--color-cream-light)', borderColor: 'var(--color-line)', outline: 'none', fontSize: '0.875rem' },
  };
  const lbl = { className: 'text-xs uppercase tracking-widest mb-1.5 font-mono', style: { color: 'var(--color-ink-soft)' } };

  return (
    <div className="grid md:grid-cols-2 gap-3">
      <div className="md:col-span-2">
        <div {...lbl}>Nom du service</div>
        <input value={form.name} onChange={e => set('name')(e.target.value)} placeholder="Ex : Séance individuelle" {...inp} />
      </div>

      {/* Sur devis toggle */}
      <div className="md:col-span-2 flex items-center gap-3">
        <Toggle on={form.sur_devis} onChange={set('sur_devis')} />
        <span className="text-sm font-mono" style={{ color: 'var(--color-ink-soft)' }}>Sur devis</span>
      </div>

      {!form.sur_devis && (
        <>
          <div>
            <div {...lbl}>Durée (minutes)</div>
            <input type="number" value={form.duration} onChange={e => set('duration')(parseInt(e.target.value) || 0)} {...inp} />
          </div>
          <div>
            <div {...lbl}>Prix (€)</div>
            <input type="number" value={form.price} onChange={e => set('price')(parseInt(e.target.value) || 0)} {...inp} />
          </div>
        </>
      )}

      <div className="md:col-span-2">
        <div {...lbl}>Affichage du prix</div>
        <input value={form.price_label} onChange={e => set('price_label')(e.target.value)} placeholder="Ex : À partir de 55 €" {...inp} />
      </div>

      <div className="md:col-span-2">
        <div {...lbl}>Description</div>
        <textarea value={form.description} onChange={e => set('description')(e.target.value)} rows={3} {...inp} style={{ ...inp.style, resize: 'none' }} />
      </div>

      <div className="md:col-span-2">
        <div {...lbl} style={{ ...lbl.style, marginBottom: '0.5rem' }}>Couleur</div>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESETS.map(p => (
            <button
              key={p.id}
              title={p.label}
              onClick={() => set('color')(p.id)}
              style={{
                width: '2rem', height: '2rem', borderRadius: '50%',
                background: p.hex,
                transform: form.color === p.id ? 'scale(1.2)' : 'scale(1)',
                boxShadow: form.color === p.id ? '0 0 0 2px var(--color-ink)' : 'none',
                transition: 'transform 0.15s, box-shadow 0.15s',
                border: 'none', cursor: 'pointer',
              }}
            />
          ))}
          {/* Custom color picker */}
          <div style={{ position: 'relative' }}>
            <button
              title="Couleur personnalisée"
              onClick={() => colorInputRef.current?.click()}
              style={{
                width: '2rem', height: '2rem', borderRadius: '50%',
                background: isCustomColor ? customHex : 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
                transform: isCustomColor ? 'scale(1.2)' : 'scale(1)',
                boxShadow: isCustomColor ? '0 0 0 2px var(--color-ink)' : 'none',
                transition: 'transform 0.15s, box-shadow 0.15s',
                border: '1.5px solid var(--color-line)', cursor: 'pointer',
                overflow: 'hidden',
              }}
            />
            <input
              ref={colorInputRef}
              type="color"
              value={isCustomColor ? customHex : '#888888'}
              onChange={e => set('color')(e.target.value)}
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', top: 0, left: 0, width: '1px', height: '1px' }}
            />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            value={isCustomColor ? customHex : (PRESETS.find(p => p.id === form.color)?.hex || '')}
            onChange={e => {
              const v = e.target.value;
              if (/^#[0-9a-fA-F]{0,6}$/.test(v)) set('color')(v.length === 7 ? v : v);
            }}
            onBlur={e => {
              const v = e.target.value;
              if (/^#[0-9a-fA-F]{6}$/.test(v)) set('color')(v);
            }}
            placeholder="#660000"
            maxLength={7}
            style={{ width: '7rem', padding: '0.3rem 0.5rem', borderRadius: '0.4rem', border: '1px solid var(--color-line)', background: 'var(--color-cream-light)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', outline: 'none' }}
          />
          {(isCustomColor || form.color?.startsWith('#')) && (
            <span className="text-xs font-mono" style={{ color: 'var(--color-ink-soft)' }}>
              aperçu :
            </span>
          )}
          {(isCustomColor || form.color?.startsWith('#')) && (
            <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.25rem', background: isCustomColor ? customHex : form.color, border: '1px solid var(--color-line)' }} />
          )}
        </div>
      </div>

      <div className="md:col-span-2 flex gap-2 mt-2">
        <button
          onClick={handleSave}
          disabled={saving || !form.name}
          className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-mono uppercase tracking-widest"
          style={{ background: 'var(--color-sage-dark)', color: 'var(--color-cream)', opacity: (saving || !form.name) ? 0.6 : 1 }}
        >
          <Save size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2 rounded-full text-sm font-mono uppercase tracking-widest border"
          style={{ borderColor: 'var(--color-line)' }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

export default function ServicesAdmin() {
  const { showToast } = useAdmin();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | service object

  const load = async () => {
    setLoading(true);
    const list = await pb.collection('services').getFullList({ sort: 'sort_order,name' }).catch(() => []);
    setServices(list);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce service ?')) return;
    await pb.collection('services').delete(id).catch(() => {});
    showToast('Service supprimé');
    load();
  };

  const handleSave = (isNew) => {
    setEditing(null);
    load();
    showToast(isNew ? 'Service créé' : 'Service mis à jour');
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-2">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 400, color: 'var(--color-ink)' }}>
          Services &amp; Tarifs
        </h1>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-mono uppercase tracking-widest"
          style={{ background: 'var(--color-sage-dark)', color: 'var(--color-cream)' }}
        >
          <Plus size={16} /> Nouveau service
        </button>
      </div>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-soft)' }}>
        Configurez les prestations proposées à vos clients.
      </p>

      {editing && (
        <div
          className="p-6 rounded-2xl mb-6"
          style={{ background: 'var(--color-cream)', border: `2px solid var(--color-sage-dark)` }}
        >
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, marginBottom: '1rem' }}>
            {editing === 'new' ? 'Nouveau service' : 'Modifier le service'}
          </h3>
          <ServiceForm
            service={editing === 'new' ? null : editing}
            onSave={() => handleSave(editing === 'new')}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem' }}>Chargement…</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {services.map(s => (
            <div
              key={s.id}
              className="p-5 rounded-2xl flex gap-4"
              style={{ background: 'var(--color-cream)' }}
            >
              <div
                className="w-12 h-12 rounded-full flex-shrink-0"
                style={{ background: colorToHex(s.color) }}
              />
              <div className="flex-1 min-w-0">
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, color: 'var(--color-ink)' }}>
                  {s.name}
                </div>
                <div className="text-xs font-mono mb-2" style={{ color: 'var(--color-ink-soft)' }}>
                  {s.sur_devis
                    ? 'Sur devis'
                    : [s.duration && `${s.duration} min`, s.price_label || (s.price ? `${s.price} €` : null)].filter(Boolean).join(' · ')
                  }
                  {!s.active && <span className="ml-2 px-1.5 py-0.5 rounded" style={{ background: 'var(--color-line)', fontSize: '0.6rem', textTransform: 'uppercase' }}>inactif</span>}
                </div>
                <p className="text-sm mb-3" style={{ color: 'var(--color-ink-soft)' }}>{s.description}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditing(s)}
                    className="text-xs font-mono uppercase tracking-widest flex items-center gap-1 hover:underline"
                  >
                    <Edit2 size={10} /> Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-xs font-mono uppercase tracking-widest flex items-center gap-1 hover:underline"
                    style={{ color: 'var(--color-sage-dark)' }}
                  >
                    <Trash2 size={10} /> Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div className="md:col-span-2 rounded-2xl p-12 text-center" style={{ background: 'var(--color-cream)', border: '1px dashed var(--color-line)' }}>
              <p style={{ color: 'var(--color-ink-soft)' }}>Aucun service — commencez par en créer un.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
