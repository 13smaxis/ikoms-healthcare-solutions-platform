"use client";

import React, { useState } from 'react';
import SiteLayout from '@/components/layout/SiteLayout';
import { COMPANY } from '@/lib/constants';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General enquiry', message: '' });
  const [status, setStatus] = useState<'idle'|'sending'|'done'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await fetch('https://famous.ai/api/crm/69ea64be485fe0443f9c974c/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, name: form.name, source: 'contact-form', tags: ['contact', form.subject] })
      });
    } catch {}
    setStatus('done');
    setForm({ name: '', email: '', subject: 'General enquiry', message: '' });
  };

  return (
    <SiteLayout>
      <section className="relative overflow-hidden text-white py-16">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600)' }}
        />
        <div className="absolute inset-0 bg-linear-to-br from-blue-900/95 to-emerald-800/95" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-3">Get in touch</h1>
          <p className="text-blue-100 max-w-2xl">Whether you need staff, training, strategic advice or supplies — our team is ready to help.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            {status === 'done' ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 mx-auto bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mb-4">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Thanks — we've received your message.</h3>
                <p className="text-slate-600">One of our team will be in touch within 1 working day.</p>
                <button onClick={() => setStatus('idle')} className="mt-6 px-5 py-2 bg-blue-700 text-white rounded-md">Send another</button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Send us a message</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input name="name" required placeholder="Full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" />
                  <input name="email" required type="email" placeholder="Email address" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" />
                </div>
                <select name="subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg">
                  <option>General enquiry</option>
                  <option>Recruitment - hire staff</option>
                  <option>Training booking</option>
                  <option>Consultancy</option>
                  <option>Shop / products</option>
                </select>
                <textarea name="message" required rows={6} placeholder="How can we help?" value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
                <button type="submit" disabled={status === 'sending'} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50">
                  <Send className="w-4 h-4" /> {status === 'sending' ? 'Sending...' : 'Send message'}
                </button>
              </form>
            )}
          </div>
          <div className="space-y-4">
            {[
              { I: Phone, t: 'Phone', d: COMPANY.contact.phone, sub: 'Mon–Fri 8am–6pm' },
              { I: Mail, t: 'Email', d: COMPANY.contact.email, sub: 'We reply within 1 working day' },
              { I: MapPin, t: 'Office', d: `${COMPANY.address.line1}, ${COMPANY.address.line2}, ${COMPANY.address.city}`, sub: COMPANY.address.country },
            ].map((c, i) => {
              const I = c.I;
              return (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
                  <I className="w-5 h-5 text-blue-700 mb-2" />
                  <div className="font-semibold text-slate-900">{c.t}</div>
                  <div className="text-sm text-slate-700">{c.d}</div>
                  <div className="text-xs text-slate-500">{c.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Contact;
