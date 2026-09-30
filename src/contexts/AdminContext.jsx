import { createContext, useContext, useState } from 'react';
import { pb } from '../lib/pocketbase.js';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [adminAuth, setAdminAuth] = useState(() => pb.authStore.isValid);
  const [toast, setToast] = useState(null);

  const login = async (email, password) => {
    await pb.collection('users').authWithPassword(email, password);
    setAdminAuth(true);
  };

  const logout = () => {
    pb.authStore.clear();
    setAdminAuth(false);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  return (
    <AdminContext.Provider value={{ adminAuth, login, logout, toast, showToast }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
