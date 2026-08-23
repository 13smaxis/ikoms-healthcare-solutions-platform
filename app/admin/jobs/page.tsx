"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

type JobForm = {
  id?: string;
  title: string;
  location: string;
  job_type: string;
  description: string;
  requirements: string;
  salary_range: string;
  salary_min: string;
  salary_max: string;
  salary_currency: string;
  benefits: string;
  qualifications_required: string;
  min_years_experience: string;
  required_skills: string;
  healthcare_specialization: string;
  shift_type: string;
  total_positions: string;
  positions_filled: string;
  is_active: boolean;
  is_urgent: boolean;
  application_deadline: string;
  contact_email: string;
  contact_phone: string;
  hiring_manager_name: string;
  hiring_manager_email: string;
};

type JobApplication = {
  id: string;
  full_name: string;
  email: string;
  cv_url: string | null;
  status: string;
  job?: { title?: string | null } | null;
};

const empty: JobForm = {
  title: '', location: '', job_type: 'Full-time', description: '', requirements: '',
  salary_range: '', salary_min: '', salary_max: '', salary_currency: 'ZAR', benefits: '',
  qualifications_required: '', min_years_experience: '', required_skills: '', healthcare_specialization: '',
  shift_type: 'Day', total_positions: '1', positions_filled: '0', is_active: true, is_urgent: false,
  application_deadline: '', contact_email: '', contact_phone: '', hiring_manager_name: '', hiring_manager_email: '',
};

const AdminJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobForm[]>([]);
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<JobForm>(empty);
  const [view, setView] = useState<'jobs' | 'applications'>('jobs');

  const load = async () => {
    const { data: jobsData, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .order('posted_at', { ascending: false });

    if (jobsError) {
      console.error('Error loading jobs:', jobsError);
      setJobs([]);
      return;
    }

    setJobs((jobsData || []).map((job: any) => ({
      ...empty,
      ...job,
      title: job.title || '',
      location: job.location || '',
      job_type: job.job_type || 'Full-time',
      description: job.description || '',
      requirements: job.requirements || '',
      salary_range: job.salary_range || '',
      salary_currency: job.salary_currency || 'ZAR',
      benefits: job.benefits || '',
      qualifications_required: job.qualifications_required || '',
      required_skills: job.required_skills || '',
      healthcare_specialization: job.healthcare_specialization || '',
      shift_type: job.shift_type || 'Day',
      contact_email: job.contact_email || '',
      contact_phone: job.contact_phone || '',
      hiring_manager_name: job.hiring_manager_name || '',
      hiring_manager_email: job.hiring_manager_email || '',
      salary_min: job.salary_min == null ? '' : String(job.salary_min),
      salary_max: job.salary_max == null ? '' : String(job.salary_max),
      min_years_experience: job.min_years_experience == null ? '' : String(job.min_years_experience),
      total_positions: String(job.total_positions ?? 1),
      positions_filled: String(job.positions_filled ?? 0),
      application_deadline: job.application_deadline || '',
      is_active: job.is_active ?? true,
      is_urgent: job.is_urgent ?? false,
    })));

    const { data: a } = await supabase
      .from('applications')
      .select('*, job:jobs(title)')
      .order('createdat', { ascending: false });
    setApps(a || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const salaryMin = editing.salary_min === '' ? null : Number(editing.salary_min);
    const salaryMax = editing.salary_max === '' ? null : Number(editing.salary_max);
    const minYears = editing.min_years_experience === '' ? null : Number(editing.min_years_experience);
    const totalPositions = Number(editing.total_positions);
    const positionsFilled = editing.positions_filled === '' ? 0 : Number(editing.positions_filled);

    if (!editing.title.trim() || !editing.location.trim() || !editing.description.trim() || !editing.requirements.trim()) {
      alert('Title, location, description, and requirements are required.');
      return;
    }
    if ([salaryMin, salaryMax, minYears, totalPositions, positionsFilled].some(value => value !== null && !Number.isFinite(value))) {
      alert('Numeric fields must contain valid numbers.');
      return;
    }
    if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) {
      alert('Minimum salary cannot exceed maximum salary.');
      return;
    }
    if (!Number.isInteger(totalPositions) || totalPositions < 1 || !Number.isInteger(positionsFilled) || positionsFilled < 0 || positionsFilled > totalPositions) {
      alert('Positions must be whole numbers, with at least one total position.');
      return;
    }

    const payload = {
      title: editing.title.trim(),
      location: editing.location.trim(),
      job_type: editing.job_type,
      description: editing.description.trim(),
      requirements: editing.requirements.trim(),
      salary_range: editing.salary_range.trim() || null,
      salary_min: salaryMin,
      salary_max: salaryMax,
      salary_currency: editing.salary_currency.trim() || null,
      benefits: editing.benefits.trim() || null,
      qualifications_required: editing.qualifications_required.trim() || null,
      min_years_experience: minYears,
      required_skills: editing.required_skills.trim() || null,
      healthcare_specialization: editing.healthcare_specialization.trim() || null,
      shift_type: editing.shift_type || null,
      total_positions: totalPositions,
      positions_filled: positionsFilled,
      is_active: editing.is_active,
      is_urgent: editing.is_urgent,
      application_deadline: editing.application_deadline || null,
      contact_email: editing.contact_email.trim() || null,
      contact_phone: editing.contact_phone.trim() || null,
      hiring_manager_name: editing.hiring_manager_name.trim() || null,
      hiring_manager_email: editing.hiring_manager_email.trim() || null,
    };

    const query = editing.id
      ? (supabase as any).from('jobs').update(payload).eq('id', editing.id)
      : (supabase as any).from('jobs').insert(payload);
    const { error } = await query;
    if (error) {
      alert(error.message);
      return;
    }
    setModal(false); setEditing(empty); load();
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
                  <td className="p-3">{j.healthcare_specialization || 'General'}</td>
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
              <input required placeholder="Title" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input required placeholder="Location" value={editing.location} onChange={e => setEditing({ ...editing, location: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" />
                <input placeholder="Healthcare specialization" value={editing.healthcare_specialization} onChange={e => setEditing({ ...editing, healthcare_specialization: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" />
                <select value={editing.job_type} onChange={e => setEditing({ ...editing, job_type: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg">
                  <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Locum</option>
                </select>
                <input placeholder="Salary range" value={editing.salary_range} onChange={e => setEditing({ ...editing, salary_range: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" />
                <input type="number" min="0" step="0.01" placeholder="Minimum salary" value={editing.salary_min} onChange={e => setEditing({ ...editing, salary_min: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" />
                <input type="number" min="0" step="0.01" placeholder="Maximum salary" value={editing.salary_max} onChange={e => setEditing({ ...editing, salary_max: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" />
                <input maxLength={3} placeholder="Currency (e.g. ZAR)" value={editing.salary_currency} onChange={e => setEditing({ ...editing, salary_currency: e.target.value.toUpperCase() })} className="px-3 py-2 border border-slate-300 rounded-lg" />
                <select value={editing.shift_type} onChange={e => setEditing({ ...editing, shift_type: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg">
                  <option>Day</option><option>Night</option><option>Rotating</option><option>Flexible</option>
                </select>
                <input type="number" min="1" step="1" required placeholder="Total positions" value={editing.total_positions} onChange={e => setEditing({ ...editing, total_positions: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" />
                <input type="number" min="0" step="1" placeholder="Positions filled" value={editing.positions_filled} onChange={e => setEditing({ ...editing, positions_filled: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" />
                <input type="date" min={new Date().toISOString().split('T')[0]} placeholder="Application deadline" value={editing.application_deadline} onChange={e => setEditing({ ...editing, application_deadline: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <textarea required rows={4} placeholder="Description" value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              <textarea required rows={3} placeholder="Requirements" value={editing.requirements} onChange={e => setEditing({ ...editing, requirements: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              <textarea rows={3} placeholder="Benefits" value={editing.benefits} onChange={e => setEditing({ ...editing, benefits: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              <textarea rows={3} placeholder="Qualifications required" value={editing.qualifications_required} onChange={e => setEditing({ ...editing, qualifications_required: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              <textarea rows={2} placeholder="Required skills" value={editing.required_skills} onChange={e => setEditing({ ...editing, required_skills: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="number" min="0" step="1" placeholder="Minimum years of experience" value={editing.min_years_experience} onChange={e => setEditing({ ...editing, min_years_experience: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" />
                <input type="email" placeholder="Contact email" value={editing.contact_email} onChange={e => setEditing({ ...editing, contact_email: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" />
                <input placeholder="Contact phone" value={editing.contact_phone} onChange={e => setEditing({ ...editing, contact_phone: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" />
                <input placeholder="Hiring manager name" value={editing.hiring_manager_name} onChange={e => setEditing({ ...editing, hiring_manager_name: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" />
                <input type="email" placeholder="Hiring manager email" value={editing.hiring_manager_email} onChange={e => setEditing({ ...editing, hiring_manager_email: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div className="flex flex-wrap gap-5">
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} /> Active (visible on site)</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_urgent} onChange={e => setEditing({ ...editing, is_urgent: e.target.checked })} /> Urgent vacancy</label>
              </div>
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