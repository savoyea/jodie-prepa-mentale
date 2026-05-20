import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Users, Settings, FileText, Plus, Trash2, Edit2, Save, Check, Clock, Phone, Mail, X, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { addMinutes, SLOT_DURATIONS, toLocalDateStr } from '../utils.js';
import { isSupabaseConfigured } from '../lib/supabase.js';
import { sendEmail, fillTemplate } from '../lib/email.js';

export default function AdminPanel({ adminPage, setAdminPage, content, updateContent, services, updateServices, slots, updateSlots, bookings, updateBookings, contacts, updateContacts, appSettings, updateAppSettings, showToast, onExportAll }) {
  const unreadContacts = (contacts || []).filter(c => !c.read).length;
  const menu = [
    { id: 'planning', label: 'Planning', icon: <Calendar size={16} /> },
    { id: 'services', label: 'Services', icon: <Settings size={16} /> },
    { id: 'bookings', label: 'Réservations', icon: <Users size={16} /> },
    { id: 'messages', label: 'Messages', icon: <Mail size={16} />, badge: unreadContacts },
    { id: 'content', label: 'Contenu du site', icon: <FileText size={16} /> },
    { id: 'settings', label: 'Paramètres', icon: <Lock size={16} /> },
  ];
  const stats = {
    upcomingBookings: bookings.filter(b => b.status !== 'annulé').length,
    availableSlots: slots.filter(s => s.available).length,
    servicesCount: services.length,
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream-light)' }}>
      <div className="border-b" style={{ borderColor: 'var(--line)', background: 'var(--cream)' }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--terracotta-dark)' }}>
              <Settings size={16} style={{ color: 'var(--cream)' }} />
            </div>
            <div>
              <div className="font-display text-xl leading-none">Admin · Jodie Peltier</div>
              <div className="text-[10px] uppercase tracking-[0.2em] mt-1" style={{ color: 'var(--ink-soft)' }}>Tableau de bord</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs">
            <Stat label="Réservations" value={stats.upcomingBookings} />
            <Stat label="Créneaux libres" value={stats.availableSlots} />
            <Stat label="Services" value={stats.servicesCount} />
            {onExportAll && (
              <button onClick={onExportAll} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all hover:opacity-90" style={{ background: 'var(--sage-dark)', color: 'var(--cream)' }}>
                <Save size={12} /> Tout exporter vers Supabase
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-[200px_1fr] gap-8">
        <aside>
          <div className="space-y-1 sticky top-6">
            {menu.map(m => (
              <button
                key={m.id}
                onClick={() => setAdminPage(m.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all text-left"
                style={{
                  background: adminPage === m.id ? 'var(--ink)' : 'transparent',
                  color: adminPage === m.id ? 'var(--cream)' : 'var(--ink-soft)'
                }}
              >
                {m.icon} {m.label}
                {m.badge > 0 && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-mono" style={{ background: 'var(--sage-dark)', color: 'var(--cream)' }}>{m.badge}</span>}
              </button>
            ))}
          </div>
        </aside>

        <main className="fade-in" key={adminPage}>
          {adminPage === 'planning' && <AdminPlanning slots={slots} updateSlots={updateSlots} bookings={bookings} updateBookings={updateBookings} services={services} showToast={showToast} />}
          {adminPage === 'services' && <AdminServices services={services} updateServices={updateServices} showToast={showToast} />}
          {adminPage === 'bookings' && <AdminBookings bookings={bookings} updateBookings={updateBookings} services={services} slots={slots} updateSlots={updateSlots} showToast={showToast} content={content} appSettings={appSettings} />}
          {adminPage === 'messages' && <AdminMessages contacts={contacts} updateContacts={updateContacts} content={content} appSettings={appSettings} showToast={showToast} />}
          {adminPage === 'content' && <AdminContent content={content} updateContent={updateContent} showToast={showToast} />}
          {adminPage === 'settings' && <AdminSettings appSettings={appSettings} updateAppSettings={updateAppSettings} showToast={showToast} />}
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-right">
      <div className="font-display text-2xl leading-none">{value}</div>
      <div className="text-[10px] uppercase tracking-widest mt-1" style={{ color: 'var(--ink-soft)' }}>{label}</div>
    </div>
  );
}

function BookingDetailModal({ booking, service, onClose, onConfirm, onCancel }) {
  if (!booking) return null;
  const statusColor = { 'en attente': 'var(--ochre)', 'confirmé': 'var(--sage-dark)', 'annulé': 'var(--terracotta-dark)' };
  const endTime = service ? addMinutes(booking.time, service.duration) : null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(42,42,38,0.55)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-6 fade-in" style={{ background: 'var(--cream)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="font-display text-3xl mb-1">{booking.clientName}</div>
            <div className="inline-flex items-center text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: statusColor[booking.status] || 'var(--line)', color: 'var(--cream)' }}>
              {booking.status}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:opacity-60" style={{ color: 'var(--ink-soft)' }}><X size={16} /></button>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl mb-4" style={{ background: 'var(--cream-light)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--terracotta)' }}>
            <Clock size={16} style={{ color: 'var(--cream)' }} />
          </div>
          <div>
            <div className="font-mono text-lg font-semibold" style={{ color: 'var(--ink)' }}>
              {booking.time}{endTime ? ` → ${endTime}` : ''}
            </div>
            <div className="text-xs" style={{ color: 'var(--ink-soft)' }}>
              {booking.date ? new Date(booking.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
            </div>
          </div>
        </div>

        {service && (
          <div className="flex items-center gap-3 p-4 rounded-xl mb-4" style={{ background: 'var(--cream-light)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--sage)' }}>
              <FileText size={16} style={{ color: 'var(--cream)' }} />
            </div>
            <div>
              <div className="font-display text-lg">{service.name}</div>
              <div className="text-xs font-mono" style={{ color: 'var(--ink-soft)' }}>{service.duration} min · {service.priceLabel}</div>
            </div>
          </div>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail size={14} style={{ color: 'var(--ink-soft)', flexShrink: 0 }} />
            <span>{booking.clientEmail}</span>
          </div>
          {booking.clientPhone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone size={14} style={{ color: 'var(--ink-soft)', flexShrink: 0 }} />
              <span>{booking.clientPhone}</span>
            </div>
          )}
        </div>

        {booking.note && (
          <div className="p-4 rounded-xl mb-5 text-sm italic" style={{ background: 'var(--cream-light)', color: 'var(--ink-soft)' }}>
            « {booking.note} »
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t" style={{ borderColor: 'var(--line)' }}>
          {booking.status !== 'confirmé' && (
            <button onClick={() => { onConfirm(booking.id); onClose(); }} className="flex-1 py-2 rounded-full text-xs font-mono uppercase tracking-widest" style={{ background: 'var(--sage-dark)', color: 'var(--cream)' }}>
              Confirmer
            </button>
          )}
          {booking.status !== 'annulé' && (
            <button onClick={() => { onCancel(booking.id); onClose(); }} className="flex-1 py-2 rounded-full text-xs font-mono uppercase tracking-widest border" style={{ borderColor: 'var(--line)', color: 'var(--ink-soft)' }}>
              Annuler
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest" style={{ background: 'var(--cream-light)', color: 'var(--ink-soft)' }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function NewBookingModal({ slot, services, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '', serviceId: '', status: 'confirmé' });

  useEffect(() => {
    if (slot) setForm({ name: '', email: '', phone: '', note: '', serviceId: services[0]?.id || '', status: 'confirmé' });
  }, [slot]);

  if (!slot) return null;

  const endTime = slot.duration ? addMinutes(slot.time, slot.duration) : null;

  const handleSubmit = () => {
    if (!form.name) return;
    onSubmit({
      id: 'b' + Date.now(),
      clientName: form.name,
      clientEmail: form.email,
      clientPhone: form.phone,
      serviceId: form.serviceId,
      date: slot.date,
      time: slot.time,
      status: form.status,
      note: form.note,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(42,42,38,0.55)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-6 fade-in" style={{ background: 'var(--cream)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-display text-2xl mb-1">Nouvelle réservation</h2>
            <div className="font-mono text-sm" style={{ color: 'var(--sage-dark)' }}>
              {new Date(slot.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              {' · '}{slot.time}{endTime ? ` → ${endTime}` : ''}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:opacity-60" style={{ color: 'var(--ink-soft)' }}><X size={16} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-mono mb-1" style={{ color: 'var(--ink-soft)' }}>Service</div>
            <select value={form.serviceId} onChange={e => setForm({ ...form, serviceId: e.target.value })} className="w-full px-3 py-2 rounded-lg border" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }}>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} — {s.priceLabel}</option>)}
            </select>
          </div>

          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Prénom & Nom *" className="w-full px-3 py-2 rounded-lg border" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2 rounded-lg border" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Téléphone" className="w-full px-3 py-2 rounded-lg border" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
          <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Note (optionnel)" rows={2} className="w-full px-3 py-2 rounded-lg border resize-none" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />

          <div>
            <div className="text-[10px] uppercase tracking-widest font-mono mb-1" style={{ color: 'var(--ink-soft)' }}>Statut</div>
            <div className="flex gap-2">
              {['confirmé', 'en attente'].map(s => (
                <button key={s} onClick={() => setForm({ ...form, status: s })} className="flex-1 py-1.5 text-xs font-mono uppercase tracking-widest rounded-full border transition-all"
                  style={{ background: form.status === s ? 'var(--ink)' : 'transparent', color: form.status === s ? 'var(--cream)' : 'var(--ink-soft)', borderColor: form.status === s ? 'var(--ink)' : 'var(--line)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5 pt-4 border-t" style={{ borderColor: 'var(--line)' }}>
          <button onClick={handleSubmit} disabled={!form.name} className="flex-1 py-2 rounded-full text-sm font-mono uppercase tracking-widest disabled:opacity-40" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>
            Enregistrer
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-full text-sm font-mono uppercase tracking-widest border" style={{ borderColor: 'var(--line)', color: 'var(--ink-soft)' }}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminPlanning({ slots, updateSlots, bookings, updateBookings, services, showToast }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotDuration, setNewSlotDuration] = useState(60);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingSlot, setBookingSlot] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + weekOffset * 7);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    days.push(d);
  }

  const toMin = (timeStr) => { const [h, m] = timeStr.split(':').map(Number); return h * 60 + m; };
  const overlaps = (aStart, aDur, bStart, bDur) => aStart < bStart + bDur && bStart < aStart + aDur;

  const addSlot = () => {
    if (!newSlotDate || !newSlotTime) { showToast("Date et heure requises"); return; }
    const id = `${newSlotDate}-${newSlotTime}`;
    if (slots.find(s => s.id === id)) { showToast("Ce créneau existe déjà"); return; }

    const newStart = toMin(newSlotTime);

    const bookingConflict = bookings.find(b => {
      if (b.date !== newSlotDate) return false;
      const svc = services.find(s => s.id === b.serviceId);
      if (!svc) return false;
      return overlaps(newStart, newSlotDuration, toMin(b.time), svc.duration);
    });
    if (bookingConflict) {
      const svc = services.find(s => s.id === bookingConflict.serviceId);
      const end = svc ? addMinutes(bookingConflict.time, svc.duration) : '?';
      showToast(`Conflit résa : ${bookingConflict.clientName} (${bookingConflict.time}→${end})`);
      return;
    }

    const slotConflict = slots.find(s => {
      if (s.date !== newSlotDate || s.id === id) return false;
      return overlaps(newStart, newSlotDuration, toMin(s.time), s.duration || 60);
    });
    if (slotConflict) {
      const end = addMinutes(slotConflict.time, slotConflict.duration || 60);
      showToast(`Conflit créneau : ${slotConflict.time}→${end}`);
      return;
    }

    updateSlots([...slots, { id, date: newSlotDate, time: newSlotTime, duration: newSlotDuration, available: true }]);
    setNewSlotDate(''); setNewSlotTime('');
    showToast("Créneau ajouté");
  };

  const removeSlot = (id) => {
    updateSlots(slots.filter(s => s.id !== id));
    showToast("Créneau supprimé");
  };

  const toggleSlot = (id) => {
    updateSlots(slots.map(s => s.id === id ? { ...s, available: !s.available } : s));
  };

  const setBookingStatus = (id, status) => {
    updateBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
    showToast(`Statut mis à jour : ${status}`);
  };

  const selectedService = selectedBooking ? services.find(s => s.id === selectedBooking.serviceId) : null;

  return (
    <div>
      <h1 className="font-display text-4xl mb-2">Planning</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--ink-soft)' }}>Gérez vos créneaux. Cliquez sur une réservation pour voir les détails, sur un créneau libre pour l'activer/désactiver.</p>

      {/* Add slot */}
      <div className="p-5 rounded-2xl mb-8 grid md:grid-cols-[1fr_1fr_1fr_auto] gap-3" style={{ background: 'var(--cream)' }}>
        <input type="date" value={newSlotDate} onChange={e => setNewSlotDate(e.target.value)} className="px-4 py-2 rounded-lg border" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
        <input type="time" value={newSlotTime} onChange={e => setNewSlotTime(e.target.value)} className="px-4 py-2 rounded-lg border" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
        <select value={newSlotDuration} onChange={e => setNewSlotDuration(Number(e.target.value))} className="px-4 py-2 rounded-lg border" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }}>
          {SLOT_DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <button onClick={addSlot} className="px-5 py-2 rounded-lg text-sm font-mono uppercase tracking-widest flex items-center gap-2" style={{ background: 'var(--sage-dark)', color: 'var(--cream)' }}>
          <Plus size={14} /> Ajouter
        </button>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))} disabled={weekOffset === 0} className="p-2 rounded-full border disabled:opacity-30" style={{ borderColor: 'var(--line)' }}><ChevronLeft size={14} /></button>
        <div className="text-sm font-mono uppercase tracking-widest">
          {weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} → {new Date(weekStart.getTime() + 6 * 86400000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </div>
        <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-2 rounded-full border" style={{ borderColor: 'var(--line)' }}><ChevronRight size={14} /></button>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          const dateStr = toLocalDateStr(d);
          const isToday = dateStr === toLocalDateStr(today);
          const daySlots = slots.filter(s => s.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
          return (
            <div key={i} className="p-2 rounded-xl min-h-[200px]" style={{ background: isToday ? 'var(--sage-light)' : 'var(--cream)', border: isToday ? '1.5px solid var(--sage-dark)' : '1.5px solid transparent' }}>
              <div className="text-center mb-2 pb-2 border-b" style={{ borderColor: 'var(--line)' }}>
                <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--ink-soft)' }}>{d.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                <div className="font-display text-xl" style={{ color: isToday ? 'var(--sage-dark)' : 'var(--ink)' }}>{d.getDate()}</div>
              </div>
              <div className="space-y-1.5">
                {daySlots.length === 0 ? (
                  <div className="text-[10px] text-center py-2" style={{ color: 'var(--ink-soft)' }}>aucun</div>
                ) : daySlots.map(s => {
                  const booking = bookings.find(b => b.date === s.date && b.time === s.time);
                  const svc = booking ? services.find(sv => sv.id === booking.serviceId) : null;
                  const endTime = svc ? addMinutes(s.time, svc.duration) : null;
                  const statusColors = { 'confirmé': 'var(--sage-dark)', 'annulé': 'var(--terracotta-dark)', 'en attente': 'var(--ochre)' };
                  if (booking) {
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedBooking(booking)}
                        className="w-full text-left rounded-lg px-2 py-1.5 transition-all hover:opacity-80 hover:shadow-md"
                        style={{ background: statusColors[booking.status] || 'var(--terracotta)', color: 'var(--cream)' }}
                      >
                        <div className="font-mono text-[10px] font-semibold leading-tight">
                          {s.time}{endTime ? ` → ${endTime}` : ''}
                        </div>
                        <div className="text-[10px] font-semibold truncate mt-0.5 leading-tight">{booking.clientName}</div>
                        {svc && <div className="text-[9px] opacity-75 truncate leading-tight">{svc.name}</div>}
                      </button>
                    );
                  }
                  const slotEnd = s.duration ? addMinutes(s.time, s.duration) : null;
                  return (
                    <div key={s.id} className="group rounded-md text-xs overflow-hidden"
                      style={{
                        background: s.available ? 'rgba(168,181,160,0.25)' : 'var(--line)',
                        color: 'var(--ink)',
                        opacity: !s.available ? 0.6 : 1
                      }}>
                      <div className="flex items-center justify-between px-2 py-1.5">
                        <span className="font-mono text-[11px] font-semibold leading-tight">
                          {s.time}{slotEnd ? ` → ${slotEnd}` : ''}
                          {!s.available && <span className="text-[9px] opacity-60 ml-1">bloqué</span>}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => toggleSlot(s.id)} title={s.available ? 'Bloquer' : 'Libérer'} className="p-0.5 rounded hover:opacity-70">
                            <Lock size={9} />
                          </button>
                          <button onClick={() => removeSlot(s.id)} title="Supprimer" className="p-0.5 rounded hover:opacity-70">
                            <Trash2 size={9} />
                          </button>
                        </div>
                      </div>
                      {s.available && (
                        <button
                          onClick={() => setBookingSlot(s)}
                          className="w-full text-center py-1 text-[9px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity border-t"
                          style={{ borderColor: 'rgba(107,122,100,0.2)', color: 'var(--sage-dark)', background: 'rgba(168,181,160,0.2)' }}
                        >
                          + Réserver
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-4 text-xs font-mono" style={{ color: 'var(--ink-soft)' }}>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: 'rgba(168,181,160,0.4)' }}></div> Libre</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: 'var(--sage-dark)' }}></div> Confirmé</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: 'var(--ochre)' }}></div> En attente</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: 'var(--terracotta-dark)' }}></div> Annulé</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: 'var(--line)' }}></div> Bloqué</div>
      </div>

      <BookingDetailModal
        booking={selectedBooking}
        service={selectedService}
        onClose={() => setSelectedBooking(null)}
        onConfirm={(id) => setBookingStatus(id, 'confirmé')}
        onCancel={(id) => setBookingStatus(id, 'annulé')}
      />

      <NewBookingModal
        slot={bookingSlot}
        services={services}
        onClose={() => setBookingSlot(null)}
        onSubmit={(booking) => {
          updateBookings([...bookings, booking]);
          const updatedSlots = slots.map(s => s.id === bookingSlot.id ? { ...s, available: false } : s);
          const svc = services.find(s => s.id === booking.serviceId);
          if (svc) {
            const remaining = bookingSlot.duration - svc.duration;
            if (remaining > 0) {
              const newTime = addMinutes(bookingSlot.time, svc.duration);
              const newId = `${bookingSlot.date}-${newTime}`;
              if (!updatedSlots.find(s => s.id === newId)) {
                updatedSlots.push({ id: newId, date: bookingSlot.date, time: newTime, duration: remaining, available: true });
              }
            }
          }
          updateSlots(updatedSlots);
          setBookingSlot(null);
          showToast("Réservation créée");
        }}
      />
    </div>
  );
}

function AdminServices({ services, updateServices, showToast }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', duration: 60, price: 0, priceLabel: '', description: '', color: 'sage', surDevis: false });

  const startEdit = (s) => { setEditing(s.id); setForm({ surDevis: false, ...s }); };
  const startNew = () => { setEditing('new'); setForm({ name: '', duration: 60, price: 0, priceLabel: '', description: '', color: 'sage', surDevis: false }); };

  const save = () => {
    if (!form.name) { showToast("Le nom est requis"); return; }
    if (editing === 'new') {
      updateServices([...services, { ...form, id: 's' + Date.now() }]);
      showToast("Service créé");
    } else {
      updateServices(services.map(s => s.id === editing ? form : s));
      showToast("Service mis à jour");
    }
    setEditing(null);
  };

  const remove = (id) => {
    updateServices(services.filter(s => s.id !== id));
    showToast("Service supprimé");
  };

  const colorMap = { sage: 'var(--sage)', terracotta: '#a31621', ochre: 'var(--ochre)', olive: 'var(--olive)' };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-4xl">Services & Tarifs</h1>
        <button onClick={startNew} className="px-4 py-2 rounded-full text-sm font-mono uppercase tracking-widest flex items-center gap-2" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>
          <Plus size={14} /> Nouveau
        </button>
      </div>
      <p className="text-sm mb-8" style={{ color: 'var(--ink-soft)' }}>Configurez les prestations proposées à vos clients.</p>

      {editing && (
        <div className="p-6 rounded-2xl mb-6 fade-in" style={{ background: 'var(--cream)', border: '2px solid var(--terracotta-dark)' }}>
          <h3 className="font-display text-2xl mb-4">{editing === 'new' ? 'Nouveau service' : 'Modifier le service'}</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <div className="text-xs uppercase tracking-widest mb-1.5 font-mono" style={{ color: 'var(--ink-soft)' }}>Nom du service</div>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex : Séance individuelle" className="w-full px-3 py-2 rounded-lg border" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, surDevis: !form.surDevis, priceLabel: !form.surDevis ? 'Sur devis' : form.priceLabel })}
                className="relative w-10 h-5 rounded-full transition-all flex-shrink-0"
                style={{ background: form.surDevis ? 'var(--sage-dark)' : 'var(--line)' }}
              >
                <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ transform: form.surDevis ? 'translateX(20px)' : 'none' }} />
              </button>
              <span className="text-sm" style={{ color: 'var(--ink-soft)' }}>
                Sur devis <span className="text-xs opacity-60">(pas de créneau à réserver — formulaire de demande textuelle)</span>
              </span>
            </div>

            {!form.surDevis && (
              <>
                <div>
                  <div className="text-xs uppercase tracking-widest mb-1.5 font-mono" style={{ color: 'var(--ink-soft)' }}>Durée (minutes)</div>
                  <input type="number" value={form.duration} onChange={e => setForm({...form, duration: parseInt(e.target.value) || 0})} placeholder="Ex : 60" className="w-full px-3 py-2 rounded-lg border" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest mb-1.5 font-mono" style={{ color: 'var(--ink-soft)' }}>Prix (€)</div>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: parseInt(e.target.value) || 0})} placeholder="Ex : 55" className="w-full px-3 py-2 rounded-lg border" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
                </div>
              </>
            )}
            <div className="md:col-span-2">
              <div className="text-xs uppercase tracking-widest mb-1.5 font-mono" style={{ color: 'var(--ink-soft)' }}>Affichage du prix</div>
              <input value={form.priceLabel} onChange={e => setForm({...form, priceLabel: e.target.value})} placeholder={form.surDevis ? 'Sur devis' : 'Ex : À partir de 55 €'} className="w-full px-3 py-2 rounded-lg border" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
            </div>
            <div className="md:col-span-2">
              <div className="text-xs uppercase tracking-widest mb-1.5 font-mono" style={{ color: 'var(--ink-soft)' }}>Description</div>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Décrivez la prestation en quelques phrases…" rows={3} className="w-full px-3 py-2 rounded-lg border resize-none" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
            </div>
            <div className="md:col-span-2">
              <div className="text-xs uppercase tracking-widest mb-2 font-mono" style={{ color: 'var(--ink-soft)' }}>Couleur</div>
              <div className="flex gap-2">
                {Object.keys(colorMap).map(c => (
                  <button key={c} onClick={() => setForm({...form, color: c})} className="w-8 h-8 rounded-full transition-transform" style={{ background: colorMap[c], transform: form.color === c ? 'scale(1.2)' : 'scale(1)', boxShadow: form.color === c ? '0 0 0 2px var(--ink)' : 'none' }}></button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} className="px-5 py-2 rounded-full text-sm font-mono uppercase tracking-widest flex items-center gap-2" style={{ background: 'var(--sage-dark)', color: 'var(--cream)' }}>
              <Save size={14} /> Enregistrer
            </button>
            <button onClick={() => setEditing(null)} className="px-5 py-2 rounded-full text-sm font-mono uppercase tracking-widest border" style={{ borderColor: 'var(--line)' }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {services.map(s => (
          <div key={s.id} className="p-5 rounded-2xl flex gap-4" style={{ background: 'var(--cream)' }}>
            <div className="w-12 h-12 rounded-full flex-shrink-0" style={{ background: colorMap[s.color] }}></div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-display text-xl">{s.name}</div>
                {s.surDevis && <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: 'var(--ochre)', color: 'var(--cream)' }}>Sur devis</span>}
              </div>
              <div className="text-xs font-mono mb-2" style={{ color: 'var(--ink-soft)' }}>{!s.surDevis && `${s.duration} min · `}{s.priceLabel}</div>
              <p className="text-sm mb-3" style={{ color: 'var(--ink-soft)' }}>{s.description}</p>
              <div className="flex gap-2">
                <button onClick={() => startEdit(s)} className="text-xs font-mono uppercase tracking-widest flex items-center gap-1 hover:underline"><Edit2 size={10} /> Modifier</button>
                <button onClick={() => remove(s.id)} className="text-xs font-mono uppercase tracking-widest flex items-center gap-1 hover:underline" style={{ color: 'var(--terracotta-dark)' }}><Trash2 size={10} /> Supprimer</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildBookingVars(booking, service) {
  const prenom = (booking.clientName || '').split(' ')[0];
  const date = booking.date ? new Date(booking.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : '—';
  return { prenom, nom: booking.clientName || '', date, heure: booking.time || '—', service: service?.name || '' };
}

function BookingResponseModal({ action, booking, service, content, appSettings, onConfirm, onClose }) {
  const vars = buildBookingVars(booking, service);
  const tpls = {
    confirmé: { subject: appSettings?.emailSubjectConfirm, body: appSettings?.emailTemplateConfirm },
    annulé:   { subject: appSettings?.emailSubjectCancel,  body: appSettings?.emailTemplateCancel  },
    supprimé: { subject: appSettings?.emailSubjectDelete,  body: appSettings?.emailTemplateDelete  },
  };
  const tpl = tpls[action] || {};
  const [subject, setSubject] = useState(fillTemplate(tpl.subject, vars));
  const [body, setBody] = useState(fillTemplate(tpl.body, vars));
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);

  const labels = { confirmé: 'Confirmer', annulé: 'Annuler', supprimé: 'Supprimer' };
  const colors = { confirmé: 'var(--sage-dark)', annulé: 'var(--ochre)', supprimé: 'var(--terracotta-dark)' };

  const sendAndAct = async () => {
    setSending(true);
    setSendError(null);
    try {
      const result = await sendEmail({
        to: booking.clientEmail,
        toName: booking.clientName,
        subject,
        body,
        fromName: content.siteName || 'Jodie Peltier',
        replyTo: content.contactEmail || undefined,
        testEmail: appSettings?.testEmail || undefined,
      });
      if (!result.ok) throw new Error(result.error);
      onConfirm();
    } catch (err) {
      setSendError("Erreur d'envoi : " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,15,16,0.5)' }}>
      <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'var(--cream)' }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'var(--sage-dark)' }}>
          <div className="font-display text-xl" style={{ color: 'var(--cream)' }}>Répondre à {booking.clientName}</div>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.6)' }}><X size={18} /></button>
        </div>
        <div className="p-6 space-y-3">
          <div className="text-xs font-mono px-3 py-2 rounded-lg flex items-center justify-between" style={{ background: 'var(--cream-light)', color: 'var(--ink-soft)' }}>
            <span>À : <strong>{booking.clientEmail}</strong></span>
            {isSupabaseConfigured
              ? <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#dcfce7', color: '#166534' }}>Envoi automatique</span>
              : <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#fef9c3', color: '#854d0e' }}>Via votre client mail</span>}
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest font-mono mb-1" style={{ color: 'var(--ink-soft)' }}>Sujet</div>
            <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg border outline-none text-sm" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest font-mono mb-1" style={{ color: 'var(--ink-soft)' }}>Message</div>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={7} className="w-full px-3 py-2 rounded-lg border outline-none text-sm resize-none" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
          </div>
          {sendError && <div className="text-xs px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>{sendError}</div>}
          <div className="flex gap-2 pt-1">
            <button onClick={sendAndAct} disabled={sending} className="flex-1 px-4 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest disabled:opacity-60" style={{ background: colors[action], color: 'var(--cream)' }}>
              {sending ? 'Envoi…' : <><Mail size={12} className="inline mr-1.5" />Envoyer + {labels[action]}</>}
            </button>
            <button onClick={onConfirm} className="px-4 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest border" style={{ borderColor: 'var(--line)', color: 'var(--ink-soft)' }}>
              {labels[action]} sans message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminBookings({ bookings, updateBookings, services, slots, updateSlots, showToast, content, appSettings }) {
  const [filter, setFilter] = useState('all');
  const [pending, setPending] = useState(null); // { booking, action, service }

  const getService = (id) => services.find(s => s.id === id);

  const askAction = (booking, action) => {
    setPending({ booking, action, service: getService(booking.serviceId) });
  };

  const doStatus = (id, status) => {
    updateBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
    showToast(`Statut mis à jour : ${status}`);
    setPending(null);
  };

  const doRemove = (id) => {
    const booking = bookings.find(b => b.id === id);
    if (booking) updateSlots(slots.map(s => (s.date === booking.date && s.time === booking.time) ? { ...s, available: true } : s));
    updateBookings(bookings.filter(b => b.id !== id));
    showToast("Réservation supprimée");
    setPending(null);
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const statusColor = {
    'en attente': 'var(--ochre)',
    'confirmé': 'var(--sage-dark)',
    'annulé': 'var(--terracotta-dark)',
  };

  return (
    <div>
      <h1 className="font-display text-4xl mb-2">Réservations</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>Suivez et gérez les demandes de vos clients.</p>

      <div className="flex gap-2 mb-6">
        {['all', 'en attente', 'confirmé', 'annulé'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest" style={{ background: filter === f ? 'var(--ink)' : 'transparent', color: filter === f ? 'var(--cream)' : 'var(--ink-soft)', border: filter !== f ? '1px solid var(--line)' : 'none' }}>
            {f === 'all' ? 'Toutes' : f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center rounded-2xl" style={{ background: 'var(--cream)', color: 'var(--ink-soft)' }}>Aucune réservation</div>
        ) : filtered.map(b => {
          const service = getService(b.serviceId);
          return (
            <div key={b.id} className="p-5 rounded-2xl flex flex-col md:flex-row gap-4 md:items-center" style={{ background: 'var(--cream)' }}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className="font-display text-xl">{b.clientName}</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: statusColor[b.status], color: 'var(--cream)' }}>{b.status}</div>
                </div>
                <div className="text-xs font-mono mb-2" style={{ color: 'var(--ink-soft)' }}>
                  {service?.name} · {b.date ? new Date(b.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : '—'} à {b.time}
                </div>
                <div className="text-xs space-y-0.5" style={{ color: 'var(--ink-soft)' }}>
                  <div className="flex items-center gap-2"><Mail size={11} /> {b.clientEmail}</div>
                  {b.clientPhone && <div className="flex items-center gap-2"><Phone size={11} /> {b.clientPhone}</div>}
                  {b.note && <div className="mt-2 italic">« {b.note} »</div>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {b.status !== 'confirmé' && <button onClick={() => askAction(b, 'confirmé')} className="px-3 py-1.5 text-xs rounded-full font-mono uppercase tracking-widest" style={{ background: 'var(--sage-dark)', color: 'var(--cream)' }}>Confirmer</button>}
                {b.status !== 'annulé' && <button onClick={() => askAction(b, 'annulé')} className="px-3 py-1.5 text-xs rounded-full font-mono uppercase tracking-widest border" style={{ borderColor: 'var(--line)', color: 'var(--ink-soft)' }}>Annuler</button>}
                <button onClick={() => askAction(b, 'supprimé')} className="p-1.5 rounded-full" style={{ color: 'var(--terracotta-dark)' }}><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {pending && (
        <BookingResponseModal
          action={pending.action}
          booking={pending.booking}
          service={pending.service}
          content={content}
          appSettings={appSettings}
          onConfirm={() => {
            if (pending.action === 'supprimé') doRemove(pending.booking.id);
            else doStatus(pending.booking.id, pending.action);
          }}
          onClose={() => setPending(null)}
        />
      )}
    </div>
  );
}

function ImageUpload({ label, value, onChange, preview, help }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <div className="text-xs uppercase tracking-widest mb-2 font-mono" style={{ color: 'var(--ink-soft)' }}>{label}</div>
      <div className="flex items-center gap-4">
        {value ? (
          preview === 'logo' ? (
            <img src={value} alt="logo" style={{ height: '48px', width: 'auto', objectFit: 'contain', border: '1px solid var(--line)', borderRadius: 8, padding: 4, background: '#fff' }} />
          ) : preview === 'favicon' ? (
            <img src={value} alt="favicon" className="w-10 h-10 rounded object-contain" style={{ border: '1px solid var(--line)', background: '#fff' }} />
          ) : (
            <img src={value} alt="header" className="w-24 h-16 rounded-lg object-cover" style={{ border: '1px solid var(--line)' }} />
          )
        ) : (
          <div className="w-16 h-10 rounded-lg flex items-center justify-center text-[10px] font-mono" style={{ background: 'var(--sage-light)', color: 'var(--ink-soft)' }}>Aucune</div>
        )}
        <div className="flex flex-col gap-1">
          <label className="cursor-pointer px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>
            Choisir
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
          {value && (
            <button onClick={() => onChange('')} className="text-xs font-mono uppercase tracking-widest underline text-left" style={{ color: 'var(--terracotta-dark)' }}>Supprimer</button>
          )}
        </div>
      </div>
      {help && <div className="text-[10px] mt-2" style={{ color: 'var(--ink-soft)' }}>{help}</div>}
    </div>
  );
}

function RichTextEditor({ value, onChange, placeholder }) {
  const ref = useRef(null);
  const internal = useRef(false);

  useEffect(() => {
    if (ref.current && !internal.current) {
      ref.current.innerHTML = value || '';
    }
    internal.current = false;
  }, [value]);

  const exec = (cmd, val = null) => {
    ref.current.focus();
    document.execCommand(cmd, false, val);
    internal.current = true;
    onChange(ref.current.innerHTML);
  };

  const tools = [
    { label: 'B', title: 'Gras', cmd: 'bold', style: { fontWeight: 'bold' } },
    { label: 'I', title: 'Italique', cmd: 'italic', style: { fontStyle: 'italic' } },
    { label: 'H2', title: 'Titre 2', cmd: 'formatBlock', val: 'h2' },
    { label: 'H3', title: 'Titre 3', cmd: 'formatBlock', val: 'h3' },
    { label: '¶', title: 'Paragraphe', cmd: 'formatBlock', val: 'p' },
    { label: '• Liste', title: 'Liste à puces', cmd: 'insertUnorderedList' },
    { label: '1. Liste', title: 'Liste numérotée', cmd: 'insertOrderedList' },
  ];

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 3, padding: '6px 8px', background: 'var(--cream)', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
        {tools.map(t => (
          <button
            key={t.cmd + (t.val || '')}
            type="button"
            title={t.title}
            onMouseDown={e => { e.preventDefault(); exec(t.cmd, t.val || null); }}
            className="px-2 py-0.5 rounded text-xs font-mono transition-all hover:opacity-70"
            style={{ background: 'var(--cream-light)', border: '1px solid var(--line)', ...t.style }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => { internal.current = true; onChange(ref.current.innerHTML); }}
        className="prose-editor outline-none"
        style={{ padding: '12px 14px', minHeight: '140px', background: 'var(--cream-light)', fontSize: 14, lineHeight: 1.6 }}
      />
    </div>
  );
}

function Field({ label, value, onChange, multiline, rich, help }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest mb-1.5 font-mono" style={{ color: 'var(--ink-soft)' }}>{label}</div>
      {rich ? (
        <RichTextEditor value={value} onChange={onChange} placeholder={label} />
      ) : multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border resize-none" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
      )}
      {help && <div className="text-[10px] mt-1" style={{ color: 'var(--ink-soft)' }}>{help}</div>}
    </div>
  );
}

function AboutSection({ draft, setDraft }) {
  const formations = Array.isArray(draft.formations) ? draft.formations : [];
  const memoires = Array.isArray(draft.memoires) ? draft.memoires : [];

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setDraft({ ...draft, aboutPhoto: ev.target.result });
    reader.readAsDataURL(file);
  };

  const updateFormation = (i, field, value) => {
    const items = [...formations];
    items[i] = { ...items[i], [field]: value };
    setDraft({ ...draft, formations: items });
  };

  const addFormation = () => {
    setDraft({ ...draft, formations: [...formations, { id: 'f' + Date.now(), school: '', diploma: '', diplomaDetail: '', year: '', stages: '', image: '' }] });
  };

  const removeFormation = (i) => {
    setDraft({ ...draft, formations: formations.filter((_, j) => j !== i) });
  };

  const updateMemoire = (i, field, value) => {
    const items = [...memoires];
    items[i] = { ...items[i], [field]: value };
    setDraft({ ...draft, memoires: items });
  };

  const addMemoire = () => {
    setDraft({ ...draft, memoires: [...memoires, { id: 'm' + Date.now(), level: '', title: '', subtitle: '' }] });
  };

  const removeMemoire = (i) => {
    setDraft({ ...draft, memoires: memoires.filter((_, j) => j !== i) });
  };

  return (
    <>
      <div>
        <div className="text-xs uppercase tracking-widest mb-2 font-mono" style={{ color: 'var(--ink-soft)' }}>Photo de profil</div>
        <div className="flex items-center gap-4">
          {draft.aboutPhoto ? (
            <img src={draft.aboutPhoto} alt="profil" className="w-20 h-20 rounded-full object-cover" style={{ border: '2px solid var(--line)' }} />
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-xs" style={{ background: 'var(--sage-light)', color: 'var(--ink-soft)' }}>Sans photo</div>
          )}
          <div>
            <label className="cursor-pointer px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>
              Choisir une photo
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
            {draft.aboutPhoto && (
              <button onClick={() => setDraft({ ...draft, aboutPhoto: '' })} className="ml-3 text-xs font-mono uppercase tracking-widest underline" style={{ color: 'var(--terracotta-dark)' }}>Supprimer</button>
            )}
          </div>
        </div>
      </div>

      <Field label="Présentation courte" value={draft.aboutShort || ''} onChange={v => setDraft({...draft, aboutShort: v})} multiline />

      <div>
        <div className="text-xs uppercase tracking-widest mb-1.5 font-mono" style={{ color: 'var(--ink-soft)' }}>Publics accompagnés (un par ligne)</div>
        <textarea
          value={Array.isArray(draft.aboutTargets) ? draft.aboutTargets.join('\n') : ''}
          onChange={e => setDraft({ ...draft, aboutTargets: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
          rows={4}
          placeholder={"Sportifs\nMilitaires\nParticuliers"}
          className="w-full px-3 py-2 rounded-lg border resize-none"
          style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }}
        />
      </div>

      <Field label="Présentation longue" value={draft.aboutLong || ''} onChange={v => setDraft({...draft, aboutLong: v})} multiline />

      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-widest font-mono" style={{ color: 'var(--ink-soft)' }}>Formations</div>
          <button onClick={addFormation} className="text-xs font-mono uppercase tracking-widest flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ background: 'var(--sage-dark)', color: 'var(--cream)' }}>
            <Plus size={11} /> Ajouter
          </button>
        </div>
        <div className="space-y-3">
          {formations.map((f, i) => (
            <div key={f.id || i} className="p-4 rounded-xl" style={{ background: 'var(--cream-light)', border: '1px solid var(--line)' }}>
              <div className="flex justify-between items-start mb-3">
                <div className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--sage-dark)' }}>Formation {i + 1}</div>
                <button onClick={() => removeFormation(i)} className="p-1 rounded hover:opacity-70" style={{ color: 'var(--terracotta-dark)' }}><Trash2 size={12} /></button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input value={f.school} onChange={e => updateFormation(i, 'school', e.target.value)} placeholder="École / Université" className="px-3 py-1.5 rounded-lg border col-span-2" style={{ background: 'var(--cream)', borderColor: 'var(--line)' }} />
                <input value={f.diploma} onChange={e => updateFormation(i, 'diploma', e.target.value)} placeholder="Diplôme" className="px-3 py-1.5 rounded-lg border" style={{ background: 'var(--cream)', borderColor: 'var(--line)' }} />
                <input value={f.year} onChange={e => updateFormation(i, 'year', e.target.value)} placeholder="Année" className="px-3 py-1.5 rounded-lg border" style={{ background: 'var(--cream)', borderColor: 'var(--line)' }} />
                <input value={f.diplomaDetail} onChange={e => updateFormation(i, 'diplomaDetail', e.target.value)} placeholder="Détail du diplôme (optionnel)" className="px-3 py-1.5 rounded-lg border col-span-2" style={{ background: 'var(--cream)', borderColor: 'var(--line)' }} />
              </div>
              <textarea value={f.stages} onChange={e => updateFormation(i, 'stages', e.target.value)} placeholder="Stages (un par ligne)" rows={2} className="w-full px-3 py-1.5 rounded-lg border resize-none mb-2" style={{ background: 'var(--cream)', borderColor: 'var(--line)' }} />
              <ImageUpload label="Photo (optionnel)" value={f.image || ''} onChange={v => updateFormation(i, 'image', v)} preview="header" />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-widest font-mono" style={{ color: 'var(--ink-soft)' }}>Mémoires</div>
          <button onClick={addMemoire} className="text-xs font-mono uppercase tracking-widest flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ background: 'var(--sage-dark)', color: 'var(--cream)' }}>
            <Plus size={11} /> Ajouter
          </button>
        </div>
        <div className="space-y-3">
          {memoires.map((m, i) => (
            <div key={m.id || i} className="p-4 rounded-xl" style={{ background: 'var(--cream-light)', border: '1px solid var(--line)' }}>
              <div className="flex justify-between items-start mb-3">
                <div className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--sage-dark)' }}>Mémoire {i + 1}</div>
                <button onClick={() => removeMemoire(i)} className="p-1 rounded hover:opacity-70" style={{ color: 'var(--terracotta-dark)' }}><Trash2 size={12} /></button>
              </div>
              <div className="space-y-2">
                <input value={m.level} onChange={e => updateMemoire(i, 'level', e.target.value)} placeholder="Niveau (ex: Master 1)" className="w-full px-3 py-1.5 rounded-lg border" style={{ background: 'var(--cream)', borderColor: 'var(--line)' }} />
                <input value={m.title} onChange={e => updateMemoire(i, 'title', e.target.value)} placeholder="Titre du mémoire" className="w-full px-3 py-1.5 rounded-lg border" style={{ background: 'var(--cream)', borderColor: 'var(--line)' }} />
                <input value={m.subtitle} onChange={e => updateMemoire(i, 'subtitle', e.target.value)} placeholder="Sous-titre (optionnel)" className="w-full px-3 py-1.5 rounded-lg border" style={{ background: 'var(--cream)', borderColor: 'var(--line)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function TestimonialsSection({ draft, setDraft }) {
  const testimonials = Array.isArray(draft.testimonials) ? draft.testimonials : [];

  const handlePhoto = (i, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const items = [...testimonials];
      items[i] = { ...items[i], photo: ev.target.result };
      setDraft({ ...draft, testimonials: items });
    };
    reader.readAsDataURL(file);
  };

  const update = (i, field, value) => {
    const items = [...testimonials];
    items[i] = { ...items[i], [field]: value };
    setDraft({ ...draft, testimonials: items });
  };

  const add = () => {
    setDraft({ ...draft, testimonials: [...testimonials, { id: 't' + Date.now(), name: '', role: '', text: '', photo: '' }] });
  };

  const remove = (i) => {
    setDraft({ ...draft, testimonials: testimonials.filter((_, j) => j !== i) });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm" style={{ color: 'var(--ink-soft)' }}>Les témoignages s'affichent sur la page d'accueil.</div>
        <button onClick={add} className="text-xs font-mono uppercase tracking-widest flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ background: 'var(--sage-dark)', color: 'var(--cream)' }}>
          <Plus size={11} /> Ajouter
        </button>
      </div>
      <div className="space-y-4">
        {testimonials.length === 0 && (
          <div className="py-8 text-center text-sm rounded-xl" style={{ background: 'var(--cream-light)', color: 'var(--ink-soft)' }}>Aucun témoignage — cliquez sur Ajouter.</div>
        )}
        {testimonials.map((t, i) => (
          <div key={t.id || i} className="p-4 rounded-xl" style={{ background: 'var(--cream-light)', border: '1px solid var(--line)' }}>
            <div className="flex justify-between items-start mb-3">
              <div className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--sage-dark)' }}>Témoignage {i + 1}</div>
              <button onClick={() => remove(i)} className="p-1 rounded hover:opacity-70" style={{ color: 'var(--terracotta-dark)' }}><Trash2 size={12} /></button>
            </div>
            <div className="flex gap-4 items-start">
              {/* Photo */}
              <div className="flex-shrink-0">
                {t.photo ? (
                  <img src={t.photo} alt={t.name} className="w-16 h-20 object-cover rounded-lg" style={{ border: '1px solid var(--line)' }} />
                ) : (
                  <div className="w-16 h-20 rounded-lg flex items-center justify-center text-[10px] font-mono text-center" style={{ background: 'var(--sage-light)', color: 'var(--ink-soft)' }}>
                    Photo
                  </div>
                )}
                <label className="mt-1.5 block text-center cursor-pointer text-[10px] font-mono uppercase tracking-widest underline" style={{ color: 'var(--ink-soft)' }}>
                  {t.photo ? 'Changer' : 'Ajouter'}
                  <input type="file" accept="image/*" onChange={e => handlePhoto(i, e)} className="hidden" />
                </label>
                {t.photo && (
                  <button onClick={() => update(i, 'photo', '')} className="block w-full text-center text-[10px] font-mono uppercase tracking-widest underline" style={{ color: 'var(--terracotta-dark)' }}>Retirer</button>
                )}
              </div>
              {/* Fields */}
              <div className="flex-1 space-y-2">
                <input value={t.name} onChange={e => update(i, 'name', e.target.value)} placeholder="Prénom Nom" className="w-full px-3 py-1.5 rounded-lg border" style={{ background: 'var(--cream)', borderColor: 'var(--line)' }} />
                <input value={t.role} onChange={e => update(i, 'role', e.target.value)} placeholder="Rôle / contexte (ex: Nageuse compétition)" className="w-full px-3 py-1.5 rounded-lg border" style={{ background: 'var(--cream)', borderColor: 'var(--line)' }} />
                <textarea value={t.text} onChange={e => update(i, 'text', e.target.value)} placeholder="Témoignage…" rows={3} className="w-full px-3 py-1.5 rounded-lg border resize-none" style={{ background: 'var(--cream)', borderColor: 'var(--line)' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function AdminContent({ content, updateContent, showToast }) {
  const [draft, setDraft] = useState(content);
  const [section, setSection] = useState('hero');

  useEffect(() => { setDraft(content); }, [content]);

  const sections = [
    { id: 'appearance', label: 'Apparence' },
    { id: 'hero', label: 'Accueil' },
    { id: 'testimonials', label: 'Témoignages' },
    { id: 'google', label: 'Avis Google' },
    { id: 'what', label: "C'est quoi" },
    { id: 'ethics', label: 'Éthique' },
    { id: 'about', label: 'Qui suis-je' },
    { id: 'contact', label: 'Contact' },
    { id: 'legal', label: 'Pages légales' },
  ];

  const save = () => {
    updateContent(draft);
    showToast("Modifications enregistrées");
  };

  const updateForWhom = (i, field, value) => {
    const items = [...draft.forWhomItems];
    items[i] = { ...items[i], [field]: value };
    setDraft({ ...draft, forWhomItems: items });
  };

  const updatePrinciple = (i, field, value) => {
    const items = [...draft.ethicsPrinciples];
    items[i] = { ...items[i], [field]: value };
    setDraft({ ...draft, ethicsPrinciples: items });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-4xl">Contenu du site</h1>
        <button onClick={save} className="px-5 py-2 rounded-full text-sm font-mono uppercase tracking-widest flex items-center gap-2" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>
          <Save size={14} /> Enregistrer
        </button>
      </div>
      <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>Éditez les textes affichés sur votre site.</p>

      <div className="flex gap-1 mb-6 flex-wrap">
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} className="px-3 py-1.5 text-xs font-mono uppercase tracking-widest rounded-full" style={{ background: section === s.id ? 'var(--terracotta-dark)' : 'transparent', color: section === s.id ? 'var(--cream)' : 'var(--ink-soft)', border: section !== s.id ? '1px solid var(--line)' : 'none' }}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="p-6 rounded-2xl space-y-4" style={{ background: 'var(--cream)' }}>
        {section === 'appearance' && (
          <>
            {/* Style du hero */}
            <div>
              <div className="text-xs uppercase tracking-widest mb-3 font-mono" style={{ color: 'var(--ink-soft)' }}>Style du header</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'split', label: 'Séparé', desc: 'Texte à gauche, image/logo à droite', preview: (
                    <div className="flex gap-1 h-10">
                      <div className="flex-1 rounded flex flex-col justify-center px-1.5 gap-0.5" style={{ background: 'var(--cream-light)' }}>
                        <div className="h-1 rounded" style={{ background: 'var(--sage-dark)', width: '60%' }} />
                        <div className="h-0.5 rounded" style={{ background: 'var(--line)', width: '80%' }} />
                        <div className="h-0.5 rounded" style={{ background: 'var(--line)', width: '50%' }} />
                      </div>
                      <div className="w-10 rounded" style={{ background: 'var(--sage-light)' }} />
                    </div>
                  )},
                  { value: 'fullwidth', label: 'Plein écran', desc: 'Photo en fond, texte centré superposé', preview: (
                    <div className="h-10 rounded flex items-center justify-center" style={{ background: 'var(--ink)' }}>
                      <div className="text-center">
                        <div className="h-1 rounded mx-auto mb-0.5" style={{ background: 'rgba(255,255,255,0.6)', width: 32 }} />
                        <div className="h-1.5 rounded mx-auto" style={{ background: 'rgba(255,255,255,0.9)', width: 48 }} />
                      </div>
                    </div>
                  )},
                ].map(opt => (
                  <button key={opt.value} onClick={() => setDraft({...draft, heroStyle: opt.value})} className="p-3 rounded-xl text-left transition-all" style={{ border: `2px solid ${draft.heroStyle === opt.value ? 'var(--sage-dark)' : 'var(--line)'}`, background: draft.heroStyle === opt.value ? 'var(--sage-light)' : 'var(--cream-light)' }}>
                    {opt.preview}
                    <div className="mt-2 text-xs font-mono font-semibold" style={{ color: draft.heroStyle === opt.value ? 'var(--sage-dark)' : 'var(--ink)' }}>{opt.label}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
              {draft.heroStyle === 'fullwidth' && (
                <div className="mt-2 text-[10px] px-3 py-2 rounded-lg" style={{ background: 'var(--sage-light)', color: 'var(--sage-dark)' }}>
                  Le style plein écran utilise l'image du header comme fond. Sans image, un fond sombre est affiché.
                </div>
              )}
            </div>

            <ImageUpload
              label="Logo (navbar & header)"
              value={draft.logo || ''}
              onChange={v => setDraft({...draft, logo: v})}
              preview="logo"
              help="Affiché dans la navbar et le header. PNG transparent recommandé."
            />
            <ImageUpload
              label="Logo footer"
              value={draft.logoFooter || ''}
              onChange={v => setDraft({...draft, logoFooter: v})}
              preview="logo"
              help="Version pour le fond cramoisi du footer (blanc ou clair). Si vide, le logo principal est inversé en blanc automatiquement."
            />
            <ImageUpload
              label="Favicon"
              value={draft.favicon || ''}
              onChange={v => setDraft({...draft, favicon: v})}
              preview="favicon"
              help="Icône dans l'onglet du navigateur. Carré 32×32 ou 64×64 px idéal."
            />
            <ImageUpload
              label="Image du header"
              value={draft.heroImage || ''}
              onChange={v => setDraft({...draft, heroImage: v})}
              preview="hero"
              help={draft.heroStyle === 'fullwidth' ? 'Fond plein écran du hero.' : 'Photo dans la colonne droite du hero. Si vide, le logo est utilisé.'}
            />

            {/* Réseaux sociaux */}
            <div className="pt-2">
              <div className="text-xs uppercase tracking-widest mb-3 font-mono" style={{ color: 'var(--ink-soft)' }}>Réseaux sociaux</div>
              <div className="space-y-2">
                {[
                  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/votre-page' },
                  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/votre-compte' },
                  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@votre-chaine' },
                  { key: 'twitter', label: 'X / Twitter', placeholder: 'https://x.com/votre-compte' },
                  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/votre-profil' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className="text-xs font-mono w-20 flex-shrink-0" style={{ color: 'var(--ink-soft)' }}>{label}</div>
                    <input
                      value={draft.socialLinks?.[key] || ''}
                      onChange={e => setDraft({ ...draft, socialLinks: { ...draft.socialLinks, [key]: e.target.value } })}
                      placeholder={placeholder}
                      className="flex-1 px-3 py-1.5 rounded-lg border text-sm"
                      style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }}
                    />
                  </div>
                ))}
              </div>
              <div className="text-[10px] mt-2" style={{ color: 'var(--ink-soft)' }}>Laissez vide pour masquer l'icône. Les icônes s'affichent dans le hero et le footer.</div>
            </div>
          </>
        )}
        {section === 'testimonials' && (
          <TestimonialsSection draft={draft} setDraft={setDraft} />
        )}
        {section === 'hero' && (
          <>
            <Field label="Nom du site" value={draft.siteName} onChange={v => setDraft({...draft, siteName: v})} />
            <Field label="Sous-titre" value={draft.tagline} onChange={v => setDraft({...draft, tagline: v})} />
            <Field label="Titre principal" value={draft.heroTitle} onChange={v => setDraft({...draft, heroTitle: v})} multiline help="Utilisez Entrée pour un retour à la ligne (la 2ème ligne sera en italique colorée)" />
            <Field label="Sous-titre principal" value={draft.heroSubtitle} onChange={v => setDraft({...draft, heroSubtitle: v})} multiline />
            <Field label="Citation" value={draft.heroQuote} onChange={v => setDraft({...draft, heroQuote: v})} multiline />
          </>
        )}
        {section === 'what' && (
          <>
            <Field label="Titre" value={draft.whatIsTitle} onChange={v => setDraft({...draft, whatIsTitle: v})} />
            <Field label="Texte de présentation" value={draft.whatIsText} onChange={v => setDraft({...draft, whatIsText: v})} rich />
            <Field label="Titre — Pour qui ?" value={draft.forWhomTitle} onChange={v => setDraft({...draft, forWhomTitle: v})} />
            <div className="text-xs uppercase tracking-widest font-mono pt-4" style={{ color: 'var(--ink-soft)' }}>Publics concernés</div>
            {draft.forWhomItems.map((item, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--cream-light)' }}>
                <Field label={`Titre ${i+1}`} value={item.title} onChange={v => updateForWhom(i, 'title', v)} />
                <Field label="Description" value={item.text} onChange={v => updateForWhom(i, 'text', v)} multiline />
              </div>
            ))}
          </>
        )}
        {section === 'ethics' && (
          <>
            <Field label="Titre" value={draft.ethicsTitle} onChange={v => setDraft({...draft, ethicsTitle: v})} />
            <Field label="Introduction" value={draft.ethicsText} onChange={v => setDraft({...draft, ethicsText: v})} multiline />
            <div className="text-xs uppercase tracking-widest font-mono pt-4" style={{ color: 'var(--ink-soft)' }}>Principes</div>
            {draft.ethicsPrinciples.map((p, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--cream-light)' }}>
                <Field label={`Principe ${i+1}`} value={p.title} onChange={v => updatePrinciple(i, 'title', v)} />
                <Field label="Description" value={p.text} onChange={v => updatePrinciple(i, 'text', v)} multiline />
              </div>
            ))}
            <div className="pt-4 space-y-4">
              <ImageUpload
                label="Image charte (droite)"
                value={draft.ethicsImage || ''}
                onChange={v => setDraft({...draft, ethicsImage: v})}
                preview="hero"
                help="Document ou visuel affiché à droite du texte. Par défaut : charte SFPS."
              />
              <ImageUpload
                label="Schéma déontologique"
                value={draft.ethicsSchema || ''}
                onChange={v => setDraft({...draft, ethicsSchema: v})}
                preview="hero"
                help="Schéma pleine largeur affiché en bas de page. Par défaut : schéma Individu / Confidentialité / Consentement."
              />
            </div>
          </>
        )}
        {section === 'about' && (
          <AboutSection draft={draft} setDraft={setDraft} />
        )}
        {section === 'contact' && (
          <>
            <Field label="Téléphone" value={draft.contactPhone} onChange={v => setDraft({...draft, contactPhone: v})} />
            <Field label="Email" value={draft.contactEmail} onChange={v => setDraft({...draft, contactEmail: v})} />
            <Field label="Lieu" value={draft.contactLocation} onChange={v => setDraft({...draft, contactLocation: v})} />
          </>
        )}
        {section === 'google' && (
          <>
            <div className="p-4 rounded-xl mb-4 text-sm" style={{ background: 'var(--cream-light)', border: '1px solid var(--line)' }}>
              <div className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--sage-dark)' }}>Comment configurer ?</div>
              <ol className="list-decimal list-inside space-y-1 text-xs" style={{ color: 'var(--ink-soft)' }}>
                <li>Créez un projet sur <strong>console.cloud.google.com</strong> et activez l'API <strong>Places API</strong></li>
                <li>Générez une clé API (rubrique "Identifiants") et collez-la ci-dessous</li>
                <li>Trouvez votre <strong>Place ID</strong> sur <strong>developers.google.com/maps/documentation/places/web-service/place-id</strong> en cherchant votre établissement</li>
                <li>Enregistrez — les avis réels remplacent les avis par défaut</li>
              </ol>
            </div>
            <Field label="Clé API Google" value={draft.googleApiKey || ''} onChange={v => setDraft({...draft, googleApiKey: v})} help="Clé avec Places API activée. Restreignez-la à votre domaine en production." />
            <Field label="Place ID" value={draft.googlePlaceId || ''} onChange={v => setDraft({...draft, googlePlaceId: v})} help="Ex : ChIJN1t_tDeuEmsRUsoyG83frY4" />
            {draft.googleApiKey && draft.googlePlaceId && (
              <div className="flex items-center gap-2 text-xs font-mono px-3 py-2 rounded-lg" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                <Check size={12} /> Configuration complète — les avis Google s'afficheront sur le site
              </div>
            )}
            {(!draft.googleApiKey || !draft.googlePlaceId) && (
              <div className="flex items-center gap-2 text-xs font-mono px-3 py-2 rounded-lg" style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a' }}>
                ⚠ Sans configuration, des avis fictifs s'affichent à titre d'illustration
              </div>
            )}
          </>
        )}
        {section === 'legal' && (
          <>
            <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--ink-soft)' }}>Mentions légales</div>
            <RichTextEditor value={draft.legalMentions || ''} onChange={v => setDraft({...draft, legalMentions: v})} placeholder="Mentions légales…" />
            <div className="text-xs font-mono uppercase tracking-widest mb-1 pt-4" style={{ color: 'var(--ink-soft)' }}>Politique cookies</div>
            <RichTextEditor value={draft.legalCookies || ''} onChange={v => setDraft({...draft, legalCookies: v})} placeholder="Politique cookies…" />
            <div className="text-xs font-mono uppercase tracking-widest mb-1 pt-4" style={{ color: 'var(--ink-soft)' }}>Politique de confidentialité</div>
            <RichTextEditor value={draft.legalPrivacy || ''} onChange={v => setDraft({...draft, legalPrivacy: v})} placeholder="Politique de confidentialité…" />
            <div className="text-xs font-mono uppercase tracking-widest mb-1 pt-4" style={{ color: 'var(--ink-soft)' }}>Conditions d'utilisation</div>
            <RichTextEditor value={draft.legalTerms || ''} onChange={v => setDraft({...draft, legalTerms: v})} placeholder="Conditions d'utilisation…" />
          </>
        )}
      </div>
    </div>
  );
}

function AdminMessages({ contacts, updateContacts, content, appSettings, showToast }) {
  const [selected, setSelected] = useState(null);
  const [replyModal, setReplyModal] = useState(null);

  const markRead = (id) => {
    const updated = contacts.map(c => c.id === id ? { ...c, read: true } : c);
    updateContacts(updated);
  };

  const deleteContact = (id) => {
    updateContacts(contacts.filter(c => c.id !== id));
    if (selected?.id === id) setSelected(null);
    showToast("Message supprimé");
  };

  const openReply = (contact) => {
    setReplyModal(contact);
  };

  const list = [...(contacts || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6">
      <div>
        <div className="font-display text-3xl mb-1">Messages</div>
        <div className="text-sm" style={{ color: 'var(--ink-soft)' }}>{list.length} message{list.length !== 1 ? 's' : ''} reçu{list.length !== 1 ? 's' : ''}</div>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ background: 'var(--cream)', border: '1px solid var(--line)' }}>
          <Mail size={32} style={{ color: 'var(--line)', margin: '0 auto 12px' }} />
          <div className="text-sm" style={{ color: 'var(--ink-soft)' }}>Aucun message pour le moment</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-[300px_1fr] gap-4">
          {/* Liste */}
          <div className="space-y-2">
            {list.map(c => (
              <button
                key={c.id}
                onClick={() => { setSelected(c); markRead(c.id); }}
                className="w-full text-left p-4 rounded-xl transition-all"
                style={{
                  background: selected?.id === c.id ? 'var(--ink)' : 'var(--cream)',
                  color: selected?.id === c.id ? 'var(--cream)' : 'var(--ink)',
                  border: `1px solid ${selected?.id === c.id ? 'transparent' : 'var(--line)'}`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm truncate">{c.name}</span>
                  {!c.read && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--sage-dark)' }} />}
                </div>
                <div className="text-xs truncate opacity-70">{c.subject || 'Sans sujet'}</div>
                <div className="text-[10px] mt-1 opacity-50 font-mono">
                  {new Date(c.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </button>
            ))}
          </div>

          {/* Détail */}
          {selected ? (
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--line)', background: 'var(--cream)' }}>
              <div className="px-6 py-4 flex items-start justify-between" style={{ borderBottom: '1px solid var(--line)' }}>
                <div>
                  <div className="font-display text-xl">{selected.name}</div>
                  <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                    <a href={`mailto:${selected.email}`} style={{ color: 'var(--sage-dark)' }}>{selected.email}</a>
                    {selected.phone && <> · {selected.phone}</>}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
                    {new Date(selected.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openReply(selected)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest" style={{ background: 'var(--sage-dark)', color: 'var(--cream)' }}>
                    <Mail size={12} /> Répondre
                  </button>
                  <button onClick={() => deleteContact(selected.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest" style={{ background: 'var(--cream-light)', color: 'var(--ink-soft)', border: '1px solid var(--line)' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              {selected.subject && (
                <div className="px-6 py-3 text-sm font-medium" style={{ borderBottom: '1px solid var(--line)', color: 'var(--ink-soft)' }}>
                  Sujet : {selected.subject}
                </div>
              )}
              <div className="px-6 py-5 text-sm whitespace-pre-wrap leading-relaxed">{selected.message}</div>
            </div>
          ) : (
            <div className="rounded-2xl flex items-center justify-center" style={{ border: '1px solid var(--line)', background: 'var(--cream)', minHeight: '200px' }}>
              <div className="text-sm" style={{ color: 'var(--ink-soft)' }}>Sélectionnez un message</div>
            </div>
          )}
        </div>
      )}

      {replyModal && (
        <ContactReplyModal
          contact={replyModal}
          content={content}
          appSettings={appSettings}
          onClose={() => setReplyModal(null)}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function ContactReplyModal({ contact, content, appSettings, onClose, showToast }) {
  const [subject, setSubject] = useState(`Re: ${contact.subject || 'Votre message'}`);
  const [body, setBody] = useState(`Bonjour ${contact.name.split(' ')[0]},\n\n`);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const send = async () => {
    setSending(true);
    setError(null);
    const result = await sendEmail({
      to: contact.email,
      toName: contact.name,
      subject,
      body,
      fromName: content.siteName || 'Jodie Peltier',
      replyTo: content.contactEmail || undefined,
      testEmail: appSettings?.testEmail || undefined,
    });
    setSending(false);
    if (!result.ok) { setError("Erreur d'envoi : " + result.error); return; }
    showToast("Réponse envoyée ✓");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,15,16,0.5)' }}>
      <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'var(--cream)' }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'var(--sage-dark)' }}>
          <div className="font-display text-xl" style={{ color: 'var(--cream)' }}>Répondre à {contact.name}</div>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.6)' }}><X size={18} /></button>
        </div>
        <div className="p-6 space-y-3">
          <div className="text-xs font-mono px-3 py-2 rounded-lg" style={{ background: 'var(--cream-light)', color: 'var(--ink-soft)' }}>
            À : <strong>{contact.email}</strong>
            {isSupabaseConfigured
              ? <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#dcfce7', color: '#166534' }}>Envoi automatique</span>
              : <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#fef9c3', color: '#854d0e' }}>Via votre client mail</span>}
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest font-mono mb-1" style={{ color: 'var(--ink-soft)' }}>Sujet</div>
            <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg border outline-none text-sm" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest font-mono mb-1" style={{ color: 'var(--ink-soft)' }}>Message</div>
            <textarea rows={8} value={body} onChange={e => setBody(e.target.value)} className="w-full px-3 py-2 rounded-lg border outline-none text-sm resize-none font-mono" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
          </div>
          {error && <div className="text-xs px-3 py-2 rounded-lg" style={{ background: '#fef2f2', color: '#991b1b' }}>{error}</div>}
          <div className="flex gap-3 pt-2">
            <button onClick={send} disabled={sending} className="flex-1 py-2.5 rounded-full text-sm font-mono uppercase tracking-widest" style={{ background: 'var(--sage-dark)', color: 'var(--cream)', opacity: sending ? 0.6 : 1 }}>
              {sending ? 'Envoi…' : 'Envoyer'}
            </button>
            <button onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-mono uppercase tracking-widest" style={{ background: 'var(--cream-light)', color: 'var(--ink-soft)', border: '1px solid var(--line)' }}>
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminSettings({ appSettings, updateAppSettings, showToast }) {
  const [draft, setDraft] = useState(appSettings || {});

  const save = () => { updateAppSettings(draft); showToast('Paramètres enregistrés ✓'); };

  const placeholders = (extra = []) => ['prenom', 'nom', 'date', 'heure', 'service', ...extra]
    .map(p => <code key={p} className="font-mono text-[11px] px-1 rounded" style={{ background: 'var(--cream-light)', color: 'var(--sage-dark)' }}>{`{${p}}`}</code>);

  const SField = ({ label, k, multiline, help }) => (
    <div>
      <label className="block text-xs uppercase tracking-widest font-mono mb-1" style={{ color: 'var(--ink-soft)' }}>{label}</label>
      {multiline
        ? <textarea rows={4} value={draft[k] || ''} onChange={e => setDraft({ ...draft, [k]: e.target.value })} className="w-full px-3 py-2 rounded-lg border outline-none text-sm font-mono resize-y" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />
        : <input type="text" value={draft[k] || ''} onChange={e => setDraft({ ...draft, [k]: e.target.value })} className="w-full px-3 py-2 rounded-lg border outline-none text-sm" style={{ background: 'var(--cream-light)', borderColor: 'var(--line)' }} />}
      {help && <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{help}</p>}
    </div>
  );

  const Card = ({ title, color, children }) => (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--line)' }}>
      <div className="px-5 py-3 text-sm font-mono uppercase tracking-widest" style={{ background: color || 'var(--ink)', color: 'var(--cream)' }}>{title}</div>
      <div className="p-5 space-y-4" style={{ background: 'var(--cream)' }}>{children}</div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <div className="font-display text-3xl mb-1">Paramètres</div>
        <div className="text-sm" style={{ color: 'var(--ink-soft)' }}>Configuration technique du back-office</div>
      </div>

      {/* Test email */}
      <Card title="Configuration email" color="var(--ink)">
        <SField label="Email de test (mode Resend)" k="testEmail"
          help="En mode test, tous les emails sont redirigés ici. Laissez vide pour utiliser l'email de contact." />
        <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: isSupabaseConfigured ? '#f0fdf4' : '#fef9c3', color: isSupabaseConfigured ? '#166534' : '#854d0e', border: `1px solid ${isSupabaseConfigured ? '#bbf7d0' : '#fde68a'}` }}>
          {isSupabaseConfigured ? '● Supabase connecté — envoi automatique actif' : '○ Supabase non configuré — fallback mailto'}
        </div>
      </Card>

      {/* Notification */}
      <Card title="🔔 Notification nouvelle réservation" color="var(--sage-dark)">
        <div className="text-xs flex flex-wrap gap-1 items-center" style={{ color: 'var(--ink-soft)' }}>
          Placeholders : {placeholders(['email', 'tel', 'message', 'duree'])}
        </div>
        <SField label="Sujet" k="notifSubject" />
        <SField label="Corps du message" k="notifTemplate" multiline />
      </Card>

      {/* Confirmation */}
      <Card title="✓ Email de confirmation client" color="#2d6a4f">
        <div className="text-xs flex flex-wrap gap-1 items-center" style={{ color: 'var(--ink-soft)' }}>
          Placeholders : {placeholders()}
        </div>
        <SField label="Sujet" k="emailSubjectConfirm" />
        <SField label="Corps du message" k="emailTemplateConfirm" multiline />
      </Card>

      {/* Annulation */}
      <Card title="✕ Email d'annulation client" color="#92400e">
        <div className="text-xs flex flex-wrap gap-1 items-center" style={{ color: 'var(--ink-soft)' }}>
          Placeholders : {placeholders()}
        </div>
        <SField label="Sujet" k="emailSubjectCancel" />
        <SField label="Corps du message" k="emailTemplateCancel" multiline />
      </Card>

      {/* Suppression */}
      <Card title="🗑 Email de suppression client" color="#6b2737">
        <div className="text-xs flex flex-wrap gap-1 items-center" style={{ color: 'var(--ink-soft)' }}>
          Placeholders : {placeholders()}
        </div>
        <SField label="Sujet" k="emailSubjectDelete" />
        <SField label="Corps du message" k="emailTemplateDelete" multiline />
      </Card>

      <button
        onClick={save}
        className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-mono uppercase tracking-widest transition-all hover:opacity-90"
        style={{ background: 'var(--sage-dark)', color: 'var(--cream)' }}
      >
        <Save size={14} /> Enregistrer
      </button>
    </div>
  );
}
