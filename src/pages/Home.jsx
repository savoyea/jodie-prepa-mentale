import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, Instagram, Linkedin, Check } from 'lucide-react';
import { useSite } from '../contexts/SiteContext.jsx';
import { Sections } from '../components/SectionRenderer.jsx';

const SERVICE_PRESETS = { sage: '#e6bfc2', terracotta: '#a31621', ochre: '#c9a96e', olive: '#7a8c5c' };
const colorToHex = (c) => { if (!c) return SERVICE_PRESETS.sage; return SERVICE_PRESETS[c] || c; };

function HeroTitle({ text }) {
  if (!text) return null;
  const words = text.split('\n').flatMap((line, li) =>
    line.split(' ').filter(Boolean).map((word, wi) => ({ word, italic: li === 1, key: `${li}-${wi}` }))
  );
  return (
    <h1
      className="text-center"
      style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'clamp(3rem, 8vw, 6rem)',
        fontWeight: 400,
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
        color: '#fff',
      }}
    >
      {words.map(({ word, italic, key }, i) => (
        <span
          key={key}
          className="hero-word inline-block mr-[0.2em]"
          style={{
            fontStyle: italic ? 'italic' : 'normal',
            color: italic ? 'var(--color-sage)' : '#fff',
            animationDelay: `${0.2 + i * 0.1}s`,
          }}
        >
          {word}
        </span>
      ))}
    </h1>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="text-center">
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 400, color: '#fff', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.65)', marginTop: '0.5rem' }}>
        {label}
      </div>
    </div>
  );
}

function ServiceCard({ service, index }) {
  const num = String(index + 1).padStart(2, '0');
  const [hovered, setHovered] = useState(false);
  const priceLabel = service.sur_devis
    ? 'Sur devis'
    : service.price_label || (service.price ? `À partir de ${service.price} €` : 'Gratuit');

  return (
    <div
      className="relative rounded-2xl p-6 overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: '1px solid var(--color-line)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 32px rgba(26,15,16,0.1)' : '0 1px 3px rgba(26,15,16,0.04)',
      }}
    >
      <span
        className="absolute top-4 right-6"
        style={{ fontFamily: 'var(--font-serif)', fontSize: '4rem', fontWeight: 400, color: 'var(--color-sage-light)', lineHeight: 1, userSelect: 'none' }}
      >
        {num}
      </span>
      <div className="w-10 h-10 rounded-full mb-4" style={{ background: colorToHex(service.color) }} />
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--color-ink)', marginBottom: '0.5rem' }}>
        {service.name}
      </h3>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-sage-dark)', marginBottom: '0.75rem' }}>
        {service.duration ? `${service.duration} min · ` : ''}{priceLabel}
      </p>
      <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
        {service.description}
      </p>
      <Link
        to="/services"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-sage-dark)' }}
      >
        Choisir →
      </Link>
    </div>
  );
}

