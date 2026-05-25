"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import SiteLayout from '@/components/layout/SiteLayout';
import { supabase } from '@/lib/supabase';
import { MapPin, Briefcase, Search, ArrowRight } from 'lucide-react';

const JobsList: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('all');
  const [type, setType] = useState('all');

  useEffect(() => {
    supabase.from('biz_jobs').select('*').eq('is_active', true).order('created_at', { ascending: false })
      .then(({ data }) => { setJobs(data || []); setLoading(false); });
  }, []);

  const departments = useMemo(() => ['all', ...Array.from(new Set(jobs.map(j => j.department).filter(Boolean)))], [jobs]);
  const types = useMemo(() => ['all', ...Array.from(new Set(jobs.map(j => j.job_type).filter(Boolean)))], [jobs]);

  const filtered = jobs.filter(j => {
    const matchQ = !q || j.title.toLowerCase().includes(q.toLowerCase()) || j.location?.toLowerCase().includes(q.toLowerCase());
    const matchD = dept === 'all' || j.department === dept;
    const matchT = type === 'all' || j.job_type === type;
    return matchQ && matchD && matchT;
  });

  return (
    <SiteLayout>
      <section className="bg-linear-to-br from-blue-900 to-blue-700 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-2">Recruitment · Open roles</div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Current vacancies</h1>
          <p className="text-blue-100">Browse {jobs.length} active healthcare roles across the UK.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 grid md:grid-cols-4 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="q" value={q} onChange={e => setQ(e.target.value)} placeholder="Search by title or location..." className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm" />
            </div>
            <select value={dept} onChange={e => setDept(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm">
              {departments.map(d => <option key={d} value={d}>{d === 'all' ? 'All departments' : d}</option>)}
            </select>
            <select value={type} onChange={e => setType(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm">
              {types.map(t => <option key={t} value={t}>{t === 'all' ? 'All types' : t}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading roles...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No roles match your filters.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map(job => (
                <Link key={job.id} href={`/recruitment/jobs/${job.id}`} className="block bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">{job.department}</div>
                      <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                    </div>
                    <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium">{job.job_type}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                    <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                    <span className="inline-flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.salary_range}</span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">{job.description}</p>
                  <div className="text-sm font-semibold text-blue-700 inline-flex items-center gap-1">View role & apply <ArrowRight className="w-4 h-4" /></div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default JobsList;