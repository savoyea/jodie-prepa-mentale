import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { SiteProvider } from './contexts/SiteContext.jsx';
import { AdminProvider } from './contexts/AdminContext.jsx';
import { router } from './router.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminProvider>
      <SiteProvider>
        <RouterProvider router={router} />
      </SiteProvider>
    </AdminProvider>
  </StrictMode>
);
