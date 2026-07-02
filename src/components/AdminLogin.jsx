import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { pb } from '../lib/pocketbase.js';

const STORAGE_KEY = 'adm_guard';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const DELAYS_MS = [0, 500, 1000, 2000, 4000];

function getGuard() {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}
function setGuard(g) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(g));
}

export default function AdminLogin({ onSuccess }) {
  const [login, setLogin]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [countdown, setCountdown]     = useState(0);

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
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handle = async () => {
    if (!login || !password || loading) return;

    const g = getGuard();
    if (g.lockedUntil && Date.now() < g.lockedUntil) return;

    const attempts = g.attempts || 0;
    const delay = DELAYS_MS[Math.min(attempts, DELAYS_MS.length - 1)];
    if (delay > 0) await new Promise(r => setTimeout(r, delay));

    setLoading(true);
    setError('');

    try {
      await pb.collection('users').authWithPassword(login.trim(), password);
      setGuard({});
      onSuccess();
    } catch {
      const newAttempts = attempts + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MS;
        setGuard({ attempts: newAttempts, lockedUntil: until });
        setLockedUntil(until);
        setError('Trop de tentatives. Accès bloqué 15 minutes.');
      } else {
        setGuard({ attempts: newAttempts });
        setError('Identifiants incorrects.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isLocked = !!(lockedUntil && Date.now() < lockedUntil);
  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ background: 'var(--sage-light)' }}>
            <Lock size={20} style={{ color: 'var(--sage-dark)' }} />
          </div>
          <h1 className="font-display text-3xl mb-2">Espace administration</h1>
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Accès restreint</p>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={login}
            onChange={e => setLogin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handle()}
            placeholder="Identifiant"
            autoFocus
            autoComplete="username"
            disabled={isLocked}
            className="w-full px-4 py-3 rounded-lg border outline-none transition-all"
            style={{ background: 'var(--cream-light)', borderColor: 'var(--line)', opacity: isLocked ? 0.5 : 1 }}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handle()}
            placeholder="Mot de passe"
            autoComplete="current-password"
            disabled={isLocked}
            className="w-full px-4 py-3 rounded-lg border outline-none transition-all"
            style={{ background: 'var(--cream-light)', borderColor: 'var(--line)', opacity: isLocked ? 0.5 : 1 }}
          />

          {error && (
            <div className="text-xs px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>
              {error}
              {isLocked && countdown > 0 && (
                <span className="ml-1 font-mono">
                  ({mins > 0 ? `${mins}m ` : ''}{String(secs).padStart(2, '0')}s)
                </span>
              )}
            </div>
          )}

          <button
            onClick={handle}
            disabled={loading || isLocked}
            className="w-full py-3 rounded-lg text-sm uppercase tracking-widest font-mono transition-all hover:opacity-90"
            style={{ background: 'var(--ink)', color: 'var(--cream)', opacity: (loading || isLocked) ? 0.5 : 1 }}
          >
            {loading ? 'Vérification…' : isLocked ? 'Bloqué' : 'Connexion'}
          </button>
        </div>
      </div>
    </div>
  );
}
