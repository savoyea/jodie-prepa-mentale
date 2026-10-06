import { useState, useEffect } from 'react';
import { Save, Mail, Globe, Bell, Palette } from 'lucide-react';
import { pb } from '../../lib/pocketbase.js';
import { useAdmin } from '../../contexts/AdminContext.jsx';
import { applyTheme } from '../../contexts/SiteContext.jsx';

const inp = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  borderRadius: '0.625rem',
  border: '1px solid var(--color-line)',
  background: 'var(--color-cream-light)',
  fontSize: '0.875rem',
  outline: 'none',
};
const lbl = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-soft)', marginBottom: '0.25rem' };

const DEFAULT_THEME = {
  colorInk:        '#1a0f10',
  colorSageDark:   '#a31621',
  colorCream:      '#fcf7f8',
  colorCreamLight: '#fff9fa',
  colorSageLight:  '#f3dfe1',
  colorSage:       '#e6bfc2',
  colorLine:       '#ead6d8',
  colorInkSoft:    '#5a3a3e',
};

const THEME_FIELDS = [
  { key: 'colorSageDark',   label: 'Couleur principale',   hint: 'Boutons, liens, accents' },
  { key: 'colorInk',        label: 'Fond foncé',           hint: 'Footer, texte principal' },
  { key: 'colorCream',      label: 'Fond de page',         hint: 'Arrière-plan global' },
  { key: 'colorCreamLight', label: 'Fond clair',           hint: 'Cards, sections claires' },
  { key: 'colorSageLight',  label: 'Accent clair',         hint: 'Badges, tags, zones légères' },
  { key: 'colorSage',       label: 'Accent moyen',         hint: 'Bordures colorées, hover' },
  { key: 'colorLine',       label: 'Trait / séparateurs',  hint: 'Lignes, bordures neutres' },
  { key: 'colorInkSoft',    label: 'Texte secondaire',     hint: 'Labels, descriptions' },
];

const DEFAULT_SETTINGS = {
  smtp_host: '',
  smtp_port: '587',
  smtp_user: '',
  smtp_from: '',
  smtp_from_name: '',
  notify_email: '',
  booking_confirm_subject: 'Confirmation de votre réservation',
  booking_confirm_body: 'Bonjour {{client_name}},\n\nVotre réservation pour {{service_name}} le {{date}} à {{time}} a bien été confirmée.\n\nÀ bientôt,\nJodie Peltier',
  booking_cancel_subject: 'Annulation de votre réservation',
  booking_cancel_body: 'Bonjour {{client_name}},\n\nNous vous informons que votre réservation du {{date}} a été annulée.\n\nN\'hésitez pas à prendre un nouveau rendez-vous.\n\nCordialement,\nJodie Peltier',
  contact_notify_subject: 'Nouveau message de contact — {{client_name}}',
  site_url: 'https://jodie.arsava.fr',
  theme: { ...DEFAULT_THEME },
};

async function getOrCreate(key, defaultValue) {
  try {
    return await pb.collection('app_settings').getFirstListItem(`key="${key}"`);
  } catch {
    return await pb.collection('app_settings').create({ key, value: JSON.stringify(defaultValue) });
  }
}

async function saveKey(key, value, recordId) {
  const payload = { key, value };
  if (recordId) {
    return pb.collection('app_settings').update(recordId, payload);
  }
  return pb.collection('app_settings').create(payload);
}

