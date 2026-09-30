import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext.jsx';
import { useAdmin } from '../../contexts/AdminContext.jsx';

const SECTIONS = [
  { id: 'navigation',   label: 'Navigation' },
  { id: 'hero',         label: 'Héro' },
  { id: 'appearance',   label: 'Apparence' },
  { id: 'testimonials', label: 'Témoignages' },
  { id: 'what',         label: "C'est quoi ?" },
  { id: 'ethics',       label: 'Éthique' },
  { id: 'about',        label: 'Qui suis-je' },
  { id: 'contact',      label: 'Contact' },
  { id: 'google',       label: 'Google Reviews' },
  { id: 'legal',        label: 'Mentions légales' },
];

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest font-mono mb-1.5 block text-ink-soft">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, multiline, rows = 3 }) {
  const cls = "w-full px-4 py-3 rounded-lg border border-line outline-none bg-cream-light text-sm";
  if (multiline) return <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={cls + ' resize-none'} />;
  return <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />;
}

function RichTextarea({ value, onChange, placeholder }) {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      className="w-full min-h-[120px] px-4 py-3 rounded-lg border border-line outline-none bg-cream-light text-sm leading-relaxed prose-editor"
      data-placeholder={placeholder}
      onInput={e => onChange(e.currentTarget.innerHTML)}
      dangerouslySetInnerHTML={{ __html: value || '' }}
    />
  );
}

function ImageUpload({ label, value, onChange, preview, help }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <div className="text-xs uppercase tracking-widest mb-2 font-mono" style={{ color: 'var(--color-ink-soft)' }}>{label}</div>
      <div className="flex items-center gap-4">
        {value ? (
          preview === 'logo' ? (
            <img src={value} alt="logo" style={{ height: '48px', width: 'auto', objectFit: 'contain', border: '1px solid var(--color-line)', borderRadius: 8, padding: 4, background: '#fff' }} />
          ) : preview === 'favicon' ? (
            <img src={value} alt="favicon" className="w-10 h-10 rounded object-contain" style={{ border: '1px solid var(--color-line)', background: '#fff' }} />
          ) : (
            <img src={value} alt="" className="w-24 h-16 rounded-lg object-cover" style={{ border: '1px solid var(--color-line)' }} />
          )
        ) : (
          <div className="w-16 h-10 rounded-lg flex items-center justify-center text-[10px] font-mono" style={{ background: 'var(--color-cream-light)', color: 'var(--color-ink-soft)' }}>Aucune</div>
        )}
        <div className="flex flex-col gap-1">
          <label className="cursor-pointer px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest" style={{ background: 'var(--color-ink)', color: 'var(--color-cream)' }}>
            Choisir
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
          {value && (
            <button onClick={() => onChange('')} className="text-xs font-mono uppercase tracking-widest underline text-left" style={{ color: 'var(--color-sage-dark)' }}>Supprimer</button>
          )}
        </div>
      </div>
      {help && <div className="text-[10px] mt-2" style={{ color: 'var(--color-ink-soft)' }}>{help}</div>}
    </div>
  );
}

