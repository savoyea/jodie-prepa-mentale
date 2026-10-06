import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Nav from '../components/Nav.jsx';
import Footer from '../components/Footer.jsx';
import { Toast } from '../components/Toast.jsx';
import { useAdmin } from '../contexts/AdminContext.jsx';

function FloatingCTA() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  if (!visible || location.pathname === '/services') return null;

  return (
    <Link
      to="/services"
      className="fixed bottom-8 right-6 z-40 px-5 py-3 rounded-full text-sm"
      style={{
        background: 'var(--color-sage-dark)',
        color: 'var(--color-cream)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        animation: 'ctaPulse 2.5s ease-in-out infinite',
        boxShadow: '0 4px 20px rgba(163,22,33,0.35)',
      }}
    >
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
      <Toast toast={toast} />
    </div>
  );
}
