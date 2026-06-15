"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { fmt } from '@/lib/cart';

type ConsultancyTopicForm = { id?: string; title: string; description: string; duration: string; price: number; image_url: string; is_active: boolean; };
type ConsultancyBooking = { id: string; full_name: string; company: string; preferred_date: string; preferred_time: string; email: string; status: string; topic?: { title?: string | null } | null; };
const empty: ConsultancyTopicForm = { title: '', description: '', duration: '2 weeks', price: 200000, image_url: '', is_active: true };

const AdminConsultancyPage: React.FC = () => {
  const [topics, setTopics] = useState<ConsultancyTopicForm[]>([]);
  const [bookings, setBookings] = useState<ConsultancyBooking[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<ConsultancyTopicForm>(empty);
  const [view, setView] = useState<'topics' | 'bookings'>('topics');

  const load = async () => {
    const { data } = await supabase.from('biz_consultancy_topics').select('*').order('created_at', { ascending: false });
    setTopics(data || []);
    const { data: b } = await supabase.from('biz_consultancy_bookings').select('*, topic:biz_consultancy_topics(title)').order('created_at', { ascending: false });
    setBookings(b || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = { ...editing, price: Number(editing.price) };
    if (editing.id) await supabase.from('biz_consultancy_topics').update(payload).eq('id', editing.id);
    else await supabase.from('biz_consultancy_topics').insert(payload);
    setModal(false); setEditing(empty); load();
  };
  const del = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('biz_consultancy_topics').delete().eq('id', id); load(); };
  const updBooking = async (id: string, status: string) => { await supabase.from('biz_consultancy_bookings').update({ status }).eq('id', id); load(); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Consultancy</h1>
          <div className="text-sm text-slate-500 mt-1">Manage consultancy services and bookings.</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl mb-6 overflow-x-auto">
        <div className="flex items-center">
          <button onClick={() => setView('topics')} className={`inline-flex items-center px-5 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${view === 'topics' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>Services ({topics.length})</button>
          <button onClick={() => setView('bookings')} className={`inline-flex items-center px-5 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${view === 'bookings' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>Bookings ({bookings.length})</button>
          {view === 'topics' && <button onClick={() => { setEditing(empty); setModal(true); }} className="ml-auto mr-3 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold inline-flex items-center gap-1"><Plus className="w-4 h-4" /> Add service</button>}
        </div>
      </div>

      {view === 'topics' ? (
        <div className="bg-amber-50/50 border border-amber-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-amber-100/60 border-b border-amber-200"><tr className="text-left"><th className="p-3">Title</th><th className="p-3">Duration</th><th className="p-3">Price</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
            <tbody>
              {topics.map(t => (
                <tr key={t.id} className="border-b border-amber-100">
                  <td className="p-3 font-semibold">{t.title}</td>
                  <td className="p-3">{t.duration}</td>
                  <td className="p-3">{fmt(t.price)}</td>
                  <td className="p-3">{t.is_active ? <span className="text-emerald-700">Active</span> : <span>Inactive</span>}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => { setEditing(t); setModal(true); }} className="p-1.5 text-slate-600 hover:text-indigo-700"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => t.id && del(t.id)} className="p-1.5 text-slate-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-amber-50/50 border border-amber-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-amber-100/60 border-b border-amber-200"><tr className="text-left"><th className="p-3">Name</th><th className="p-3">Service</th><th className="p-3">Company</th><th className="p-3">Date</th><th className="p-3">Email</th><th className="p-3">Status</th></tr></thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className="border-b border-amber-100">
                  <td className="p-3 font-semibold">{b.full_name}</td>
                  <td className="p-3">{b.topic?.title}</td>
                  <td className="p-3">{b.company}</td>
                  <td className="p-3">{b.preferred_date} {b.preferred_time}</td>
                  <td className="p-3"><a href={`mailto:${b.email}`} className="text-blue-700">{b.email}</a></td>
                  <td className="p-3">
                    <select value={b.status} onChange={e => updBooking(b.id, e.target.value)} className="px-2 py-1 border border-slate-300 rounded text-xs">
                      <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between"><h3 className="text-lg font-bold">{editing.id ? 'Edit' : 'New service'}</h3><button onClick={() => setModal(false)}><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-3">
              <input placeholder="Title" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Duration" value={editing.duration} onChange={e => setEditing({ ...editing, duration: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" />
                <input type="number" placeholder="Price (cents)" value={editing.price} onChange={e => setEditing({ ...editing, price: Number(e.target.value) })} className="px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <input placeholder="Image URL" value={editing.image_url} onChange={e => setEditing({ ...editing, image_url: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              <textarea rows={5} placeholder="Description" value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
              <button onClick={() => setModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg">Cancel</button>
              <button onClick={save} className="px-4 py-2 bg-indigo-700 text-white rounded-lg font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConsultancyPage;