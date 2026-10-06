import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext.jsx';

const GUARD_KEY = 'adm_guard';
const MAX = 5;
const LOCKOUT = 15 * 60 * 1000;
const DELAYS = [0, 500, 1000, 2000, 4000];

const getGuard = () => { try { return JSON.parse(sessionStorage.getItem(GUARD_KEY)) || {}; } catch { return {}; } };
const setGuard = g => sessionStorage.setItem(GUARD_KEY, JSON.stringify(g));

export default function Login() {
  const { auth, login } = useAdmin();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const tick = () => {
      const g = getGuard();
      if (g.lockedUntil && Date.now() < g.lockedUntil) {
        setLockedUntil(g.lockedUntil);
        setCountdown(Math.ceil((g.lockedUntil - Date.now()) / 1000));
      } else if (g.lockedUntil) {
        setGuard({});
        setLockedUntil(null);
        setCountdown(0);
        setError('');
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  if (auth) return <Navigate to="/admin" replace />;

  const locked = !!(lockedUntil && Date.now() < lockedUntil);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!id || !pw || loading || locked) return;
    const g = getGuard();
    if (g.lockedUntil && Date.now() < g.lockedUntil) return;
    const attempts = g.attempts || 0;
    const delay = DELAYS[Math.min(attempts, DELAYS.length - 1)];
    if (delay) await new Promise(r => setTimeout(r, delay));
    setLoading(true);
    setError('');
    try {
      await login(id.trim(), pw);
      setGuard({});
    } catch {
      const n = attempts + 1;
      if (n >= MAX) {
        const until = Date.now() + LOCKOUT;
        setGuard({ attempts: n, lockedUntil: until });
        setLockedUntil(until);
        setError('Trop de tentatives. Accès bloqué 15 minutes.');
      } else {
        setGuard({ attempts: n });
        setError('Identifiants incorrects.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fmtCountdown = () => {
    const m = Math.floor(countdown / 60);
    const s = String(countdown % 60).padStart(2, '0');
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--color-cream)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'var(--color-sage-light)' }}
          >
            <Lock size={24} style={{ color: 'var(--color-sage-dark)' }} />
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--color-ink-soft)', marginBottom: '0.5rem' }}>
            Back-office
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 400, color: 'var(--color-ink)' }}>
            Espace administration
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-ink-soft)', marginTop: '0.25rem' }}>Accès restreint</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl p-8"
          style={{ background: '#fff', border: '1px solid var(--color-line)' }}
        >
          <div>
            <input
              type="text"
              value={id}
              onChange={e => setId(e.target.value)}
              placeholder="Identifiant"
              required
              disabled={locked}
              autoComplete="off"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--color-line)',
                background: 'var(--color-cream-light)',
                fontSize: '0.95rem',
                outline: 'none',
                opacity: locked ? 0.5 : 1,
              }}
            />
          </div>
          <div>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="Mot de passe"
              required
              disabled={locked}
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--color-line)',
                background: 'var(--color-cream-light)',
                fontSize: '0.95rem',
                outline: 'none',
                opacity: locked ? 0.5 : 1,
              }}
            />
          </div>
          {error && (
            <div
              className="px-3 py-2 rounded-lg text-sm"
              style={{ background: '#fee2e2', color: '#991b1b', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
            >
              {error}{locked && countdown > 0 && ` (${fmtCountdown()})`}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || locked}
            className="w-full py-4 rounded-full"
            style={{
              background: 'var(--color-ink)',
              color: '#fff',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              opacity: loading || locked ? 0.6 : 1,
              cursor: loading || locked ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Connexion…' : locked ? 'Bloqué' : 'Connexion'}
          </button>
        </form>
      </div>
    </div>
  );
}
