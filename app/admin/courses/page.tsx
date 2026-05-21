"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, X, ArrowLeft } from 'lucide-react';
import { fmt } from '@/lib/cart';

type CourseForm = {
  id?: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  start_date: string;
  price: number;
  seats: number;
  image_url: string;
  is_active: boolean;
};

type CourseBooking = { id: string; full_name: string; email: string; organization: string; status: string; course?: { title?: string | null } | null; };

const empty: CourseForm = { title: '', category: '', description: '', duration: '1 day', start_date: '', price: 15000, seats: 20, image_url: '', is_active: true };

const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseForm[]>([]);
  const [bookings, setBookings] = useState<CourseBooking[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<CourseForm>(empty);
  const [view, setView] = useState<'courses' | 'bookings'>('courses');

  const load = async () => {
    const { data } = await supabase.from('biz_courses').select('*').order('start_date');
    setCourses(data || []);
    const { data: b } = await supabase.from('biz_course_bookings').select('*, course:biz_courses(title)').order('created_at', { ascending: false });
    setBookings(b || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = { ...editing, price: Number(editing.price), seats: Number(editing.seats) };
    if (editing.id) await supabase.from('biz_courses').update(payload).eq('id', editing.id);
    else await supabase.from('biz_courses').insert(payload);
    setModal(false); setEditing(empty); load();
  };
  const del = async (id: string) => { if (!confirm('Delete this course?')) return; await supabase.from('biz_courses').delete().eq('id', id); load(); };
  const updBooking = async (id: string, status: string) => { await supabase.from('biz_course_bookings').update({ status }).eq('id', id); load(); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-2"><ArrowLeft className="w-4 h-4" /> Back to dashboard</Link>
          <h1 className="text-3xl font-bold text-slate-900">Training</h1>
          <div className="text-sm text-slate-500 mt-1">Manage courses and bookings.</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl mb-6 overflow-x-auto">
        <div className="flex items-center">
          <button onClick={() => setView('courses')} className={`inline-flex items-center px-5 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${view === 'courses' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>Courses ({courses.length})</button>
          <button onClick={() => setView('bookings')} className={`inline-flex items-center px-5 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${view === 'bookings' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>Bookings ({bookings.length})</button>
          {view === 'courses' && <button onClick={() => { setEditing(empty); setModal(true); }} className="ml-auto mr-3 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold inline-flex items-center gap-1"><Plus className="w-4 h-4" /> Add course</button>}
        </div>
      </div>

      {view === 'courses' ? (
        <div className="bg-amber-50/50 border border-amber-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-amber-100/60 border-b border-amber-200"><tr className="text-left"><th className="p-3">Title</th><th className="p-3">Category</th><th className="p-3">Date</th><th className="p-3">Price</th><th className="p-3">Seats</th><th className="p-3"></th></tr></thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id} className="border-b border-amber-100">
                  <td className="p-3 font-semibold">{c.title}</td>
                  <td className="p-3">{c.category}</td>
                  <td className="p-3">{c.start_date}</td>
                  <td className="p-3">{fmt(c.price)}</td>
                  <td className="p-3">{c.seats}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => { setEditing(c); setModal(true); }} className="p-1.5 text-slate-600 hover:text-emerald-700"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => c.id && del(c.id)} className="p-1.5 text-slate-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-amber-50/50 border border-amber-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-amber-100/60 border-b border-amber-200"><tr className="text-left"><th className="p-3">Name</th><th className="p-3">Course</th><th className="p-3">Email</th><th className="p-3">Org</th><th className="p-3">Status</th></tr></thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className="border-b border-amber-100">
                  <td className="p-3 font-semibold">{b.full_name}</td>
                  <td className="p-3">{b.course?.title}</td>
                  <td className="p-3"><a href={`mailto:${b.email}`} className="text-blue-700">{b.email}</a></td>
                  <td className="p-3">{b.organization}</td>
                  <td className="p-3">
                    <select value={b.status} onChange={e => updBooking(b.id, e.target.value)} className="px-2 py-1 border border-slate-300 rounded text-xs">
                      <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option><option value="attended">Attended</option>
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
            <div className="p-6 border-b flex items-center justify-between"><h3 className="text-lg font-bold">{editing.id ? 'Edit course' : 'New course'}</h3><button onClick={() => setModal(false)}><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-3">
              <input placeholder="Title" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Category" value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" />
                <input placeholder="Duration" value={editing.duration} onChange={e => setEditing({ ...editing, duration: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" />
                <input type="date" placeholder="Start date" value={editing.start_date || ''} onChange={e => setEditing({ ...editing, start_date: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" />
                <input type="number" placeholder="Price (cents)" value={editing.price} onChange={e => setEditing({ ...editing, price: Number(e.target.value) })} className="px-3 py-2 border border-slate-300 rounded-lg" />
                <input type="number" placeholder="Seats" value={editing.seats} onChange={e => setEditing({ ...editing, seats: Number(e.target.value) })} className="px-3 py-2 border border-slate-300 rounded-lg" />
                <input placeholder="Image URL" value={editing.image_url} onChange={e => setEditing({ ...editing, image_url: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <textarea rows={4} placeholder="Description" value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
              <button onClick={() => setModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg">Cancel</button>
              <button onClick={save} className="px-4 py-2 bg-emerald-700 text-white rounded-lg font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoursesPage;