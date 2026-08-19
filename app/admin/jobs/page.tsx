"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

type JobForm = {
  id?: string;
  title: string;
  department: string;
  location: string;
  job_type: string;
  salary_range: string;
  description: string;
  requirements: string;
  is_active: boolean;
};

type JobApplication = {
  id: string;
  full_name: string;
  email: string;
  cv_url: string | null;
  status: string;
  job?: { title?: string | null } | null;
};

type DatabaseJob = Record<string, any> & { id: string };

const parseSalaryRange = (value: string) => {
  const amounts = value.match(/[0-9][0-9,]*(?:\.\d+)?/g)?.map((amount) => Number(amount.replace(/,/g, ''))) ?? [];
  return {
    salary_min: amounts[0] ?? null,
    salary_max: amounts[1] ?? amounts[0] ?? null,
  };
};

const toDatabaseJob = async (job: JobForm) => {
  const salary = parseSalaryRange(job.salary_range);
  const { data: employmentType, error: employmentTypeError } = await (supabase as any)
    .from('employment_types')
    .select('id')
    .ilike('name', job.job_type)
    .maybeSingle();

  if (employmentTypeError) throw employmentTypeError;

  return {
    title: job.title.trim(),
    healthcare_specialization: job.department.trim() || null,
    facility_name: job.location.trim() || null,
    description: job.description.trim() || null,
    requirements: job.requirements.trim() || null,
    ...(employmentType?.id ? { employment_type_id: employmentType.id } : {}),
    salary_currency: 'ZAR',
    salary_min: salary.salary_min,
    salary_max: salary.salary_max,
    status: job.is_active ? 'Active' : 'Inactive',
    posted_at: new Date().toISOString(),
  };
};

const toAdminJob = (job: DatabaseJob): JobForm => ({
  id: job.id,
  title: job.title ?? '',
  department: job.healthcare_specialization ?? '',
  location: job.location
    ? [job.location.city, job.location.country].filter(Boolean).join(', ')
    : job.facility_name ?? '',
  job_type: job.employment_type?.name ?? job.job_type ?? 'Full-time',
  salary_range: job.salary_min != null || job.salary_max != null
    ? `${job.salary_currency || 'ZAR'} ${Number(job.salary_min || 0).toLocaleString()} - ${Number(job.salary_max || 0).toLocaleString()}`
    : '',
  description: job.description ?? '',
  requirements: job.requirements ?? '',
  is_active: job.status === 'Active',
});
const empty: JobForm = { 
                          title: '', 
                          department: '', 
                          location: '', 
                          job_type: 'Full-time', 
                          salary_range: '', 
                          description: '', 
                          requirements: '', 
                          is_active: true 
                        };

const AdminJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobForm[]>([]);
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<JobForm>(empty);
  const [view, setView] = useState<'jobs' | 'applications'>('jobs');
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = async () => {
    const { data: jobsData, error: jobsError } = await supabase
      .from('jobs')
      .select(`
        *,
        employment_type:employment_types(id, name),
        job_level:job_levels(id, name),
        location:locations(id, city, country)
      `)
      .order('posted_at', { ascending: false });

    if (jobsError) {
      console.error('Error loading jobs:', jobsError);
      setJobs([]);
      return;
    }

    setJobs((jobsData || []).map((job: any) => ({
      ...job,
      id: job.id,
      title: job.title,
      department: job.healthcare_specialization,
      location: job.location ? [job.location.city, job.location.country].filter(Boolean).join(', ') : job.facility_name,
      job_type: job.employment_type?.name || 'Full-time',
      salary_range: job.salary_min != null || job.salary_max != null
        ? `${job.salary_currency || 'ZAR'} ${Number(job.salary_min || 0).toLocaleString()} - ${Number(job.salary_max || 0).toLocaleString()}`
        : 'Not disclosed',
      description: job.description,
      requirements: job.requirements,
      is_active: job.status === 'Active',
    })));

    const { data: a } = await supabase
      .from('applications')
      .select('*, job:jobs(title)')
      .order('createdat', { ascending: false });
    setApps(a || []);
  };
  useEffect(() => {
    const handleFocusRefresh = () => {
      void load();
    };

    void load();
    window.addEventListener('soft-focus-refresh', handleFocusRefresh);
    return () => window.removeEventListener('soft-focus-refresh', handleFocusRefresh);
  }, []);

  const save = async () => {
    setSaveError(null);

    if (!editing.title.trim()) {
      setSaveError('A job title is required.');
      return;
    }

    let payload;
    try {
      payload = await toDatabaseJob(editing);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to prepare this job.');
      return;
    }

    const result = editing.id
      ? await (supabase as any).from('jobs').update(payload).eq('id', editing.id).select(`
          *, employment_type:employment_types(id, name), job_level:job_levels(id, name), location:locations(id, city, country)
        `).single()
      : await (supabase as any).from('jobs').insert(payload).select(`
          *, employment_type:employment_types(id, name), job_level:job_levels(id, name), location:locations(id, city, country)
        `).single();

    if (result.error) {
      console.error('Error saving job:', result.error);
      setSaveError(result.error.message || 'Unable to save this job.');
      return;
    }

    const savedJob = toAdminJob(result.data as DatabaseJob);
    setJobs((currentJobs) => editing.id
      ? currentJobs.map((job) => job.id === savedJob.id ? savedJob : job)
      : [savedJob, ...currentJobs]);
    setModal(false);
    setEditing(empty);
    void load();
  };
  
  const del = async (id: string) => {
    if (!confirm('Delete this job?')) return;
    await (supabase as any)
    .from('jobs')
    .delete()
    .eq('id', id); 
    load();
  };

  const updateAppStatus = async (id: string, status: string) => {
    await (supabase as any)
    .from('applications')
    .update({ status } as any)
    .eq('id', id); 
    load();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Recruitment</h1>
          <div className="text-sm text-slate-500 mt-1">Manage jobs and applications.</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl mb-6 overflow-x-auto">
        <div className="flex items-center">
          <button onClick={() => setView('jobs')} className={`inline-flex items-center px-5 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${view === 'jobs' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>Jobs ({jobs.length})</button>
          <button onClick={() => setView('applications')} className={`inline-flex items-center px-5 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${view === 'applications' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>Applications ({apps.length})</button>
          {view === 'jobs' && <button onClick={() => { setEditing(empty); setModal(true); }} className="ml-auto mr-3 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold inline-flex items-center gap-1"><Plus className="w-4 h-4" /> Add job</button>}
        </div>
      </div>

      {view === 'jobs' ? (
        <div className="bg-amber-50/50 border border-amber-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-amber-100/60 border-b border-amber-200">
              <tr className="text-left"><th className="p-3">Title</th><th className="p-3">Department</th><th className="p-3">Location</th><th className="p-3">Type</th><th className="p-3">Status</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id} className="border-b border-amber-100">
                  <td className="p-3 font-semibold">{j.title}</td>
                  <td className="p-3">{j.department}</td>
                  <td className="p-3">{j.location}</td>
                  <td className="p-3">{j.job_type}</td>
                  <td className="p-3">{j.is_active ? <span className="text-emerald-700">Active</span> : <span className="text-slate-500">Inactive</span>}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => { setEditing(j); setModal(true); }} className="p-1.5 text-slate-600 hover:text-blue-700"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => j.id && del(j.id)} className="p-1.5 text-slate-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-amber-50/50 border border-amber-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-amber-100/60 border-b border-amber-200">
              <tr className="text-left"><th className="p-3">Name</th><th className="p-3">Job</th><th className="p-3">Email</th><th className="p-3">CV</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {apps.map(a => (
                <tr key={a.id} className="border-b border-amber-100">
                  <td className="p-3 font-semibold">{a.full_name}</td>
                  <td className="p-3">{a.job?.title}</td>
                  <td className="p-3"><a href={`mailto:${a.email}`} className="text-blue-700">{a.email}</a></td>
                  <td className="p-3">{a.cv_url ? <a href={a.cv_url} target="_blank" rel="noreferrer" className="text-blue-700">Download</a> : '—'}</td>
                  <td className="p-3">
                    <select value={a.status} onChange={(e) => updateAppStatus(a.id, e.target.value)} className="px-2 py-1 border border-slate-300 rounded text-xs">
                      <option value="new">New</option><option value="reviewing">Reviewing</option><option value="shortlisted">Shortlisted</option><option value="rejected">Rejected</option><option value="hired">Hired</option>
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
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold">{editing.id ? 'Edit job' : 'New job'}</h3>
              <button onClick={() => setModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-3">
              <input placeholder="Title" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Department" value={editing.department} onChange={e => setEditing({ ...editing, department: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" />
                <input placeholder="Location" value={editing.location} onChange={e => setEditing({ ...editing, location: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" />
                <select value={editing.job_type} onChange={e => setEditing({ ...editing, job_type: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg">
                  <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Locum</option>
                </select>
                <input placeholder="Salary range" value={editing.salary_range} onChange={e => setEditing({ ...editing, salary_range: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <textarea rows={4} placeholder="Description" value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              <textarea rows={3} placeholder="Requirements" value={editing.requirements} onChange={e => setEditing({ ...editing, requirements: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} /> Active (visible on site)</label>
              {saveError && <p className="text-sm text-red-600">{saveError}</p>}
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg">Cancel</button>
              <button onClick={save} className="px-4 py-2 bg-blue-700 text-white rounded-lg font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobsPage;