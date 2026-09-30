import { Link } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext.jsx';

export default function About() {
  const { content } = useSite();
  const targets = Array.isArray(content.aboutTargets) ? content.aboutTargets : [];
  const formations = Array.isArray(content.formations) ? content.formations : [];
  const memoires = Array.isArray(content.memoires) ? content.memoires : [];

  return (
    <div>
      {/* Hero intro */}
      <section className="py-16 px-6 bg-cream">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 items-start">
            <div className="md:col-span-2">
              {content.aboutPhoto ? (
                <img src={content.aboutPhoto} alt="Jodie Peltier" className="w-full rounded-3xl object-cover" style={{ maxHeight: '480px' }} />
              ) : (
                <div className="aspect-[3/4] rounded-3xl flex items-center justify-center overflow-hidden"
                  style={{ background: 'linear-gradient(160deg, var(--color-sage-dark) 0%, var(--color-olive) 100%)' }}>
                  <img src="/logo-crop.png" alt="" className="w-[70%] object-contain opacity-25" />
                </div>
              )}
            </div>
            <div className="md:col-span-3">
              <div className="text-xs uppercase tracking-[0.3em] mb-4 font-mono text-sage-dark">● Présentation</div>
              <h1 className="font-serif text-5xl md:text-6xl mb-2 text-ink">Qui suis-je ?</h1>
              <p className="font-serif italic text-2xl mb-6 text-sage-dark">Jodie Peltier</p>
              {content.aboutShort && (
                <div className="p-6 rounded-2xl mb-5 bg-sage-light" style={{ borderLeft: '4px solid var(--color-sage-dark)' }}>
                  <p className="text-base leading-relaxed font-medium text-ink">{content.aboutShort}</p>
                </div>
              )}
              {targets.length > 0 && (
                <div className="mb-5">
                  <div className="text-xs uppercase tracking-widest font-mono mb-3 text-ink-soft">J'accompagne :</div>
                  <div className="flex flex-wrap gap-2">
                    {targets.map((t, i) => (
                      <span key={i} className="px-4 py-1.5 rounded-full text-sm font-mono bg-sage-dark text-cream">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {content.aboutLong && (
                <p className="text-base leading-relaxed mb-8 text-ink-soft">{content.aboutLong}</p>
              )}
              <Link to="/services" className="inline-block px-8 py-4 rounded-full text-sm uppercase tracking-widest font-mono transition-all hover:opacity-90 bg-sage-dark text-cream">
                Réserver un appel découverte
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Formations */}
      {formations.length > 0 && (
        <section className="py-16 px-6 bg-sage-dark">
          <div className="max-w-5xl mx-auto">
            <div className="text-xs uppercase tracking-[0.3em] mb-3 font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>● Parcours académique</div>
            <h2 className="font-serif text-4xl md:text-5xl mb-10 text-cream">Formations</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {formations.map((f, i) => {
                const defaultImg = i === 0 ? '/formation-nantes.png' : i === 1 ? '/formation-ubo.png' : '';
                const imgSrc = f.image || defaultImg;
                return (
                  <div key={f.id || i} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    {imgSrc && (
                      <div className="h-40 bg-white flex items-center justify-center px-8 py-5">
                        <img src={imgSrc} alt={f.school} className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{f.year}</div>
                      <div className="font-serif text-xl mb-1 text-cream">{f.school}</div>
                      <div className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.85)' }}>{f.diploma}</div>
                      {f.diplomaDetail && <div className="text-xs italic mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>{f.diplomaDetail}</div>}
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
        <section className="py-16 px-6 bg-cream-light">
          <div className="max-w-5xl mx-auto">
            <div className="text-xs uppercase tracking-[0.3em] mb-3 font-mono text-sage-dark">● Recherche</div>
            <h2 className="font-serif text-4xl md:text-5xl mb-10 text-ink">Mémoires</h2>
            <div className="space-y-4">
              {memoires.map((m, i) => (
                <div key={m.id || i} className="p-6 rounded-2xl flex gap-6 items-start bg-cream border border-line">
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="font-mono text-[10px] uppercase tracking-widest mb-1 text-ink-soft">Niveau</div>
                    <div className="text-xs font-serif text-sage-dark">{m.level}</div>
                  </div>
                  <div style={{ borderLeft: '2px solid var(--color-sage-dark)', paddingLeft: '1.5rem' }}>
                    <div className="font-serif text-lg mb-1 text-ink">{m.title}</div>
                    {m.subtitle && <div className="text-sm italic text-ink-soft">{m.subtitle}</div>}
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
