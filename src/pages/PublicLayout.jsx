import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import Footer from '../components/Footer.jsx';
import LocalBanner from '../components/LocalBanner.jsx';
import { Toast } from '../components/ui/Toast.jsx';
import { useAdmin } from '../contexts/AdminContext.jsx';

function FloatingCTA() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible || location.pathname === '/services') return null;

  return (
    <Link to="/services"
      className="fixed bottom-8 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full text-sm font-mono uppercase tracking-widest shadow-lg"
      style={{ background: 'var(--color-sage-dark)', color: 'var(--color-cream)', animation: 'ctaPulse 2.5s ease-in-out infinite', letterSpacing: '0.08em' }}>
      Réserver
    </Link>
  );
}

export default function PublicLayout() {
  const { toast } = useAdmin();
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-1 animate-fade-in" key={location.pathname}>
        <Outlet />
      </main>
      <Footer />
      <FloatingCTA />
      <LocalBanner />
      <Toast toast={toast} />
    </div>
  );
}
