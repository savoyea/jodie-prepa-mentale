import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Check } from 'lucide-react';
import { useSite } from '../contexts/SiteContext.jsx';
import { useAdmin } from '../contexts/AdminContext.jsx';
import { loadContacts, saveContacts, loadAppSettings } from '../lib/storage.js';
import { sendEmail } from '../lib/email.js';

const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidPhone = v => !v || (/^[\d\s.\-+()]{7,}$/.test(v.trim()) && v.replace(/\D/g, '').length >= 7);
const ErrMsg = ({ msg }) => msg ? <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{msg}</p> : null;
const inputStyle = err => ({ background: 'var(--color-cream-light)', borderColor: err ? '#dc2626' : 'var(--color-line)' });

export default function Contact() {
  const { content } = useSite();
  const { showToast } = useAdmin();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Le nom est requis';
    if (!form.email.trim()) errs.email = "L'email est requis";
    else if (!isValidEmail(form.email)) errs.email = 'Format email invalide';
    if (!isValidPhone(form.phone)) errs.phone = 'Numéro de téléphone invalide';
    if (!form.message.trim()) errs.message = 'Le message est requis';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSending(true);

    const newContact = { id: 'c' + Date.now(), ...form, date: new Date().toISOString(), read: false };
    const contacts = await loadContacts();
    await saveContacts([...contacts, newContact]);

    if (content.contactEmail) {
      const appSettings = await loadAppSettings();
      await sendEmail({
        to: content.contactEmail,
        subject: `[Contact] ${form.subject || 'Nouveau message'} — ${form.name}`,
        body: `Nom : ${form.name}\nEmail : ${form.email}\nTéléphone : ${form.phone || '—'}\nSujet : ${form.subject || '—'}\n\nMessage :\n${form.message}`,
        fromName: content.siteName || 'Jodie Peltier',
        replyTo: form.email,
        testEmail: appSettings?.testEmail,
      });
    }

    setSending(false);
    setSent(true);
    showToast('Message envoyé !');
  };

  return (
    <div>
      <div className="py-16 px-6 bg-sage-dark">
        <div className="max-w-5xl mx-auto">
          <div className="text-xs uppercase tracking-[0.3em] mb-4 font-mono text-sage">● Contact</div>
          <h1 className="font-serif text-5xl md:text-6xl text-cream">Écrivez-moi</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-[1fr_340px] gap-14 items-start">
        {/* Formulaire */}
        <div>
          {sent ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-sage-light">
                <Check size={28} className="text-sage-dark" />
              </div>
              <h2 className="font-serif text-4xl mb-4 text-ink">Message envoyé !</h2>
              <p className="text-base max-w-sm mx-auto mb-8 text-ink-soft">
                Merci {form.name.split(' ')[0]} ! Je vous réponds dans les plus brefs délais.
              </p>
              <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                className="text-xs font-mono uppercase tracking-widest underline text-ink-soft">
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest font-mono mb-1.5 block text-ink-soft">Prénom & Nom *</label>
                  <input value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setErrors(er => ({ ...er, name: '' })); }}
                    placeholder="Marie Dupont" className="w-full px-4 py-3 rounded-lg border outline-none" style={inputStyle(errors.name)} />
                  <ErrMsg msg={errors.name} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest font-mono mb-1.5 block text-ink-soft">Email *</label>
                  <input value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); setErrors(er => ({ ...er, email: '' })); }}
                    placeholder="marie@exemple.fr" className="w-full px-4 py-3 rounded-lg border outline-none" style={inputStyle(errors.email)} />
                  <ErrMsg msg={errors.email} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest font-mono mb-1.5 block text-ink-soft">Téléphone</label>
                  <input value={form.phone} onChange={e => { setForm({ ...form, phone: e.target.value }); setErrors(er => ({ ...er, phone: '' })); }}
                    placeholder="06 00 00 00 00" className="w-full px-4 py-3 rounded-lg border outline-none" style={inputStyle(errors.phone)} />
                  <ErrMsg msg={errors.phone} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest font-mono mb-1.5 block text-ink-soft">Sujet</label>
                  <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                    placeholder="Demande d'information…" className="w-full px-4 py-3 rounded-lg border outline-none"
                    style={{ background: 'var(--color-cream-light)', borderColor: 'var(--color-line)' }} />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest font-mono mb-1.5 block text-ink-soft">Message *</label>
                <textarea value={form.message} onChange={e => { setForm({ ...form, message: e.target.value }); setErrors(er => ({ ...er, message: '' })); }}
                  placeholder="Dites-moi ce qui vous amène…" rows={6} className="w-full px-4 py-3 rounded-lg border outline-none resize-none" style={inputStyle(errors.message)} />
                <ErrMsg msg={errors.message} />
              </div>
              <div className="flex items-center gap-4 pt-2">
                <button onClick={handleSubmit} disabled={sending}
                  className="px-8 py-3.5 rounded-full text-sm uppercase tracking-widest font-mono transition-all hover:opacity-90 disabled:opacity-50 bg-sage-dark text-cream">
                  {sending ? 'Envoi…' : 'Envoyer le message'}
                </button>
                <span className="text-xs text-ink-soft">* champs obligatoires</span>
              </div>
            </div>
          )}
        </div>

        {/* Coordonnées */}
        <div className="space-y-6 md:sticky md:top-24">
          <div className="p-6 rounded-2xl space-y-5 bg-cream-light border border-line">
            <div className="text-xs uppercase tracking-[0.3em] font-mono mb-4 text-sage-dark">● Coordonnées</div>
            {content.contactPhone && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-sage-dark">
                  <Phone size={14} className="text-cream" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest font-mono mb-0.5 text-ink-soft">Téléphone</div>
                  <a href={`tel:${content.contactPhone.replace(/\s/g, '')}`} className="font-serif text-lg hover:opacity-70 transition-opacity text-ink">{content.contactPhone}</a>
                </div>
              </div>
            )}
            {content.contactEmail && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-sage-dark">
                  <Mail size={14} className="text-cream" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest font-mono mb-0.5 text-ink-soft">Email</div>
                  <a href={`mailto:${content.contactEmail}`} className="font-serif text-base break-all hover:opacity-70 transition-opacity text-ink">{content.contactEmail}</a>
                </div>
              </div>
            )}
            {content.contactLocation && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-sage-dark">
                  <MapPin size={14} className="text-cream" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest font-mono mb-0.5 text-ink-soft">Lieu</div>
                  <div className="font-serif text-base text-ink">{content.contactLocation}</div>
                </div>
              </div>
            )}
          </div>
          <div className="p-6 rounded-2xl text-center bg-sage-dark">
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>Vous souhaitez réserver une séance directement ?</p>
            <Link to="/services" className="inline-block px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-mono transition-all hover:opacity-90 bg-cream text-sage-dark">
              Voir les services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
