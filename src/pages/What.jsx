import { Link } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext.jsx';
import { Sections } from '../components/SectionRenderer.jsx';

export default function What() {
  const { content } = useSite();
  const forWhom = content.forWhomItems || [];
  const sections = content.whatSections || [];

  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 px-6" style={{ background: 'var(--color-cream)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--color-sage-dark)', marginBottom: '1rem' }}>
            Comprendre
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 400, color: 'var(--color-ink)', lineHeight: 1.1 }}>
            {content.whatIsTitle || "La préparation mentale, qu'est-ce que c'est ?"}
          </h1>
        </div>
      </section>

      {/* Sections before-intro */}
      <Sections sections={sections} position="before-intro" />

      {/* Fallback: old whatIsText if no sections */}
      {!sections.length && content.whatIsText && (
        <section className="py-12 px-6" style={{ background: 'var(--color-cream-light)' }}>
          <div
            className="max-w-3xl mx-auto text-base leading-relaxed legal-prose"
            style={{ color: 'var(--color-ink-soft)' }}
            dangerouslySetInnerHTML={{ __html: content.whatIsText }}
          />
        </section>
      )}

      {/* Sections before-forwhom */}
      <Sections sections={sections} position="before-forwhom" />

      {/* Pour qui */}
      {forWhom.length > 0 && (
        <section className="py-20 px-6" style={{ background: 'var(--color-cream)' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-center mb-12" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, color: 'var(--color-ink)' }}>
              {content.forWhomTitle || 'Pour qui ?'}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {forWhom.map((item, i) => (
                <div key={i} className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid var(--color-line)' }}>
                  {item.image && (
                    <img src={item.image} alt={item.title || ''} className="w-full object-cover" style={{ height: 180 }} />
                  )}
                  <div className="p-6">
                    <div
                      className="w-8 h-8 rounded-full mb-4 flex items-center justify-center text-white text-sm font-mono"
                      style={{ background: 'var(--color-sage-dark)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 400, color: 'var(--color-ink)', marginBottom: '0.5rem' }}>
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

      {/* Sections after-forwhom */}
      <Sections sections={sections} position="after-forwhom" />

      {/* CTA */}
      <section className="py-16 px-6 text-center" style={{ background: 'var(--color-sage-dark)' }}>
        <Link
          to="/contact"
          className="inline-block px-8 py-4 rounded-full"
          style={{ border: '1px solid rgba(255,255,255,0.6)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}
        >
          Échangeons
        </Link>
      </section>
    </>
  );
}