export default function Home() {
  const { content, services } = useSite();
  const social = content.socialLinks || {};
  const stats = content.stats || {};
  const forWhom = content.forWhomItems || [];
  const sections = content.heroSections || [];

  return (
    <>
      <Sections sections={sections} position="before-hero" />
      {/* Hero */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6"
        style={{
          minHeight: '100vh',
          background: content.heroImage
            ? `linear-gradient(rgba(26,15,16,0.65), rgba(61,12,18,0.75)), url(${content.heroImage}) center/cover no-repeat`
            : 'linear-gradient(150deg, var(--color-ink) 0%, #3d0c12 100%)',
        }}
      >
        <p
          className="hero-label text-xs uppercase mb-8"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.55)', animationDelay: '0.1s' }}
        >
          {content.tagline || 'Préparation mentale'}
        </p>

        <HeroTitle text={content.heroTitle || 'Le mental au\nservice de ta réussite !'} />

        <p
          className="hero-label text-lg md:text-xl mt-6 mb-10 max-w-2xl"
          style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, animationDelay: '0.6s' }}
        >
          {content.heroSubtitle}
        </p>

        <div className="hero-label flex flex-col sm:flex-row gap-4 justify-center" style={{ animationDelay: '0.8s' }}>
          <Link
            to="/services"
            className="px-8 py-4 rounded-full"
            style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}
          >
            Réserver un appel
          </Link>
          <Link
            to="/demarche"
            className="px-8 py-4 rounded-full"
            style={{ border: '1px solid rgba(255,255,255,0.4)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}
          >
            En savoir plus
          </Link>
        </div>

        {(social.instagram || social.linkedin) && (
          <div className="hero-label flex gap-5 justify-center mt-6" style={{ animationDelay: '1.0s' }}>
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noopener noreferrer"
                style={{ color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              >
                <Instagram size={20} />
              </a>
            )}
            {social.linkedin && (
              <a href={social.linkedin} target="_blank" rel="noopener noreferrer"
                style={{ color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              >
                <Linkedin size={20} />
              </a>
            )}
          </div>
        )}

        <div
          className="scroll-indicator absolute bottom-8 left-1/2 flex flex-col items-center gap-2"
          style={{ transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.4)' }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Défiler</span>
          <ArrowDown size={14} />
        </div>
      </section>

      <Sections sections={sections} position="before-stats" />
      {/* Stats */}
      {(stats.clients || stats.years || stats.satisfaction || stats.specialties) && (
        <section className="py-16 px-6" style={{ background: 'var(--color-sage-dark)' }}>
          <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.clients      && <StatCard value={`${stats.clients}+`}      label="Clients accompagnés" />}
            {stats.years        && <StatCard value={`${stats.years} ans`}     label="D'expérience" />}
            {stats.satisfaction && <StatCard value={`${stats.satisfaction}%`} label="De satisfaction" />}
            {stats.specialties  && <StatCard value={stats.specialties}         label="Spécialités" />}
          </div>
        </section>
      )}

      {/* Citation */}
      {content.heroQuote && (
        <section className="py-20 px-6" style={{ background: 'var(--color-cream-light)' }}>
          <div className="max-w-3xl mx-auto text-center">
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(1.4rem, 3vw, 2rem)', lineHeight: 1.5, color: 'var(--color-ink)' }}>
              {content.heroQuote}
            </p>
            <div className="mt-8 w-16 h-px mx-auto" style={{ background: 'var(--color-sage-dark)' }} />
          </div>
        </section>
      )}

      <Sections sections={sections} position="before-services" />
      {/* Services */}
      {services.length > 0 && (
        <section className="py-20 px-6" style={{ background: 'var(--color-cream)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--color-sage-dark)', marginBottom: '0.75rem' }}>
                Accompagnement
              </p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: 'var(--color-ink)' }}>
                Trouvez la formule qui vous correspond
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
            </div>
          </div>
        </section>
      )}

      <Sections sections={sections} position="before-forwhom" />
      {/* Pour qui */}
      {forWhom.length > 0 && (
        <section className="py-20 px-6" style={{ background: 'var(--color-cream-light)' }}>
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
            {/* Colonne gauche */}
            <div className="flex flex-col gap-8 md:sticky md:top-28">
              <div>
                <p className="flex items-center gap-2 mb-5" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--color-sage-dark)' }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--color-sage-dark)' }} />
                  Comprendre
                </p>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 400, color: 'var(--color-ink)', lineHeight: 1.2 }}>
                  {content.forWhomTitle || 'Pourquoi la préparation mentale ?'}
                </h2>
              </div>
              <Link
                to="/contact"
                className="self-start px-8 py-4 rounded-full"
                style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}
              >
                Commencer maintenant
              </Link>
            </div>
            {/* Colonne droite */}
            <div className="flex flex-col gap-4">
              {forWhom.map((item, i) => (
                <div key={i} className="flex gap-4 items-start rounded-2xl p-5" style={{ background: '#fff', border: '1px solid var(--color-line)' }}>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--color-sage-dark)' }}>
                    <Check size={14} color="#fff" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 400, color: 'var(--color-ink)', marginBottom: '0.25rem' }}>
                      {item.title}
                    </h3>
                    <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <Sections sections={sections} position="after-forwhom" />
      <Sections sections={sections} position="after-all" />
    </>
  );
}
