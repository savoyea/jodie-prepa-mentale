import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, ArrowLeft, Save, ChevronLeft, Check } from 'lucide-react';
import { pb } from '../../lib/pocketbase.js';
import { useAdmin } from '../../contexts/AdminContext.jsx';

const inp = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  borderRadius: '0.625rem',
  border: '1px solid var(--color-line)',
  background: 'var(--color-cream-light)',
  fontSize: '0.875rem',
  outline: 'none',
};
const lbl = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.6rem',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--color-ink-soft)',
  marginBottom: '0.25rem',
};

function slugify(str) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const TEMPLATES = [
  { id: 'blank',     label: 'Page libre',        desc: 'Titre + éditeur WYSIWYG',                    icon: '📄', fields: ['heroTitle','heroSubtitle','heroImage','html'] },
  { id: 'hero-text', label: 'Hero + Texte',       desc: 'Grande image d\'en-tête + contenu riche',   icon: '🖼️', fields: ['heroTitle','heroSubtitle','heroImage','intro','html'] },
  { id: 'cards',     label: 'Cartes',             desc: 'Grille de cartes (titre, texte, image)',     icon: '🃏', fields: ['heroTitle','heroSubtitle','heroImage','intro','cards'] },
  { id: 'list',      label: 'Liste numérotée',    desc: 'Liste d\'éléments avec titre et description',icon: '📋', fields: ['heroTitle','heroSubtitle','heroImage','intro','items'] },
  { id: 'accordion', label: 'Accordéon',          desc: 'Questions / réponses dépliables',            icon: '❓', fields: ['heroTitle','heroSubtitle','heroImage','intro','items'] },
];

function RichEditor({ value, onChange }) {
  const ref = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (ref.current && !initialized.current) {
      ref.current.innerHTML = value || '';
      initialized.current = true;
    }
  }, []);

  const exec = (cmd, val) => { document.execCommand(cmd, false, val); ref.current?.focus(); };

  const btnStyle = (active) => ({
    padding: '0.25rem 0.5rem',
    borderRadius: '0.375rem',
    border: 'none',
    background: active ? 'var(--color-sage-light)' : 'transparent',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--color-ink-soft)',
  });

  return (
    <div style={{ border: '1px solid var(--color-line)', borderRadius: '0.75rem', overflow: 'hidden' }}>
      <div className="flex gap-1 flex-wrap p-2" style={{ background: 'var(--color-cream)', borderBottom: '1px solid var(--color-line)' }}>
        {[
          ['bold', 'G'], ['italic', 'I'], ['underline', 'S'],
        ].map(([cmd, label]) => (
          <button key={cmd} onMouseDown={e => { e.preventDefault(); exec(cmd); }} style={btnStyle(false)}>{label}</button>
        ))}
        <button onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'h2'); }} style={btnStyle(false)}>H2</button>
        <button onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'p'); }} style={btnStyle(false)}>P</button>
        <button onMouseDown={e => { e.preventDefault(); exec('insertOrderedList'); }} style={btnStyle(false)}>1.</button>
        <button onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }} style={btnStyle(false)}>•</button>
        <button onMouseDown={e => { e.preventDefault(); exec('removeFormat'); }} style={btnStyle(false)}>⊘</button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={e => onChange(e.currentTarget.innerHTML)}
        style={{
          minHeight: '180px',
          padding: '0.875rem',
          outline: 'none',
          fontSize: '0.875rem',
          lineHeight: 1.7,
          color: 'var(--color-ink)',
          background: 'var(--color-cream-light)',
        }}
      />
    </div>
  );
}

function PageEditor({ page, pages, onSave, onCancel, saving }) {
  const isNew = !page.id;
  const [form, setForm] = useState(page);
  const [step, setStep] = useState(page.template && page.id ? 'info' : 'template');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setContent = (k, v) => setForm(f => ({ ...f, content: { ...f.content, [k]: v } }));

  const tpl = TEMPLATES.find(t => t.id === form.template);
  const parentPages = pages.filter(p => p.id && p.id !== form.id && p.nav_position === 'header' && !p.parent_id);

  if (step === 'template') {
    return (
      <div>
        <button onClick={onCancel} className="flex items-center gap-2 text-sm mb-6 hover:opacity-70" style={{ color: 'var(--color-ink-soft)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={16} /> Retour
        </button>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400, color: 'var(--color-ink)', marginBottom: '0.5rem' }}>Choisir un template</h2>
        <p className="mb-8 text-sm" style={{ color: 'var(--color-ink-soft)' }}>Le template détermine la structure visuelle de la page</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => { set('template', t.id); setStep('info'); }}
              className="text-left p-6 rounded-2xl transition-all hover:shadow-md"
              style={{
                border: `2px solid ${form.template === t.id ? 'var(--color-sage-dark)' : 'var(--color-line)'}`,
                background: form.template === t.id ? 'var(--color-sage-light)' : '#fff',
                cursor: 'pointer',
              }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{t.icon}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--color-ink)', marginBottom: '0.25rem' }}>{t.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ink-soft)' }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'info') {
    return (
      <div className="max-w-xl">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => isNew ? setStep('template') : onCancel()}
            className="flex items-center gap-2 text-sm hover:opacity-70"
            style={{ color: 'var(--color-ink-soft)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={16} /> {isNew ? 'Choisir un autre template' : 'Retour à la liste'}
          </button>
          {!isNew && (
            <button onClick={() => onSave(form)} disabled={saving || !form.title}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm disabled:opacity-40"
              style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'pointer' }}>
              <Save size={13} /> {saving ? 'Enregistrement…' : 'Sauvegarder'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'var(--color-sage-light)' }}>
          <span style={{ fontSize: '1.5rem' }}>{tpl?.icon}</span>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--color-ink)' }}>{tpl?.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ink-soft)' }}>{tpl?.desc}</div>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <label style={lbl}>Titre de la page *</label>
            <input style={inp} value={form.title} placeholder="Mon titre de page"
              onChange={e => { set('title', e.target.value); if (!form.id) set('slug', slugify(e.target.value)); }} />
          </div>
          <div>
            <label style={lbl}>Slug URL</label>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-ink-soft)' }}>jodie.arsava.fr/#</span>
              <input style={{ ...inp }} value={form.slug} placeholder="mon-slug"
                onChange={e => set('slug', e.target.value)} />
            </div>
          </div>
          <div>
            <label style={lbl}>Statut</label>
            <div className="flex gap-3">
              {[['draft','Brouillon'],['published','Publié']].map(([val, label]) => (
                <button key={val} onClick={() => set('status', val)}
                  className="px-4 py-2 rounded-full text-xs border transition-all"
                  style={{
                    fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em',
                    background: form.status === val ? 'var(--color-ink)' : 'transparent',
                    color: form.status === val ? '#fff' : 'var(--color-ink-soft)',
                    borderColor: 'var(--color-line)',
                    cursor: 'pointer',
                  }}>{label}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={lbl}>Position dans le menu</label>
            <div className="flex gap-3 flex-wrap">
              {[['none','Non affiché'],['header','En-tête'],['footer','Pied de page']].map(([val, label]) => (
                <button key={val} onClick={() => set('nav_position', val)}
                  className="px-4 py-2 rounded-full text-xs border transition-all"
                  style={{
                    fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em',
                    background: form.nav_position === val ? 'var(--color-ink)' : 'transparent',
                    color: form.nav_position === val ? '#fff' : 'var(--color-ink-soft)',
                    borderColor: 'var(--color-line)',
                    cursor: 'pointer',
                  }}>{label}</button>
              ))}
            </div>
          </div>
          {form.nav_position !== 'none' && (
            <>
              <div>
                <label style={lbl}>Label dans le menu</label>
                <input style={inp} value={form.nav_label} placeholder={form.title || 'Label menu'}
                  onChange={e => set('nav_label', e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Ordre dans le menu</label>
                <input type="number" style={{ ...inp, width: '8rem' }} value={form.nav_order}
                  onChange={e => set('nav_order', Number(e.target.value))} />
              </div>
              {form.nav_position === 'header' && parentPages.length > 0 && (
                <div>
                  <label style={lbl}>Sous-page de (optionnel)</label>
                  <select style={inp} value={form.parent_id || ''} onChange={e => set('parent_id', e.target.value)}>
                    <option value="">— Page de niveau supérieur —</option>
                    {parentPages.map(p => (
                      <option key={p.id} value={p.id}>{p.nav_label || p.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={() => setStep('edit')} disabled={!form.title}
            className="px-6 py-3 rounded-full text-sm disabled:opacity-40"
            style={{ background: 'var(--color-ink)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', border: 'none' }}>
            {isNew ? 'Suivant : Contenu →' : 'Modifier le contenu →'}
          </button>
          {isNew && (
            <button onClick={onCancel}
              className="px-6 py-3 rounded-full text-sm"
              style={{ border: '1px solid var(--color-line)', color: 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', background: 'none', cursor: 'pointer' }}>
              Annuler
            </button>
          )}
        </div>
      </div>
    );
  }

  const content = form.content || {};
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep('info')} style={{ color: 'var(--color-ink-soft)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ChevronLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-ink)' }}>
              {form.title || 'Nouvelle page'}
            </h2>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ink-soft)' }}>
              {tpl?.icon} {tpl?.label}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            style={{ border: '1px solid var(--color-line)', color: 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', background: 'none', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '1rem' }}>
            Annuler
          </button>
          <button onClick={() => onSave(form)} disabled={saving}
            className="flex items-center gap-2"
            style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'pointer', padding: '0.5rem 1.25rem', borderRadius: '1rem', opacity: saving ? 0.7 : 1 }}>
            <Save size={14} /> {saving ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="space-y-6 max-w-3xl">
        <div className="p-5 rounded-2xl space-y-4" style={{ border: '1px solid var(--color-line)', background: '#fff' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.75rem' }}>
            En-tête de page
          </div>
          <div>
            <label style={lbl}>Titre principal</label>
            <input style={inp} value={content.heroTitle || ''} placeholder={form.title}
              onChange={e => setContent('heroTitle', e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Sous-titre</label>
            <input style={inp} value={content.heroSubtitle || ''} placeholder="Sous-titre optionnel"
              onChange={e => setContent('heroSubtitle', e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Image d'en-tête (URL)</label>
            <input style={{ ...inp, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} value={content.heroImage || ''} placeholder="https://..."
              onChange={e => setContent('heroImage', e.target.value)} />
          </div>
        </div>

        {tpl?.fields.includes('intro') && (
          <div>
            <label style={lbl}>Texte d'introduction</label>
            <textarea rows={3} style={{ ...inp, resize: 'vertical' }} value={content.intro || ''} placeholder="Chapô introductif..."
              onChange={e => setContent('intro', e.target.value)} />
          </div>
        )}

        {tpl?.fields.includes('html') && (
          <div>
            <label style={lbl}>Contenu principal</label>
            <RichEditor value={content.html || ''} onChange={v => setContent('html', v)} />
          </div>
        )}

        {tpl?.fields.includes('cards') && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label style={lbl}>Cartes ({(content.cards || []).length})</label>
              <button
                onClick={() => setContent('cards', [...(content.cards || []), { title: '', text: '', image: '', link: '' }])}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full"
                style={{ background: 'var(--color-sage-light)', color: 'var(--color-sage-dark)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                <Plus size={12} /> Ajouter une carte
              </button>
            </div>
            <div className="space-y-4">
              {(content.cards || []).map((card, i) => (
                <div key={i} className="p-4 rounded-xl relative" style={{ border: '1px solid var(--color-line)', background: 'var(--color-cream-light)' }}>
                  <button onClick={() => setContent('cards', (content.cards || []).filter((_, j) => j !== i))}
                    className="absolute top-3 right-3" style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={{ ...lbl, fontSize: '0.58rem' }}>Titre</label>
                      <input style={inp} value={card.title} onChange={e => {
                        const c = [...(content.cards || [])]; c[i] = { ...c[i], title: e.target.value }; setContent('cards', c);
                      }} />
                    </div>
                    <div>
                      <label style={{ ...lbl, fontSize: '0.58rem' }}>Lien (optionnel)</label>
                      <input style={inp} value={card.link} placeholder="https://..." onChange={e => {
                        const c = [...(content.cards || [])]; c[i] = { ...c[i], link: e.target.value }; setContent('cards', c);
                      }} />
                    </div>
                    <div className="col-span-2">
                      <label style={{ ...lbl, fontSize: '0.58rem' }}>Texte</label>
                      <textarea rows={2} style={{ ...inp, resize: 'none' }} value={card.text} onChange={e => {
                        const c = [...(content.cards || [])]; c[i] = { ...c[i], text: e.target.value }; setContent('cards', c);
                      }} />
                    </div>
                    <div className="col-span-2">
                      <label style={{ ...lbl, fontSize: '0.58rem' }}>Image (URL)</label>
                      <input style={{ ...inp, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} value={card.image} placeholder="https://..." onChange={e => {
                        const c = [...(content.cards || [])]; c[i] = { ...c[i], image: e.target.value }; setContent('cards', c);
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tpl?.fields.includes('items') && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label style={lbl}>{tpl.id === 'accordion' ? 'Questions / Réponses' : 'Éléments'} ({(content.items || []).length})</label>
              <button
                onClick={() => setContent('items', [...(content.items || []), tpl.id === 'accordion' ? { question: '', answer: '' } : { title: '', text: '' }])}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full"
                style={{ background: 'var(--color-sage-light)', color: 'var(--color-sage-dark)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                <Plus size={12} /> Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {(content.items || []).map((item, i) => (
                <div key={i} className="p-4 rounded-xl relative" style={{ border: '1px solid var(--color-line)', background: 'var(--color-cream-light)' }}>
                  <button onClick={() => setContent('items', (content.items || []).filter((_, j) => j !== i))}
                    className="absolute top-3 right-3" style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                  <div className="space-y-2 pr-6">
                    <div>
                      <label style={{ ...lbl, fontSize: '0.58rem' }}>{tpl.id === 'accordion' ? 'Question' : 'Titre'}</label>
                      <input style={inp} value={tpl.id === 'accordion' ? item.question : item.title}
                        onChange={e => {
                          const it = [...(content.items || [])];
                          it[i] = { ...it[i], [tpl.id === 'accordion' ? 'question' : 'title']: e.target.value };
                          setContent('items', it);
                        }} />
                    </div>
                    <div>
                      <label style={{ ...lbl, fontSize: '0.58rem' }}>{tpl.id === 'accordion' ? 'Réponse' : 'Description'}</label>
                      <textarea rows={2} style={{ ...inp, resize: 'none' }}
                        value={tpl.id === 'accordion' ? item.answer : item.text}
                        onChange={e => {
                          const it = [...(content.items || [])];
                          it[i] = { ...it[i], [tpl.id === 'accordion' ? 'answer' : 'text']: e.target.value };
                          setContent('items', it);
                        }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Pages() {
  const { showToast } = useAdmin();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    pb.collection('pages').getFullList({ sort: 'nav_order,title' })
      .then(setPages).catch(() => setPages([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const newPage = () => setEditing({
    title: '', slug: '', template: 'blank', content: {},
    status: 'draft', nav_position: 'none', nav_label: '',
    nav_order: pages.length + 1, parent_id: '', category_label: '',
  });

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (form.id) {
        await pb.collection('pages').update(form.id, form);
      } else {
        await pb.collection('pages').create(form);
      }
      setEditing(null);
      load();
      showToast('Page sauvegardée');
    } catch {
      showToast('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (page) => {
    if (!confirm(`Supprimer la page "${page.title}" ?`)) return;
    await pb.collection('pages').delete(page.id).catch(() => {});
    load();
    showToast('Page supprimée');
  };

  const handleToggleStatus = async (page) => {
    const status = page.status === 'published' ? 'draft' : 'published';
    await pb.collection('pages').update(page.id, { status }).catch(() => {});
    load();
    showToast(status === 'published' ? 'Page publiée' : 'Page repassée en brouillon');
  };

  if (editing !== null) {
    return (
      <div className="max-w-4xl">
        <PageEditor
          page={editing}
          pages={pages}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          saving={saving}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 400, color: 'var(--color-ink)' }}>Pages</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-ink-soft)', marginTop: '0.25rem' }}>
            Créez des pages personnalisées avec vos propres templates
          </p>
        </div>
        <button onClick={newPage}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full"
          style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'pointer' }}>
          <Plus size={16} /> Nouvelle page
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem' }}>Chargement…</p>
      ) : pages.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ border: '2px dashed var(--color-line)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-ink)', marginBottom: '0.5rem' }}>Aucune page encore</div>
          <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Créez votre première page personnalisée</p>
          <button onClick={newPage}
            className="px-5 py-2.5 rounded-full"
            style={{ background: 'var(--color-ink)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'pointer' }}>
            Créer une page
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map(p => {
            const tpl = TEMPLATES.find(t => t.id === p.template);
            return (
              <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ border: '1px solid var(--color-line)', background: '#fff' }}>
                <div style={{ fontSize: '1.5rem' }}>{tpl?.icon || '📄'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--color-ink)' }}>{p.title}</span>
                    <button onClick={() => handleToggleStatus(p)}
                      style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.6rem', padding: '0.125rem 0.5rem', borderRadius: '1rem', border: 'none', cursor: 'pointer',
                        background: p.status === 'published' ? '#d1fae5' : '#fef3c7',
                        color: p.status === 'published' ? '#065f46' : '#92400e',
                      }}>
                      {p.status === 'published' ? '● Publié' : '○ Brouillon'}
                    </button>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ink-soft)' }}>
                    {tpl?.label} · /{p.slug}
                    {p.nav_position !== 'none' && (
                      <span className="ml-2">· Menu : {p.nav_position === 'header' ? 'En-tête' : 'Pied de page'}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditing({ ...p })}
                    className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--color-ink-soft)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(p)}
                    className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                    style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
