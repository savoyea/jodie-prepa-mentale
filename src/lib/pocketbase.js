import PocketBase from 'pocketbase';

const PB_URL = import.meta.env.VITE_PB_URL || 'https://jodie.arsava.fr';

export const pb = new PocketBase(PB_URL);
export const isPbConfigured = true;
