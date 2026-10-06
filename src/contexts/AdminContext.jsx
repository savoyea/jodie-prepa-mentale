import { createContext, useContext, useState } from 'react';
import { pb } from '../lib/pocketbase.js';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [auth, setAuth] = useState(() => pb.authStore.isValid);
  const [toast, setToast] = useState(null);

  const login = async (identifier, password) => {
    await pb.collection('users').authWithPassword(identifier, password);
    setAuth(true);
  };

  const logout = () => {
    pb.authStore.clear();
    setAuth(false);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <AdminContext.Provider value={{ auth, login, logout, toast, showToast }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
