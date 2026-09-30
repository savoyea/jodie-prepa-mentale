import { Link } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext.jsx';

export default function What() {
  const { content } = useSite();

  return (
    <div>
      {/* Header crimson */}
      <div className="py-16 px-6 bg-sage-dark">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs uppercase tracking-[0.3em] mb-4 font-mono text-sage">● Comprendre</div>
          <h1 className="font-serif text-5xl md:text-6xl mb-6 text-cream">{content.whatIsTitle}</h1>
          {content.whatIsText && (
            <div className="text-lg leading-relaxed max-w-2xl" style={{ color: 'rgba(252,247,248,0.75)' }}
              dangerouslySetInnerHTML={{ __html: content.whatIsText }} />
          )}
        </div>
      </div>

      {/* What sections */}
      {Array.isArray(content.whatSections) && content.whatSections.length > 0 && (
        <div className="py-16 px-6 bg-cream">
          <div className="max-w-4xl mx-auto space-y-10">
            {content.whatSections.map((section, i) => (
              <div key={i}>
                {section.title && <h2 className="font-serif text-3xl mb-4 text-ink">{section.title}</h2>}
                {section.text && <div className="text-base leading-relaxed text-ink-soft" dangerouslySetInnerHTML={{ __html: section.text }} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pour qui */}
      {Array.isArray(content.forWhomItems) && content.forWhomItems.length > 0 && (
        <div className="px-6 py-16 bg-cream-light">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl mb-10 text-ink">{content.forWhomTitle}</h2>
            <div className="grid md:grid-cols-2 gap-4 stagger">
              {content.forWhomItems.map((item, i) => {
                const isCrimson = i % 2 === 0;
                return (
                  <div key={i} className="p-8 rounded-2xl"
                    style={{ background: isCrimson ? 'var(--color-sage-dark)' : 'var(--color-cream)', border: isCrimson ? 'none' : '1.5px solid var(--color-line)' }}>
                    <div className="font-serif text-5xl mb-3" style={{ color: isCrimson ? 'rgba(252,247,248,0.2)' : 'var(--color-sage)' }}>0{i + 1}</div>
                    <h3 className="font-serif text-2xl mb-2" style={{ color: isCrimson ? 'var(--color-cream)' : 'var(--color-ink)' }}>{item.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: isCrimson ? 'rgba(252,247,248,0.7)' : 'var(--color-ink-soft)' }}>{item.text}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-12 text-center">
              <Link to="/services" className="px-8 py-4 rounded-full text-sm uppercase tracking-widest font-mono transition-all hover:opacity-90 bg-sage-dark text-cream">
                Échangeons
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