export default function Content() {
  const { content, updateContent, loaded } = useSite();
  const { showToast } = useAdmin();
  const [section, setSection] = useState('hero');
  const [saving, setSaving] = useState(false);
  const [local, setLocal] = useState({ ...content });

  // Resync quand PocketBase répond (loaded + content mis à jour ensemble dans SiteContext)
  const synced = useRef(false);
  useEffect(() => {
    if (loaded && !synced.current) {
      synced.current = true;
      setLocal({ ...content });
    }
  }, [loaded, content]);

  const set = key => val => setLocal(l => ({ ...l, [key]: val }));
  const setNested = (key, idx, field) => val => setLocal(l => {
    const arr = [...(l[key] || [])];
    arr[idx] = { ...arr[idx], [field]: val };
    return { ...l, [key]: arr };
  });

  const save = async () => {
    setSaving(true);
    await updateContent(local);
    showToast('Contenu sauvegardé');
    setSaving(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between p-6 pb-0">
        <h1 className="font-serif text-4xl text-ink">Contenu du site</h1>
        <button onClick={save} disabled={saving}
          className="px-6 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest bg-sage-dark text-cream disabled:opacity-50 hover:opacity-90 transition-opacity">
          {saving ? 'Sauvegarde…' : 'Sauvegarder'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        {/* Section tabs */}
        <div className="w-36 flex-shrink-0 flex flex-col gap-1">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)}
              className={`px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-widest text-left transition-all ${section === s.id ? 'bg-sage-dark text-cream' : 'text-ink-soft hover:text-ink hover:bg-cream-light'}`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-auto space-y-5 pr-2">
          {section === 'navigation' && <>
            <div className="p-4 rounded-xl text-xs" style={{ background: 'var(--color-cream-light)', color: 'var(--color-ink-soft)', border: '1px solid var(--color-line)' }}>
              Personnalisez les libellés des liens dans la barre de navigation.
            </div>
            <Field label="Accueil"><TextInput value={local.navHomeLabel} onChange={set('navHomeLabel')} placeholder="Accueil" /></Field>
            <Field label="C'est quoi ?"><TextInput value={local.navWhatLabel} onChange={set('navWhatLabel')} placeholder="C'est quoi ?" /></Field>
            <Field label="Éthique"><TextInput value={local.navEthicsLabel} onChange={set('navEthicsLabel')} placeholder="Éthique" /></Field>
            <Field label="Qui suis-je"><TextInput value={local.navAboutLabel} onChange={set('navAboutLabel')} placeholder="Qui suis-je" /></Field>
            <Field label="Prestations"><TextInput value={local.navServicesLabel} onChange={set('navServicesLabel')} placeholder="Prestations" /></Field>
            <Field label="Contact"><TextInput value={local.navContactLabel} onChange={set('navContactLabel')} placeholder="Contact" /></Field>
          </>}

          {section === 'appearance' && <>
            {/* Style du header — visual card picker, valeurs 'split' | 'fullwidth' comme dans la v1 */}
            <div>
              <label className="text-xs uppercase tracking-widest font-mono mb-3 block text-ink-soft">Style du header</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'split', label: 'Séparé', desc: 'Texte à gauche, image/logo à droite', preview: (
                    <div className="flex gap-1 h-10">
                      <div className="flex-1 rounded flex flex-col justify-center px-1.5 gap-0.5 bg-cream-light">
                        <div className="h-1 rounded bg-sage-dark" style={{ width: '60%' }} />
                        <div className="h-0.5 rounded" style={{ background: 'var(--color-line)', width: '80%' }} />
                        <div className="h-0.5 rounded" style={{ background: 'var(--color-line)', width: '50%' }} />
                      </div>
                      <div className="w-10 rounded" style={{ background: 'var(--color-cream-light)', border: '1px solid var(--color-line)' }} />
                    </div>
                  )},
                  { value: 'fullwidth', label: 'Plein écran', desc: 'Photo en fond, texte centré superposé', preview: (
                    <div className="h-10 rounded flex items-center justify-center" style={{ background: 'var(--color-ink)' }}>
                      <div className="text-center">
                        <div className="h-1 rounded mx-auto mb-0.5" style={{ background: 'rgba(255,255,255,0.6)', width: 32 }} />
                        <div className="h-1.5 rounded mx-auto" style={{ background: 'rgba(255,255,255,0.9)', width: 48 }} />
                      </div>
                    </div>
                  )},
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => set('heroStyle')(opt.value)}
                    className="p-3 rounded-xl text-left transition-all"
                    style={{ border: `2px solid ${(local.heroStyle || 'fullwidth') === opt.value ? 'var(--color-sage-dark)' : 'var(--color-line)'}`, background: (local.heroStyle || 'fullwidth') === opt.value ? 'var(--color-cream-light)' : 'var(--color-cream)' }}>
                    {opt.preview}
                    <div className="mt-2 text-xs font-mono font-semibold" style={{ color: (local.heroStyle || 'fullwidth') === opt.value ? 'var(--color-sage-dark)' : 'var(--color-ink)' }}>{opt.label}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-ink-soft)' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
              {(local.heroStyle || 'fullwidth') === 'fullwidth' && (
                <div className="mt-2 text-[10px] px-3 py-2 rounded-lg" style={{ background: 'var(--color-cream-light)', color: 'var(--color-ink-soft)' }}>
                  Le style plein écran utilise l'image du header comme fond. Sans image, un fond sombre est affiché.
                </div>
              )}
            </div>

            <ImageUpload label="Logo (navbar & header)" value={local.logo} onChange={set('logo')} preview="logo" help="Affiché dans la navbar et le header. PNG transparent recommandé." />
            <ImageUpload label="Logo footer" value={local.logoFooter} onChange={set('logoFooter')} preview="logo" help="Version pour le fond cramoisi du footer (blanc ou clair). Si vide, le logo principal est inversé en blanc automatiquement." />
            <ImageUpload label="Favicon" value={local.favicon} onChange={set('favicon')} preview="favicon" help="Icône dans l'onglet du navigateur. Carré 32×32 ou 64×64 px idéal." />
            <ImageUpload label="Image du header" value={local.heroImage} onChange={set('heroImage')} help={(local.heroStyle || 'fullwidth') === 'fullwidth' ? 'Fond plein écran du hero.' : 'Photo dans la colonne droite du hero. Si vide, le logo est utilisé.'} />

            <div className="pt-2">
              <label className="text-xs uppercase tracking-widest font-mono mb-3 block text-ink-soft">Réseaux sociaux</label>
              <div className="space-y-2">
                {[
                  { key: 'facebook',  label: 'Facebook',   placeholder: 'https://facebook.com/votre-page' },
                  { key: 'instagram', label: 'Instagram',  placeholder: 'https://instagram.com/votre-compte' },
                  { key: 'youtube',   label: 'YouTube',    placeholder: 'https://youtube.com/@votre-chaine' },
                  { key: 'twitter',   label: 'X / Twitter',placeholder: 'https://x.com/votre-compte' },
                  { key: 'linkedin',  label: 'LinkedIn',   placeholder: 'https://linkedin.com/in/votre-profil' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className="text-xs font-mono w-20 flex-shrink-0 text-ink-soft">{label}</div>
                    <input value={local.socialLinks?.[key] || ''} onChange={e => setLocal(l => ({ ...l, socialLinks: { ...l.socialLinks, [key]: e.target.value } }))}
                      placeholder={placeholder} className="flex-1 px-3 py-1.5 rounded-lg border border-line outline-none bg-cream-light text-sm" />
                  </div>
                ))}
              </div>
              <div className="text-[10px] mt-2 text-ink-soft">Laissez vide pour masquer l'icône. Les icônes s'affichent dans le hero et le footer.</div>
            </div>
          </>}

          {section === 'hero' && <>
            <Field label="Nom du site"><TextInput value={local.siteName} onChange={set('siteName')} placeholder="Jodie Peltier" /></Field>
            <Field label="Tagline"><TextInput value={local.tagline} onChange={set('tagline')} placeholder="Préparation mentale" /></Field>
            <Field label="Annonce bandeau"><TextInput value={local.announcement} onChange={set('announcement')} placeholder="Laisser vide pour masquer" /></Field>
            <Field label="Titre principal"><TextInput value={local.heroTitle} onChange={set('heroTitle')} placeholder="Le mental au service…" multiline rows={2} /></Field>
            <Field label="Sous-titre principal"><TextInput value={local.heroSubtitle} onChange={set('heroSubtitle')} placeholder="Accompagnement en…" multiline rows={2} /></Field>
            <Field label="Citation (bande sous le héro)"><TextInput value={local.heroQuote} onChange={set('heroQuote')} multiline rows={3} /></Field>
          </>}

          {section === 'what' && <>
            <Field label="Titre page C'est quoi ?"><TextInput value={local.whatIsTitle} onChange={set('whatIsTitle')} /></Field>
            <Field label="Texte introductif (HTML)"><RichTextarea value={local.whatIsText} onChange={set('whatIsText')} placeholder="Présentation de la préparation mentale…" /></Field>
            <Field label="Titre Pour qui ?"><TextInput value={local.forWhomTitle} onChange={set('forWhomTitle')} /></Field>
            <Field label="Publics cibles">
              {(local.forWhomItems || []).map((item, i) => (
                <div key={i} className="flex gap-2 mb-2 items-start">
                  <div className="flex-1 space-y-1">
                    <TextInput value={item.title} onChange={setNested('forWhomItems', i, 'title')} placeholder="Titre" />
                    <TextInput value={item.text} onChange={setNested('forWhomItems', i, 'text')} placeholder="Description" multiline rows={2} />
                  </div>
                  <button onClick={() => setLocal(l => ({ ...l, forWhomItems: l.forWhomItems.filter((_, j) => j !== i) }))}
                    className="text-red-400 hover:text-red-600 p-2"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => setLocal(l => ({ ...l, forWhomItems: [...(l.forWhomItems || []), { title: '', text: '' }] }))}
                className="flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-sage-dark hover:underline">
                <Plus size={12} /> Ajouter
              </button>
            </Field>
          </>}

          {section === 'ethics' && <>
            <Field label="Titre page Éthique"><TextInput value={local.ethicsTitle} onChange={set('ethicsTitle')} /></Field>
            <Field label="Texte intro (encart rose)"><TextInput value={local.ethicsText} onChange={set('ethicsText')} multiline rows={4} /></Field>
            <ImageUpload label="Image éthique" value={local.ethicsImage} onChange={set('ethicsImage')} />
            <ImageUpload label="Schéma déontologique" value={local.ethicsSchema} onChange={set('ethicsSchema')} />
            <Field label="Principes (accordéon)">
              {(local.ethicsPrinciples || []).map((p, i) => (
                <div key={i} className="flex gap-2 mb-2 items-start">
                  <div className="flex-1 space-y-1">
                    <TextInput value={p.title} onChange={setNested('ethicsPrinciples', i, 'title')} placeholder="Titre du principe" />
                    <TextInput value={p.description} onChange={setNested('ethicsPrinciples', i, 'description')} placeholder="Description" multiline rows={2} />
                  </div>
                  <button onClick={() => setLocal(l => ({ ...l, ethicsPrinciples: l.ethicsPrinciples.filter((_, j) => j !== i) }))}
                    className="text-red-400 hover:text-red-600 p-2"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => setLocal(l => ({ ...l, ethicsPrinciples: [...(l.ethicsPrinciples || []), { title: '', description: '' }] }))}
                className="flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-sage-dark hover:underline">
                <Plus size={12} /> Ajouter
              </button>
            </Field>
          </>}

          {section === 'about' && <>
            <Field label="Résumé court (encart)"><TextInput value={local.aboutShort} onChange={set('aboutShort')} multiline rows={3} /></Field>
            <Field label="Biographie complète"><TextInput value={local.aboutLong} onChange={set('aboutLong')} multiline rows={6} /></Field>
            <ImageUpload label="Photo" value={local.aboutPhoto} onChange={set('aboutPhoto')} />
            <Field label="J'accompagne (tags)">
              <div className="flex flex-wrap gap-2 mb-2">
                {(local.aboutTargets || []).map((t, i) => (
                  <div key={i} className="flex items-center gap-1 px-3 py-1 rounded-full bg-sage-dark text-cream text-xs font-mono">
                    {t}
                    <button onClick={() => setLocal(l => ({ ...l, aboutTargets: l.aboutTargets.filter((_, j) => j !== i) }))} className="hover:opacity-70">×</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input id="new-target" placeholder="Nouveau tag" onKeyDown={e => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    setLocal(l => ({ ...l, aboutTargets: [...(l.aboutTargets || []), e.target.value.trim()] }));
                    e.target.value = '';
                  }
                }} className="flex-1 px-3 py-2 rounded-lg border border-line outline-none bg-cream-light text-sm" />
                <span className="text-xs text-ink-soft self-center">↵ Entrée</span>
              </div>
            </Field>
            <Field label="Formations">
              {(local.formations || []).map((f, i) => (
                <div key={i} className="p-4 rounded-xl border border-line mb-3 space-y-2">
                  <div className="flex gap-2">
                    <TextInput value={f.school} onChange={setNested('formations', i, 'school')} placeholder="Établissement" />
                    <button onClick={() => setLocal(l => ({ ...l, formations: l.formations.filter((_, j) => j !== i) }))}
                      className="text-red-400 hover:text-red-600 p-2 flex-shrink-0"><Trash2 size={14} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <TextInput value={f.year} onChange={setNested('formations', i, 'year')} placeholder="Année" />
                    <TextInput value={f.diploma} onChange={setNested('formations', i, 'diploma')} placeholder="Diplôme" />
                  </div>
                  <TextInput value={f.diplomaDetail} onChange={setNested('formations', i, 'diplomaDetail')} placeholder="Détail (spécialité…)" />
                  <TextInput value={f.stages} onChange={setNested('formations', i, 'stages')} placeholder="Stages (1 par ligne)" multiline rows={3} />
                  <ImageUpload label="Logo école" value={f.image} onChange={setNested('formations', i, 'image')} preview="favicon" />
                </div>
              ))}
              <button onClick={() => setLocal(l => ({ ...l, formations: [...(l.formations || []), { school: '', year: '', diploma: '', diplomaDetail: '', stages: '', image: '' }] }))}
                className="flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-sage-dark hover:underline">
                <Plus size={12} /> Ajouter formation
              </button>
            </Field>
            <Field label="Mémoires">
              {(local.memoires || []).map((m, i) => (
                <div key={i} className="p-4 rounded-xl border border-line mb-3 space-y-2">
                  <div className="flex gap-2">
                    <TextInput value={m.title} onChange={setNested('memoires', i, 'title')} placeholder="Titre du mémoire" />
                    <button onClick={() => setLocal(l => ({ ...l, memoires: l.memoires.filter((_, j) => j !== i) }))}
                      className="text-red-400 hover:text-red-600 p-2 flex-shrink-0"><Trash2 size={14} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <TextInput value={m.level} onChange={setNested('memoires', i, 'level')} placeholder="Niveau (M1, M2…)" />
                    <TextInput value={m.subtitle} onChange={setNested('memoires', i, 'subtitle')} placeholder="Sous-titre" />
                  </div>
                </div>
              ))}
              <button onClick={() => setLocal(l => ({ ...l, memoires: [...(l.memoires || []), { title: '', level: '', subtitle: '' }] }))}
                className="flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-sage-dark hover:underline">
                <Plus size={12} /> Ajouter mémoire
              </button>
            </Field>
          </>}

          {section === 'testimonials' && (
            <Field label="Témoignages">
              {(local.testimonials || []).map((t, i) => (
                <div key={i} className="p-4 rounded-xl border border-line mb-3 space-y-2">
                  <div className="flex gap-2">
                    <TextInput value={t.name} onChange={setNested('testimonials', i, 'name')} placeholder="Prénom Nom" />
                    <button onClick={() => setLocal(l => ({ ...l, testimonials: l.testimonials.filter((_, j) => j !== i) }))}
                      className="text-red-400 hover:text-red-600 p-2 flex-shrink-0"><Trash2 size={14} /></button>
                  </div>
                  <TextInput value={t.role} onChange={setNested('testimonials', i, 'role')} placeholder="Rôle / profession" />
                  <TextInput value={t.text} onChange={setNested('testimonials', i, 'text')} placeholder="Témoignage" multiline rows={3} />
                  <TextInput value={t.photo} onChange={setNested('testimonials', i, 'photo')} placeholder="Photo URL" />
                </div>
              ))}
              <button onClick={() => setLocal(l => ({ ...l, testimonials: [...(l.testimonials || []), { id: 't' + Date.now(), name: '', role: '', text: '', photo: '' }] }))}
                className="flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-sage-dark hover:underline">
                <Plus size={12} /> Ajouter témoignage
              </button>
            </Field>
          )}

          {section === 'contact' && <>
            <Field label="Email"><TextInput value={local.contactEmail} onChange={set('contactEmail')} placeholder="jodie@exemple.fr" /></Field>
            <Field label="Téléphone"><TextInput value={local.contactPhone} onChange={set('contactPhone')} placeholder="06 00 00 00 00" /></Field>
            <Field label="Lieu"><TextInput value={local.contactLocation} onChange={set('contactLocation')} placeholder="Nantes, France" /></Field>
          </>}

          {section === 'google' && <>
            <div className="p-4 rounded-xl bg-cream-light border border-line text-xs text-ink-soft mb-4">
              <p className="mb-2">Pour afficher les vrais avis Google :</p>
              <ol className="list-decimal ml-4 space-y-1">
                <li>Activez <strong>Places API (New)</strong> dans la Google Cloud Console</li>
                <li>Créez une clé API avec restriction au domaine</li>
                <li>Trouvez votre Place ID sur <strong>developers.google.com/maps/documentation/places/web-service/place-id</strong></li>
              </ol>
            </div>
            <Field label="Clé API Google"><TextInput value={local.googleApiKey} onChange={set('googleApiKey')} placeholder="AIza…" /></Field>
            <Field label="Place ID"><TextInput value={local.googlePlaceId} onChange={set('googlePlaceId')} placeholder="ChIJ…" /></Field>
          </>}

          {section === 'legal' && <>
            <Field label="Mentions légales (HTML)"><RichTextarea value={local.legalMentions} onChange={set('legalMentions')} placeholder="Contenu mentions légales…" /></Field>
            <Field label="Politique cookies (HTML)"><RichTextarea value={local.legalCookies} onChange={set('legalCookies')} placeholder="Politique de cookies…" /></Field>
            <Field label="Confidentialité (HTML)"><RichTextarea value={local.legalPrivacy} onChange={set('legalPrivacy')} placeholder="Politique de confidentialité…" /></Field>
            <Field label="Conditions d'utilisation (HTML)"><RichTextarea value={local.legalTerms} onChange={set('legalTerms')} placeholder="Conditions d'utilisation…" /></Field>
          </>}
        </div>
      </div>
    </div>
  );
}