export default function Settings() {
  const { showToast } = useAdmin();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [themeRecord, setThemeRecord] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('emails');

  useEffect(() => {
    pb.collection('app_settings').getFirstListItem('key="theme"').then(r => {
      setThemeRecord(r);
      const theme = { ...DEFAULT_THEME, ...(r.value || {}) };
      setSettings(s => ({ ...s, theme }));
      applyTheme(theme);
    }).catch(() => {});
  }, []);

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === 'theme') {
        const r = await saveKey('theme', settings.theme, themeRecord?.id);
        if (!themeRecord?.id) setThemeRecord(r);
      }
      showToast('Paramètres enregistrés');
    } catch {
      showToast('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const setThemeColor = (k, v) => {
    const next = { ...settings.theme, [k]: v };
    set('theme', next);
    applyTheme(next);
  };

  const resetTheme = () => {
    set('theme', { ...DEFAULT_THEME });
    applyTheme(DEFAULT_THEME);
  };

  const tabs = [
    { key: 'emails',    label: 'Emails',   icon: Mail },
    { key: 'templates', label: 'Modèles',  icon: Bell },
    { key: 'general',   label: 'Général',  icon: Globe },
    { key: 'theme',     label: 'Thème',    icon: Palette },
  ];

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 400, color: 'var(--color-ink)' }}>Paramètres</h1>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full"
          style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: saving ? 0.7 : 1 }}>
          <Save size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit overflow-x-auto" style={{ background: 'var(--color-sage-light)', maxWidth: '100%' }}>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              background: activeTab === key ? '#fff' : 'transparent',
              color: activeTab === key ? 'var(--color-ink)' : 'var(--color-ink-soft)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              boxShadow: activeTab === key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'emails' && (
        <div className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', border: '1px solid var(--color-line)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-ink)', marginBottom: '1rem' }}>
            Configuration SMTP
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={lbl}>Serveur SMTP</label>
              <input value={settings.smtp_host} onChange={e => set('smtp_host', e.target.value)} style={inp} placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label style={lbl}>Port</label>
              <input value={settings.smtp_port} onChange={e => set('smtp_port', e.target.value)} style={inp} placeholder="587" />
            </div>
            <div>
              <label style={lbl}>Utilisateur SMTP</label>
              <input type="email" value={settings.smtp_user} onChange={e => set('smtp_user', e.target.value)} style={inp} placeholder="user@gmail.com" />
            </div>
            <div>
              <label style={lbl}>Nom expéditeur</label>
              <input value={settings.smtp_from_name} onChange={e => set('smtp_from_name', e.target.value)} style={inp} placeholder="Jodie Peltier" />
            </div>
            <div>
              <label style={lbl}>Email expéditeur</label>
              <input type="email" value={settings.smtp_from} onChange={e => set('smtp_from', e.target.value)} style={inp} placeholder="contact@jodie.fr" />
            </div>
            <div>
              <label style={lbl}>Email notifications (admin)</label>
              <input type="email" value={settings.notify_email} onChange={e => set('notify_email', e.target.value)} style={inp} placeholder="votre@email.fr" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid var(--color-line)' }}>
            <h3 className="mb-4" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, color: 'var(--color-ink)' }}>
              Confirmation de réservation
            </h3>
            <div className="space-y-3">
              <div>
                <label style={lbl}>Sujet</label>
                <input value={settings.booking_confirm_subject} onChange={e => set('booking_confirm_subject', e.target.value)} style={inp} />
              </div>
              <div>
                <label style={lbl}>Corps (variables: {'{{client_name}}'}, {'{{service_name}}'}, {'{{date}}'}, {'{{time}}'})</label>
                <textarea value={settings.booking_confirm_body} onChange={e => set('booking_confirm_body', e.target.value)} rows={8}
                  style={{ ...inp, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} />
              </div>
            </div>
          </div>
          <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid var(--color-line)' }}>
            <h3 className="mb-4" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, color: 'var(--color-ink)' }}>
              Annulation de réservation
            </h3>
            <div className="space-y-3">
              <div>
                <label style={lbl}>Sujet</label>
                <input value={settings.booking_cancel_subject} onChange={e => set('booking_cancel_subject', e.target.value)} style={inp} />
              </div>
              <div>
                <label style={lbl}>Corps</label>
                <textarea value={settings.booking_cancel_body} onChange={e => set('booking_cancel_body', e.target.value)} rows={6}
                  style={{ ...inp, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} />
              </div>
            </div>
          </div>
          <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid var(--color-line)' }}>
            <h3 className="mb-4" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, color: 'var(--color-ink)' }}>
              Notification nouveau message
            </h3>
            <div>
              <label style={lbl}>Sujet (variable: {'{{client_name}}'})</label>
              <input value={settings.contact_notify_subject} onChange={e => set('contact_notify_subject', e.target.value)} style={inp} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'general' && (
        <div className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', border: '1px solid var(--color-line)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-ink)', marginBottom: '1rem' }}>
            Paramètres généraux
          </h2>
          <div>
            <label style={lbl}>URL du site</label>
            <input value={settings.site_url} onChange={e => set('site_url', e.target.value)} style={inp} placeholder="https://jodie.arsava.fr" />
          </div>
        </div>
      )}

      {activeTab === 'theme' && (
        <div className="space-y-6">
          {/* Preview strip */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-line)' }}>
            <div style={{ background: (settings.theme?.colorCream || DEFAULT_THEME.colorCream), padding: '1.25rem 1.5rem', borderBottom: '1px solid ' + (settings.theme?.colorLine || DEFAULT_THEME.colorLine) }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: settings.theme?.colorSageDark || DEFAULT_THEME.colorSageDark, marginBottom: '0.375rem' }}>Aperçu</p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: settings.theme?.colorInk || DEFAULT_THEME.colorInk, lineHeight: 1.2 }}>Jodie Peltier</p>
              <p style={{ fontSize: '0.875rem', color: settings.theme?.colorInkSoft || DEFAULT_THEME.colorInkSoft, marginTop: '0.25rem' }}>Préparation mentale</p>
              <div className="flex gap-2 mt-3">
                <span style={{ padding: '0.375rem 0.875rem', borderRadius: '9999px', background: settings.theme?.colorSageDark || DEFAULT_THEME.colorSageDark, color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>Bouton principal</span>
                <span style={{ padding: '0.375rem 0.875rem', borderRadius: '9999px', background: settings.theme?.colorSageLight || DEFAULT_THEME.colorSageLight, color: settings.theme?.colorInk || DEFAULT_THEME.colorInk, fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>Accent léger</span>
              </div>
            </div>
            <div style={{ background: settings.theme?.colorInk || DEFAULT_THEME.colorInk, padding: '1rem 1.5rem' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Footer — © 2025 Jodie Peltier</p>
            </div>
          </div>

          {/* Color pickers */}
          <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid var(--color-line)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-ink)' }}>Couleurs</h2>
              <button onClick={resetTheme}
                className="px-4 py-1.5 rounded-full"
                style={{ background: 'var(--color-cream-light)', color: 'var(--color-ink-soft)', border: '1px solid var(--color-line)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Réinitialiser
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {THEME_FIELDS.map(({ key, label, hint }) => {
                const val = settings.theme?.[key] || DEFAULT_THEME[key];
                return (
                  <div key={key} className="flex items-center gap-3 p-3 rounded-xl" style={{ border: '1px solid var(--color-line)', background: 'var(--color-cream-light)' }}>
                    <label style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}>
                      <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', background: val, border: '2px solid rgba(0,0,0,0.1)', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
                      <input
                        type="color"
                        value={val}
                        onChange={e => setThemeColor(key, e.target.value)}
                        style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                      />
                    </label>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-ink)', fontWeight: 600 }}>{label}</p>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-ink-soft)', marginTop: '0.125rem' }}>{hint}</p>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-ink-soft)', marginTop: '0.125rem', opacity: 0.6 }}>{val}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
