import { useState } from 'react';

/* CSS injected once for Quill-rendered HTML */
const QUILL_CSS = `
.ql-content p { margin-bottom: 0.5rem; line-height: 1.7; }
.ql-content p:last-child { margin-bottom: 0; }
.ql-content p:empty { margin: 0; line-height: 0; height: 0; font-size: 0; }
.ql-content p > br:only-child { display: block; content: ''; margin: 0; }
.ql-content strong { font-weight: 700; }
.ql-content em { font-style: italic; }
.ql-content h2 { font-family: var(--font-serif); font-size: 1.6rem; font-weight: 400; margin: 1.25rem 0 0.5rem; }
.ql-content ol, .ql-content ul { padding-left: 1.5rem; margin-bottom: 0.75rem; }
.ql-content li { margin-bottom: 0.25rem; line-height: 1.7; }
.ql-content ol li[data-list="bullet"] { list-style-type: disc; }
.ql-content ol li[data-list="ordered"] { list-style-type: decimal; }
.ql-content .ql-ui { display: none; }
.ql-content .ql-align-justify { text-align: justify; }
.ql-content .ql-align-center { text-align: center; }
.ql-content .ql-align-right { text-align: right; }
`;

let cssInjected = false;
function injectCss() {
  if (cssInjected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.textContent = QUILL_CSS;
  document.head.appendChild(el);
  cssInjected = true;
}

function RichText({ html, style, className = '' }) {
  injectCss();
  return (
    <div
      className={`ql-content ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: html || '' }}
    />
  );
}

function AccordionItem({ item, light }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${light ? 'rgba(255,255,255,0.15)' : 'var(--color-line)'}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span style={{ fontSize: '0.95rem', fontWeight: 500, color: light ? 'var(--color-cream)' : 'var(--color-ink)' }}>
          {item.title}
        </span>
        <span style={{ color: light ? 'rgba(255,255,255,0.5)' : 'var(--color-ink-soft)', fontSize: '1.2rem', flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none', display: 'inline-block' }}>+</span>
      </button>
      {open && item.text && (
        <p className="pb-4 text-sm leading-relaxed" style={{ color: light ? 'rgba(255,255,255,0.75)' : 'var(--color-ink-soft)' }}>{item.text}</p>
      )}
    </div>
  );
}

function SectionBody({ section, light }) {
  const { layout, rendu: _, text, title, image, encartItems = [] } = section;
  const textColor = light ? 'rgba(255,255,255,0.85)' : 'var(--color-ink-soft)';
  const titleColor = light ? 'var(--color-cream)' : 'var(--color-ink)';

  const textBlock = (
    <div className="flex-1">
      {title && (
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 400, color: titleColor, marginBottom: '1rem' }}>
          {title}
        </h2>
      )}
      <RichText html={text} style={{ color: textColor }} />
      {encartItems.length > 0 && (
        <div className="mt-4">
          {encartItems.map((item, i) => <AccordionItem key={i} item={item} light={light} />)}
        </div>
      )}
    </div>
  );

  const imgEl = image && (
    <div className="flex-shrink-0 w-full md:w-80">
      <img src={image} alt={title || ''} className="w-full rounded-2xl object-cover" style={{ maxHeight: 320 }} />
    </div>
  );

  if (layout === 'image-right') return <div className="flex flex-col md:flex-row gap-8 items-start">{textBlock}{imgEl}</div>;
  if (layout === 'image-left')  return <div className="flex flex-col md:flex-row-reverse gap-8 items-start">{textBlock}{imgEl}</div>;
  if (layout === 'image-top')   return <div>{imgEl && <div className="mb-6">{imgEl}</div>}{textBlock}</div>;
  if (layout === 'image-bottom')return <div>{textBlock}{imgEl && <div className="mt-6">{imgEl}</div>}</div>;

  return textBlock;
}

export function Section({ section }) {
  const { rendu, layout } = section;

  if (rendu === 'accentue') {
    return (
      <section className="py-16 px-6" style={{ background: 'var(--color-sage-dark)' }}>
        <div className="max-w-4xl mx-auto">
          <SectionBody section={section} light />
        </div>
      </section>
    );
  }

  if (rendu === 'citation') {
    return (
      <section className="py-16 px-6" style={{ background: 'var(--color-cream)' }}>
        <div className="max-w-3xl mx-auto text-center">
          {section.title && (
            <p className="text-xs uppercase tracking-widest font-mono mb-4" style={{ color: 'var(--color-sage-dark)' }}>{section.title}</p>
          )}
          <RichText html={section.text} style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontStyle: 'italic', color: 'var(--color-ink)', lineHeight: 1.5 }} />
        </div>
      </section>
    );
  }

  if (rendu === 'encadre') {
    return (
      <section className="py-12 px-6" style={{ background: 'var(--color-cream-light)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="p-8 rounded-xl" style={{
            background: '#fff',
            border: '1px solid var(--color-line)',
            borderLeft: '4px solid var(--color-sage-dark)',
          }}>
            <SectionBody section={section} light={false} />
          </div>
        </div>
      </section>
    );
  }

  // brut (default)
  return (
    <section className="py-12 px-6" style={{ background: 'var(--color-cream-light)' }}>
      <div className="max-w-4xl mx-auto">
        <SectionBody section={section} light={false} />
      </div>
    </section>
  );
}

export function Sections({ sections = [], position }) {
  const filtered = sections.filter(s => s.position === position);
  if (!filtered.length) return null;
  return <>{filtered.map((s, i) => <Section key={s.id || i} section={s} />)}</>;
}
