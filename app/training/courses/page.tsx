"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import SiteLayout from '@/components/layout/SiteLayout';
import { supabase } from '@/lib/supabase';
import { Search, Clock, Calendar } from 'lucide-react';
import { fmt } from '@/lib/cart';

const CoursesList: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');

  useEffect(() => {
    supabase.from('biz_courses').select('*').eq('is_active', true).order('start_date')
      .then(({ data }) => { setCourses(data || []); setLoading(false); });
  }, []);

  const cats = useMemo(() => ['all', ...Array.from(new Set(courses.map(c => c.category).filter(Boolean)))], [courses]);
  const filtered = courses.filter(c => (!q || c.title.toLowerCase().includes(q.toLowerCase())) && (cat === 'all' || c.category === cat));

  return (
    <SiteLayout>
      <section className="bg-linear-to-br from-emerald-800 to-teal-700 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-2">Training · All courses</div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Browse our course catalogue</h1>
          <p className="text-emerald-100">{courses.length} CPD-accredited courses across clinical, compliance and leadership.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 grid md:grid-cols-3 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="q" value={q} onChange={e => setQ(e.target.value)} placeholder="Search courses..." className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm" />
            </div>
            <select value={cat} onChange={e => setCat(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm">
              {cats.map(c => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}
            </select>
          </div>

          {loading ? <div className="text-center py-12 text-slate-500">Loading courses...</div> : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(c => (
                <Link key={c.id} href={`/training/courses/${c.id}`} className="block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-emerald-500 transition">
                  <img src={c.image_url} alt={c.title} className="w-full h-40 object-cover" />
                  <div className="p-5">
                    <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">{c.category}</div>
                    <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">{c.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">{c.description}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                      <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {c.duration}</span>
                      <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(c.start_date).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="font-bold text-slate-900">{fmt(c.price)}</span>
                      <span className="text-sm font-semibold text-emerald-700">Book →</span>
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

export default CoursesList;