"use client";

import React from 'react';
import Link from 'next/link';
import SiteLayout from '@/components/layout/SiteLayout';
import { Users, Briefcase, CheckCircle2, ArrowRight, Award, Shield, Heart } from 'lucide-react';

const RecruitmentHome: React.FC = () => (
  <SiteLayout>
    <section className="relative bg-linear-to-br from-blue-900 to-blue-700 text-white py-20">
      <div
        className="absolute inset-0 opacity-20 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=1600)' }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4 max-w-3xl">Healthcare staffing, redefined</h1>
        <p className="text-lg text-blue-100 max-w-2xl mb-8">Specialist recruitment for the NHS, private hospitals, care providers and community services across the UK.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/recruitment/jobs" className="px-6 py-3 bg-white text-blue-800 rounded-lg font-semibold">Browse open roles</Link>
          <Link href="/contact" className="px-6 py-3 bg-emerald-600 rounded-lg font-semibold">Hire staff</Link>
        </div>
      </div>
    </section>

    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { I: Users, t: 'For candidates', d: 'Find permanent, temporary and locum healthcare roles. Upload your CV once, apply in seconds.', cta: 'Browse jobs', to: '/recruitment/jobs' },
            { I: Briefcase, t: 'For employers', d: 'Access a vetted pool of clinicians, carers and allied health professionals.', cta: 'Hire staff', to: '/contact' },
            { I: Heart, t: 'Specialist areas', d: 'Nursing, mental health, allied health, social care, pharmacy, management.', cta: 'See specialisms', to: '/recruitment/jobs' },
          ].map((c, i) => {
            const I = c.I;
            return (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition">
                <I className="w-10 h-10 text-blue-700 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">{c.t}</h3>
                <p className="text-slate-600 mb-4">{c.d}</p>
                <Link href={c.to} className="inline-flex items-center gap-1 text-blue-700 font-semibold">{c.cta} <ArrowRight className="w-4 h-4" /></Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    <section className="py-16 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">Our recruitment promise</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { I: Shield, t: 'Compliance first', d: 'Full DBS and reference checks on every candidate.' },
            { I: Award, t: 'Quality matched', d: 'Matched by clinically experienced recruiters.' },
            { I: CheckCircle2, t: 'Fast turnaround', d: 'Shortlists in 48 hours for most clinical roles.' },
            { I: Users, t: 'Retention focus', d: 'We stay engaged long after placement.' },
          ].map((p, i) => {
            const I = p.I;
            return (
              <div key={i} className="text-center p-6">
                <I className="w-10 h-10 text-blue-700 mx-auto mb-3" />
                <div className="font-semibold text-slate-900 mb-1">{p.t}</div>
                <div className="text-sm text-slate-600">{p.d}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    <section className="py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Looking for your next role?</h2>
        <p className="text-slate-600 mb-6">We have hundreds of active vacancies across the UK.</p>
        <Link href="/recruitment/jobs" className="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold inline-flex items-center gap-2">Browse jobs <ArrowRight className="w-4 h-4" /></Link>
      </div>
    </section>
  </SiteLayout>
);

export default RecruitmentHome;