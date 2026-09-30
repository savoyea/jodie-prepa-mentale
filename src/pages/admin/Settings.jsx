import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext.jsx';
import { loadAppSettings, saveAppSettings } from '../../lib/storage.js';

function SettingsField({ label, k, draft, setDraft, multiline, help }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest font-mono mb-1" style={{ color: 'var(--color-ink-soft)' }}>{label}</div>
      {multiline
        ? <textarea value={draft[k] || ''} onChange={e => setDraft({ ...draft, [k]: e.target.value })} rows={4} className="w-full px-3 py-2 rounded-lg border outline-none text-sm resize-none" style={{ background: 'var(--color-cream-light)', borderColor: 'var(--color-line)' }} />
        : <input value={draft[k] || ''} onChange={e => setDraft({ ...draft, [k]: e.target.value })} className="w-full px-3 py-2 rounded-lg border outline-none text-sm" style={{ background: 'var(--color-cream-light)', borderColor: 'var(--color-line)' }} />
      }
      {help && <div className="text-[10px] mt-1" style={{ color: 'var(--color-ink-soft)' }}>{help}</div>}
    </div>
  );
}

function Card({ title, color = 'var(--color-ink)', children }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-line)' }}>
      <div className="px-5 py-3 text-sm font-mono font-medium" style={{ background: color, color: 'var(--color-cream)' }}>{title}</div>
      <div className="p-5 space-y-3" style={{ background: 'var(--color-cream)' }}>{children}</div>
    </div>
  );
}

const VARS_BASE = ['{service}', '{date}', '{heure}', '{prenom}', '{nom}', '{email}', '{tel}', '{message}'];

function VarBadges({ extra = [] }) {
  return (
    <div className="flex flex-wrap gap-1 text-[10px] font-mono">
      {[...VARS_BASE, ...extra].map(v => (
        <span key={v} className="px-1.5 py-0.5 rounded" style={{ background: 'var(--color-cream-light)', color: 'var(--color-ink-soft)', border: '1px solid var(--color-line)' }}>{v}</span>
      ))}
    </div>
  );
}

const TABS = [
  { id: 'emails', label: 'Emails' },
  { id: 'system', label: 'Système' },
];

export default function Settings() {
  const { showToast } = useAdmin();
  const [tab, setTab] = useState('emails');
  const [draft, setDraft] = useState({});

  useEffect(() => { loadAppSettings().then(setDraft); }, []);

  const save = async () => {
    await saveAppSettings(draft);
    showToast('Paramètres enregistrés ✓');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="font-serif text-3xl mb-1" style={{ color: 'var(--color-ink)' }}>Paramètres</div>
        <div className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>Configuration technique du back-office</div>
      </div>

      <div className="flex gap-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-2 text-xs font-mono uppercase tracking-widest rounded-full transition-all"
            style={{ background: tab === t.id ? 'var(--color-ink)' : 'transparent', color: tab === t.id ? 'var(--color-cream)' : 'var(--color-ink-soft)', border: tab !== t.id ? '1px solid var(--color-line)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'emails' && (
        <div className="space-y-5">
          <Card title="Configuration générale" color="var(--color-ink)">
            <SettingsField label="Email de test" k="testEmail" draft={draft} setDraft={setDraft}
              help="Si renseigné, tous les emails sont redirigés ici. Laissez vide en production." />
            <div className="flex items-center justify-between gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a' }}>
              <span>Configurer le SMTP dans PocketBase admin</span>
              <a href="http://127.0.0.1:8090/_/settings/mail" target="_blank" rel="noreferrer" className="underline font-mono" style={{ color: '#854d0e' }}>Ouvrir →</a>
            </div>
          </Card>

          <Card title="🔔 Notification nouvelle réservation (envoyée à Jodie)" color="var(--color-sage-dark)">
            <VarBadges />
            <SettingsField label="Sujet" k="notifSubject" draft={draft} setDraft={setDraft} />
            <SettingsField label="Corps du message" k="notifTemplate" draft={draft} setDraft={setDraft} multiline />
          </Card>

          <Card title="✓ Confirmation client" color="#2d6a4f">
            <VarBadges />
            <SettingsField label="Sujet" k="emailSubjectConfirm" draft={draft} setDraft={setDraft} />
            <SettingsField label="Corps du message" k="emailTemplateConfirm" draft={draft} setDraft={setDraft} multiline />
          </Card>

          <Card title="✕ Annulation client" color="#92400e">
            <VarBadges />
            <SettingsField label="Sujet" k="emailSubjectCancel" draft={draft} setDraft={setDraft} />
            <SettingsField label="Corps du message" k="emailTemplateCancel" draft={draft} setDraft={setDraft} multiline />
          </Card>

          <Card title="🗑 Suppression client" color="#6b2737">
            <VarBadges />
            <SettingsField label="Sujet" k="emailSubjectDelete" draft={draft} setDraft={setDraft} />
            <SettingsField label="Corps du message" k="emailTemplateDelete" draft={draft} setDraft={setDraft} multiline />
          </Card>

          <button onClick={save} className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-mono uppercase tracking-widest hover:opacity-90 transition-all" style={{ background: 'var(--color-sage-dark)', color: 'var(--color-cream)' }}>
            <Save size={14} /> Enregistrer
          </button>
        </div>
      )}

      {tab === 'system' && (
        <div className="space-y-5">
          <Card title="Base de données" color="var(--color-ink)">
            <div className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
              Les données sont synchronisées avec PocketBase en temps réel. Toute modification dans le BO est immédiatement persistée.
            </div>
            <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
              ● PocketBase connecté
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
