"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteLayout from '@/components/layout/SiteLayout';
import { supabase } from '@/lib/supabase';
import { ArrowRight } from 'lucide-react';
import { fmt } from '@/lib/cart';

const TopicsList: React.FC = () => {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('biz_consultancy_topics').select('*').eq('is_active', true).order('created_at')
      .then(({ data }) => { setTopics(data || []); setLoading(false); });
  }, []);

  return (
    <SiteLayout>
      <section className="bg-linear-to-br from-indigo-900 to-purple-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-2">Consultancy · Services</div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Our consultancy services</h1>
          <p className="text-indigo-100">{topics.length} flagship engagements tailored to your organisation.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? <div className="text-center py-12 text-slate-500">Loading...</div> : (
            <div className="grid md:grid-cols-2 gap-6">
              {topics.map(t => (
                <Link key={t.id} href={`/consultancy/topics/${t.id}`} className="flex bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-indigo-500 transition">
                  <img src={t.image_url} alt={t.title} className="w-44 h-auto object-cover hidden sm:block" />
                  <div className="p-6 flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{t.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-3 mb-3">{t.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-500">{t.duration}</div>
                        <div className="text-lg font-bold text-slate-900">From {fmt(t.price)}</div>
                      </div>
                      <span className="text-sm font-semibold text-indigo-700 inline-flex items-center gap-1">Details <ArrowRight className="w-4 h-4" /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default TopicsList;