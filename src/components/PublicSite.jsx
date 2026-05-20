import React, { useState } from 'react';
import { Menu, X, Phone, Mail, MapPin, Clock, Euro, Heart, Compass, Users, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { toLocalDateStr, addMinutes } from '../utils.js';

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
      <nav className="sticky top-0 z-40 border-b" style={{ background: '#ffffff', borderColor: 'var(--line)' }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={() => setPage('home')} className="flex items-center">
            <img
              src={content.logo || (import.meta.env.BASE_URL + 'logo-crop.png')}
              alt="JOYA – Le mental au service de ta réussite"
              style={{ height: '52px', width: 'auto', objectFit: 'contain' }}
            />
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

      {/* Footer cramoisie */}
      <footer className="mt-20 py-12" style={{ background: 'var(--sage-dark)' }}>
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-sm">
          <div>
            {content.logoFooter ? (
              <img src={content.logoFooter} alt="JOYA" style={{ height: '60px', width: 'auto', objectFit: 'contain', marginBottom: '0.75rem' }} />
            ) : (
              <div style={{ display: 'inline-block', background: '#fff', borderRadius: 10, padding: '4px 10px', marginBottom: '0.75rem' }}>
                <img src={content.logo || (import.meta.env.BASE_URL + 'logo-crop.png')} alt="JOYA" style={{ height: '48px', width: 'auto', objectFit: 'contain', display: 'block' }} />
              </div>
            )}
            <p className="text-xs mb-4" style={{ color: 'rgba(252,247,248,0.6)' }}>{content.tagline}</p>
            <SocialIcons links={content.socialLinks} light />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest mb-4 font-mono" style={{ color: 'var(--sage)' }}>Contact</div>
            <div className="space-y-2" style={{ color: 'rgba(252,247,248,0.85)' }}>
              <div className="flex items-center gap-2"><Phone size={12} /> {content.contactPhone}</div>
              <div className="flex items-center gap-2"><Mail size={12} /> {content.contactEmail}</div>
              <div className="flex items-center gap-2"><MapPin size={12} /> {content.contactLocation}</div>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest mb-4 font-mono" style={{ color: 'var(--sage)' }}>Navigation</div>
            <div className="grid grid-cols-2 gap-1">
              {navItems.map(item => (
                <button key={item.id} onClick={() => setPage(item.id)} className="text-left hover:underline text-xs" style={{ color: 'rgba(252,247,248,0.7)' }}>{item.label}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-10 pt-6 text-xs text-center" style={{ borderTop: '1px solid rgba(252,247,248,0.15)', color: 'rgba(252,247,248,0.4)' }}>
          © {new Date().getFullYear()} {content.siteName} — Tous droits réservés
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({ service, onClick }) {
  const colorMap = {
    sage: 'var(--sage)',
    terracotta: 'var(--sage-dark)',
    ochre: 'var(--ochre)',
    olive: 'var(--olive)',
  };
  return (
    <button onClick={onClick} className="text-left p-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl group" style={{ background: 'var(--cream)', border: '1.5px solid var(--line)' }}>
      <div className="w-10 h-10 rounded-full mb-4 transition-all group-hover:scale-110" style={{ background: colorMap[service.color] || 'var(--sage)' }}></div>
      <h3 className="font-display text-xl mb-2">{service.name}</h3>
      <div className="flex items-center gap-3 text-xs mb-3 font-mono" style={{ color: 'var(--ink-soft)' }}>
        {!service.surDevis && <span className="flex items-center gap-1"><Clock size={12} /> {service.duration} min</span>}
        <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--sage-dark)' }}><Euro size={12} /> {service.priceLabel}</span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{service.description}</p>
      <div className="mt-4 text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--sage-dark)' }}>Réserver →</div>
    </button>
  );
}

function SocialIcons({ links, light }) {
  const color = light ? 'rgba(255,255,255,0.75)' : 'var(--ink-soft)';
  const hoverColor = light ? '#fff' : 'var(--ink)';
  const platforms = [
    { key: 'facebook', label: 'Facebook', svg: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/> },
    { key: 'instagram', label: 'Instagram', svg: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></> },
    { key: 'youtube', label: 'YouTube', svg: <><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></> },
    { key: 'twitter', label: 'X / Twitter', svg: <path d="M18 6 6 18M6 6l12 12"/> },
    { key: 'linkedin', label: 'LinkedIn', svg: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></> },
  ];
  const active = platforms.filter(p => links?.[p.key]);
  if (!active.length) return null;
  return (
    <div className="flex items-center gap-5">
      {active.map(p => (
        <a key={p.key} href={links[p.key]} target="_blank" rel="noopener noreferrer" title={p.label}
          style={{ color, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = hoverColor}
          onMouseLeave={e => e.currentTarget.style.color = color}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {p.svg}
          </svg>
        </a>
      ))}
    </div>
  );
}

function HomePage({ content, setPage, services }) {
  const isFullwidth = content.heroStyle === 'fullwidth';

  return (
    <div>
      {/* Hero */}
      {isFullwidth ? (
        <section className="relative overflow-hidden flex items-center" style={{ minHeight: '92vh' }}>
          {/* Background image */}
          {content.heroImage && (
            <img src={content.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0" style={{ background: content.heroImage ? 'linear-gradient(to bottom, rgba(10,5,5,0.55) 0%, rgba(10,5,5,0.45) 60%, rgba(10,5,5,0.7) 100%)' : 'linear-gradient(135deg, var(--ink) 0%, var(--olive) 100%)' }} />
          <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-24 text-center">
            <div className="text-xs uppercase tracking-[0.4em] mb-6 font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>{content.tagline}</div>
            <h1 className="font-display leading-[1.0] mb-6" style={{ color: '#fff', fontSize: 'clamp(3.5rem, 10vw, 8rem)' }}>
              {content.heroTitle.split('\n').map((line, i) => (
                <span key={i} className="block">
                  {i === 1 ? <em style={{ fontStyle: 'italic', color: 'var(--sage)' }}>{line}</em> : line}
                </span>
              ))}
            </h1>
            <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>{content.heroSubtitle}</p>
            <div className="flex flex-wrap gap-3 justify-center mb-10">
              <button onClick={() => setPage('contact')} className="px-7 py-3.5 rounded-full text-sm uppercase tracking-widest font-mono transition-all hover:opacity-90" style={{ background: 'var(--sage-dark)', color: '#fff' }}>
                Réserver un appel
              </button>
              <button onClick={() => setPage('what')} className="px-7 py-3.5 rounded-full text-sm uppercase tracking-widest font-mono transition-all" style={{ border: '1px solid rgba(255,255,255,0.45)', color: '#fff' }}>
                En savoir plus
              </button>
            </div>
            <div className="flex justify-center">
              <SocialIcons links={content.socialLinks} light />
            </div>
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden" style={{ background: 'linear-gradient(150deg, var(--cream) 0%, var(--sage-light) 100%)' }}>
          <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center relative">
            <div className="stagger relative z-10">
              <div className="text-xs uppercase tracking-[0.3em] mb-6 font-mono" style={{ color: 'var(--sage-dark)' }}>● Préparation mentale</div>
              <h1 className="font-display text-5xl md:text-7xl leading-[1.05] mb-6" style={{ color: 'var(--ink)' }}>
                {content.heroTitle.split('\n').map((line, i) => (
                  <span key={i} className="block">
                    {i === 1 ? <em style={{ fontStyle: 'italic', color: 'var(--sage-dark)' }}>{line}</em> : line}
                  </span>
                ))}
              </h1>
              <p className="text-lg mb-8 max-w-md" style={{ color: 'var(--ink-soft)' }}>{content.heroSubtitle}</p>
              <div className="flex flex-wrap gap-3 mb-6">
                <button onClick={() => setPage('contact')} className="px-6 py-3 rounded-full text-sm uppercase tracking-widest font-mono transition-all hover:opacity-90" style={{ background: 'var(--sage-dark)', color: 'var(--cream)' }}>
                  Réserver un appel
                </button>
                <button onClick={() => setPage('what')} className="px-6 py-3 rounded-full text-sm uppercase tracking-widest font-mono transition-all border" style={{ borderColor: 'var(--sage-dark)', color: 'var(--sage-dark)' }}>
                  En savoir plus
                </button>
              </div>
              <SocialIcons links={content.socialLinks} light={false} />
            </div>
            <div className="relative flex items-center justify-center">
              {content.heroImage ? (
                <img src={content.heroImage} alt="header" className="w-full max-w-sm mx-auto rounded-3xl object-cover drop-shadow-xl" style={{ maxHeight: '480px' }} />
              ) : (
                <div className="relative z-10 p-8">
                  <img src={content.logo || (import.meta.env.BASE_URL + 'logo-crop.png')} alt="JOYA" className="w-full max-w-sm mx-auto drop-shadow-lg" style={{ objectFit: 'contain' }} />
                </div>
              )}
              <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full" style={{ background: 'var(--sage)', opacity: 0.35 }}></div>
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full" style={{ background: 'var(--sage-dark)', opacity: 0.12 }}></div>
            </div>
          </div>
        </section>
      )}

      {/* Quote — bande cramoisie pleine largeur */}
      <section className="py-20 px-6" style={{ background: 'var(--sage-dark)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-display italic text-3xl md:text-4xl leading-relaxed" style={{ color: 'var(--cream)' }}>
            {content.heroQuote}
          </p>
          <div className="mt-8 w-16 h-px mx-auto" style={{ background: 'rgba(252,247,248,0.35)' }}></div>
        </div>
      </section>

      {/* Services preview */}
      <section className="py-20 px-6" style={{ background: 'var(--cream-light)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block text-xs uppercase tracking-[0.3em] px-4 py-1 rounded-full mb-4 font-mono" style={{ background: 'var(--sage-dark)', color: 'var(--cream)' }}>Accompagnement</div>
            <h2 className="font-display text-4xl md:text-5xl">Trouvez la formule qui vous correspond</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            {services.map(s => <ServiceCard key={s.id} service={s} onClick={() => setPage('contact')} />)}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      {Array.isArray(content.testimonials) && content.testimonials.length > 0 && (
        <section className="py-20 px-6" style={{ background: 'var(--cream)' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-5xl md:text-6xl mb-14" style={{ color: 'var(--sage-dark)' }}>Témoignages</h2>
            <div className="grid md:grid-cols-3 gap-10 stagger">
              {content.testimonials.map((t) => (
                <div key={t.id} className="flex flex-col items-center text-center">
                  {t.photo ? (
                    <img src={t.photo} alt={t.name} className="w-full mb-8 object-cover rounded-xl" style={{ aspectRatio: '3/4', maxHeight: 280 }} />
                  ) : (
                    <div className="w-full mb-8 rounded-xl flex items-center justify-center" style={{ aspectRatio: '3/4', maxHeight: 280, background: 'var(--sage-light)' }}>
                      <span className="font-display text-4xl" style={{ color: 'var(--sage-dark)', opacity: 0.3 }}>{t.name.charAt(0)}</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed mb-5 italic" style={{ color: 'var(--ink-soft)' }}>« {t.text} »</p>
                  <div className="font-display text-lg font-semibold" style={{ color: 'var(--sage-dark)' }}>{t.name}</div>
                  {t.role && <div className="text-xs font-mono uppercase tracking-widest mt-0.5" style={{ color: 'var(--sage-dark)', opacity: 0.7 }}>{t.role}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Approach — bande cramoisie */}
      <section className="py-20 px-6" style={{ background: 'var(--sage-dark)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl" style={{ color: 'var(--cream)' }}>Mon approche</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 stagger">
            {[
              { icon: <Heart size={24} />, title: "Bienveillance", text: "Un espace d'écoute sans jugement, à votre rythme." },
              { icon: <Compass size={24} />, title: "Clarté", text: "Des objectifs concrets et un cap clair dès la première séance." },
              { icon: <Users size={24} />, title: "Sur mesure", text: "Chaque parcours est construit autour de votre singularité." }
            ].map((v, i) => (
              <div key={i} className="text-center p-8 rounded-2xl" style={{ background: 'rgba(252,247,248,0.08)', border: '1px solid rgba(252,247,248,0.15)' }}>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5" style={{ background: 'var(--sage)', color: 'var(--sage-dark)' }}>
                  {v.icon}
                </div>
                <h3 className="font-display text-2xl mb-3" style={{ color: 'var(--cream)' }}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(252,247,248,0.7)' }}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function WhatIsPage({ content, setPage }) {
  return (
    <div>
      {/* Header cramoisie */}
      <div className="py-16 px-6" style={{ background: 'var(--sage-dark)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-xs uppercase tracking-[0.3em] mb-4 font-mono" style={{ color: 'var(--sage)' }}>● Comprendre</div>
          <h1 className="font-display text-5xl md:text-6xl mb-6" style={{ color: 'var(--cream)' }}>{content.whatIsTitle}</h1>
          <p className="text-lg leading-relaxed max-w-2xl" style={{ color: 'rgba(252,247,248,0.75)' }}>{content.whatIsText}</p>
        </div>
      </div>

      {/* Pour qui — cartes alternées */}
      <div className="px-6 py-16" style={{ background: 'var(--cream-light)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-4xl mb-10">{content.forWhomTitle}</h2>
          <div className="grid md:grid-cols-2 gap-4 stagger">
            {content.forWhomItems.map((item, i) => {
              const isCrimson = i % 2 === 0;
              return (
                <div key={i} className="p-8 rounded-2xl" style={{
                  background: isCrimson ? 'var(--sage-dark)' : 'var(--cream)',
                  border: isCrimson ? 'none' : '1.5px solid var(--line)'
                }}>
                  <div className="font-display text-5xl mb-3" style={{ color: isCrimson ? 'rgba(252,247,248,0.2)' : 'var(--sage)' }}>0{i+1}</div>
                  <h3 className="font-display text-2xl mb-2" style={{ color: isCrimson ? 'var(--cream)' : 'var(--ink)' }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: isCrimson ? 'rgba(252,247,248,0.7)' : 'var(--ink-soft)' }}>{item.text}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-12 text-center">
            <button onClick={() => setPage('contact')} className="px-8 py-4 rounded-full text-sm uppercase tracking-widest font-mono transition-all hover:opacity-90" style={{ background: 'var(--sage-dark)', color: 'var(--cream)' }}>
              Échangeons
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EthicsPage({ content }) {
  const ethicsImg = content.ethicsImage || (import.meta.env.BASE_URL + 'ethics-photo.png');
  const schemaImg = content.ethicsSchema || (import.meta.env.BASE_URL + 'ethics-schema.png');

  return (
    <div>
      {/* Header */}
      <div className="py-16 px-6" style={{ background: 'var(--sage-dark)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-xs uppercase tracking-[0.3em] mb-4 font-mono" style={{ color: 'var(--sage)' }}>● Cadre</div>
          <h1 className="font-display text-5xl md:text-6xl" style={{ color: 'var(--cream)' }}>{content.ethicsTitle}</h1>
        </div>
      </div>

      {/* Corps — texte gauche, image droite */}
      <div className="px-6 py-16" style={{ background: 'var(--cream)' }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-start">
          {/* Bloc SFPS */}
          <div className="rounded-2xl px-10 py-12 flex flex-col items-center text-center" style={{ background: 'var(--sage-dark)' }}>
            <h2 className="font-display text-3xl md:text-4xl mb-6 leading-tight" style={{ color: 'var(--cream)' }}>{content.ethicsTitle}</h2>
            <p className="text-sm leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '38ch' }}>{content.ethicsText}</p>
            <div className="flex flex-col items-center gap-4 w-full">
              {content.ethicsPrinciples.map((p, i) => (
                <span key={i} className="font-mono text-xs uppercase tracking-widest pb-1" style={{ color: 'var(--cream)', borderBottom: '1.5px solid rgba(255,255,255,0.5)' }}>
                  {p.title}
                </span>
              ))}
            </div>
          </div>
          {/* Image charte */}
          <div className="md:sticky md:top-24">
            <img
              src={ethicsImg}
              alt="Charte éthique"
              className="w-full rounded-2xl shadow-lg object-contain"
              style={{ border: '1px solid var(--line)' }}
            />
          </div>
        </div>
      </div>

      {/* Schéma pleine largeur */}
      <div className="px-6 pb-16" style={{ background: 'var(--cream)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-xs uppercase tracking-[0.3em] mb-6 font-mono" style={{ color: 'var(--sage-dark)' }}>● Schéma déontologique</div>
          <img
            src={schemaImg}
            alt="Schéma déontologique"
            className="w-full rounded-2xl shadow-md object-contain"
            style={{ border: '1px solid var(--line)', background: '#fff' }}
          />
        </div>
      </div>
    </div>
  );
}

function AboutPage({ content, setPage }) {
  const targets = Array.isArray(content.aboutTargets) ? content.aboutTargets : [];
  const formations = Array.isArray(content.formations) ? content.formations : [];
  const memoires = Array.isArray(content.memoires) ? content.memoires : [];

  return (
    <div>
      {/* Hero intro */}
      <section className="py-16 px-6" style={{ background: 'var(--cream)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 items-start">
            <div className="md:col-span-2">
              {content.aboutPhoto ? (
                <img src={content.aboutPhoto} alt="Jodie Peltier" className="w-full rounded-3xl object-cover" style={{ maxHeight: '480px' }} />
              ) : (
                <div className="aspect-[3/4] rounded-3xl" style={{ background: 'linear-gradient(160deg, var(--sage-dark) 0%, var(--olive) 100%)' }}>
                  <div className="w-full h-full flex items-center justify-center">
                    <img src={import.meta.env.BASE_URL + 'logo-crop.png'} alt="JOYA" style={{ width: '70%', objectFit: 'contain', opacity: 0.25 }} />
                  </div>
                </div>
              )}
            </div>
            <div className="md:col-span-3">
              <div className="text-xs uppercase tracking-[0.3em] mb-4 font-mono" style={{ color: 'var(--sage-dark)' }}>● Présentation</div>
              <h1 className="font-display text-5xl md:text-6xl mb-2">Qui suis-je ?</h1>
              <p className="font-display italic text-2xl mb-6" style={{ color: 'var(--sage-dark)' }}>Jodie Peltier</p>
              <div className="p-6 rounded-2xl mb-5" style={{ background: 'var(--sage-light)', borderLeft: '4px solid var(--sage-dark)' }}>
                <p className="text-base leading-relaxed font-medium" style={{ color: 'var(--ink)' }}>{content.aboutShort}</p>
              </div>
              {targets.length > 0 && (
                <div className="mb-5">
                  <div className="text-xs uppercase tracking-widest font-mono mb-3" style={{ color: 'var(--ink-soft)' }}>J'accompagne :</div>
                  <div className="flex flex-wrap gap-2">
                    {targets.map((t, i) => (
                      <span key={i} className="px-4 py-1.5 rounded-full text-sm font-mono" style={{ background: 'var(--sage-dark)', color: 'var(--cream)' }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--ink-soft)' }}>{content.aboutLong}</p>
              <button onClick={() => setPage('contact')} className="px-8 py-4 rounded-full text-sm uppercase tracking-widest font-mono transition-all hover:opacity-90" style={{ background: 'var(--sage-dark)', color: 'var(--cream)' }}>
                Réserver un appel découverte
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Formations */}
      {formations.length > 0 && (
        <section className="py-16 px-6" style={{ background: 'var(--sage-dark)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-xs uppercase tracking-[0.3em] mb-3 font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>● Parcours académique</div>
            <h2 className="font-display text-4xl md:text-5xl mb-10" style={{ color: 'var(--cream)' }}>Formations</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {formations.map((f, i) => {
                const defaultImg = i === 0
                  ? import.meta.env.BASE_URL + 'formation-nantes.png'
                  : i === 1
                    ? import.meta.env.BASE_URL + 'formation-ubo.png'
                    : '';
                const imgSrc = f.image || defaultImg;
                return (
                  <div key={f.id || i} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    {imgSrc && (
                      <div style={{ height: '160px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 32px' }}>
                        <img src={imgSrc} alt={f.school} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{f.year}</div>
                      <div className="font-display text-xl mb-1" style={{ color: 'var(--cream)' }}>{f.school}</div>
                      <div className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.85)' }}>{f.diploma}</div>
                      {f.diplomaDetail && (
                        <div className="text-xs italic mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>{f.diplomaDetail}</div>
                      )}
                      {f.stages && (
                        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                          <div className="text-[10px] uppercase tracking-widest font-mono mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Stages</div>
                          {f.stages.split('\n').map((s, j) => (
                            <div key={j} className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>— {s}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Mémoires */}
      {memoires.length > 0 && (
        <section className="py-16 px-6" style={{ background: 'var(--cream-light)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-xs uppercase tracking-[0.3em] mb-3 font-mono" style={{ color: 'var(--sage-dark)' }}>● Recherche</div>
            <h2 className="font-display text-4xl md:text-5xl mb-10">Mémoires</h2>
            <div className="space-y-4">
              {memoires.map((m, i) => (
                <div key={m.id || i} className="p-6 rounded-2xl flex gap-6 items-start" style={{ background: 'var(--cream)', border: '1px solid var(--line)' }}>
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--ink-soft)' }}>Niveau</div>
                    <div className="text-xs font-display" style={{ color: 'var(--sage-dark)' }}>{m.level}</div>
                  </div>
                  <div style={{ borderLeft: '2px solid var(--sage-dark)', paddingLeft: '1.5rem' }}>
                    <div className="font-display text-lg mb-1">{m.title}</div>
                    {m.subtitle && <div className="text-sm italic" style={{ color: 'var(--ink-soft)' }}>{m.subtitle}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ServicesPage({ content, services, setPage }) {
  return (
    <div>
      <div className="py-16 px-6" style={{ background: 'var(--sage-dark)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-xs uppercase tracking-[0.3em] mb-4 font-mono" style={{ color: 'var(--sage)' }}>● Prestations</div>
          <h1 className="font-display text-5xl md:text-6xl" style={{ color: 'var(--cream)' }}>Mes services</h1>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-6 stagger">
          {services.map(s => <ServiceCard key={s.id} service={s} onClick={() => setPage('contact')} />)}
        </div>
        <div className="mt-16 p-10 rounded-2xl text-center" style={{ background: 'var(--sage-dark)' }}>
          <p className="font-display italic text-2xl mb-6" style={{ color: 'var(--cream)' }}>Vous avez une question ? Je suis là.</p>
          <button onClick={() => setPage('contact')} className="px-8 py-4 rounded-full text-sm uppercase tracking-widest font-mono transition-all hover:opacity-90" style={{ background: 'var(--cream)', color: 'var(--sage-dark)' }}>
            Me contacter
          </button>
        </div>
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
    if (selectedSlot) {
      const updatedSlots = slots.map(s => s.id === selectedSlot.id ? { ...s, available: false } : s);
      const remaining = selectedSlot.duration - selectedService.duration;
      if (remaining > 0) {
        const newTime = addMinutes(selectedSlot.time, selectedService.duration);
        const newId = `${selectedSlot.date}-${newTime}`;
        if (!updatedSlots.find(s => s.id === newId)) {
          updatedSlots.push({ id: newId, date: selectedSlot.date, time: newTime, duration: remaining, available: true });
        }
      }
      updateSlots(updatedSlots);
    }
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
