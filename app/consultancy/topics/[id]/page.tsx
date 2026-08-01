"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SiteLayout from '@/components/layout/SiteLayout';
import { subscribeEmail } from '@/lib/crm';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, ArrowLeft, Calendar } from 'lucide-react';
import { fmt } from '@/lib/cart';

const TopicDetail: React.FC = () => {
  const params = useParams<{ id?: string | string[] }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', company: '', preferred_date: '', preferred_time: '10:00', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from('biz_consultancy_topics').select('*').eq('id', id).single()
      .then(({ data }) => { setTopic(data); setLoading(false); });
  }, [id]);

  const book = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !id) return;
    setSubmitting(true);
    await supabase.from('biz_consultancy_bookings').insert({ topic_id: id, ...form } as any);
    try { await subscribeEmail({ email: form.email, name: form.full_name, source: 'consultancy-booking', tags: ['consultancy', topic.title] }); } catch {}
    setSubmitting(false); setDone(true);
  };

  if (loading) return <SiteLayout><div className="py-20 text-center">Loading...</div></SiteLayout>;
  if (!topic) return <SiteLayout><div className="py-20 text-center">Service not found. <Link href="/consultancy/topics" className="text-indigo-700">Browse all</Link></div></SiteLayout>;

  return (
    <SiteLayout>
      <section className="bg-linear-to-br from-indigo-900 to-purple-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/consultancy/topics" className="inline-flex items-center gap-1 text-indigo-200 text-sm mb-4"><ArrowLeft className="w-4 h-4" /> All services</Link>
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">{topic.title}</h1>
          <div className="text-indigo-100">{topic.duration} · From {fmt(topic.price)}</div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <img src={topic.image_url} alt={topic.title} className="w-full h-72 object-cover rounded-2xl mb-6" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">About this service</h2>
            <p className="text-slate-700 mb-6 whitespace-pre-line">{topic.description}</p>
            <h2 className="text-xl font-bold text-slate-900 mb-3">What's included</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {['Kick-off discovery workshop','Bespoke diagnostic report','Evidence-based recommendations','Implementation roadmap','Board-ready summary','Follow-up review meeting'].map((t, i) => (
                <div key={i} className="flex gap-2 text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-indigo-600 mt-0.5" /> {t}</div>
              ))}
            </div>
          </div>

          <div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-24">
              {done ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600 mb-3" />
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Request received</h3>
                  <p className="text-sm text-slate-600">A senior consultant will contact you to confirm.</p>
                </div>
              ) : (
                <form onSubmit={book} className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Book a consultation</h3>
                  <p className="text-xs text-slate-500 mb-3">Tell us a little about your organisation.</p>
                  <input required placeholder="Full name" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input placeholder="Company / organisation" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <div className="grid grid-cols-2 gap-2">
                    <input required type="date" value={form.preferred_date} onChange={e => setForm({...form, preferred_date: e.target.value})} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    <select value={form.preferred_time} onChange={e => setForm({...form, preferred_time: e.target.value})} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
                      {['09:00','10:00','11:00','13:00','14:00','15:00','16:00'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <textarea rows={3} placeholder="Brief context (optional)" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <button type="submit" disabled={submitting} className="w-full py-3 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" /> {submitting ? 'Sending...' : 'Request booking'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default TopicDetail;