import { isPbLocal } from '../lib/pocketbase.js';

export default function LocalBanner() {
  if (!isPbLocal) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[9998] flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono shadow-lg"
      style={{ background: 'rgba(20,10,10,0.88)', color: '#88ff88', backdropFilter: 'blur(12px)', border: '1px solid rgba(136,255,136,0.3)' }}>
      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      LOCAL · PocketBase 8090
    </div>
  );
}
