"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SiteLayout from '@/components/layout/SiteLayout';
import { subscribeEmail } from '@/lib/crm';
import { supabase } from '@/lib/supabase';
import { MapPin, Briefcase, Upload, CheckCircle2, ArrowLeft } from 'lucide-react';

const JobDetail: React.FC = () => {
  const params = useParams<{ id?: string | string[] }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', cover_letter: '' });
  const [cv, setCv] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const loadJob = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error loading job:', error);
        setLoading(false);
        return;
      }

      const row = (data ?? {}) as Record<string, any>;
      const loc = row?.location as { city?: string; country?: string } | string | null;
      const mappedJob: Record<string, any> = {
        ...row,
        id: row?.id,
        title: row?.title,
        department: row?.healthcare_specialization,
        location: typeof loc === 'string' ? loc : loc ? [loc.city, loc.country].filter(Boolean).join(', ') : row?.facility_name,
        job_type: row?.employment_type?.name || 'Full-time',
        employment_type: row?.employment_type?.name || 'Full-time',
        job_level: row?.job_level?.name || 'Mid',
        status: row?.status || 'Active',
        is_active: row?.status === 'Active',
        closing_date: row?.application_deadline,
        posted_date: row?.posted_at,
        created_at: row?.posted_at,
        salary_range: row?.salary_min != null || row?.salary_max != null
          ? `${row?.salary_currency || 'ZAR'} ${Number(row?.salary_min || 0).toLocaleString()} - ${Number(row?.salary_max || 0).toLocaleString()}`
          : 'Not disclosed',
        description: row?.description,
        requirements: row?.requirements,
        required_qualifications: row?.qualifications_required || row?.requirements,
        experience_required: row?.min_years_experience ? `${row.min_years_experience}+ years` : undefined,
      };

      setJob(mappedJob);
      setLoading(false);
    };

    loadJob();
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      let cv_url: string | null = null;
      if (cv) {
        const fileName = `${Date.now()}-${cv.name}`;
        const { data: up, error: upErr } = await supabase.storage.from('cvs').upload(fileName, cv);
        if (upErr) throw upErr;
        cv_url = supabase.storage.from('cvs').getPublicUrl(up.path).data.publicUrl;
      }

      const application = {
        job_id: id,
        ...form,
        cv_url,
      } as any;

      const { error: insErr } = await supabase.from('biz_applications' as any).insert(application);
      if (insErr) throw insErr;

      try { await subscribeEmail({ email: form.email, name: form.full_name, source: 'job-application', tags: ['candidate', job.title] }); } catch {}

      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SiteLayout><div className="py-20 text-center text-slate-500">Loading...</div></SiteLayout>;
  if (!job) return <SiteLayout><div className="py-20 text-center text-slate-500">Job not found. <Link href="/recruitment/jobs" className="text-blue-700">Browse all jobs</Link></div></SiteLayout>;

  return (
    <SiteLayout>
      <section className="bg-linear-to-br from-blue-900 to-blue-700 text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/recruitment/jobs" className="inline-flex items-center gap-1 text-blue-200 text-sm mb-4 hover:text-white"><ArrowLeft className="w-4 h-4" /> All jobs</Link>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-2">{job.department}</div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">{job.title}</h1>
          <div className="flex flex-wrap gap-4 text-blue-100">
            <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
            <span className="inline-flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.job_type}</span>
            <span>{job.salary_range}</span>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">About the role</h2>
              <p className="text-slate-700 whitespace-pre-line">{job.description}</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Requirements</h2>
              <p className="text-slate-700 whitespace-pre-line">{job.requirements}</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div id="apply" className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-24">
              {done ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600 mb-3" />
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Application received</h3>
                  <p className="text-sm text-slate-600">Thanks for applying. Our team will review your CV and respond within 5 working days.</p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Apply for this role</h3>
                  <input name="full_name" required placeholder="Full name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input name="email" required type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input name="phone" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <textarea name="cover_letter" rows={4} placeholder="Brief cover note (optional)" value={form.cover_letter} onChange={e => setForm({ ...form, cover_letter: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg text-sm cursor-pointer hover:border-blue-500">
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-600 truncate">{cv ? cv.name : 'Upload your CV (PDF/DOC)'}</span>
                    <input name="cv" type="file" accept=".pdf,.doc,.docx" onChange={e => setCv(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                  {error && <div className="text-sm text-red-600">{error}</div>}
                  <button type="submit" disabled={submitting} className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold disabled:opacity-50">
                    {submitting ? 'Submitting...' : 'Submit application'}
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

export default JobDetail;