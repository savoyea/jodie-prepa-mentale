import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Clock } from 'lucide-react';
import { useSite } from '../contexts/SiteContext.jsx';
import { pb } from '../lib/pocketbase.js';
import { sendEmail, fillTemplate } from '../lib/email.js';
import { toLocalDateStr, addMinutes } from '../utils.js';

const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidPhone = v => !v || (/^[\d\s.\-+() ]{7,}$/.test(v.trim()) && v.replace(/\D/g, '').length >= 7);
const ErrMsg = ({ msg }) => msg ? <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{msg}</p> : null;
const errBorder = err => ({ background: 'var(--color-cream-light)', borderColor: err ? '#dc2626' : 'var(--color-line)' });

function colorHex(c) {
  const map = { sage: '#e6bfc2', terracotta: '#a31621', ochre: '#c9a96e', olive: '#7a8c5c' };
  return map[c] || c || '#e6bfc2';
}

function ServiceCard({ service, onClick }) {
  const priceLabel = service.sur_devis
    ? 'Sur devis'
    : service.price_label || (service.price ? `À partir de ${service.price} €` : 'Gratuit');

  return (
    <button
      onClick={onClick}
      className="text-left p-6 rounded-2xl w-full transition-all hover:-translate-y-1 group"
      style={{ background: '#fff', border: '1.5px solid var(--color-line)' }}
    >
      <div className="w-10 h-10 rounded-full mb-4" style={{ background: colorHex(service.color) }} />
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 400, color: 'var(--color-ink)', marginBottom: '0.5rem' }}>
        {service.name}
      </h3>
      <div className="flex items-center gap-3 text-xs mb-3 flex-wrap" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-soft)' }}>
        {service.duration > 0 && !service.sur_devis && (
          <span className="flex items-center gap-1"><Clock size={11} /> {service.duration} min</span>
        )}
        <span style={{ color: 'var(--color-sage-dark)', fontWeight: 600 }}>{priceLabel}</span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>{service.description}</p>
      <div className="mt-4 text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--color-sage-dark)' }}>
        Réserver →
      </div>
    </button>
  );
}

