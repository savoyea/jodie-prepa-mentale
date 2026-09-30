import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, ArrowDown } from 'lucide-react';
import { useSite } from '../contexts/SiteContext.jsx';
import { DEFAULT_GOOGLE_REVIEWS } from '../lib/defaults.js';

function AnimatedCounter({ target, suffix = '' }) {
  const [n, setN] = useState(0);
  const elRef = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = elRef.current;
    if (!el || !target) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1500;
        const start = Date.now();
        const tick = () => {
          const progress = Math.min((Date.now() - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setN(Math.round(ease * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={elRef}>{n}{suffix}</span>;
}

function StarRating({ rating, size = 18 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= rating ? '#FBBC04' : 'none'} stroke={i <= rating ? '#FBBC04' : '#ccc'} strokeWidth="1.5">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}

function GoogleReviewsSection({ content }) {
  const [reviews, setReviews] = useState(null);
  const [placeInfo, setPlaceInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const isConfigured = content.googleApiKey && content.googlePlaceId;
  const displayReviews = reviews ?? (isConfigured ? [] : DEFAULT_GOOGLE_REVIEWS);

  const next = useCallback(() => setCurrent(c => (c + 1) % Math.max(displayReviews.length, 1)), [displayReviews.length]);
  const prev = () => setCurrent(c => (c - 1 + displayReviews.length) % displayReviews.length);

  useEffect(() => {
    if (!displayReviews.length) return;
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [next, displayReviews.length]);

  useEffect(() => {
    if (!isConfigured) return;
    setLoading(true);

    const fetchWithSdk = async () => {
      try {
        const { Place } = await window.google.maps.importLibrary('places');
        const place = new Place({ id: content.googlePlaceId });
        await place.fetchFields({ fields: ['displayName', 'rating', 'userRatingCount', 'reviews'] });
        const normalized = (place.reviews || []).map(r => ({
          author_name: r.authorAttribution?.displayName || '',
          profile_photo_url: r.authorAttribution?.photoUri || r.authorAttribution?.photoURI || '',
          rating: r.rating,
          text: typeof r.text === 'object' ? (r.text?.text || '') : (r.text || ''),
          relative_time_description: r.relativePublishTimeDescription || '',
        }));
        setReviews(normalized);
        setPlaceInfo({ name: place.displayName, rating: place.rating, total: place.userRatingCount });
        setLoading(false);
      } catch {
        setLoading(false);
        setReviews(DEFAULT_GOOGLE_REVIEWS);
      }
    };

    const scriptId = 'gmap-places-sdk';
    const existing = document.getElementById(scriptId);
    if (existing && window.google?.maps?.importLibrary) {
      fetchWithSdk();
    } else {
      if (existing) existing.remove();
      window.__gmapPlacesReady__ = fetchWithSdk;
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = `https://maps.googleapis.com/maps/api/js?key=${content.googleApiKey}&loading=async&callback=__gmapPlacesReady__`;
      s.async = true;
      s.onerror = () => { setLoading(false); setReviews(DEFAULT_GOOGLE_REVIEWS); };
      document.head.appendChild(s);
    }
  }, [content.googleApiKey, content.googlePlaceId, isConfigured]);

  if (isConfigured && loading) {
    return (
      <section className="py-20 px-6 text-center" style={{ background: 'var(--color-cream-light)' }}>
        <div className="text-sm font-mono" style={{ color: 'var(--color-ink-soft)' }}>Chargement des avis Google…</div>
      </section>
    );
  }

  if (!displayReviews.length) return null;

  const r = displayReviews[current];
  const avgRating = isConfigured && placeInfo ? placeInfo.rating : 5.0;
  const totalReviews = isConfigured && placeInfo ? placeInfo.total : null;

  return (
    <section className="py-20 px-6" style={{ background: 'var(--color-cream-light)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="flex items-center gap-2 mb-3">
            <svg width="28" height="28" viewBox="0 0 24 24" aria-label="Google">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-serif text-2xl">Avis Google</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-serif text-5xl font-light">{typeof avgRating === 'number' ? avgRating.toFixed(1) : '5.0'}</span>
            <div>
              <StarRating rating={Math.round(avgRating)} size={20} />
              {totalReviews && <div className="text-xs font-mono mt-1" style={{ color: 'var(--color-ink-soft)' }}>{totalReviews} avis</div>}
              {!isConfigured && <div className="text-xs font-mono mt-1" style={{ color: 'var(--color-ink-soft)' }}>Aperçu — configurez dans le BO</div>}
            </div>
          </div>
        </div>

        {r && (
          <div className="relative">
            <div className="p-8 rounded-2xl text-center" style={{ minHeight: 200, background: 'var(--color-cream)', border: '1px solid var(--color-line)' }}>
              <div className="flex justify-center mb-4"><StarRating rating={r.rating} /></div>
              <p className="text-base leading-relaxed mb-6 italic" style={{ maxWidth: '52ch', margin: '0 auto 1.5rem', color: 'var(--color-ink-soft)' }}>
                « {r.text} »
              </p>
              <div className="flex items-center justify-center gap-3">
                {r.profile_photo_url ? (
                  <img src={r.profile_photo_url} alt={r.author_name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-serif" style={{ background: 'var(--color-sage-dark)', color: 'var(--color-cream)' }}>
                    {r.author_name.charAt(0)}
                  </div>
                )}
                <div className="text-left">
                  <div className="font-serif text-base">{r.author_name}</div>
                  {r.relative_time_description && <div className="text-xs font-mono" style={{ color: 'var(--color-ink-soft)' }}>{r.relative_time_description}</div>}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-6">
              <button onClick={prev} className="p-2 rounded-full border transition-all hover:opacity-70" style={{ borderColor: 'var(--color-line)' }}><ChevronLeft size={16} /></button>
              <div className="flex gap-2">
                {displayReviews.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)} className="w-2 h-2 rounded-full transition-all"
                    style={{ background: i === current ? 'var(--color-sage-dark)' : 'var(--color-line)', transform: i === current ? 'scale(1.3)' : 'scale(1)' }} />
                ))}
              </div>
              <button onClick={next} className="p-2 rounded-full border transition-all hover:opacity-70" style={{ borderColor: 'var(--color-line)' }}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function SocialIcons({ links, light }) {
  const color = light ? 'rgba(255,255,255,0.75)' : 'var(--color-ink-soft)';
  const hoverColor = light ? '#fff' : 'var(--color-ink)';
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

function ServiceCard({ service, index }) {
  const colorMap = { sage: 'var(--color-sage)', terracotta: 'var(--color-sage-dark)', ochre: 'var(--color-ochre)', olive: 'var(--color-olive)' };
  return (
    <Link to="/services" className="relative overflow-hidden block text-left p-7 rounded-2xl transition-all hover:-translate-y-2 hover:shadow-2xl group" style={{ background: 'var(--color-cream-light)', border: '1.5px solid var(--color-line)' }}>
      <div className="absolute top-4 right-5 font-serif font-bold select-none pointer-events-none" style={{ fontSize: '5rem', color: 'var(--color-sage)', opacity: 0.18, lineHeight: 1 }}>
        {String(index + 1).padStart(2, '0')}
      </div>
      <div className="w-10 h-10 rounded-full mb-5 transition-transform group-hover:scale-110" style={{ background: colorMap[service.color] || 'var(--color-sage)' }} />
      <h3 className="font-serif text-xl mb-2" style={{ color: 'var(--color-ink)' }}>{service.name}</h3>
      <div className="flex flex-wrap items-center gap-2 text-xs mb-3 font-mono" style={{ color: 'var(--color-ink-soft)' }}>
        {!service.surDevis && <span className="flex items-center gap-1"><Clock size={11} /> {service.duration} min</span>}
        <span className="font-semibold" style={{ color: 'var(--color-sage-dark)' }}>{service.priceLabel}</span>
      </div>
      <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--color-ink-soft)' }}>{service.description}</p>
      <div className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--color-sage-dark)' }}>Choisir →</div>
    </Link>
  );
}

export default function Home() {
  const { content, services } = useSite();

  const words = (content.heroTitle || '').split('\n').flatMap((line, lineIdx) =>
    line.split(' ').map((word, wordIdx) => ({ word, italic: lineIdx === 1, key: `${lineIdx}-${wordIdx}` }))
  );

  return (
    <div>
      {/* Hero — fullscreen avec nav overlay */}
      <section className="relative overflow-hidden flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
        {content.heroImage && <img src={content.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0" style={{
          background: content.heroImage
            ? 'linear-gradient(to bottom, rgba(10,5,5,0.6) 0%, rgba(10,5,5,0.4) 55%, rgba(10,5,5,0.75) 100%)'
            : 'linear-gradient(150deg, var(--color-ink) 0%, #3d0c12 100%)'
        }} />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="hero-label text-xs uppercase font-mono mb-8" style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.4em', animationDelay: '0.1s' }}>
            {content.tagline}
          </div>
          <h1 className="font-serif leading-[1.0] mb-8" style={{ fontSize: 'clamp(4rem, 10vw, 9rem)', color: '#fff' }}>
            {words.map(({ word, italic, key }, i) => (
              <span key={key} className="hero-word inline-block mr-[0.2em]"
                style={{ fontStyle: italic ? 'italic' : 'normal', color: italic ? 'var(--color-sage)' : '#fff', animationDelay: `${0.2 + i * 0.1}s` }}>
                {word}
              </span>
            ))}
          </h1>
          <p className="hero-label text-lg md:text-xl mb-10 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.72)', animationDelay: '0.6s' }}>
            {content.heroSubtitle}
          </p>
          <div className="hero-label flex flex-wrap gap-4 justify-center mb-12" style={{ animationDelay: '0.8s' }}>
            <Link to="/services" className="px-8 py-4 rounded-full text-sm uppercase font-mono tracking-widest transition-all hover:opacity-90" style={{ background: 'var(--color-sage-dark)', color: '#fff', letterSpacing: '0.1em' }}>
              Réserver un appel
            </Link>
            <Link to="/demarche" className="px-8 py-4 rounded-full text-sm uppercase font-mono tracking-widest transition-all" style={{ border: '1px solid rgba(255,255,255,0.4)', color: '#fff', letterSpacing: '0.1em' }}>
              En savoir plus
            </Link>
          </div>
          <div className="flex justify-center">
            <SocialIcons links={content.socialLinks} light />
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>Défiler</span>
          <ArrowDown size={20} style={{ color: 'rgba(255,255,255,0.4)' }} />
        </div>
      </section>

      {/* Stats band — juste après hero */}
      {content.stats && (
        <section className="py-16 px-6" style={{ background: 'var(--color-sage-dark)' }}>
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: content.stats.clients, suffix: '+', label: 'clients accompagnés' },
              { value: content.stats.years, suffix: ' ans', label: "d'expérience" },
              { value: content.stats.satisfaction, suffix: '%', label: 'de satisfaction' },
              { value: content.stats.specialties, suffix: '', label: 'spécialités' },
            ].map((s, i) => (
              <div key={i} className="px-4">
                <div className="font-serif leading-none mb-2" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: 'var(--color-cream)' }}>
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-xs uppercase tracking-widest font-mono" style={{ color: 'rgba(252,247,248,0.6)', letterSpacing: '0.15em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Citation — fond crème clair, texte foncé */}
      <section className="py-20 px-6" style={{ background: 'var(--color-cream-light)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-serif italic leading-relaxed" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: 'var(--color-ink)' }}>
            {content.heroQuote}
          </p>
          <div className="mt-8 w-16 h-px mx-auto" style={{ background: 'var(--color-sage-dark)' }} />
        </div>
      </section>

      {/* Services */}
      {services.length > 0 && (
        <section className="py-20 px-6" style={{ background: 'var(--color-cream)' }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-block text-xs uppercase tracking-[0.3em] px-4 py-1 rounded-full mb-5 font-mono" style={{ background: 'var(--color-sage-dark)', color: 'var(--color-cream)' }}>Accompagnement</div>
              <h2 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>Trouvez la formule qui vous correspond</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {services.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* Pour qui */}
      <section className="py-20 px-6" style={{ background: 'var(--color-cream-light)' }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] mb-5 font-mono" style={{ color: 'var(--color-sage-dark)', letterSpacing: '0.2em' }}>● Comprendre</div>
            <h2 className="font-serif mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--color-ink)' }}>Pourquoi la préparation mentale ?</h2>
            {content.whatIsText ? (
              <div className="text-base leading-relaxed mb-8" style={{ color: 'var(--color-ink-soft)' }} dangerouslySetInnerHTML={{ __html: content.whatIsText }} />
            ) : (
              <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--color-ink-soft)' }}>{content.whatDistinctionText || ''}</p>
            )}
            <Link to="/services" className="inline-block px-7 py-3.5 rounded-full text-xs font-mono uppercase tracking-widest transition-all hover:opacity-90" style={{ background: 'var(--color-sage-dark)', color: 'var(--color-cream)', letterSpacing: '0.1em' }}>
              Commencer maintenant
            </Link>
          </div>
          <div className="space-y-4">
            {(content.forWhomItems || []).map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-xl" style={{ background: 'var(--color-cream)', border: '1px solid var(--color-line)' }}>
                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5" style={{ background: 'var(--color-sage-dark)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <div className="font-serif text-lg mb-1" style={{ color: 'var(--color-ink)' }}>{item.title}</div>
                  <div className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>{item.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Reviews */}
      <GoogleReviewsSection content={content} />
    </div>
  );
}
