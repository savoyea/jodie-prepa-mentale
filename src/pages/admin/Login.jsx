import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext.jsx';

const STORAGE_KEY = 'adm_guard';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const DELAYS_MS = [0, 500, 1000, 2000, 4000];
const getGuard = () => { try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } };
const setGuard = g => sessionStorage.setItem(STORAGE_KEY, JSON.stringify(g));

export default function AdminLogin() {
  const { adminAuth, login } = useAdmin();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const tick = () => {
      const g = getGuard();
      if (g.lockedUntil && Date.now() < g.lockedUntil) { setLockedUntil(g.lockedUntil); setCountdown(Math.ceil((g.lockedUntil - Date.now()) / 1000)); }
      else if (g.lockedUntil) { setGuard({}); setLockedUntil(null); setCountdown(0); setError(''); }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (adminAuth) return <Navigate to="/admin" replace />;

  const isLocked = !!(lockedUntil && Date.now() < lockedUntil);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!identifier || !password || loading || isLocked) return;
    const g = getGuard();
    if (g.lockedUntil && Date.now() < g.lockedUntil) return;
    const attempts = g.attempts || 0;
    const delay = DELAYS_MS[Math.min(attempts, DELAYS_MS.length - 1)];
    if (delay) await new Promise(r => setTimeout(r, delay));
    setLoading(true); setError('');
    try {
      await login(identifier.trim(), password);
      setGuard({});
    } catch {
      const n = attempts + 1;
      if (n >= MAX_ATTEMPTS) { const until = Date.now() + LOCKOUT_MS; setGuard({ attempts: n, lockedUntil: until }); setLockedUntil(until); setError('Trop de tentatives. Accès bloqué 15 minutes.'); }
      else { setGuard({ attempts: n }); setError('Identifiants incorrects.'); }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.3em] font-mono mb-2 text-ink-soft">Back-office</div>
          <h1 className="font-serif text-4xl text-ink">Administration</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-8 rounded-2xl bg-white border border-line shadow-sm">
          <div>
            <label className="text-xs uppercase tracking-widest font-mono mb-1.5 block text-ink-soft">Identifiant</label>
            <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} required disabled={isLocked}
              placeholder="identifiant" autoComplete="off" name="identifier" inputMode="text"
              className="w-full px-4 py-3 rounded-lg border outline-none"
              style={{ background: 'var(--color-cream-light)', borderColor: 'var(--color-line)', opacity: isLocked ? 0.5 : 1 }} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest font-mono mb-1.5 block text-ink-soft">Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLocked}
              placeholder="••••••••" autoComplete="current-password"
              className="w-full px-4 py-3 rounded-lg border outline-none"
              style={{ background: 'var(--color-cream-light)', borderColor: 'var(--color-line)', opacity: isLocked ? 0.5 : 1 }} />
          </div>
          {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>
            {error}{isLocked && countdown > 0 && ` (${Math.floor(countdown/60) > 0 ? Math.floor(countdown/60)+'m ' : ''}${String(countdown%60).padStart(2,'0')}s)`}
          </p>}
          <button type="submit" disabled={loading || isLocked}
            className="w-full py-3 rounded-full text-sm uppercase tracking-widest font-mono bg-sage-dark text-cream disabled:opacity-50 transition-opacity hover:opacity-90">
            {loading ? 'Connexion…' : isLocked ? 'Bloqué' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
