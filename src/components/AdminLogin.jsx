import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { pb } from '../lib/pocketbase.js';

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handle = async () => {
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      await pb.collection('users').authWithPassword('jodie', password);
      setPassword('');
      onSuccess();
    } catch {
      setError('Mot de passe incorrect');
    } finally {
      setLoading(false);
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
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handle()}
            placeholder="Mot de passe"
            autoFocus
            className="w-full px-4 py-3 rounded-lg border outline-none transition-all"
            style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }}
          />
          {error && <p className="text-xs" style={{ color: 'var(--terracotta-dark)' }}>{error}</p>}
          <button
            onClick={handle}
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm uppercase tracking-widest font-mono transition-all hover:opacity-90"
            style={{ background: 'var(--ink)', color: 'var(--cream)', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Connexion…' : 'Entrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
