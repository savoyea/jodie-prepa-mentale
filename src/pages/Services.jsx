import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useSite } from '../contexts/SiteContext.jsx';
import { useAdmin } from '../contexts/AdminContext.jsx';
import { loadSlots, saveSlots, loadBookings, saveBookings, loadAppSettings } from '../lib/storage.js';
import { sendEmail, fillTemplate } from '../lib/email.js';

const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidPhone = v => !v || (/^[\d\s.\-+()]{7,}$/.test(v.trim()) && v.replace(/\D/g, '').length >= 7);
const ErrMsg = ({ msg }) => msg ? <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{msg}</p> : null;
const inputStyle = err => ({ background: 'var(--color-cream-light)', borderColor: err ? '#dc2626' : 'var(--color-line)' });

function toLocalDateStr(d) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function addMinutes(time, mins) {
  const [h, min] = time.split(':').map(Number);
  const total = h * 60 + min + mins;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export default function Services() {
  const { content, services } = useSite();
  const { showToast } = useAdmin();
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '', besoin: '' });
  const [errors, setErrors] = useState({});
  const [weekOffset, setWeekOffset] = useState(0);
  const [slots, setSlots] = useState(null);
  const [bookings, setBookings] = useState(null);

  const isSurDevis = selectedService?.surDevis;

  const startBooking = async (s) => {
    setSelectedService(s);
    setSelectedSlot(null);
    setForm({ name: '', email: '', phone: '', note: '', besoin: '' });
    setWeekOffset(0);
    setErrors({});
    if (!s.surDevis && slots === null) {
      const loaded = await loadSlots();
      setSlots(loaded);
    }
    if (bookings === null) {
      const loaded = await loadBookings();
      setBookings(loaded);
    }
    setStep(s.surDevis ? 2 : 1);
  };

  const reset = () => { setStep(0); setSelectedService(null); setSelectedSlot(null); };

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d; });
  const availableSlots = (slots || []).filter(s => s.available);

  const submitBooking = async () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Le nom est requis';
    if (!form.email.trim()) errs.email = "L'email est requis";
    else if (!isValidEmail(form.email)) errs.email = 'Format email invalide';
    if (!isValidPhone(form.phone)) errs.phone = 'Numéro de téléphone invalide';
    if (isSurDevis && !form.besoin.trim()) errs.besoin = 'Veuillez décrire votre besoin';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const newBooking = {
      id: 'b' + Date.now(),
      clientName: form.name, clientEmail: form.email, clientPhone: form.phone,
      serviceId: selectedService.id, date: selectedSlot?.date || '', time: selectedSlot?.time || '',
      status: 'en attente', note: isSurDevis ? form.besoin : form.note,
    };

    const updatedBookings = [...(bookings || []), newBooking];
    await saveBookings(updatedBookings);
    setBookings(updatedBookings);

    if (selectedSlot) {
      let updatedSlots = (slots || []).map(s => s.id === selectedSlot.id ? { ...s, available: false } : s);
      const remaining = selectedSlot.duration - selectedService.duration;
      if (remaining > 0) {
        const newTime = addMinutes(selectedSlot.time, selectedService.duration);
        const newId = `${selectedSlot.date}-${newTime}`;
        if (!updatedSlots.find(s => s.id === newId)) updatedSlots.push({ id: newId, date: selectedSlot.date, time: newTime, duration: remaining, available: true });
      }
      await saveSlots(updatedSlots);
      setSlots(updatedSlots);
    }

    const appSettings = await loadAppSettings();
    if (content.contactEmail && appSettings?.notifSubject) {
      const vars = { service: selectedService.name, date: selectedSlot?.date || '—', heure: selectedSlot?.time || '—', nom: form.name, prenom: form.name.split(' ')[0], email: form.email, tel: form.phone || '—', message: (isSurDevis ? form.besoin : form.note) || '—' };
      sendEmail({ to: content.contactEmail, subject: fillTemplate(appSettings.notifSubject, vars), body: fillTemplate(appSettings.notifTemplate, vars), fromName: content.siteName, replyTo: form.email, testEmail: appSettings.testEmail });
    }

    showToast(isSurDevis ? 'Demande de devis envoyée !' : 'Réservation enregistrée !');
    setStep(3);
  };

  return (
    <div>
      <div className="py-16 px-6 bg-sage-dark">
        <div className="max-w-5xl mx-auto">
          <div className="text-xs uppercase tracking-[0.3em] mb-4 font-mono text-sage">● Prestations</div>
          <h1 className="font-serif text-5xl md:text-6xl text-cream">Mes services</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Liste des services */}
        {step === 0 && (
          <div>
            {services.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6 mb-16">
                {services.map(s => (
                  <button key={s.id} onClick={() => startBooking(s)}
                    className="text-left p-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl group bg-cream border-line" style={{ border: '1.5px solid var(--color-line)' }}>
                    <div className="w-10 h-10 rounded-full mb-4 transition-all group-hover:scale-110" style={{ background: `var(--color-${s.color || 'sage'})` }} />
                    <h3 className="font-serif text-xl mb-2 text-ink">{s.name}</h3>
                    <div className="flex items-center gap-3 text-xs mb-3 font-mono text-ink-soft">
                      {!s.surDevis && <span>{s.duration} min</span>}
                      <span className="font-semibold text-sage-dark">{s.priceLabel}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-ink-soft">{s.description}</p>
                    <div className="mt-4 text-xs font-mono uppercase tracking-widest text-sage-dark">Réserver →</div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-ink-soft mb-16">Aucun service disponible pour le moment.</p>
            )}
            <div className="p-10 rounded-2xl text-center bg-sage-dark">
              <p className="font-serif italic text-2xl mb-6 text-cream">Vous avez une question ? Je suis là.</p>
              <Link to="/contact" className="inline-block px-8 py-4 rounded-full text-sm uppercase tracking-widest font-mono transition-all hover:opacity-90 bg-cream text-sage-dark">
                Me contacter
              </Link>
            </div>
          </div>
        )}

        {/* Étape 1 — Créneau */}
        {step === 1 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={reset} className="text-xs font-mono uppercase tracking-widest underline text-ink-soft">← Retour</button>
              <span className="text-xs font-mono text-ink-soft">·</span>
              <span className="font-serif text-lg text-ink">{selectedService?.name}</span>
            </div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-3xl text-ink">Choisissez un créneau</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))} disabled={weekOffset === 0}
                  className="p-2 rounded-full border border-line disabled:opacity-30"><ChevronLeft size={14} /></button>
                <span className="text-xs font-mono uppercase tracking-widest px-2">Sem. {weekOffset + 1}</span>
                <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-2 rounded-full border border-line"><ChevronRight size={14} /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-6">
              {days.map((d, i) => {
                const dateStr = toLocalDateStr(d);
                const daySlots = availableSlots.filter(s => s.date === dateStr);
                const isPast = d < today;
                return (
                  <div key={i} className="p-3 rounded-xl text-center bg-cream-light" style={{ opacity: isPast ? 0.3 : 1 }}>
                    <div className="text-xs uppercase tracking-widest text-ink-soft">{d.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                    <div className="font-serif text-2xl my-1 text-ink">{d.getDate()}</div>
                    <div className="text-[10px] uppercase font-mono text-ink-soft">{d.toLocaleDateString('fr-FR', { month: 'short' })}</div>
                    <div className="mt-2 space-y-1">
                      {daySlots.length === 0
                        ? <div className="text-[10px] text-ink-soft">—</div>
                        : daySlots.map(s => (
                          <button key={s.id} onClick={() => { setSelectedSlot(s); setStep(2); }}
                            className="w-full py-1 text-xs rounded-md transition-all hover:opacity-80 bg-sage text-cream">{s.time}</button>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Étape 2 — Formulaire */}
        {step === 2 && (
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep(isSurDevis ? 0 : 1)} className="text-xs font-mono uppercase tracking-widest underline text-ink-soft">← Retour</button>
              <span className="text-xs font-mono text-ink-soft">·</span>
              <span className="font-serif text-lg text-ink">
                {selectedService?.name}{!isSurDevis && selectedSlot && ` · ${new Date(selectedSlot.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à ${selectedSlot.time}`}
              </span>
            </div>
            <h2 className="font-serif text-3xl mb-6 text-ink">{isSurDevis ? 'Décrivez votre besoin' : 'Vos coordonnées'}</h2>
            <div className="space-y-3">
              {isSurDevis && (
                <div>
                  <textarea value={form.besoin} onChange={e => { setForm({ ...form, besoin: e.target.value }); setErrors(er => ({ ...er, besoin: '' })); }}
                    placeholder="Décrivez votre projet, contexte, objectifs… *" rows={5} className="w-full px-4 py-3 rounded-lg border outline-none resize-none" style={inputStyle(errors.besoin)} />
                  <ErrMsg msg={errors.besoin} />
                </div>
              )}
              <div>
                <input value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setErrors(er => ({ ...er, name: '' })); }}
                  placeholder="Prénom & Nom *" className="w-full px-4 py-3 rounded-lg border outline-none" style={inputStyle(errors.name)} />
                <ErrMsg msg={errors.name} />
              </div>
              <div>
                <input value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); setErrors(er => ({ ...er, email: '' })); }}
                  placeholder="Email *" className="w-full px-4 py-3 rounded-lg border outline-none" style={inputStyle(errors.email)} />
                <ErrMsg msg={errors.email} />
              </div>
              <div>
                <input value={form.phone} onChange={e => { setForm({ ...form, phone: e.target.value }); setErrors(er => ({ ...er, phone: '' })); }}
                  placeholder="Téléphone" className="w-full px-4 py-3 rounded-lg border outline-none" style={inputStyle(errors.phone)} />
                <ErrMsg msg={errors.phone} />
              </div>
              {!isSurDevis && (
                <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
                  placeholder="Un message (optionnel)" rows={3} className="w-full px-4 py-3 rounded-lg border outline-none resize-none"
                  style={{ background: 'var(--color-cream-light)', borderColor: 'var(--color-line)' }} />
              )}
              <button onClick={submitBooking} className="w-full px-6 py-3.5 rounded-full text-sm uppercase tracking-widest font-mono bg-ink text-cream">
                {isSurDevis ? 'Envoyer la demande' : 'Confirmer la réservation'}
              </button>
            </div>
          </div>
        )}

        {/* Étape 3 — Confirmation */}
        {step === 3 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-sage-light">
              <Check size={28} className="text-sage-dark" />
            </div>
            <h2 className="font-serif text-4xl mb-4 text-ink">Demande envoyée</h2>
            <p className="text-base max-w-md mx-auto mb-8 text-ink-soft">
              {isSurDevis
                ? `Merci ${form.name.split(' ')[0]} ! Je reviens vers vous très vite pour vous proposer un devis personnalisé.`
                : `Merci ${form.name.split(' ')[0]} ! Je reviens vers vous très vite pour confirmer notre rendez-vous.`}
            </p>
            <button onClick={reset} className="text-xs font-mono uppercase tracking-widest underline text-ink-soft">Voir tous les services</button>
          </div>
        )}
      </div>
    </div>
  );
}
