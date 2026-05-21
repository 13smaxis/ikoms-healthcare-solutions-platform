"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteLayout from '@/components/layout/SiteLayout';
import { supabase } from '@/lib/supabase';
import { Briefcase, Target, TrendingUp, Shield, ArrowRight } from 'lucide-react';

const ConsultancyHome: React.FC = () => {
  const [topics, setTopics] = useState<any[]>([]);
  useEffect(() => {
    supabase.from('biz_consultancy_topics').select('*').eq('is_active', true).limit(3)
      .then(({ data }) => setTopics(data || []));
  }, []);

  return (
    <SiteLayout>
      <section className="relative bg-linear-to-br from-indigo-900 to-purple-800 text-white py-20">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 max-w-3xl">Strategic advisory for modern healthcare</h1>
          <p className="text-lg text-indigo-100 max-w-2xl mb-8">From CQC readiness to full service transformation — our clinical consultants help you deliver safer, more effective care.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/consultancy/topics" className="px-6 py-3 bg-white text-indigo-800 rounded-lg font-semibold">View services</Link>
            <Link href="/contact" className="px-6 py-3 bg-emerald-600 rounded-lg font-semibold">Book a discovery call</Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { I: Shield, t: 'CQC Readiness', d: 'Mock inspections & compliance audits' },
              { I: Target, t: 'Service Design', d: 'New services & pathway redesign' },
              { I: TrendingUp, t: 'Transformation', d: 'Operational and digital transformation' },
              { I: Briefcase, t: 'Governance', d: 'Clinical governance frameworks' },
            ].map((p, i) => {
              const I = p.I;
              return (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
                  <I className="w-9 h-9 text-indigo-700 mb-3" />
                  <div className="font-semibold text-slate-900 mb-1">{p.t}</div>
                  <div className="text-sm text-slate-600">{p.d}</div>
                </div>
              );
            })}
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-8">Popular consultancy services</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {topics.map(t => (
              <Link key={t.id} href={`/consultancy/topics/${t.id}`} className="block bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition">
                <img src={t.image_url} alt={t.title} className="w-full h-40 object-cover" />
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 mb-2">{t.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">{t.description}</p>
                  <div className="text-sm font-semibold text-indigo-700 inline-flex items-center gap-1">Learn more <ArrowRight className="w-4 h-4" /></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">How we work</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {['Discovery call','Diagnostic & proposal','Delivery partnership','Handover & review'].map((s, i) => (
              <div key={i} className="p-5 bg-linear-to-br from-indigo-50 to-purple-50 rounded-xl">
                <div className="text-xs font-semibold text-indigo-700 mb-1">Step {i+1}</div>
                <div className="font-semibold text-slate-900">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default ConsultancyHome;