export default function Services() {
  const { services, content } = useSite();
  const [slots, setSlots] = useState([]);
  const [appSettings, setAppSettings] = useState(null);

  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '', besoin: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    pb.collection('slots').getFullList({ filter: 'available=true', sort: 'date,time' }).then(setSlots).catch(() => {});
    pb.collection('app_settings').getFirstListItem('').then(r => setAppSettings(r.data || {})).catch(() => {});
  }, []);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const isSurDevis = selectedService?.sur_devis;

  // Slots visible for this service: no service_id (open to all) OR matching this service
  const visibleSlots = selectedService
    ? slots.filter(s => !s.service_id || s.service_id === selectedService.id)
    : slots;

  const startBooking = s => {
    setSelectedService(s);
    setSelectedSlot(null);
    setForm({ name: '', email: '', phone: '', note: '', besoin: '' });
    setErrors({});
    setWeekOffset(0);
    setStep(s.sur_devis ? 2 : 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => { setStep(0); setSelectedService(null); setSelectedSlot(null); };

  const submitBooking = async () => {
    const errs = {};
    if (!form.name.trim())           errs.name   = 'Le nom est requis';
    if (!form.email.trim())          errs.email  = "L'email est requis";
    else if (!isValidEmail(form.email)) errs.email = 'Format email invalide';
    if (!isValidPhone(form.phone))   errs.phone  = 'Numéro invalide';
    if (isSurDevis && !form.besoin.trim()) errs.besoin = 'Veuillez décrire votre besoin';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      // Créer la réservation en base
      await pb.collection('bookings').create({
        client_name:  form.name,
        client_email: form.email,
        client_phone: form.phone || '',
        service_id:   selectedService.id,
        service_name: selectedService.name,
        date:         selectedSlot?.date || '',
        time:         selectedSlot?.time || '',
        duration:     selectedService.duration || 0,
        note:         isSurDevis ? form.besoin : form.note,
        status:       'pending',
      });

      // Marquer le créneau indisponible
      if (selectedSlot) {
        await pb.collection('slots').update(selectedSlot.id, { available: false }).catch(() => {});
        setSlots(prev => prev.filter(s => s.id !== selectedSlot.id));
      }

      // Notification email
      if (content.contactEmail) {
        const vars = {
          service:  selectedService.name,
          date:     selectedSlot?.date || '—',
          heure:    selectedSlot?.time || '—',
          duree:    selectedService.duration ? `${selectedService.duration} min` : '—',
          nom:      form.name,
          prenom:   form.name.split(' ')[0] || form.name,
          email:    form.email,
          tel:      form.phone || '—',
          message:  (isSurDevis ? form.besoin : form.note) || '—',
        };
        const subject = appSettings?.notifSubject
          ? fillTemplate(appSettings.notifSubject, vars)
          : `[Réservation] ${selectedService.name} — ${form.name}`;
        const body = appSettings?.notifTemplate
          ? fillTemplate(appSettings.notifTemplate, vars)
          : `Nom : ${form.name}\nEmail : ${form.email}\nTel : ${vars.tel}\nService : ${selectedService.name}\nDate : ${vars.date} à ${vars.heure}\nMessage : ${vars.message}`;
        sendEmail({ to: content.contactEmail, subject, body, fromName: content.siteName || 'Site', replyTo: form.email });
      }

      setStep(3);
    } catch (e) {
      setErrors({ submit: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="pt-32 pb-16 px-6" style={{ background: 'var(--color-cream)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--color-sage-dark)', marginBottom: '1rem' }}>
            Prestations
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 400, color: 'var(--color-ink)', lineHeight: 1.1 }}>
            Mes services
          </h1>
        </div>
      </section>

      <section className="py-16 px-6" style={{ background: 'var(--color-cream-light)', minHeight: '60vh' }}>
        <div className="max-w-5xl mx-auto">

          {/* Étape 0 — liste */}
          {step === 0 && (
            <div>
              <div className="grid md:grid-cols-2 gap-6 mb-16">
                {services.map(s => <ServiceCard key={s.id} service={s} onClick={() => startBooking(s)} />)}
              </div>
              <div className="p-10 rounded-2xl text-center" style={{ background: 'var(--color-sage-dark)' }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, fontStyle: 'italic', color: 'var(--color-cream)', marginBottom: '1.5rem' }}>
                  Vous avez une question ? Je suis là.
                </p>
                <a href="/contact" className="inline-block px-8 py-3 rounded-full" style={{ background: 'var(--color-cream)', color: 'var(--color-sage-dark)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  Me contacter
                </a>
              </div>
            </div>
          )}

          {/* Étape 1 — créneaux */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <button onClick={reset} className="text-xs font-mono uppercase tracking-widest underline" style={{ color: 'var(--color-ink-soft)' }}>
                  ← Retour
                </button>
                <span style={{ color: 'var(--color-ink-soft)' }}>·</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>{selectedService?.name}</span>
              </div>

              <div className="flex items-center justify-between mb-6">
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400 }}>Choisissez un créneau</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))} disabled={weekOffset === 0}
                    className="p-2 rounded-full border disabled:opacity-30" style={{ borderColor: 'var(--color-line)' }}>
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-xs font-mono uppercase tracking-widest px-2">Sem. {weekOffset + 1}</span>
                  <button onClick={() => setWeekOffset(weekOffset + 1)}
                    className="p-2 rounded-full border" style={{ borderColor: 'var(--color-line)' }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 mb-6">
                {days.map((d, i) => {
                  const dateStr = toLocalDateStr(d);
                  const daySlots = visibleSlots.filter(s => s.date === dateStr);
                  const isPast = d < today;
                  return (
                    <div key={i} className="p-3 rounded-xl text-center"
                      style={{ background: isPast ? 'transparent' : 'var(--color-cream)', opacity: isPast ? 0.3 : 1, border: isPast ? 'none' : '1px solid var(--color-line)' }}>
                      <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-ink-soft)', fontSize: '0.6rem' }}>
                        {d.toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', margin: '0.25rem 0' }}>{d.getDate()}</div>
                      <div className="text-xs" style={{ color: 'var(--color-ink-soft)', fontSize: '0.6rem' }}>
                        {d.toLocaleDateString('fr-FR', { month: 'short' })}
                      </div>
                      <div className="mt-2 space-y-1">
                        {daySlots.length === 0
                          ? <div style={{ fontSize: '0.65rem', color: 'var(--color-ink-soft)' }}>—</div>
                          : daySlots.map(s => (
                            <button key={s.id}
                              onClick={() => { setSelectedSlot(s); setStep(2); }}
                              className="w-full py-1 text-xs rounded-md hover:opacity-80"
                              style={{ background: 'var(--color-sage-dark)', color: '#fff', fontSize: '0.7rem' }}>
                              {s.time}
                            </button>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {visibleSlots.length === 0 && (
                <p className="text-center py-10 text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                  Aucun créneau disponible pour l'instant. <a href="/contact" style={{ color: 'var(--color-sage-dark)', textDecoration: 'underline' }}>Contactez-moi</a> pour convenir d'un rendez-vous.
                </p>
              )}
            </div>
          )}

          {/* Étape 2 — formulaire */}
          {step === 2 && (
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-8">
                <button onClick={() => setStep(isSurDevis ? 0 : 1)} className="text-xs font-mono uppercase tracking-widest underline" style={{ color: 'var(--color-ink-soft)' }}>
                  ← Retour
                </button>
                <span style={{ color: 'var(--color-ink-soft)' }}>·</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem' }}>
                  {selectedService?.name}
                  {!isSurDevis && selectedSlot && (
                    <> · {new Date(selectedSlot.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {selectedSlot.time}</>
                  )}
                </span>
              </div>

              <h2 className="mb-6" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400 }}>
                {isSurDevis ? 'Décrivez votre besoin' : 'Vos coordonnées'}
              </h2>

              <div className="space-y-3">
                {isSurDevis && (
                  <div>
                    <textarea
                      value={form.besoin}
                      onChange={e => { setForm({ ...form, besoin: e.target.value }); setErrors(er => ({ ...er, besoin: '' })); }}
                      placeholder="Décrivez votre projet, contexte, nombre de personnes, objectifs… *"
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border outline-none resize-none"
                      style={errBorder(errors.besoin)}
                    />
                    <ErrMsg msg={errors.besoin} />
                  </div>
                )}
                <div>
                  <input value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setErrors(er => ({ ...er, name: '' })); }}
                    placeholder="Prénom & Nom *" className="w-full px-4 py-3 rounded-lg border outline-none" style={errBorder(errors.name)} />
                  <ErrMsg msg={errors.name} />
                </div>
                <div>
                  <input value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); setErrors(er => ({ ...er, email: '' })); }}
                    placeholder="Email *" className="w-full px-4 py-3 rounded-lg border outline-none" style={errBorder(errors.email)} />
                  <ErrMsg msg={errors.email} />
                </div>
                <div>
                  <input value={form.phone} onChange={e => { setForm({ ...form, phone: e.target.value }); setErrors(er => ({ ...er, phone: '' })); }}
                    placeholder="Téléphone" className="w-full px-4 py-3 rounded-lg border outline-none" style={errBorder(errors.phone)} />
                  <ErrMsg msg={errors.phone} />
                </div>
                {!isSurDevis && (
                  <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
                    placeholder="Un message (optionnel)" rows={3}
                    className="w-full px-4 py-3 rounded-lg border outline-none resize-none"
                    style={{ background: 'var(--color-cream-light)', borderColor: 'var(--color-line)' }} />
                )}
                {errors.submit && <p className="text-sm" style={{ color: '#dc2626' }}>{errors.submit}</p>}
                <button onClick={submitBooking} disabled={submitting}
                  className="w-full px-6 py-3.5 rounded-full text-sm uppercase tracking-widest font-mono disabled:opacity-50"
                  style={{ background: 'var(--color-sage-dark)', color: '#fff' }}>
                  {submitting ? 'Envoi…' : isSurDevis ? 'Envoyer la demande' : 'Confirmer la réservation'}
                </button>
              </div>
            </div>
          )}

          {/* Étape 3 — confirmation */}
          {step === 3 && (
            <div className="text-center py-16 max-w-lg mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                style={{ background: 'var(--color-sage-light)' }}>
                <Check size={28} style={{ color: 'var(--color-sage-dark)' }} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 400, marginBottom: '1rem' }}>
                {isSurDevis ? 'Demande envoyée !' : 'Réservation enregistrée !'}
              </h2>
              <p className="text-base mb-8" style={{ color: 'var(--color-ink-soft)', lineHeight: 1.7 }}>
                {isSurDevis
                  ? `Merci ${form.name.split(' ')[0]} ! Je reviens vers vous très vite pour vous proposer un devis personnalisé.`
                  : `Merci ${form.name.split(' ')[0]} ! Je reviens vers vous pour confirmer le rendez-vous.`}
              </p>
              <button onClick={reset} className="text-xs font-mono uppercase tracking-widest underline" style={{ color: 'var(--color-ink-soft)' }}>
                Voir tous les services
              </button>
            </div>
          )}

        </div>
      </section>
    </>
  );
}
