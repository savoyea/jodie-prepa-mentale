import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { pb } from '../lib/pocketbase.js';
import { useSite } from '../contexts/SiteContext.jsx';

const inputStyle = {
  width: '100%',
  padding: '0.875rem 1rem',
  borderRadius: '0.75rem',
  border: '1px solid var(--color-line)',
  background: 'var(--color-cream-light)',
  color: 'var(--color-ink)',
  fontSize: '0.9rem',
  outline: 'none',
  fontFamily: 'inherit',
};

export default function Contact() {
  const { content } = useSite();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await pb.collection('contacts').create(form);
      setStatus('success');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="pt-32 pb-16 px-6" style={{ background: 'var(--color-cream)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--color-sage-dark)', marginBottom: '1rem' }}>
            Contact
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 400, color: 'var(--color-ink)', lineHeight: 1.1 }}>
            {content.contactTitle || 'Écrivez-moi'}
          </h1>
          {content.contactSubtitle && (
            <p style={{ marginTop: '1rem', color: 'var(--color-ink-soft)', fontSize: '1rem', lineHeight: 1.7 }}>
              {content.contactSubtitle}
            </p>
          )}
        </div>
      </section>

      <section className="py-16 px-6" style={{ background: 'var(--color-cream-light)' }}>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">

          {/* Formulaire */}
          <div>
            {status === 'success' ? (
              <div className="rounded-xl p-8 text-center" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#166534', marginBottom: '0.5rem' }}>
                  Message envoyé !
                </p>
                <p style={{ color: '#166534', fontSize: '0.9rem' }}>Je vous répondrai dans les plus brefs délais.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-ink-soft)', marginBottom: '0.5rem' }}>
                    Prénom & Nom *
                  </label>
                  <input name="name" value={form.name} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-ink-soft)', marginBottom: '0.5rem' }}>
                    Email *
                  </label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-ink-soft)', marginBottom: '0.5rem' }}>
                    Téléphone
                  </label>
                  <input name="phone" value={form.phone} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-ink-soft)', marginBottom: '0.5rem' }}>
                    Sujet
                  </label>
                  <input name="subject" value={form.subject} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-ink-soft)', marginBottom: '0.5rem' }}>
                    Message *
                  </label>
                  <textarea name="message" value={form.message} onChange={handleChange} required rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                {status === 'error' && (
                  <p style={{ color: '#991b1b', fontSize: '0.85rem' }}>Une erreur est survenue. Veuillez réessayer.</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full"
                  style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Envoi…' : 'Envoyer le message'}
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-soft)' }}>* champs obligatoires</p>
              </form>
            )}
          </div>

          {/* Coordonnées */}
          <div>
            <h2 className="mb-6" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--color-sage-dark)' }}>
              Coordonnées
            </h2>
            <div className="space-y-4">
              {content.contactPhone && (
                <a href={`tel:${content.contactPhone}`} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-sage-light)' }}>
                    <Phone size={16} style={{ color: 'var(--color-sage-dark)' }} />
                  </div>
                  <span style={{ color: 'var(--color-ink)', fontSize: '0.95rem' }}>{content.contactPhone}</span>
                </a>
              )}
              {content.contactEmail && (
                <a href={`mailto:${content.contactEmail}`} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-sage-light)' }}>
                    <Mail size={16} style={{ color: 'var(--color-sage-dark)' }} />
                  </div>
                  <span style={{ color: 'var(--color-ink)', fontSize: '0.95rem' }}>{content.contactEmail}</span>
                </a>
              )}
              {content.contactLocation && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-sage-light)' }}>
                    <MapPin size={16} style={{ color: 'var(--color-sage-dark)' }} />
                  </div>
                  <span style={{ color: 'var(--color-ink)', fontSize: '0.95rem' }}>{content.contactLocation}</span>
                </div>
              )}
            </div>

            <div className="mt-10 rounded-xl p-6" style={{ background: 'var(--color-cream)', border: '1px solid var(--color-line)' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--color-ink)', marginBottom: '0.75rem' }}>
                Vous souhaitez réserver une séance directement ?
              </p>
              <Link
                to="/services"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-sage-dark)' }}
              >
                Voir les services →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
