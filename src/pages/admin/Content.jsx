import { useState, useEffect, useRef, useCallback } from 'react';
import { Save, Plus, X, ChevronDown, ChevronUp, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { pb } from '../../lib/pocketbase.js';
import { useAdmin } from '../../contexts/AdminContext.jsx';
import { useSite } from '../../contexts/SiteContext.jsx';

// ─── Config ──────────────────────────────────────────────────────────────────

const PAGES = [
  { key: 'hero',    label: 'Accueil',                    titleField: 'heroTitle',    sectionsKey: 'heroSections',    url: '/',           positions: ['before-hero','before-stats','before-services','before-forwhom','after-forwhom','after-all'] },
  { key: 'what',    label: "C'est quoi et pour qui ?",   titleField: 'whatIsTitle',  sectionsKey: 'whatSections',    url: '/demarche',   positions: ['before-intro','before-forwhom','after-forwhom'] },
  { key: 'ethics',  label: 'Les principes éthiques',     titleField: 'ethicsTitle',  sectionsKey: 'ethicsSections',  url: '/charte',     positions: ['before-intro','before-principles','after-principles'] },
  { key: 'about',   label: 'Qui suis-je ?',              titleField: null,           sectionsKey: 'aboutSections',   url: '/a-propos',   positions: ['before-intro','before-formations','after-formations'] },
  { key: 'contact', label: 'Contact',                    titleField: null,           sectionsKey: 'contactSections', url: '/contact',    positions: ['before-form','after-form'] },
];

const POSITION_LABELS = {
  'before-hero':        "Avant le hero",
  'before-stats':       "Avant les stats",
  'before-services':    "Avant les services",
  'after-all':          "Après tout",
  'before-intro':       "Avant l'intro",
  'before-forwhom':     'Avant "Pour qui ?"',
  'after-forwhom':      'Après "Pour qui ?"',
  'before-principles':  "Avant les principes",
  'after-principles':   "Après les principes",
  'before-formations':  "Avant les formations",
  'after-formations':   "Après les formations",
  'before-form':        "Avant le formulaire",
  'after-form':         "Après le formulaire",
};

const LAYOUTS = [
  { value: 'text-only',   label: 'Texte seul' },
  { value: 'text-encart', label: 'Texte + Encart' },
  { value: 'image-right', label: 'Image droite' },
  { value: 'image-left',  label: 'Image gauche' },
  { value: 'image-top',   label: 'Image haut' },
  { value: 'image-bottom',label: 'Image bas' },
  { value: 'image-encart',label: 'Image + Encart' },
];

const RENDUS = [
  { value: 'brut',     label: 'Brut' },
  { value: 'encadre',  label: 'Encadré' },
  { value: 'citation', label: 'Citation' },
  { value: 'accentue', label: 'Accentué' },
];

const WIDGETS_TABS = ['FAQ','Témoignages','Stats','Ressources','Bandeau'];
const GLOBAL_TABS  = ['Apparence','Navigation','Avis Google','Pages légales'];

const LAYOUT_ICONS = {
  'text-only':   <svg viewBox="0 0 56 36" width="56" height="36"><rect x="4" y="6" width="48" height="4" rx="2" fill="currentColor" opacity=".4"/><rect x="4" y="14" width="48" height="3" rx="1.5" fill="currentColor" opacity=".25"/><rect x="4" y="20" width="36" height="3" rx="1.5" fill="currentColor" opacity=".25"/><rect x="4" y="26" width="42" height="3" rx="1.5" fill="currentColor" opacity=".25"/></svg>,
  'text-encart': <svg viewBox="0 0 56 36" width="56" height="36"><rect x="4" y="6" width="22" height="4" rx="2" fill="currentColor" opacity=".4"/><rect x="4" y="13" width="22" height="3" rx="1.5" fill="currentColor" opacity=".25"/><rect x="4" y="19" width="18" height="3" rx="1.5" fill="currentColor" opacity=".25"/><rect x="30" y="5" width="22" height="26" rx="3" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="1" strokeOpacity=".3"/><rect x="33" y="10" width="16" height="2" rx="1" fill="currentColor" opacity=".3"/><rect x="33" y="15" width="12" height="2" rx="1" fill="currentColor" opacity=".2"/></svg>,
  'image-right': <svg viewBox="0 0 56 36" width="56" height="36"><rect x="4" y="6" width="22" height="4" rx="2" fill="currentColor" opacity=".4"/><rect x="4" y="13" width="22" height="3" rx="1.5" fill="currentColor" opacity=".25"/><rect x="4" y="19" width="18" height="3" rx="1.5" fill="currentColor" opacity=".25"/><rect x="30" y="4" width="22" height="28" rx="3" fill="currentColor" opacity=".22"/></svg>,
  'image-left':  <svg viewBox="0 0 56 36" width="56" height="36"><rect x="4" y="4" width="22" height="28" rx="3" fill="currentColor" opacity=".22"/><rect x="30" y="6" width="22" height="4" rx="2" fill="currentColor" opacity=".4"/><rect x="30" y="13" width="22" height="3" rx="1.5" fill="currentColor" opacity=".25"/><rect x="30" y="19" width="16" height="3" rx="1.5" fill="currentColor" opacity=".25"/></svg>,
  'image-top':   <svg viewBox="0 0 56 36" width="56" height="36"><rect x="4" y="4" width="48" height="15" rx="3" fill="currentColor" opacity=".22"/><rect x="4" y="23" width="48" height="3" rx="1.5" fill="currentColor" opacity=".4"/><rect x="4" y="29" width="34" height="3" rx="1.5" fill="currentColor" opacity=".25"/></svg>,
  'image-bottom':<svg viewBox="0 0 56 36" width="56" height="36"><rect x="4" y="4" width="48" height="3" rx="1.5" fill="currentColor" opacity=".4"/><rect x="4" y="10" width="34" height="3" rx="1.5" fill="currentColor" opacity=".25"/><rect x="4" y="17" width="48" height="15" rx="3" fill="currentColor" opacity=".22"/></svg>,
  'image-encart':<svg viewBox="0 0 56 36" width="56" height="36"><rect x="4" y="4" width="48" height="28" rx="3" fill="currentColor" opacity=".18"/><rect x="28" y="11" width="20" height="16" rx="2" fill="white" opacity=".9"/><rect x="30" y="14" width="16" height="3" rx="1" fill="currentColor" opacity=".4"/><rect x="30" y="20" width="12" height="2" rx="1" fill="currentColor" opacity=".25"/></svg>,
};

function LayoutBtn({ layout, active, onClick, pillBtn }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={pillBtn(active)}>
        {layout.label}
      </button>
      {hov && LAYOUT_ICONS[layout.value] && (
        <div style={{ position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid var(--color-line)', borderRadius: '0.5rem', padding: '0.5rem 0.625rem', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 100, color: 'var(--color-sage-dark)', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          {LAYOUT_ICONS[layout.value]}
          <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-ink-soft)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{layout.label}</div>
        </div>
      )}
    </div>
  );
}

// ─── Image upload (canvas resize → base64) ────────────────────────────────────

function ImageUpload({ value, onChange, placeholder, previewHeight = 48, aspect = 'contain' }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      // SVG: store as-is
      if (file.type === 'image/svg+xml') {
        onChange(e.target.result);
        setUploading(false);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const MAX = 1400;
        let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const isPng = file.type === 'image/png';
        onChange(canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.82));
        setUploading(false);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const previewStyle = { height: previewHeight, width: 'auto', maxWidth: previewHeight * 2, objectFit: aspect, borderRadius: '0.5rem', border: '1px solid var(--color-line)', background: '#fff', flexShrink: 0 };
  const btnStyle = { display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-line)', background: 'var(--color-cream-light)', color: 'var(--color-ink)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', whiteSpace: 'nowrap' };
  const rmStyle = { fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 };

  return (
    <div className="flex items-center gap-3">
      {value
        ? <img src={value} alt="" style={previewStyle} />
        : placeholder
          ? <img src={placeholder} alt="" style={{ ...previewStyle, opacity: 0.35 }} />
          : null}
      <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
      <div className="flex flex-col gap-1">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={btnStyle}>
          {uploading ? '…' : value ? 'Changer' : 'Choisir une image'}
        </button>
        {value && <button type="button" onClick={() => onChange('')} style={rmStyle}>Supprimer</button>}
      </div>
    </div>
  );
}

// ─── Rich text editor ─────────────────────────────────────────────────────────

function RichEditor({ value, onChange, rows = 6 }) {
  const ref = useRef(null);
  const init = useRef(false);

  useEffect(() => {
    if (ref.current && !init.current) {
      ref.current.innerHTML = value || '';
      init.current = true;
    }
  }, []);

  const exec = (cmd, val = null) => {
    ref.current.focus();
    document.execCommand(cmd, false, val);
  };

  const tools = [
    { label: 'G', title: 'Gras',      cmd: () => exec('bold') },
    { label: 'I', title: 'Italique',  cmd: () => exec('italic'),     style: { fontStyle: 'italic' } },
    { label: 'S', title: 'Souligné',  cmd: () => exec('underline'),  style: { textDecoration: 'underline' } },
    { label: 'H2',title: 'Titre 2',   cmd: () => exec('formatBlock', 'h2') },
    { label: 'P', title: 'Paragraphe',cmd: () => exec('formatBlock', 'p') },
    { label: '1.', title: 'Liste numérotée', cmd: () => exec('insertOrderedList') },
    { label: '•', title: 'Liste à puces',    cmd: () => exec('insertUnorderedList') },
    { label: '⊘', title: 'Effacer',   cmd: () => exec('removeFormat') },
  ];

  return (
    <div style={{ border: '1px solid var(--color-line)', borderRadius: '0.625rem', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-1.5 flex-wrap" style={{ background: 'var(--color-sage-light)', borderBottom: '1px solid var(--color-line)' }}>
        {tools.map(t => (
          <button
            key={t.label}
            type="button"
            title={t.title}
            onMouseDown={e => { e.preventDefault(); t.cmd(); }}
            className="px-2 py-1 rounded"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, ...t.style, background: 'transparent', color: 'var(--color-ink)' }}>
            {t.label}
          </button>
        ))}
      </div>
      {/* Editable */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current.innerHTML)}
        style={{
          minHeight: `${rows * 1.6}em`,
          padding: '0.75rem',
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

// ─── Section editor ───────────────────────────────────────────────────────────

function SectionCard({ section, positions, onChange, onDelete, onUp, onDown, isFirst, isLast }) {
  const [open, setOpen] = useState(true);
  const set = (k, v) => onChange({ ...section, [k]: v });

  const pillBtn = (active) => ({
    padding: '0.375rem 0.75rem',
    borderRadius: '9999px',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: active ? 'var(--color-sage-dark)' : 'var(--color-cream-light)',
    color: active ? '#fff' : 'var(--color-ink-soft)',
    border: active ? 'none' : '1px solid var(--color-line)',
    cursor: 'pointer',
  });

  return (
    <div style={{ border: '1px solid var(--color-sage)', borderRadius: '0.875rem', overflow: 'hidden' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'var(--color-sage-light)' }}>
        <button type="button" onClick={() => setOpen(o => !o)} className="flex-1 text-left flex items-center gap-2">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-sage-dark)', fontWeight: 600 }}>
            Section · {POSITION_LABELS[section.position] || section.position}
          </span>
          {section.title && <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)' }}>— {section.title}</span>}
          {open ? <ChevronUp size={14} style={{ marginLeft: 'auto', color: 'var(--color-ink-soft)' }} /> : <ChevronDown size={14} style={{ marginLeft: 'auto', color: 'var(--color-ink-soft)' }} />}
        </button>
        <div className="flex items-center gap-1">
          {!isFirst && <button type="button" onClick={onUp} title="Monter" style={{ color: 'var(--color-ink-soft)', padding: '0.125rem' }}><ChevronUp size={16} /></button>}
          {!isLast && <button type="button" onClick={onDown} title="Descendre" style={{ color: 'var(--color-ink-soft)', padding: '0.125rem' }}><ChevronDown size={16} /></button>}
          <button type="button" onClick={onDelete} title="Supprimer" style={{ color: '#ef4444', padding: '0.125rem' }}><X size={16} /></button>
        </div>
      </div>

      {open && (
        <div className="p-4 space-y-4" style={{ background: '#fff' }}>
          {/* Position */}
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.5rem' }}>Position</p>
            <div className="flex flex-wrap gap-2">
              {positions.map(p => (
                <button key={p} type="button" onClick={() => set('position', p)} style={pillBtn(section.position === p)}>
                  {POSITION_LABELS[p] || p}
                </button>
              ))}
            </div>
          </div>

          {/* Mise en page */}
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.5rem' }}>Mise en page</p>
            <div className="flex flex-wrap gap-2">
              {LAYOUTS.map(l => (
                <LayoutBtn key={l.value} layout={l} active={section.layout === l.value} onClick={() => set('layout', l.value)} pillBtn={pillBtn} />
              ))}
            </div>
          </div>

          {/* Rendu visuel */}
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.5rem' }}>Rendu visuel</p>
            <div className="flex flex-wrap gap-2">
              {RENDUS.map(r => (
                <button key={r.value} type="button" onClick={() => set('rendu', r.value)} style={pillBtn(section.rendu === r.value)}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image (si layout avec image) */}
          {section.layout && section.layout !== 'text-only' && section.layout !== 'text-encart' && (
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>
                URL de l'image
              </label>
              <input
                value={section.image || ''}
                onChange={e => set('image', e.target.value)}
                placeholder="https://…"
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-line)', background: 'var(--color-cream-light)', fontSize: '0.8rem', outline: 'none', fontFamily: 'var(--font-mono)' }}
              />
            </div>
          )}

          {/* Titre de section */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>
              Titre de la section
            </label>
            <input
              value={section.title || ''}
              onChange={e => set('title', e.target.value)}
              style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', border: '1px solid var(--color-line)', background: 'var(--color-cream-light)', fontSize: '0.875rem', outline: 'none' }}
            />
          </div>

          {/* Texte */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>
              Texte
            </label>
            <RichEditor value={section.text || ''} onChange={v => set('text', v)} rows={6} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Hero extra fields ────────────────────────────────────────────────────────

function HeroExtraFields({ data, setData }) {
  const inp = { width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', border: '1px solid var(--color-line)', background: 'var(--color-cream-light)', fontSize: '0.875rem', outline: 'none' };
  const lbl = (text) => <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>{text}</label>;
  return (
    <>
      <div>{lbl('Accroche')}<input value={data.tagline || ''} onChange={e => setData('tagline', e.target.value)} placeholder="Préparation mentale" style={inp} /></div>
      <div>{lbl('Sous-titre principal')}<textarea value={data.heroSubtitle || ''} onChange={e => setData('heroSubtitle', e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} /></div>
      <div>{lbl('Citation')}<input value={data.heroQuote || ''} onChange={e => setData('heroQuote', e.target.value)} placeholder="L'échec est le contraire de la réussite…" style={inp} /></div>
      <div style={{ borderTop: '1px solid var(--color-line)', paddingTop: '1rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-ink-soft)', marginBottom: '0.75rem' }}>Section "Pour qui ?"</p>
        <ForWhomEditor
          title={data.forWhomTitle}
          items={data.forWhomItems}
          onTitleChange={v => setData('forWhomTitle', v)}
          onItemsChange={v => setData('forWhomItems', v)}
        />
      </div>
    </>
  );
}

// ─── Page tab ─────────────────────────────────────────────────────────────────

function PageTab({ page, data, onChange }) {
  const sections = data[page.sectionsKey] || [];
  const setData = (k, v) => onChange({ ...data, [k]: v });

  const setSections = (s) => setData(page.sectionsKey, s);

  const addSection = () => {
    const newSection = { id: String(Date.now()), position: page.positions[0], layout: 'text-only', rendu: 'brut', title: '', text: '', image: '', encartItems: [] };
    setSections([...sections, newSection]);
  };

  const updateSection = (idx, s) => { const ns = [...sections]; ns[idx] = s; setSections(ns); };
  const deleteSection = (idx)    => setSections(sections.filter((_, i) => i !== idx));
  const moveUp   = (idx) => { if (idx === 0) return; const ns = [...sections]; [ns[idx-1],ns[idx]] = [ns[idx],ns[idx-1]]; setSections(ns); };
  const moveDown = (idx) => { if (idx === sections.length-1) return; const ns = [...sections]; [ns[idx],ns[idx+1]] = [ns[idx+1],ns[idx]]; setSections(ns); };

  return (
    <div className="space-y-6">
      {/* Voir la page */}
      <a
        href={page.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-sage-dark)', textDecoration: 'underline' }}>
        Voir la page <ExternalLink size={12} />
      </a>

      {/* Titre de la page */}
      {page.titleField && (
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>
            {page.key === 'hero' ? 'Titre principal' : 'Titre'}
          </label>
          <textarea
            value={data[page.titleField] || ''}
            onChange={e => setData(page.titleField, e.target.value)}
            rows={2}
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--color-line)', background: 'var(--color-cream-light)', fontSize: '1rem', outline: 'none', resize: 'vertical' }}
          />
          {page.key === 'hero' && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-ink-soft)', marginTop: '0.25rem' }}>
              Utilisez Entrée pour un retour à la ligne (la 2ème ligne sera en italique colorée)
            </p>
          )}
        </div>
      )}

      {/* Champs spécifiques à l'Accueil */}
      {page.key === 'hero' && <HeroExtraFields data={data} setData={setData} />}

      {/* Section Pour qui dans C'est quoi et pour qui ? */}
      {page.key === 'what' && <WhatExtraFields data={data} setData={setData} />}

      {/* Contenu spécifique à la page Éthique */}
      {page.key === 'ethics' && <EthicsExtraFields data={data} setData={setData} />}

      {/* Contenu spécifique à Qui suis-je ? */}
      {page.key === 'about' && <AboutExtraFields data={data} setData={setData} />}

      {/* Contenu spécifique à Contact */}
      {page.key === 'contact' && <ContactExtraFields data={data} setData={setData} />}

      {/* Sections personnalisées */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-ink-soft)' }}>
            Sections personnalisées
          </p>
          <button
            type="button"
            onClick={addSection}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full"
            style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <Plus size={13} /> Ajouter une section
          </button>
        </div>
        <div className="space-y-3">
          {sections.map((s, i) => (
            <SectionCard
              key={s.id || i}
              section={s}
              positions={page.positions}
              onChange={ns => updateSection(i, ns)}
              onDelete={() => deleteSection(i)}
              onUp={() => moveUp(i)}
              onDown={() => moveDown(i)}
              isFirst={i === 0}
              isLast={i === sections.length - 1}
            />
          ))}
          {sections.length === 0 && (
            <div className="rounded-xl p-6 text-center" style={{ border: '1px dashed var(--color-line)' }}>
              <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem' }}>Aucune section. Cliquez sur "Ajouter une section".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Widgets ──────────────────────────────────────────────────────────────────

function StatsEditor({ stats, onChange }) {
  const s = stats || {};
  const set = (k, v) => onChange({ ...s, [k]: Number(v) });
  const fields = [['clients','Clients accompagnés'],['satisfaction','Satisfaction (%)'],['specialties','Spécialités'],['years','Années d\'expérience']];
  return (
    <div className="grid grid-cols-2 gap-4">
      {fields.map(([k,l]) => (
        <div key={k}>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>{l}</label>
          <input type="number" value={s[k] ?? ''} onChange={e => set(k, e.target.value)}
            style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', border: '1px solid var(--color-line)', background: 'var(--color-cream-light)', fontSize: '0.875rem', outline: 'none' }} />
        </div>
      ))}
    </div>
  );
}

function FaqEditor({ items, onChange }) {
  const list = items || [];
  const add = () => onChange([...list, { id: String(Date.now()), question: '', answer: '' }]);
  const remove = (i) => onChange(list.filter((_, idx) => idx !== i));
  const update = (i, k, v) => { const nl = [...list]; nl[i] = { ...nl[i], [k]: v }; onChange(nl); };
  const inp = { width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-line)', background: 'var(--color-cream-light)', fontSize: '0.875rem', outline: 'none' };
  return (
    <div className="space-y-4">
      {list.map((item, i) => (
        <div key={item.id || i} className="rounded-xl p-4" style={{ background: 'var(--color-cream-light)', border: '1px solid var(--color-line)' }}>
          <div className="flex justify-between items-center mb-3">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase' }}>Q {i+1}</span>
            <button type="button" onClick={() => remove(i)} style={{ color: '#ef4444' }}><X size={14} /></button>
          </div>
          <input value={item.question} onChange={e => update(i,'question',e.target.value)} placeholder="Question…" style={{ ...inp, marginBottom: '0.5rem' }} />
          <textarea value={item.answer} onChange={e => update(i,'answer',e.target.value)} placeholder="Réponse…" rows={3} style={{ ...inp, resize: 'vertical' }} />
        </div>
      ))}
      <button type="button" onClick={add}
        className="flex items-center gap-2 px-4 py-2 rounded-full"
        style={{ border: '1px solid var(--color-line)', color: 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
        <Plus size={13} /> Ajouter une question
      </button>
    </div>
  );
}

function ForWhomEditor({ title, items, onTitleChange, onItemsChange }) {
  const list = items || [];
  const inp = { width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-line)', background: 'var(--color-cream-light)', fontSize: '0.875rem', outline: 'none' };
  const lbl = (text) => <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>{text}</label>;
  const add = () => onItemsChange([...list, { id: String(Date.now()), title: '', text: '', image: '' }]);
  const remove = (i) => onItemsChange(list.filter((_, idx) => idx !== i));
  const update = (i, k, v) => { const nl = [...list]; nl[i] = { ...nl[i], [k]: v }; onItemsChange(nl); };
  return (
    <div className="space-y-6">
      <div>
        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>
          Titre — Pour qui ?
        </label>
        <input
          value={title || ''}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="Pourquoi la préparation mentale ?"
          style={inp}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.5rem' }}>
          Publics concernés
        </label>
        <div className="space-y-3">
        {list.map((item, i) => (
          <div key={item.id || i} className="rounded-xl p-4" style={{ background: 'var(--color-cream-light)', border: '1px solid var(--color-line)' }}>
            <div className="flex justify-between items-center mb-3">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase' }}>Titre {i+1}</span>
              <button type="button" onClick={() => remove(i)} style={{ color: '#ef4444' }}><X size={14} /></button>
            </div>
            <input value={item.title || ''} onChange={e => update(i,'title',e.target.value)} placeholder="Titre (ex: Sportifs)" style={{ ...inp, marginBottom: '0.5rem' }} />
            <textarea value={item.text || ''} onChange={e => update(i,'text',e.target.value)} placeholder="Description…" rows={2} style={{ ...inp, resize: 'vertical', marginBottom: '0.5rem' }} />
            <div>
              {lbl('Photo illustrative')}
              <div className="mt-1">
                <ImageUpload value={item.image || ''} onChange={v => update(i,'image',v)} previewHeight={52} aspect="cover" />
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={add}
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ border: '1px solid var(--color-line)', color: 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
          <Plus size={13} /> Ajouter un item
        </button>
      </div>
      </div>
    </div>
  );
}

function AboutExtraFields({ data, setData }) {
  const inp = { width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-line)', background: 'var(--color-cream-light)', fontSize: '0.875rem', outline: 'none' };
  const lbl = (text) => <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>{text}</label>;
  const sectionLbl = (text) => <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-ink-soft)', marginBottom: '0.75rem', marginTop: '0.25rem' }}>{text}</p>;

  const formations = data.formations || [];
  const addF = () => setData('formations', [...formations, { id: String(Date.now()), image: '', diploma: '', year: '', school: '', diplomaDetail: '', stages: '' }]);
  const removeF = (i) => setData('formations', formations.filter((_, idx) => idx !== i));
  const updateF = (i, k, v) => { const nl = [...formations]; nl[i] = { ...nl[i], [k]: v }; setData('formations', nl); };

  const memoires = data.memoires || [];
  const addM = () => setData('memoires', [...memoires, { id: String(Date.now()), level: '', title: '', subtitle: '' }]);
  const removeM = (i) => setData('memoires', memoires.filter((_, idx) => idx !== i));
  const updateM = (i, k, v) => { const nl = [...memoires]; nl[i] = { ...nl[i], [k]: v }; setData('memoires', nl); };

  return (
    <div className="space-y-5" style={{ borderTop: '1px solid var(--color-line)', paddingTop: '1rem' }}>
      {/* Photo + présentations */}
      <div>
        {lbl('Photo de profil')}
        <div className="mt-1">
          <ImageUpload value={data.aboutPhoto || ''} onChange={v => setData('aboutPhoto', v)} previewHeight={64} aspect="cover" />
        </div>
      </div>
      <div>
        {lbl('Présentation courte')}
        <textarea value={data.aboutShort || ''} onChange={e => setData('aboutShort', e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} placeholder="Préparatrice mentale diplômée…" />
      </div>
      <div>
        {lbl('Présentation longue')}
        <textarea value={data.aboutLong || ''} onChange={e => setData('aboutLong', e.target.value)} rows={5} style={{ ...inp, resize: 'vertical' }} placeholder="Mon approche repose sur…" />
      </div>
      <div>
        {lbl('Publics accompagnés (un par ligne)')}
        <textarea
          value={Array.isArray(data.aboutPublics) ? data.aboutPublics.join('\n') : (data.aboutPublics || '')}
          onChange={e => setData('aboutPublics', e.target.value.split('\n').filter(Boolean))}
          rows={4}
          style={{ ...inp, resize: 'vertical' }}
          placeholder={'Sportifs\nMilitaires\nProfessionnels\nParticuliers'}
        />
      </div>

      {/* Formations */}
      <div style={{ borderTop: '1px solid var(--color-line)', paddingTop: '1rem' }}>
        {sectionLbl('Formations')}
        <div className="space-y-3">
          {formations.map((f, i) => (
            <div key={f.id || i} className="rounded-xl p-4" style={{ background: 'var(--color-cream-light)', border: '1px solid var(--color-line)' }}>
              <div className="flex justify-between items-center mb-3">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase' }}>Formation {i + 1}</span>
                <button type="button" onClick={() => removeF(i)} style={{ color: '#ef4444' }}><X size={14} /></button>
              </div>
              <div className="mb-2">
                {lbl('Logo / Photo de l\'école')}
                <div className="mt-1"><ImageUpload value={f.image || ''} onChange={v => updateF(i,'image',v)} previewHeight={52} aspect="contain" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>{lbl('Diplôme')}<input value={f.diploma || ''} onChange={e => updateF(i,'diploma',e.target.value)} placeholder="Master EOPS" style={inp} /></div>
                <div>{lbl('Année')}<input value={f.year || ''} onChange={e => updateF(i,'year',e.target.value)} placeholder="2022" style={inp} /></div>
              </div>
              <div className="mb-2">{lbl('École / Établissement')}<input value={f.school || ''} onChange={e => updateF(i,'school',e.target.value)} placeholder="Université…" style={inp} /></div>
              <div className="mb-2">{lbl('Détail du diplôme')}<input value={f.diplomaDetail || ''} onChange={e => updateF(i,'diplomaDetail',e.target.value)} placeholder="Mention, spécialisation…" style={inp} /></div>
              <div>{lbl('Stages / Expériences')}<textarea value={f.stages || ''} onChange={e => updateF(i,'stages',e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} placeholder="Stage chez…" /></div>
            </div>
          ))}
          <button type="button" onClick={addF}
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ border: '1px solid var(--color-line)', color: 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
            <Plus size={13} /> Ajouter une formation
          </button>
        </div>
      </div>

      {/* Mémoires */}
      <div style={{ borderTop: '1px solid var(--color-line)', paddingTop: '1rem' }}>
        {sectionLbl('Mémoires')}
        <div className="space-y-3">
          {memoires.map((m, i) => (
            <div key={m.id || i} className="rounded-xl p-4" style={{ background: 'var(--color-cream-light)', border: '1px solid var(--color-line)' }}>
              <div className="flex justify-between items-center mb-3">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase' }}>Mémoire {i + 1}</span>
                <button type="button" onClick={() => removeM(i)} style={{ color: '#ef4444' }}><X size={14} /></button>
              </div>
              <div className="mb-2">{lbl('Niveau (ex: Master 2)')}<input value={m.level || ''} onChange={e => updateM(i,'level',e.target.value)} placeholder="Master 2" style={inp} /></div>
              <div className="mb-2">{lbl('Titre')}<input value={m.title || ''} onChange={e => updateM(i,'title',e.target.value)} placeholder="Titre du mémoire" style={inp} /></div>
              <div>{lbl('Sous-titre / résumé')}<input value={m.subtitle || ''} onChange={e => updateM(i,'subtitle',e.target.value)} placeholder="Sous-titre…" style={inp} /></div>
            </div>
          ))}
          <button type="button" onClick={addM}
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ border: '1px solid var(--color-line)', color: 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
            <Plus size={13} /> Ajouter un mémoire
          </button>
        </div>
      </div>
    </div>
  );
}

function EthicsExtraFields({ data, setData }) {
  const inp = { width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-line)', background: 'var(--color-cream-light)', fontSize: '0.875rem', outline: 'none' };
  const lbl = (text) => <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>{text}</label>;
  const principles = data.ethicsPrinciples || [];
  const addP = () => setData('ethicsPrinciples', [...principles, { id: String(Date.now()), title: '', text: '' }]);
  const removeP = (i) => setData('ethicsPrinciples', principles.filter((_, idx) => idx !== i));
  const updateP = (i, k, v) => { const nl = [...principles]; nl[i] = { ...nl[i], [k]: v }; setData('ethicsPrinciples', nl); };

  return (
    <div className="space-y-5" style={{ borderTop: '1px solid var(--color-line)', paddingTop: '1rem' }}>
      {/* Introduction */}
      <div>
        {lbl('Introduction')}
        <textarea value={data.ethicsIntro || ''} onChange={e => setData('ethicsIntro', e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' }} placeholder="Texte d'introduction…" />
      </div>

      {/* Principes */}
      <div>
        {lbl('Principes')}
        <div className="space-y-3 mt-1">
          {principles.map((p, i) => (
            <div key={p.id || i} className="rounded-xl p-4" style={{ background: 'var(--color-cream-light)', border: '1px solid var(--color-line)' }}>
              <div className="flex justify-between items-center mb-2">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase' }}>Principe {i + 1}</span>
                <button type="button" onClick={() => removeP(i)} style={{ color: '#ef4444' }}><X size={14} /></button>
              </div>
              <input value={p.title || ''} onChange={e => updateP(i, 'title', e.target.value)} placeholder="Titre (ex: Confidentialité)" style={{ ...inp, marginBottom: '0.5rem' }} />
              <textarea value={p.text || ''} onChange={e => updateP(i, 'text', e.target.value)} placeholder="Description…" rows={2} style={{ ...inp, resize: 'vertical' }} />
            </div>
          ))}
          <button type="button" onClick={addP}
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ border: '1px solid var(--color-line)', color: 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
            <Plus size={13} /> Ajouter un principe
          </button>
        </div>
      </div>

      {/* Images */}
      <div>
        {lbl('Image Charte (droite)')}
        <div className="mt-1"><ImageUpload value={data.ethicsImage || ''} onChange={v => setData('ethicsImage', v)} previewHeight={52} aspect="cover" /></div>
      </div>
      <div>
        {lbl('Schéma déontologique')}
        <div className="mt-1"><ImageUpload value={data.ethicsSchema || ''} onChange={v => setData('ethicsSchema', v)} previewHeight={52} aspect="contain" /></div>
      </div>
    </div>
  );
}

function WhatExtraFields({ data, setData }) {
  return (
    <div style={{ borderTop: '1px solid var(--color-line)', paddingTop: '1rem' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '1rem' }}>Section "Pour qui ?"</p>
      <ForWhomEditor
        title={data.forWhomTitle}
        items={data.forWhomItems}
        onTitleChange={v => setData('forWhomTitle', v)}
        onItemsChange={v => setData('forWhomItems', v)}
      />
    </div>
  );
}

function ContactExtraFields({ data, setData }) {
  const inp = { width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-line)', background: 'var(--color-cream-light)', fontSize: '0.875rem', outline: 'none' };
  const lbl = (text) => <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>{text}</label>;
  return (
    <div className="space-y-4" style={{ borderTop: '1px solid var(--color-line)', paddingTop: '1rem' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-ink-soft)' }}>Informations de contact</p>
      <div className="grid grid-cols-2 gap-4">
        <div>{lbl('Titre de la page')}<input value={data.contactTitle || ''} onChange={e => setData('contactTitle', e.target.value)} placeholder="Écrivez-moi" style={inp} /></div>
        <div>{lbl('Sous-titre')}<input value={data.contactSubtitle || ''} onChange={e => setData('contactSubtitle', e.target.value)} placeholder="Je suis disponible…" style={inp} /></div>
        <div>{lbl('Téléphone')}<input value={data.contactPhone || ''} onChange={e => setData('contactPhone', e.target.value)} placeholder="07 83 15 70 30" style={inp} /></div>
        <div>{lbl('Email')}<input value={data.contactEmail || ''} onChange={e => setData('contactEmail', e.target.value)} placeholder="jodie@example.com" style={inp} /></div>
      </div>
      <div>{lbl('Localisation')}<input value={data.contactLocation || ''} onChange={e => setData('contactLocation', e.target.value)} placeholder="Pays de la Loire — en présentiel ou en visio" style={inp} /></div>
    </div>
  );
}

function WidgetsTab({ activeWidget, setActiveWidget, data, onChange }) {
  const inp = { width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', border: '1px solid var(--color-line)', background: 'var(--color-cream-light)', fontSize: '0.875rem', outline: 'none' };
  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'var(--color-sage-light)' }}>
        {WIDGETS_TABS.map(t => (
          <button key={t} type="button" onClick={() => setActiveWidget(t)}
            className="px-4 py-2 rounded-lg"
            style={{ background: activeWidget === t ? '#fff' : 'transparent', color: activeWidget === t ? 'var(--color-ink)' : 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: activeWidget === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
            {t}
          </button>
        ))}
      </div>
      {activeWidget === 'FAQ' && <FaqEditor items={data.faq} onChange={v => onChange({ ...data, faq: v })} />}
      {activeWidget === 'Stats' && <StatsEditor stats={data.stats} onChange={v => onChange({ ...data, stats: v })} />}
      {activeWidget === 'Bandeau' && (
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>Texte du bandeau d'annonce</label>
          <input value={data.announcement || ''} onChange={e => onChange({ ...data, announcement: e.target.value })} style={inp} />
        </div>
      )}
      {(activeWidget === 'Témoignages' || activeWidget === 'Ressources') && (
        <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem' }}>Aucun élément pour l'instant.</p>
      )}
    </div>
  );
}

// ─── Global ────────────────────────────────────────────────────────────────────

function GlobalTab({ activeGlobal, setActiveGlobal, data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const inp = { width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', border: '1px solid var(--color-line)', background: 'var(--color-cream-light)', fontSize: '0.875rem', outline: 'none' };
  const lbl = (text) => <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' }}>{text}</label>;
  const [fetchingGoogle, setFetchingGoogle] = useState(false);
  const [googleFetchMsg, setGoogleFetchMsg] = useState('');

  const social = data.socialLinks || {};
  const setNav = (k, v) => set(k, v);
  const setSocial = (k, v) => set('socialLinks', { ...social, [k]: v });

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'var(--color-sage-light)' }}>
        {GLOBAL_TABS.map(t => (
          <button key={t} type="button" onClick={() => setActiveGlobal(t)}
            className="px-4 py-2 rounded-lg"
            style={{ background: activeGlobal === t ? '#fff' : 'transparent', color: activeGlobal === t ? 'var(--color-ink)' : 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: activeGlobal === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
            {t}
          </button>
        ))}
      </div>

      {activeGlobal === 'Apparence' && (
        <div className="space-y-5">
          <div>{lbl('Nom du site')}<input value={data.siteName || ''} onChange={e => set('siteName', e.target.value)} style={inp} /></div>

          {/* Style du header */}
          <div>
            {lbl('Style du header')}
            <div className="grid grid-cols-2 gap-3 mt-1">
              {[
                { value: 'fullscreen', label: 'Plein écran', desc: 'Photo en fond, texte centré' },
                { value: 'split',      label: 'Séparé',      desc: 'Texte à gauche, image à droite' },
              ].map(opt => {
                const active = (data.heroStyle || 'fullscreen') === opt.value;
                return (
                  <button key={opt.value} type="button" onClick={() => set('heroStyle', opt.value)}
                    className="rounded-xl p-4 text-left"
                    style={{ border: `2px solid ${active ? 'var(--color-sage-dark)' : 'var(--color-line)'}`, background: active ? 'var(--color-sage-light)' : 'var(--color-cream-light)', cursor: 'pointer' }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 400, color: active ? 'var(--color-sage-dark)' : 'var(--color-ink)', marginBottom: '0.25rem' }}>{opt.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ink-soft)' }}>{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image fields */}
          {[
            ['logo',        'Logo (Navbar & Header)', '/logo-crop.png'],
            ['logoFooter',  'Logo Footer',            '/logo-crop.png'],
            ['favicon',     'Favicon',                '/logo-crop.png'],
            ['heroImage',   'Image du header',        null],
          ].map(([key, label, placeholder]) => (
            <div key={key}>
              {lbl(label)}
              <div className="mt-1">
                <ImageUpload
                  value={data[key] || ''}
                  onChange={v => set(key, v)}
                  placeholder={placeholder}
                  previewHeight={key === 'heroImage' ? 56 : 48}
                  aspect={key === 'heroImage' ? 'cover' : 'contain'}
                />
              </div>
            </div>
          ))}

          {/* Réseaux sociaux */}
          <div style={{ borderTop: '1px solid var(--color-line)', paddingTop: '1rem' }}>
            {lbl('Réseaux sociaux')}
            <div className="space-y-3 mt-2">
              <div>{lbl('Instagram')}<input value={social.instagram || ''} onChange={e => setSocial('instagram', e.target.value)} style={inp} /></div>
              <div>{lbl('LinkedIn')}<input value={social.linkedin || ''} onChange={e => setSocial('linkedin', e.target.value)} style={inp} /></div>
              <div>{lbl('Facebook')}<input value={social.facebook || ''} onChange={e => setSocial('facebook', e.target.value)} style={inp} /></div>
            </div>
          </div>

          {/* Coordonnées (footer) */}
          <div style={{ borderTop: '1px solid var(--color-line)', paddingTop: '1rem' }}>
            {lbl('Coordonnées (affichées dans le footer)')}
            <div className="space-y-3 mt-2">
              <div>{lbl('Téléphone')}<input value={data.contactPhone || ''} onChange={e => set('contactPhone', e.target.value)} placeholder="07 83 15 70 30" style={inp} /></div>
              <div>{lbl('Email')}<input value={data.contactEmail || ''} onChange={e => set('contactEmail', e.target.value)} placeholder="jodie.prepa.mentale@gmail.com" style={inp} /></div>
              <div>{lbl('Localisation')}<input value={data.contactLocation || ''} onChange={e => set('contactLocation', e.target.value)} placeholder="Pays de la Loire — en présentiel ou en visio" style={inp} /></div>
              <div>{lbl('Accroche footer (sous le logo)')}<input value={data.footerTagline || ''} onChange={e => set('footerTagline', e.target.value)} placeholder="Préparation mentale" style={inp} /></div>
              <div>{lbl('URL du bouton Réserver')}<input value={data.bookingUrl || ''} onChange={e => set('bookingUrl', e.target.value)} placeholder="/contact" style={inp} /></div>
            </div>
          </div>
        </div>
      )}

      {activeGlobal === 'Navigation' && (
        <div className="space-y-4">
          {[
            ['navHomeLabel',    'Label — Accueil'],
            ['navWhatLabel',    "Label — C'est quoi et pour qui ?"],
            ['navEthicsLabel',  'Label — Éthique'],
            ['navAboutLabel',   'Label — À propos'],
            ['navServicesLabel','Label — Services'],
            ['navContactLabel', 'Label — Contact'],
          ].map(([k, l]) => (
            <div key={k}>{lbl(l)}<input value={data[k] || ''} onChange={e => setNav(k, e.target.value)} style={inp} /></div>
          ))}
        </div>
      )}

      {activeGlobal === 'Avis Google' && (() => {
        const reviews = data.googleReviews || [];
        const addR = () => set('googleReviews', [...reviews, { id: String(Date.now()), author: '', rating: 5, text: '', date: '' }]);
        const removeR = (i) => set('googleReviews', reviews.filter((_, idx) => idx !== i));
        const updateR = (i, k, v) => { const nl = [...reviews]; nl[i] = { ...nl[i], [k]: v }; set('googleReviews', nl); };

        const fetchFromGoogle = async () => {
          setFetchingGoogle(true);
          setGoogleFetchMsg('');
          try {
            const res = await pb.send('/api/pb/google-reviews', { method: 'GET' });
            const newReviews = (res.reviews || []).map(r => ({ ...r, id: r.id || String(Date.now() + Math.random()) }));
            onChange({
              ...data,
              googleRating: res.rating !== undefined ? String(res.rating) : data.googleRating,
              googleRatingCount: res.user_ratings_total !== undefined ? String(res.user_ratings_total) : data.googleRatingCount,
              googleReviews: newReviews,
            });
            setGoogleFetchMsg(`OK — ${newReviews.length} avis importés (note: ${res.rating})`);
          } catch (err) {
            const msg = err?.response?.message || err?.data?.error || String(err);
            setGoogleFetchMsg('Erreur : ' + msg);
          } finally {
            setFetchingGoogle(false);
          }
        };

        return (
          <div className="space-y-5">
            {/* Clés API */}
            <div className="rounded-xl p-4" style={{ background: 'var(--color-sage-light)', border: '1px solid var(--color-line)' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-sage-dark)', marginBottom: '0.75rem', fontWeight: 600 }}>
                Connexion Google Places
              </p>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>{lbl('Clé API Google')}<input value={data.googleApiKey || ''} onChange={e => set('googleApiKey', e.target.value)} placeholder="AIza…" style={inp} /></div>
                <div>{lbl('Place ID')}<input value={data.googlePlaceId || ''} onChange={e => set('googlePlaceId', e.target.value)} placeholder="ChIJ…" style={inp} /></div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button type="button" onClick={fetchFromGoogle} disabled={fetchingGoogle || !data.googleApiKey || !data.googlePlaceId}
                  className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ background: data.googleApiKey && data.googlePlaceId ? 'var(--color-sage-dark)' : 'var(--color-line)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: fetchingGoogle || !data.googleApiKey || !data.googlePlaceId ? 'not-allowed' : 'pointer', opacity: fetchingGoogle ? 0.7 : 1 }}>
                  <RefreshCw size={13} className={fetchingGoogle ? 'animate-spin' : ''} />
                  {fetchingGoogle ? 'Récupération…' : 'Récupérer depuis Google'}
                </button>
                {googleFetchMsg && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: googleFetchMsg.startsWith('Erreur') ? '#991b1b' : '#166534' }}>
                    {googleFetchMsg}
                  </span>
                )}
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-ink-soft)', marginTop: '0.5rem' }}>
                Si renseignés, cliquez le bouton pour importer automatiquement la note et les avis Google.
              </p>
            </div>

            {/* Note + compteur (modifiables manuellement) */}
            <div className="grid grid-cols-2 gap-4">
              <div>{lbl('Note globale (ex: 4.9)')}<input value={data.googleRating || ''} onChange={e => set('googleRating', e.target.value)} placeholder="4.9" style={inp} /></div>
              <div>{lbl('Nombre d\'avis (ex: 37)')}<input value={data.googleRatingCount || ''} onChange={e => set('googleRatingCount', e.target.value)} placeholder="37" style={inp} /></div>
            </div>

            {/* Avis manuels */}
            <div>
              {lbl('Avis clients')}
              <div className="space-y-3 mt-1">
                {reviews.map((r, i) => (
                  <div key={r.id || i} className="rounded-xl p-4" style={{ background: 'var(--color-cream-light)', border: '1px solid var(--color-line)' }}>
                    <div className="flex justify-between items-center mb-2">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase' }}>Avis {i + 1}</span>
                      <button type="button" onClick={() => removeR(i)} style={{ color: '#ef4444' }}><X size={14} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input value={r.author || ''} onChange={e => updateR(i, 'author', e.target.value)} placeholder="Prénom Nom" style={inp} />
                      <select value={r.rating || 5} onChange={e => updateR(i, 'rating', Number(e.target.value))} style={inp}>
                        {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}
                      </select>
                    </div>
                    <textarea value={r.text || ''} onChange={e => updateR(i, 'text', e.target.value)} placeholder="Texte de l'avis…" rows={3} style={{ ...inp, resize: 'vertical' }} />
                    <input value={r.date || ''} onChange={e => updateR(i, 'date', e.target.value)} placeholder="Date (ex: Octobre 2024)" style={{ ...inp, marginTop: '0.5rem' }} />
                  </div>
                ))}
                <button type="button" onClick={addR}
                  className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ border: '1px solid var(--color-line)', color: 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                  <Plus size={13} /> Ajouter un avis
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {activeGlobal === 'Pages légales' && (
        <div className="space-y-6">
          {[
            ['legalMentions','Mentions légales'],
            ['legalPrivacy', 'Politique de confidentialité'],
            ['legalCookies', 'Cookies'],
            ['legalTerms',   "Conditions d'utilisation"],
          ].map(([k, l]) => (
            <div key={k}>
              {lbl(l + ' (HTML)')}
              <textarea
                value={data[k] || ''}
                onChange={e => set(k, e.target.value)}
                rows={10}
                style={{ ...inp, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

const GROUP_TABS = ['Pages', 'Widgets', 'Global'];

export default function Content() {
  const { showToast } = useAdmin();
  const { refresh: refreshSite } = useSite();

  const [record, setRecord]         = useState(null);
  const [data, setData]             = useState({});
  const [saving, setSaving]         = useState(false);
  const [dirty, setDirty]           = useState(false);
  const [group, setGroup]           = useState('Pages');
  const [activePage, setActivePage] = useState(PAGES[0].key);
  const [activeWidget, setActiveWidget] = useState('FAQ');
  const [activeGlobal, setActiveGlobal] = useState('Apparence');

  useEffect(() => {
    pb.collection('site_content').getFirstListItem('section="global"').then(r => {
      setRecord(r);
      setData(r.data || {});
    }).catch(() => {});
  }, []);

  const handleChange = useCallback((newData) => {
    setData(newData);
    setDirty(true);
  }, []);

  const handleSave = async () => {
    if (!record || !dirty) return;
    setSaving(true);
    try {
      await pb.collection('site_content').update(record.id, { data });
      setDirty(false);
      showToast('Contenu sauvegardé');
      refreshSite();
    } finally {
      setSaving(false);
    }
  };

  const currentPage = PAGES.find(p => p.key === activePage);

  const groupBtn = (g) => ({
    padding: '0.5rem 1.25rem',
    borderRadius: '9999px',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    background: group === g ? 'var(--color-sage-dark)' : '#fff',
    color: group === g ? '#fff' : 'var(--color-ink-soft)',
    border: `1px solid ${group === g ? 'var(--color-sage-dark)' : 'var(--color-line)'}`,
    cursor: 'pointer',
  });

  const pageBtn = (p) => ({
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    background: activePage === p.key ? 'var(--color-ink)' : 'var(--color-cream-light)',
    color: activePage === p.key ? '#fff' : 'var(--color-ink-soft)',
    border: `1px solid ${activePage === p.key ? 'var(--color-ink)' : 'var(--color-line)'}`,
    cursor: 'pointer',
  });

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 400, color: 'var(--color-ink)' }}>Contenu du site</h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty || !record}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full"
          style={{ background: dirty ? 'var(--color-sage-dark)' : 'var(--color-line)', color: dirty ? '#fff' : 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: (saving || !dirty) ? 0.7 : 1, cursor: (saving || !dirty) ? 'default' : 'pointer' }}>
          <Save size={14} /> {saving ? 'Enregistrement…' : 'Sauvegarder'}
        </button>
      </div>

      {/* Groupe PAGES / WIDGETS / GLOBAL */}
      <div className="flex gap-2 mb-6">
        {GROUP_TABS.map(g => (
          <button key={g} type="button" onClick={() => setGroup(g)} style={groupBtn(g)}>{g}</button>
        ))}
      </div>

      {!record ? (
        <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem' }}>Chargement…</p>
      ) : (
        <>
          {/* Pages */}
          {group === 'Pages' && (
            <div>
              {/* Page selector */}
              <div className="flex flex-wrap gap-2 mb-6 pb-6" style={{ borderBottom: '1px solid var(--color-line)' }}>
                {PAGES.map(p => (
                  <button key={p.key} type="button" onClick={() => setActivePage(p.key)} style={pageBtn(p)}>{p.label}</button>
                ))}
              </div>
              {currentPage && (
                <PageTab
                  page={currentPage}
                  data={data}
                  onChange={handleChange}
                />
              )}
            </div>
          )}

          {/* Widgets */}
          {group === 'Widgets' && (
            <WidgetsTab
              activeWidget={activeWidget}
              setActiveWidget={setActiveWidget}
              data={data}
              onChange={handleChange}
            />
          )}

          {/* Global */}
          {group === 'Global' && (
            <GlobalTab
              activeGlobal={activeGlobal}
              setActiveGlobal={setActiveGlobal}
              data={data}
              onChange={handleChange}
            />
          )}
        </>
      )}

      {/* Floating save */}
      {dirty && (
        <div className="fixed bottom-6 right-6 z-10">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-full shadow-lg"
            style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <Save size={15} /> {saving ? 'Enregistrement…' : 'Sauvegarder les modifications'}
          </button>
        </div>
      )}
    </div>
  );
}
