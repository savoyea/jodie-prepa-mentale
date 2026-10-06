import { Link } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext.jsx';
import { Sections } from '../components/SectionRenderer.jsx';

export default function About() {
  const { content } = useSite();
  const formations = content.formations || [];
  const memoires = content.memoires || [];
  const sections = content.aboutSections || [];

  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 px-6" style={{ background: 'var(--color-cream)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--color-sage-dark)', marginBottom: '1rem' }}>
            À propos
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 400, color: 'var(--color-ink)', lineHeight: 1.1 }}>
            Qui suis-je ?
          </h1>
        </div>
      </section>

      <Sections sections={sections} position="before-intro" />

      {/* Photo + texte court */}
      <section className="py-16 px-6" style={{ background: 'var(--color-cream-light)' }}>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-start">
          {content.aboutPhoto && (
            <div className="flex-shrink-0">
              <img
                src={content.aboutPhoto}
                alt="Jodie Peltier"
                className="rounded-2xl"
                style={{ width: 280, height: 360, objectFit: 'cover', border: '1px solid var(--color-line)' }}
              />
            </div>
          )}
          <div>
            {content.aboutShort && (
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontStyle: 'italic', color: 'var(--color-ink)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {content.aboutShort}
              </p>
            )}
            {(() => {
              const raw = content.aboutPublics;
              const publics = Array.isArray(raw)
                ? raw
                : typeof raw === 'string'
                  ? raw.split('\n').filter(Boolean)
                  : [];
              return publics.length > 0 ? (
                <div className="mb-5">
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--color-ink-soft)', marginBottom: '0.625rem' }}>
                    J'accompagne :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {publics.map((p, i) => (
                      <span key={i} className="px-4 py-1.5 rounded-full" style={{ background: 'var(--color-sage-dark)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
            {content.aboutLong && (
              <p style={{ color: 'var(--color-ink-soft)', lineHeight: 1.8 }}>
                {content.aboutLong}
              </p>
            )}
          </div>
        </div>
      </section>

      <Sections sections={sections} position="before-formations" />

      {/* Formations */}
      {formations.length > 0 && (
        <section className="py-20 px-6" style={{ background: 'var(--color-sage-dark)' }}>
          <div className="max-w-5xl mx-auto">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem' }}>
              Parcours académique
            </p>
            <h2 className="mb-10" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 400, color: '#fff' }}>
              Formations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formations.map((f, i) => (
                <div key={f.id || i} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  {f.image && (
                    <div className="flex items-center justify-center p-8" style={{ background: '#fff', minHeight: 140 }}>
                      <img src={f.image} alt={f.school || ''} style={{ maxHeight: 80, maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                  )}
                  <div className="p-6">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)' }}>
                      {f.year}
                    </span>
                    <h3 className="mt-2 mb-1" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 400, color: '#fff' }}>
                      {f.school}
                    </h3>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: f.diplomaDetail ? '0.5rem' : 0 }}>
                      {f.diploma}
                    </p>
                    {f.diplomaDetail && (
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                        {f.diplomaDetail}
                      </p>
                    )}
                    {f.stages && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>
                          Stages
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                          {f.stages}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mémoires */}
      {memoires.length > 0 && (
        <section className="py-16 px-6" style={{ background: 'var(--color-cream-light)' }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="mb-10" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 400, color: 'var(--color-ink)' }}>
              Mémoires
            </h2>
            <div className="space-y-4">
              {memoires.map((m, i) => (
                <div key={m.id || i} className="rounded-xl p-6" style={{ background: '#fff', border: '1px solid var(--color-line)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-sage-dark)' }}>
                    {m.level}
                  </span>
                  <h3 className="mt-2" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 400, color: 'var(--color-ink)' }}>
                    {m.title}
                  </h3>
                  <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.875rem', fontStyle: 'italic', marginTop: '0.25rem' }}>
                    {m.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Sections sections={sections} position="after-formations" />

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
