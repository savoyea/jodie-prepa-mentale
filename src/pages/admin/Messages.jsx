import { useState, useEffect } from 'react';
import { X, Trash2, CheckCircle2 } from 'lucide-react';
import { pb } from '../../lib/pocketbase.js';
import { useAdmin } from '../../contexts/AdminContext.jsx';

function MessageDetail({ msg, onClose, onRefresh }) {
  const { showToast } = useAdmin();

  const markRead = async () => {
    await pb.collection('contacts').update(msg.id, { read: true });
    onRefresh();
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer ce message ?')) return;
    await pb.collection('contacts').delete(msg.id);
    showToast('Message supprimé');
    onClose();
    onRefresh();
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid var(--color-line)' }}>
      <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid var(--color-line)' }}>
        <div className="flex-1">
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-ink)' }}>{msg.name}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)', marginTop: '0.125rem' }}>{msg.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {!msg.read && (
            <button
              onClick={markRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: '#f0fdf4', color: '#166534', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <CheckCircle2 size={13} /> Marquer lu
            </button>
          )}
          <button onClick={handleDelete} style={{ color: '#ef4444', padding: '0.25rem' }}><Trash2 size={16} /></button>
          <button onClick={onClose} style={{ color: 'var(--color-ink-soft)' }}><X size={18} /></button>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {[
            ['Date', new Date(msg.created).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
            ['Téléphone', msg.phone || '—'],
            ['Service souhaité', msg.service || '—'],
            ['Statut', msg.read ? 'Lu' : 'Non lu'],
          ].map(([k, v]) => (
            <div key={k}>
              <dt style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>{k}</dt>
              <dd style={{ fontSize: '0.9rem', color: 'var(--color-ink)' }}>{v}</dd>
            </div>
          ))}
        </div>
        {msg.message && (
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.5rem' }}>Message</p>
            <div className="rounded-xl p-4" style={{ background: 'var(--color-cream-light)', border: '1px solid var(--color-line)' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-ink)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{msg.message}</p>
            </div>
          </div>
        )}
        <a
          href={`mailto:${msg.email}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
          style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none' }}>
          Répondre par email
        </a>
      </div>
    </div>
  );
}

export default function Messages() {
  const { showToast } = useAdmin();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    const list = await pb.collection('contacts').getFullList({ sort: '-created' }).catch(() => []);
    setMessages(list);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = messages.filter(m => {
    if (filter === 'unread') return !m.read;
    if (filter === 'read')   return m.read;
    return true;
  });

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 400, color: 'var(--color-ink)' }}>Messages</h1>
        {unreadCount > 0 && (
          <span className="px-3 py-1 rounded-full"
            style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
            {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6">
        {[['all', 'Tous'], ['unread', 'Non lus'], ['read', 'Lus']].map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)}
            className="px-4 py-2 rounded-full"
            style={{
              background: filter === k ? 'var(--color-ink)' : '#fff',
              color: filter === k ? '#fff' : 'var(--color-ink-soft)',
              border: '1px solid var(--color-line)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-[320px,1fr] gap-6">
        {/* Liste */}
        <div>
          {loading ? (
            <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem' }}>Chargement…</p>
          ) : (
            <div className="space-y-2">
              {filtered.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setSelected(m); if (!m.read) { pb.collection('contacts').update(m.id, { read: true }).then(load); } }}
                  className="w-full text-left rounded-xl p-4 transition-colors"
                  style={{
                    background: selected?.id === m.id ? 'var(--color-sage-light)' : '#fff',
                    border: `1px solid ${selected?.id === m.id ? 'var(--color-sage)' : 'var(--color-line)'}`,
                  }}>
                  <div className="flex items-start justify-between gap-2">
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--color-ink)', fontWeight: m.read ? 400 : 600 }}>{m.name}</p>
                    {!m.read && <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: 'var(--color-sage-dark)' }} />}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)', marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.message || m.email}
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ink-soft)', marginTop: '0.5rem' }}>
                    {new Date(m.created).toLocaleDateString('fr-FR')}
                  </p>
                </button>
              ))}
              {filtered.length === 0 && (
                <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem' }}>Aucun message</p>
              )}
            </div>
          )}
        </div>

        {/* Détail */}
        <div>
          {selected ? (
            <MessageDetail
              msg={selected}
              onClose={() => setSelected(null)}
              onRefresh={() => { load(); }}
            />
          ) : (
            <div className="rounded-2xl p-12 text-center" style={{ background: '#fff', border: '1px dashed var(--color-line)' }}>
              <p style={{ color: 'var(--color-ink-soft)' }}>Sélectionnez un message</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
