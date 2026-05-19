import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANT : remplacez 'jodie-prepa-mentale' par le nom EXACT de votre repo GitHub
// Si vous déployez sur Netlify/Vercel, vous pouvez mettre base: '/'
export default defineConfig({
  plugins: [react()],
  base: '/jodie-prepa-mentale/',
});
