import React, { useState } from 'react';
import { Menu, X, Phone, Mail, MapPin, Clock, Euro, Heart, Compass, Users, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { toLocalDateStr } from '../utils.js';

export default function PublicSite({ page, setPage, content, services, slots, bookings, updateBookings, updateSlots, menuOpen, setMenuOpen, showToast }) {
  const navItems = [
    { id: 'home', label: 'Accueil' },
    { id: 'what', label: "C'est quoi ?" },
    { id: 'ethics', label: 'Éthique' },
    { id: 'about', label: 'Qui suis-je' },
    { id: 'services', label: 'Services' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div>
      {/* Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-md border-b" style={{ background: 'rgba(245, 239, 230, 0.85)', borderColor: 'var(--line)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setPage('home')} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--sage)' }}>
              <span className="font-display text-lg" style={{ color: 'var(--cream)' }}>J</span>
            </div>
            <div className="text-left">
              <div className="font-display text-lg leading-none">{content.siteName}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] mt-1" style={{ color: 'var(--ink-soft)' }}>{content.tagline}</div>
            </div>
          </button>
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className="px-4 py-2 text-sm transition-all relative"
                style={{ color: page === item.id ? 'var(--ink)' : 'var(--ink-soft)' }}
              >
                {item.label}
                {page === item.id && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: 'var(--terracotta-dark)' }} />
                )}
              </button>
            ))}
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t px-6 py-3" style={{ borderColor: 'var(--line)' }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setPage(item.id); setMenuOpen(false); }}
                className="block w-full text-left py-2 text-sm"
                style={{ color: page === item.id ? 'var(--terracotta-dark)' : 'var(--ink-soft)' }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      <main className="fade-in" key={page}>
        {page === 'home' && <HomePage content={content} setPage={setPage} services={services} />}
        {page === 'what' && <WhatIsPage content={content} setPage={setPage} />}
        {page === 'ethics' && <EthicsPage content={content} />}
        {page === 'about' && <AboutPage content={content} setPage={setPage} />}
        {page === 'services' && <ServicesPage content={content} services={services} setPage={setPage} />}
        {page === 'contact' && <ContactPage content={content} services={services} slots={slots} bookings={bookings} updateBookings={updateBookings} updateSlots={updateSlots} showToast={showToast} />}
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-10" style={{ borderColor: 'var(--line)', background: 'var(--cream-light)' }}>
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="font-display text-xl mb-2">{content.siteName}</div>
            <p style={{ color: 'var(--ink-soft)' }}>{content.tagline}</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--ink-soft)' }}>Contact</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2"><Phone size={12} /> {content.contactPhone}</div>
              <div className="flex items-center gap-2"><Mail size={12} /> {content.contactEmail}</div>
              <div className="flex items-center gap-2"><MapPin size={12} /> {content.contactLocation}</div>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--ink-soft)' }}>Navigation</div>
            <div className="grid grid-cols-2 gap-1">
              {navItems.map(item => (
                <button key={item.id} onClick={() => setPage(item.id)} className="text-left hover:underline" style={{ color: 'var(--ink-soft)' }}>{item.label}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-8 pt-6 border-t text-xs text-center" style={{ borderColor: 'var(--line)', color: 'var(--ink-soft)' }}>
          © {new Date().getFullYear()} {content.siteName} — Tous droits réservés
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({ service, onClick }) {
  const colorMap = {
    sage: 'var(--sage)', terracotta: 'var(--terracotta)', ochre: 'var(--ochre)', olive: 'var(--olive)'
  };
  return (
    <button onClick={onClick} className="text-left p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-lg" style={{ background: 'var(--cream)', borderColor: 'var(--line)' }}>
      <div className="w-10 h-10 rounded-full mb-4" style={{ background: colorMap[service.color] || 'var(--sage)' }}></div>
      <h3 className="font-display text-xl mb-2">{service.name}</h3>
      <div className="flex items-center gap-3 text-xs mb-3 font-mono" style={{ color: 'var(--ink-soft)' }}>
        <span className="flex items-center gap-1"><Clock size={12} /> {service.duration} min</span>
        <span className="flex items-center gap-1"><Euro size={12} /> {service.priceLabel}</span>
      </div>
      <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{service.description}</p>
    </button>
  );
}

function HomePage({ content, setPage, services }) {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden grain" style={{ background: 'linear-gradient(135deg, var(--cream) 0%, var(--sage-light) 100%)' }}>
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center relative">
          <div className="stagger relative z-10">
            <div className="text-xs uppercase tracking-[0.3em] mb-6 font-mono" style={{ color: 'var(--sage-dark)' }}>● Préparation mentale</div>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] mb-6" style={{ color: 'var(--ink)' }}>
              {content.heroTitle.split('\n').map((line, i) => (
                <span key={i} className="block">
                  {i === 1 ? <em style={{ fontStyle: 'italic', color: 'var(--terracotta-dark)' }}>{line}</em> : line}
                </span>
              ))}
            </h1>
            <p className="text-lg mb-8 max-w-md" style={{ color: 'var(--ink-soft)' }}>{content.heroSubtitle}</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setPage('contact')} className="px-6 py-3 rounded-full text-sm uppercase tracking-widest font-mono transition-all hover:opacity-90" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>
                Réserver un appel
              </button>
              <button onClick={() => setPage('what')} className="px-6 py-3 rounded-full text-sm uppercase tracking-widest font-mono transition-all border" style={{ borderColor: 'var(--ink)', color: 'var(--ink)' }}>
                En savoir plus
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-[40%_60%_60%_40%/50%_40%_60%_50%] overflow-hidden grain" style={{ background: 'linear-gradient(160deg, var(--terracotta) 0%, var(--ochre) 100%)' }}>
              <svg viewBox="0 0 400 500" className="w-full h-full opacity-40">
                <circle cx="200" cy="250" r="180" fill="none" stroke="var(--cream)" strokeWidth="1" />
                <circle cx="200" cy="250" r="120" fill="none" stroke="var(--cream)" strokeWidth="1" />
                <circle cx="200" cy="250" r="60" fill="none" stroke="var(--cream)" strokeWidth="1" />
                <path d="M 200 70 Q 280 250 200 430 Q 120 250 200 70" fill="none" stroke="var(--cream)" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full grain" style={{ background: 'var(--sage)' }}></div>
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full" style={{ background: 'var(--olive)', opacity: 0.7 }}></div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="leaf-divider"></div>
          <p className="font-display italic text-2xl md:text-3xl leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            {content.heroQuote}
          </p>
          <div className="leaf-divider"></div>
        </div>
      </section>

      {/* Services preview */}
      <section className="py-20 px-6" style={{ background: 'var(--cream-light)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.3em] mb-3 font-mono" style={{ color: 'var(--sage-dark)' }}>Accompagnement</div>
            <h2 className="font-display text-4xl md:text-5xl">Trouvez la formule qui vous correspond</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            {services.map(s => <ServiceCard key={s.id} service={s} onClick={() => setPage('contact')} />)}
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 stagger">
          {[
            { icon: <Heart size={20} />, title: "Bienveillance", text: "Un espace d'écoute sans jugement, à votre rythme." },
            { icon: <Compass size={20} />, title: "Clarté", text: "Des objectifs concrets et un cap clair dès la première séance." },
            { icon: <Users size={20} />, title: "Sur mesure", text: "Chaque parcours est construit autour de votre singularité." }
          ].map((v, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ background: 'var(--sage-light)', color: 'var(--sage-dark)' }}>
                {v.icon}
              </div>
              <h3 className="font-display text-2xl mb-2">{v.title}</h3>
              <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{v.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function WhatIsPage({ content, setPage }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-xs uppercase tracking-[0.3em] mb-4 font-mono" style={{ color: 'var(--sage-dark)' }}>● Comprendre</div>
      <h1 className="font-display text-5xl md:text-6xl mb-8">{content.whatIsTitle}</h1>
      <p className="text-lg leading-relaxed mb-12" style={{ color: 'var(--ink-soft)' }}>{content.whatIsText}</p>

      <div className="leaf-divider"></div>

      <h2 className="font-display text-4xl mb-8 mt-12">{content.forWhomTitle}</h2>
      <div className="grid md:grid-cols-2 gap-4 stagger">
        {content.forWhomItems.map((item, i) => (
          <div key={i} className="p-6 rounded-2xl border" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }}>
            <div className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--terracotta-dark)' }}>0{i+1}</div>
            <h3 className="font-display text-2xl mb-2">{item.title}</h3>
            <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <button onClick={() => setPage('contact')} className="px-6 py-3 rounded-full text-sm uppercase tracking-widest font-mono" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>
          Échangeons
        </button>
      </div>
    </div>
  );
}

function EthicsPage({ content }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-xs uppercase tracking-[0.3em] mb-4 font-mono" style={{ color: 'var(--sage-dark)' }}>● Cadre</div>
      <h1 className="font-display text-5xl md:text-6xl mb-8">{content.ethicsTitle}</h1>
      <p className="text-lg leading-relaxed mb-12" style={{ color: 'var(--ink-soft)' }}>{content.ethicsText}</p>

      <div className="space-y-4 stagger">
        {content.ethicsPrinciples.map((p, i) => (
          <div key={i} className="flex gap-6 p-6 rounded-2xl" style={{ background: 'var(--cream-light)' }}>
            <div className="font-display text-4xl flex-shrink-0" style={{ color: 'var(--terracotta-dark)' }}>0{i+1}</div>
            <div>
              <h3 className="font-display text-2xl mb-1">{p.title}</h3>
              <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{p.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutPage({ content, setPage }) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="grid md:grid-cols-5 gap-12">
        <div className="md:col-span-2">
          <div className="aspect-[3/4] rounded-3xl grain" style={{ background: 'linear-gradient(160deg, var(--sage) 0%, var(--olive) 100%)' }}>
            <svg viewBox="0 0 300 400" className="w-full h-full opacity-30">
              <circle cx="150" cy="150" r="60" fill="none" stroke="var(--cream)" strokeWidth="1.5" />
              <path d="M 90 250 Q 150 320 210 250" fill="none" stroke="var(--cream)" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="text-xs uppercase tracking-[0.3em] mb-4 font-mono" style={{ color: 'var(--sage-dark)' }}>● Présentation</div>
          <h1 className="font-display text-5xl md:text-6xl mb-2">Qui suis-je ?</h1>
          <p className="font-display italic text-2xl mb-6" style={{ color: 'var(--terracotta-dark)' }}>Jodie Peltier</p>
          <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-soft)' }}>{content.aboutShort}</p>
          <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--ink-soft)' }}>{content.aboutLong}</p>
          <button onClick={() => setPage('contact')} className="px-6 py-3 rounded-full text-sm uppercase tracking-widest font-mono" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>
            Réserver un appel découverte
          </button>
        </div>
      </div>
    </div>
  );
}

function ServicesPage({ content, services, setPage }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-xs uppercase tracking-[0.3em] mb-4 font-mono" style={{ color: 'var(--sage-dark)' }}>● Prestations</div>
      <h1 className="font-display text-5xl md:text-6xl mb-12">Mes services</h1>
      <div className="grid md:grid-cols-2 gap-6 stagger">
        {services.map(s => <ServiceCard key={s.id} service={s} onClick={() => setPage('contact')} />)}
      </div>
    </div>
  );
}

function ContactPage({ content, services, slots, bookings, updateBookings, updateSlots, showToast }) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '', besoin: '' });
  const [weekOffset, setWeekOffset] = useState(0);

  const isSurDevis = selectedService?.surDevis;

  const availableSlots = slots.filter(s => s.available);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + weekOffset * 7);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    days.push(d);
  }

  const selectService = (s) => {
    setSelectedService(s);
    setStep(s.surDevis ? 3 : 2);
  };

  const submitBooking = () => {
    if (!form.name || !form.email) { showToast("Veuillez renseigner votre nom et email"); return; }
    if (isSurDevis && !form.besoin) { showToast("Veuillez décrire votre besoin"); return; }
    const newBooking = {
      id: 'b' + Date.now(),
      clientName: form.name,
      clientEmail: form.email,
      clientPhone: form.phone,
      serviceId: selectedService.id,
      date: selectedSlot?.date || '',
      time: selectedSlot?.time || '',
      status: 'en attente',
      note: isSurDevis ? form.besoin : form.note,
    };
    updateBookings([...bookings, newBooking]);
    if (selectedSlot) updateSlots(slots.map(s => s.id === selectedSlot.id ? { ...s, available: false } : s));
    setStep(4);
    showToast(isSurDevis ? "Demande de devis envoyée !" : "Réservation enregistrée !");
  };

  const stepperLabels = isSurDevis
    ? ['Service', 'Votre besoin', 'Confirmé']
    : ['Service', 'Créneau', 'Vos infos', 'Confirmé'];

  const displayStep = isSurDevis && step >= 3 ? step - 1 : step;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-xs uppercase tracking-[0.3em] mb-4 font-mono" style={{ color: 'var(--sage-dark)' }}>● Réservation</div>
      <h1 className="font-display text-5xl md:text-6xl mb-12">Prenons rendez-vous</h1>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-10 text-xs font-mono uppercase tracking-widest">
        {stepperLabels.map((label, i) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2" style={{ color: displayStep > i + 1 ? 'var(--terracotta-dark)' : displayStep === i + 1 ? 'var(--ink)' : 'var(--ink-soft)', opacity: displayStep >= i + 1 ? 1 : 0.4 }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: displayStep > i + 1 ? 'var(--sage-dark)' : displayStep === i + 1 ? 'var(--ink)' : 'transparent', color: displayStep >= i + 1 ? 'var(--cream)' : 'inherit', border: displayStep <= i + 1 ? '1px solid currentColor' : 'none' }}>
                {displayStep > i + 1 ? <Check size={12} /> : i + 1}
              </div>
              <span className="hidden md:inline">{label}</span>
            </div>
            {i < stepperLabels.length - 1 && <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="fade-in">
          <h2 className="font-display text-3xl mb-6">Quel service vous intéresse ?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {services.map(s => (
              <button key={s.id} onClick={() => selectService(s)} className="text-left p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-md" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }}>
                <div className="flex items-start justify-between mb-1 gap-2">
                  <h3 className="font-display text-2xl">{s.name}</h3>
                  {s.surDevis && <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0 mt-1" style={{ background: 'var(--ochre)', color: 'var(--cream)' }}>Sur devis</span>}
                </div>
                <div className="flex gap-3 text-xs font-mono mb-2" style={{ color: 'var(--ink-soft)' }}>
                  {!s.surDevis && <span>{s.duration} min · </span>}<span>{s.priceLabel}</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>{s.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && !isSurDevis && (
        <div className="fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-3xl">Choisissez un créneau</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))} disabled={weekOffset === 0} className="p-2 rounded-full border disabled:opacity-30" style={{ borderColor: 'var(--line)' }}><ChevronLeft size={14} /></button>
              <span className="text-xs font-mono uppercase tracking-widest px-2">Sem. {weekOffset + 1}</span>
              <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-2 rounded-full border" style={{ borderColor: 'var(--line)' }}><ChevronRight size={14} /></button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-6">
            {days.map((d, i) => {
              const dateStr = toLocalDateStr(d);
              const daySlots = availableSlots.filter(s => s.date === dateStr);
              const isPast = d < today;
              return (
                <div key={i} className="p-3 rounded-xl text-center" style={{ background: isPast ? 'transparent' : 'var(--cream-light)', opacity: isPast ? 0.3 : 1 }}>
                  <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--ink-soft)' }}>{d.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                  <div className="font-display text-2xl my-1">{d.getDate()}</div>
                  <div className="text-[10px] uppercase font-mono" style={{ color: 'var(--ink-soft)' }}>{d.toLocaleDateString('fr-FR', { month: 'short' })}</div>
                  <div className="mt-2 space-y-1">
                    {daySlots.length === 0 ? (
                      <div className="text-[10px]" style={{ color: 'var(--ink-soft)' }}>—</div>
                    ) : daySlots.map(s => (
                      <button key={s.id} onClick={() => { setSelectedSlot(s); setStep(3); }} className="w-full py-1 text-xs rounded-md transition-all hover:opacity-80" style={{ background: 'var(--sage)', color: 'var(--cream)' }}>
                        {s.time}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => setStep(1)} className="text-xs font-mono uppercase tracking-widest underline" style={{ color: 'var(--ink-soft)' }}>← Retour</button>
        </div>
      )}

      {step === 3 && (
        <div className="fade-in max-w-2xl">
          {isSurDevis ? (
            <>
              <h2 className="font-display text-3xl mb-2">Décrivez votre besoin</h2>
              <div className="text-sm mb-6 font-mono" style={{ color: 'var(--ink-soft)' }}>{selectedService.name} — Sur devis</div>
              <div className="space-y-3">
                <textarea
                  value={form.besoin}
                  onChange={e => setForm({ ...form, besoin: e.target.value })}
                  placeholder="Décrivez votre projet, contexte, nombre de personnes, objectifs… *"
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border outline-none resize-none"
                  style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }}
                />
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Prénom & Nom *" className="w-full px-4 py-3 rounded-lg border outline-none" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email *" className="w-full px-4 py-3 rounded-lg border outline-none" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Téléphone" className="w-full px-4 py-3 rounded-lg border outline-none" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="px-6 py-3 rounded-full text-sm uppercase tracking-widest font-mono border" style={{ borderColor: 'var(--ink)', color: 'var(--ink)' }}>← Retour</button>
                  <button onClick={submitBooking} className="px-6 py-3 rounded-full text-sm uppercase tracking-widest font-mono flex-1" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>Envoyer la demande</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-display text-3xl mb-2">Vos coordonnées</h2>
              <div className="text-sm mb-6 font-mono" style={{ color: 'var(--ink-soft)' }}>
                {selectedService.name} · {selectedSlot && new Date(selectedSlot.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {selectedSlot?.time}
              </div>
              <div className="space-y-3">
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Prénom & Nom *" className="w-full px-4 py-3 rounded-lg border outline-none" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email *" className="w-full px-4 py-3 rounded-lg border outline-none" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Téléphone" className="w-full px-4 py-3 rounded-lg border outline-none" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
                <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Un message (optionnel)" rows={3} className="w-full px-4 py-3 rounded-lg border outline-none resize-none" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="px-6 py-3 rounded-full text-sm uppercase tracking-widest font-mono border" style={{ borderColor: 'var(--ink)', color: 'var(--ink)' }}>← Retour</button>
                  <button onClick={submitBooking} className="px-6 py-3 rounded-full text-sm uppercase tracking-widest font-mono flex-1" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>Confirmer</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="fade-in text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ background: 'var(--sage-light)' }}>
            <Check size={28} style={{ color: 'var(--sage-dark)' }} />
          </div>
          <h2 className="font-display text-4xl mb-4">Demande envoyée</h2>
          <p className="text-base max-w-md mx-auto mb-6" style={{ color: 'var(--ink-soft)' }}>
            {isSurDevis
              ? `Merci ${form.name.split(' ')[0]} ! Je reviens vers vous très vite pour vous proposer un devis personnalisé.`
              : `Merci ${form.name.split(' ')[0]} ! Je reviens vers vous très vite pour confirmer notre rendez-vous du ${selectedSlot && new Date(selectedSlot.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à ${selectedSlot?.time}.`
            }
          </p>
          <button onClick={() => { setStep(1); setSelectedService(null); setSelectedSlot(null); setForm({ name: '', email: '', phone: '', note: '', besoin: '' }); }} className="text-xs font-mono uppercase tracking-widest underline" style={{ color: 'var(--ink-soft)' }}>
            Nouvelle réservation
          </button>
        </div>
      )}

      {/* Direct contact */}
      <div className="mt-20 pt-10 border-t grid md:grid-cols-3 gap-6" style={{ borderColor: 'var(--line)' }}>
        <div>
          <div className="text-xs uppercase tracking-widest mb-2 font-mono" style={{ color: 'var(--ink-soft)' }}>Téléphone</div>
          <div className="font-display text-xl">{content.contactPhone}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest mb-2 font-mono" style={{ color: 'var(--ink-soft)' }}>Email</div>
          <div className="font-display text-xl break-all">{content.contactEmail}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest mb-2 font-mono" style={{ color: 'var(--ink-soft)' }}>Lieu</div>
          <div className="font-display text-xl">{content.contactLocation}</div>
        </div>
      </div>
    </div>
  );
}
