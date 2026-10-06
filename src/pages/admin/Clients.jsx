import { useState, useEffect } from 'react';
import { Search, Plus, X, Save, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { pb } from '../../lib/pocketbase.js';
import { useAdmin } from '../../contexts/AdminContext.jsx';

const STATUTS = ['Actif', 'Inactif', 'Prospect', 'En pause'];
const TAGS_LIST = ['anxiété','sport','pro','confiance','concentration','stress','motivation','bilan','suivi'];
const SOURCES = ['Site web','Bouche à oreille','Instagram','LinkedIn','Autre'];

const inputStyle = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  borderRadius: '0.625rem',
  border: '1px solid var(--color-line)',
  background: 'var(--color-cream-light)',
  fontSize: '0.875rem',
  outline: 'none',
};

function StatusBadge({ status }) {
  const colors = {
    Actif:    { bg: '#f0fdf4', color: '#166534' },
    Inactif:  { bg: '#f1f5f9', color: '#475569' },
    Prospect: { bg: '#fef3c7', color: '#92400e' },
    'En pause': { bg: '#fce7f3', color: '#9d174d' },
  };
  const c = colors[status] || { bg: 'var(--color-sage-light)', color: 'var(--color-ink)' };
  return (
    <span
      className="px-2 py-1 rounded-full text-xs"
      style={{ background: c.bg, color: c.color, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600 }}
    >
      {status}
    </span>
  );
}

