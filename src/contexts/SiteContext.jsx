import { createContext, useContext, useState, useEffect } from 'react';
import { loadSiteContent, saveSiteContent, loadServices, saveServices } from '../lib/storage.js';
import { DEFAULT_CONTENT, DEFAULT_SERVICES } from '../lib/defaults.js';

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([loadSiteContent(), loadServices()]).then(([c, s]) => {
      setContent(c);
      setServices(s);
      setLoaded(true);
      if (c.favicon) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
        link.href = c.favicon;
      }
      if (c.siteName) document.title = `${c.siteName} — ${c.tagline || 'Préparation mentale'}`;
    });
  }, []);

  const updateContent = async (updates) => {
    const next = { ...content, ...updates };
    setContent(next);
    await saveSiteContent(next);
  };

  const updateServices = async (next) => {
    setServices(next);
    await saveServices(next);
  };

  return (
    <SiteContext.Provider value={{ content, services, loaded, updateContent, updateServices }}>
      {children}
    </SiteContext.Provider>
  );
}

export const useSite = () => useContext(SiteContext);
