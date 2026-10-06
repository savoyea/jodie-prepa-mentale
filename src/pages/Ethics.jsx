import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext.jsx';
import { Sections } from '../components/SectionRenderer.jsx';

function PrincipleItem({ principle, light }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${light ? 'rgba(255,255,255,0.15)' : 'var(--color-line)'}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          fontWeight: 600,
          color: light ? 'var(--color-cream)' : 'var(--color-ink)',
        }}>
          {principle.title}
        </span>
        <span style={{
          color: light ? 'rgba(255,255,255,0.5)' : 'var(--color-ink-soft)',
          fontSize: '1.1rem',
          flexShrink: 0,
          transition: 'transform 0.2s',
          transform: open ? 'rotate(45deg)' : 'none',
          display: 'inline-block',
        }}>+</span>
      </button>
      {open && principle.text && (
        <p className="pb-4 text-sm leading-relaxed" style={{ color: light ? 'rgba(255,255,255,0.75)' : 'var(--color-ink-soft)' }}>
          {principle.text}
        </p>
      )}
    </div>
  );
}

export default function Ethics() {
  const { content } = useSite();
  const principles = content.ethicsPrinciples || [];
  const sections = content.ethicsSections || [];

  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 px-6" style={{ background: 'var(--color-cream)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--color-sage-dark)', marginBottom: '1rem' }}>
            Déontologie
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 400, color: 'var(--color-ink)', lineHeight: 1.1 }}>
            {content.ethicsTitle || 'Éthique et déontologie'}
          </h1>
        </div>
      </section>

      <Sections sections={sections} position="before-intro" />

      {/* Introduction */}
      {content.ethicsIntro && (
        <section className="py-12 px-6" style={{ background: 'var(--color-cream-light)' }}>
          <div className="max-w-3xl mx-auto">
            <p style={{ color: 'var(--color-ink-soft)', lineHeight: 1.8, fontSize: '0.95rem' }}>
              {content.ethicsIntro}
            </p>
          </div>
        </section>
      )}

      {/* Fallback: old ethicsText */}
      {!content.ethicsIntro && content.ethicsText && (
        <section className="py-12 px-6" style={{ background: 'var(--color-cream-light)' }}>
          <div
            className="max-w-3xl mx-auto legal-prose"
            dangerouslySetInnerHTML={{ __html: content.ethicsText.replace(/\n/g, '<br>') }}
          />
        </section>
      )}

      <Sections sections={sections} position="before-principles" />

      {/* Principes — accordion sur fond accentué */}
      {principles.length > 0 && (
        <section className="py-16 px-6" style={{ background: 'var(--color-sage-dark)' }}>
          <div className="max-w-3xl mx-auto">
            {principles.map((p, i) => (
              <PrincipleItem key={p.id || i} principle={p} light />
            ))}
          </div>
        </section>
      )}

      <Sections sections={sections} position="after-principles" />

      {/* Schéma déontologique */}
      {content.ethicsSchema && (
        <section className="py-12 px-6" style={{ background: 'var(--color-cream-light)' }}>
          <div className="max-w-4xl mx-auto">
            <p className="flex items-center gap-2 mb-6" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--color-sage-dark)' }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--color-sage-dark)' }} />
              Schéma déontologique
            </p>
            <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid var(--color-line)', padding: '1.5rem' }}>
              <img src={content.ethicsSchema} alt="Schéma déontologique" className="w-full" style={{ maxHeight: 480, objectFit: 'contain' }} />
            </div>
          </div>
        </section>
      )}

      {/* Fallback old schema */}
      {!content.ethicsSchema && content.ethicsImage && (
        <section className="py-12 px-6" style={{ background: 'var(--color-cream-light)' }}>
          <div className="max-w-3xl mx-auto">
            <img src={content.ethicsImage} alt="Charte éthique" className="w-full rounded-xl" style={{ border: '1px solid var(--color-line)' }} />
          </div>
        </section>
      )}

      <section className="py-16 px-6 text-center" style={{ background: 'var(--color-sage-dark)' }}>
        <Link
          to="/contact"
          className="inline-block px-8 py-4 rounded-full"
          style={{ border: '1px solid rgba(255,255,255,0.6)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}
        >
          Me contacter
        </Link>
      </section>
    </>
  );
}