function ClientForm({ client, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    city: client?.city || '',
    birth_year: client?.birth_year || '',
    source: client?.source || '',
    status: client?.status || 'Prospect',
    tags: client?.tags || [],
    objectives: client?.objectives || '',
    notes: client?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleTag = (t) => set('tags', form.tags.includes(t) ? form.tags.filter(x => x !== t) : [...form.tags, t]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (client?.id) {
        await pb.collection('clients').update(client.id, form);
      } else {
        await pb.collection('clients').create(form);
      }
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Nom</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Email</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Téléphone</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Ville</label>
          <input value={form.city} onChange={e => set('city', e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Année de naissance</label>
          <input value={form.birth_year} onChange={e => set('birth_year', e.target.value)} style={inputStyle} placeholder="ex: 19910925" />
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Source</label>
          <select value={form.source} onChange={e => set('source', e.target.value)} style={{ ...inputStyle }}>
            <option value="">—</option>
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.5rem' }}>Statut</label>
        <div className="flex gap-2 flex-wrap">
          {STATUTS.map(s => (
            <button key={s} onClick={() => set('status', s)}
              className="px-3 py-1.5 rounded-full text-xs"
              style={{ background: form.status === s ? 'var(--color-sage-dark)' : 'var(--color-sage-light)', color: form.status === s ? '#fff' : 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.5rem' }}>Tags</label>
        <div className="flex gap-2 flex-wrap">
          {TAGS_LIST.map(t => (
            <button key={t} onClick={() => toggleTag(t)}
              className="px-3 py-1 rounded-full text-xs"
              style={{ background: form.tags.includes(t) ? 'var(--color-ink)' : 'var(--color-sage-light)', color: form.tags.includes(t) ? '#fff' : 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Objectifs</label>
        <textarea value={form.objectives} onChange={e => set('objectives', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full"
          style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: saving ? 0.7 : 1 }}>
          <Save size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button onClick={onCancel}
          className="px-5 py-2.5 rounded-full"
          style={{ border: '1px solid var(--color-line)', color: 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Annuler
        </button>
      </div>
    </div>
  );
}

function ClientDetail({ client, onClose, onRefresh }) {
  const [tab, setTab] = useState('infos');
  const [editing, setEditing] = useState(false);

  const tabs = ['Infos', 'Notes', 'Journal', 'Séances'];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid var(--color-line)' }}>
      {/* Header */}
      <div className="flex items-center gap-4 p-5" style={{ borderBottom: '1px solid var(--color-line)' }}>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-serif text-xl flex-shrink-0"
          style={{ background: 'var(--color-sage-dark)' }}
        >
          {(client.name || '?')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-ink)' }}>{client.name}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)' }}>{client.city}</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 rounded-full"
            style={{ border: '1px solid var(--color-line)', color: 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Modifier
          </button>
        )}
        <button onClick={onClose} style={{ color: 'var(--color-ink-soft)' }}><X size={18} /></button>
      </div>

      {/* Tabs */}
      <div className="flex px-5 pt-4 gap-4 border-b" style={{ borderColor: 'var(--color-line)' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t.toLowerCase())}
            className="pb-3 text-sm"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: tab === t.toLowerCase() ? 'var(--color-sage-dark)' : 'var(--color-ink-soft)',
              borderBottom: tab === t.toLowerCase() ? '2px solid var(--color-sage-dark)' : '2px solid transparent',
            }}>
            {t}
          </button>
        ))}
      </div>

      <div className="p-5">
        {editing ? (
          <ClientForm
            client={client}
            onSave={() => { setEditing(false); onRefresh(); }}
            onCancel={() => setEditing(false)}
          />
        ) : tab === 'infos' ? (
          <dl className="grid grid-cols-2 gap-y-4 gap-x-6">
            {[
              ['Statut',           <StatusBadge status={client.status} />],
              ['Email',            client.email],
              ['Téléphone',        client.phone],
              ['Ville',            client.city],
              ['Année de naissance', client.birth_year],
              ['Source',           client.source],
              ['Dernière séance',  client.last_seen],
              ['Tags',             (client.tags || []).join(', ') || '—'],
              ['Objectifs',        client.objectives || '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>{k}</dt>
                <dd style={{ fontSize: '0.9rem', color: 'var(--color-ink)' }}>{v || '—'}</dd>
              </div>
            ))}
          </dl>
        ) : tab === 'notes' ? (
          <NotesTab client={client} onRefresh={onRefresh} />
        ) : tab === 'journal' ? (
          <JournalTab client={client} onRefresh={onRefresh} />
        ) : (
          <SeancesTab client={client} />
        )}
      </div>
    </div>
  );
}

const BOOKING_STATUS = {
  pending:   { bg: '#fef3c7', color: '#92400e', label: 'En attente' },
  confirmed: { bg: '#dbeafe', color: '#1e40af', label: 'Confirmée' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Annulée' },
  done:      { bg: '#f0fdf4', color: '#166534', label: 'Terminée' },
};

function SeancesTab({ client }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client.email) { setLoading(false); return; }
    pb.collection('bookings')
      .getFullList({ filter: `client_email="${client.email}"`, sort: '-date' })
      .then(list => setBookings(list))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [client.id]);

  if (loading) return <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem' }}>Chargement…</p>;
  if (!bookings.length) return <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem' }}>Aucune séance enregistrée</p>;

  return (
    <div className="space-y-3">
      {bookings.map(b => {
        const s = BOOKING_STATUS[b.status] || BOOKING_STATUS.pending;
        return (
          <div key={b.id} className="rounded-xl p-4" style={{ background: 'var(--color-cream-light)', border: '1px solid var(--color-line)' }}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--color-ink)', marginBottom: '0.125rem' }}>
                  {b.service_name || '—'}
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-ink-soft)' }}>
                  {b.date} {b.time && `· ${b.time}`} {b.duration ? `· ${b.duration} min` : ''}
                </p>
              </div>
              <span className="px-2 py-1 rounded-full flex-shrink-0" style={{ background: s.bg, color: s.color, fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                {s.label}
              </span>
            </div>
            {b.note && (
              <p className="mt-2" style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)', fontStyle: 'italic' }}>{b.note}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function NotesTab({ client, onRefresh }) {
  const [notes, setNotes] = useState(client.notes || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await pb.collection('clients').update(client.id, { notes }).finally(() => setSaving(false));
    onRefresh();
  };

  return (
    <div className="space-y-3">
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={8}
        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--color-line)', background: 'var(--color-cream-light)', fontSize: '0.875rem', resize: 'vertical', outline: 'none' }}
        placeholder="Notes sur ce client…"
      />
      <button onClick={save} disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full"
        style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        <Save size={14} /> {saving ? 'Enregistrement…' : 'Sauvegarder'}
      </button>
    </div>
  );
}

function JournalTab({ client, onRefresh }) {
  const journal = Array.isArray(client.journal) ? client.journal : [];
  const [entry, setEntry] = useState('');
  const [saving, setSaving] = useState(false);

  const addEntry = async () => {
    if (!entry.trim()) return;
    setSaving(true);
    const newJournal = [{ date: new Date().toISOString().split('T')[0], text: entry }, ...journal];
    await pb.collection('clients').update(client.id, { journal: newJournal }).finally(() => setSaving(false));
    setEntry('');
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <textarea
          value={entry}
          onChange={e => setEntry(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--color-line)', background: 'var(--color-cream-light)', fontSize: '0.875rem', resize: 'vertical', outline: 'none' }}
          placeholder="Nouvelle entrée de journal…"
        />
        <button onClick={addEntry} disabled={saving || !entry.trim()}
          className="px-5 py-2.5 rounded-full"
          style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: (!entry.trim() || saving) ? 0.6 : 1 }}>
          Ajouter
        </button>
      </div>
      <div className="space-y-3">
        {journal.map((e, i) => (
          <div key={i} className="rounded-xl p-4" style={{ background: 'var(--color-cream-light)', border: '1px solid var(--color-line)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-sage-dark)', marginBottom: '0.5rem' }}>{e.date}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-ink)', whiteSpace: 'pre-wrap' }}>{e.text}</p>
          </div>
        ))}
        {journal.length === 0 && <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem' }}>Aucune entrée</p>}
      </div>
    </div>
  );
}

export default function Clients() {
  const { showToast } = useAdmin();
  const location = useLocation();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const list = await pb.collection('clients').getFullList({ sort: 'name' }).catch(() => []);
    setClients(list);
    setLoading(false);
    // Auto-sélection depuis la page Réservations
    const targetId = location.state?.clientId;
    if (targetId) {
      const found = list.find(c => c.id === targetId);
      if (found) setSelected(found);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = clients.filter(c => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || c.status === filterStatus;
    const matchTag    = !filterTag    || (c.tags || []).includes(filterTag);
    return matchSearch && matchStatus && matchTag;
  });

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce client ?')) return;
    await pb.collection('clients').delete(id);
    showToast('Client supprimé');
    setSelected(null);
    load();
  };

  const selStyle = { width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.625rem', border: '1px solid var(--color-line)', background: '#fff', fontSize: '0.825rem', outline: 'none' };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 400, color: 'var(--color-ink)' }}>Clients</h1>
        <button onClick={() => { setCreating(true); setSelected(null); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full"
          style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <Plus size={16} /> Nouveau client
        </button>
      </div>

      <div className="grid md:grid-cols-[300px,1fr] gap-6">
        {/* Liste */}
        <div>
          <div className="space-y-2 mb-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-ink-soft)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
                style={{ ...selStyle, paddingLeft: '2rem' }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selStyle}>
                <option value="">Tous statuts</option>
                {STATUTS.map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={filterTag} onChange={e => setFilterTag(e.target.value)} style={selStyle}>
                <option value="">Tous tags</option>
                {TAGS_LIST.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem' }}>Chargement…</p>
          ) : (
            <div className="space-y-2">
              {filtered.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelected(c); setCreating(false); }}
                  className="w-full text-left rounded-xl p-4 transition-colors"
                  style={{
                    background: selected?.id === c.id ? 'var(--color-sage-light)' : '#fff',
                    border: `1px solid ${selected?.id === c.id ? 'var(--color-sage)' : 'var(--color-line)'}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--color-ink)' }}>{c.name}</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)', marginTop: '0.25rem' }}>{c.email}</p>
                  {(c.tags || []).length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {c.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--color-sage-light)', color: 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
              {filtered.length === 0 && (
                <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem' }}>Aucun client</p>
              )}
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ink-soft)' }}>
                {filtered.length} client{filtered.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Détail / Formulaire */}
        <div>
          {creating && (
            <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid var(--color-line)' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-ink)' }}>Nouveau client</h2>
                <button onClick={() => setCreating(false)}><X size={18} /></button>
              </div>
              <ClientForm
                onSave={() => { setCreating(false); load(); showToast('Client créé'); }}
                onCancel={() => setCreating(false)}
              />
            </div>
          )}
          {selected && !creating && (
            <ClientDetail
              client={selected}
              onClose={() => setSelected(null)}
              onRefresh={() => {
                load().then(() => {
                  setSelected(s => clients.find(c => c.id === s?.id) || s);
                });
              }}
            />
          )}
          {!selected && !creating && (
            <div className="rounded-2xl p-12 text-center" style={{ background: '#fff', border: '1px dashed var(--color-line)' }}>
              <p style={{ color: 'var(--color-ink-soft)' }}>Sélectionnez un client</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
