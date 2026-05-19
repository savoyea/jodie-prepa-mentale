import React from 'react';
import { Lock } from 'lucide-react';

export default function AdminLogin({ authInput, setAuthInput, authError, setAuthError, onSuccess }) {
  const handle = () => {
    if (authInput === 'jodie') {
      setAuthError('');
      setAuthInput('');
      onSuccess();
    } else {
      setAuthError('Mot de passe incorrect');
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ background: 'var(--sage-light)' }}>
            <Lock size={20} style={{ color: 'var(--sage-dark)' }} />
          </div>
          <h1 className="font-display text-3xl mb-2">Espace administration</h1>
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Connectez-vous pour gérer votre site</p>
        </div>
        <div className="space-y-3">
          <input
            type="password"
            value={authInput}
            onChange={(e) => setAuthInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handle()}
            placeholder="Mot de passe"
            autoFocus
            className="w-full px-4 py-3 rounded-lg border outline-none transition-all"
            style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }}
          />
          {authError && <p className="text-xs" style={{ color: 'var(--terracotta-dark)' }}>{authError}</p>}
          <button
            onClick={handle}
            className="w-full py-3 rounded-lg text-sm uppercase tracking-widest font-mono transition-all hover:opacity-90"
            style={{ background: 'var(--ink)', color: 'var(--cream)' }}
          >
            Entrer
          </button>
          <p className="text-xs text-center mt-4 font-mono" style={{ color: 'var(--ink-soft)' }}>
            Démo : mot de passe = <span style={{ color: 'var(--terracotta-dark)' }}>jodie</span>
          </p>
        </div>
      </div>
    </div>
  );
}
