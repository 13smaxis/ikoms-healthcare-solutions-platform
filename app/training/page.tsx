"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteLayout from '@/components/layout/SiteLayout';
import { supabase } from '@/lib/supabase';
import { GraduationCap, Award, Clock, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { fmt } from '@/lib/cart';

const TrainingHome: React.FC = () => {
  const [featured, setFeatured] = useState<any[]>([]);
  useEffect(() => {
    supabase.from('biz_courses').select('*').eq('is_active', true).order('start_date').limit(3)
      .then(({ data }) => setFeatured(data || []));
  }, []);

  return (
    <SiteLayout>
      <section className="relative bg-linear-to-br from-emerald-800 to-teal-700 text-white py-20">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1600)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 max-w-3xl">CPD-accredited training, delivered by experts</h1>
          <p className="text-lg text-emerald-100 max-w-2xl mb-8">Clinical, compliance and leadership courses for healthcare professionals, teams and whole organisations.</p>
          <Link href="/training/courses" className="px-6 py-3 bg-white text-emerald-800 rounded-lg font-semibold inline-flex items-center gap-2">View all courses <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Upcoming featured courses</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featured.map(c => (
              <Link key={c.id} href={`/training/courses/${c.id}`} className="block bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition">
                <img src={c.image_url} alt={c.title} className="w-full h-44 object-cover" />
                <div className="p-5">
                  <div className="text-xs font-semibold text-emerald-700 mb-1">{c.category}</div>
                  <h3 className="font-bold text-slate-900 mb-2">{c.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                    <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {c.duration}</span>
                    <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(c.start_date).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{fmt(c.price)}</span>
                    <span className="text-sm font-semibold text-emerald-700">Book →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Training built for real healthcare settings</h2>
            <div className="space-y-3">
              {[
                'CPD-certified and CQC-aligned curriculum',
                'Delivered by registered clinicians and subject experts',
                'Blended, face-to-face and fully online delivery options',
                'Group bookings and bespoke in-house training available',
                'Certificates issued immediately on completion',
              ].map((t, i) => (
                <div key={i} className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" /><span className="text-slate-700">{t}</span></div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { I: GraduationCap, n: '12+', l: 'Live courses' },
              { I: Award, n: '5,000+', l: 'Learners trained' },
              { I: Clock, n: '1–3', l: 'Day durations' },
              { I: CheckCircle2, n: '98%', l: 'Pass rate' },
            ].map((s, i) => {
              const I = s.I;
              return (
                <div key={i} className="p-6 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl text-center">
                  <I className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{s.n}</div>
                  <div className="text-xs text-slate-600">{s.l}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default TrainingHome;