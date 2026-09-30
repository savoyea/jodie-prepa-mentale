import { pb } from './pocketbase.js';
import { DEFAULT_CONTENT, DEFAULT_SERVICES, DEFAULT_APP_SETTINGS } from './defaults.js';

async function pbGet(key, fallback) {
  try {
    const rows = await pb.collection('settings').getFullList({ filter: `key = "${key}"`, requestKey: `get-${key}` });
    if (rows.length && rows[0].value != null) return rows[0].value;
  } catch {}
  try {
    const v = localStorage.getItem('jodie_' + key);
    if (v) return JSON.parse(v);
  } catch {}
  return fallback;
}

async function pbSet(key, value) {
  try {
    const rows = await pb.collection('settings').getFullList({ filter: `key = "${key}"`, requestKey: `set-${key}` });
    if (rows.length) await pb.collection('settings').update(rows[0].id, { value });
    else await pb.collection('settings').create({ key, value });
  } catch {}
  try { localStorage.setItem('jodie_' + key, JSON.stringify(value)); } catch {}
}

export async function loadSiteContent() {
  const data = await pbGet('content', {});
  return { ...DEFAULT_CONTENT, ...data };
}

export async function saveSiteContent(content) {
  await pbSet('content', content);
}

export async function loadServices() {
  return pbGet('services', DEFAULT_SERVICES);
}

export async function saveServices(services) {
  return pbSet('services', services);
}

export async function loadSlots() {
  return pbGet('slots', []);
}

export async function saveSlots(slots) {
  return pbSet('slots', slots);
}

export async function loadBookings() {
  return pbGet('bookings', []);
}

export async function saveBookings(bookings) {
  return pbSet('bookings', bookings);
}

export async function loadContacts() {
  return pbGet('contacts', []);
}

export async function saveContacts(contacts) {
  return pbSet('contacts', contacts);
}

export async function loadAppSettings() {
  const data = await pbGet('appSettings', {});
  return { ...DEFAULT_APP_SETTINGS, ...data };
}

export async function saveAppSettings(settings) {
  return pbSet('appSettings', settings);
}
