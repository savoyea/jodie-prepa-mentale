import { createContext, useContext, useState, useEffect } from 'react';
import { pb } from '../lib/pocketbase.js';

const SiteContext = createContext(null);

const THEME_VARS = {
  colorInk:       '--color-ink',
  colorSageDark:  '--color-sage-dark',
  colorCream:     '--color-cream',
  colorCreamLight:'--color-cream-light',
  colorSageLight: '--color-sage-light',
  colorSage:      '--color-sage',
  colorLine:      '--color-line',
  colorInkSoft:   '--color-ink-soft',
};

export function applyTheme(theme = {}) {
  Object.entries(THEME_VARS).forEach(([key, cssVar]) => {
    if (theme[key]) document.documentElement.style.setProperty(cssVar, theme[key]);
    else document.documentElement.style.removeProperty(cssVar);
  });
}

export function SiteProvider({ children }) {
  const [content, setContent] = useState({});
  const [services, setServices] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      pb.collection('site_content').getFirstListItem('section="global"').catch(() => null),
      pb.collection('services').getFullList({ sort: 'sort_order', filter: 'active=true' }).catch(() => []),
      pb.collection('pages').getFullList({ filter: 'status="published" && nav_position!="none"', sort: 'nav_order' }).catch(() => []),
      pb.collection('app_settings').getFirstListItem('key="theme"').catch(() => null),
    ]).then(([siteContent, svcList, pageList, themeRecord]) => {
      setContent(siteContent?.data || {});
      setServices(svcList);
      setPages(pageList);
      applyTheme(themeRecord?.value || {});
    }).finally(() => setLoading(false));
  }, []);

  const refresh = async () => {
    const [siteContent, svcList, pageList] = await Promise.all([
      pb.collection('site_content').getFirstListItem('section="global"').catch(() => null),
      pb.collection('services').getFullList({ sort: 'sort_order', filter: 'active=true' }).catch(() => []),
      pb.collection('pages').getFullList({ filter: 'status="published" && nav_position!="none"', sort: 'nav_order' }).catch(() => []),
    ]);
    setContent(siteContent?.data || {});
    setServices(svcList);
    setPages(pageList);
  };

  return (
    <SiteContext.Provider value={{ content, services, pages, loading, refresh }}>
      {children}
    </SiteContext.Provider>
  );
}

export const useSite = () => useContext(SiteContext);
