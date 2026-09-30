import { useSite } from '../contexts/SiteContext.jsx';

export default function Ethics() {
  const { content } = useSite();
  const principles = Array.isArray(content.ethicsPrinciples) ? content.ethicsPrinciples : [];
  const ethicsImg = content.ethicsImage || '/ethics-photo.png';
  const schemaImg = content.ethicsSchema || '/ethics-schema.png';

  return (
    <div>
      {/* Header */}
      <div className="py-16 px-6" style={{ background: 'var(--color-sage-dark)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-xs uppercase tracking-[0.3em] mb-4 font-mono" style={{ color: 'var(--color-sage)' }}>● Cadre</div>
          <h1 className="font-serif text-5xl md:text-6xl" style={{ color: 'var(--color-cream)' }}>{content.ethicsTitle}</h1>
        </div>
      </div>

      {/* Corps — bloc cramoisie gauche + image droite */}
      <div className="px-6 py-16" style={{ background: 'var(--color-cream)' }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-start">
          {/* Bloc SFPS */}
          <div className="rounded-2xl px-10 py-12 flex flex-col items-center text-center" style={{ background: 'var(--color-sage-dark)' }}>
            <h2 className="font-serif text-3xl md:text-4xl mb-6 leading-tight" style={{ color: 'var(--color-cream)' }}>{content.ethicsTitle}</h2>
            <p className="text-sm leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '38ch' }}>{content.ethicsText}</p>
            <div className="flex flex-col items-center gap-4 w-full">
              {principles.map((p, i) => (
                <span key={i} className="font-mono text-xs uppercase tracking-widest pb-1" style={{ color: 'var(--color-cream)', borderBottom: '1.5px solid rgba(255,255,255,0.5)' }}>
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
              style={{ border: '1px solid var(--color-line)' }}
            />
          </div>
        </div>
      </div>

      {/* Schéma pleine largeur */}
      <div className="px-6 pb-16" style={{ background: 'var(--color-cream)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-xs uppercase tracking-[0.3em] mb-6 font-mono" style={{ color: 'var(--color-sage-dark)' }}>● Schéma déontologique</div>
          <img
            src={schemaImg}
            alt="Schéma déontologique"
            className="rounded-2xl shadow-md object-contain mx-auto"
            style={{ border: '1px solid var(--color-line)', background: '#fff', maxWidth: '713px', width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
