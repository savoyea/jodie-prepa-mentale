import { createBrowserRouter } from 'react-router-dom';

import PublicLayout from './pages/PublicLayout.jsx';
import Home from './pages/Home.jsx';
import What from './pages/What.jsx';
import Ethics from './pages/Ethics.jsx';
import About from './pages/About.jsx';
import Services from './pages/Services.jsx';
import Contact from './pages/Contact.jsx';
import Legal from './pages/Legal.jsx';

import AdminLogin from './pages/admin/Login.jsx';
import AdminLayout from './pages/admin/Layout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Content from './pages/admin/Content.jsx';
import ServicesAdmin from './pages/admin/ServicesAdmin.jsx';
import Slots from './pages/admin/Slots.jsx';
import Bookings from './pages/admin/Bookings.jsx';
import Contacts from './pages/admin/Contacts.jsx';
import Settings from './pages/admin/Settings.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'demarche', element: <What /> },
      { path: 'charte', element: <Ethics /> },
      { path: 'a-propos', element: <About /> },
      { path: 'services', element: <Services /> },
      { path: 'contact', element: <Contact /> },
      { path: ':slug', element: <Legal /> },
    ],
  },
  { path: '/admin/login', element: <AdminLogin /> },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'contenu', element: <Content /> },
      { path: 'services', element: <ServicesAdmin /> },
      { path: 'planning', element: <Slots /> },
      { path: 'reservations', element: <Bookings /> },
      { path: 'messages', element: <Contacts /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);
