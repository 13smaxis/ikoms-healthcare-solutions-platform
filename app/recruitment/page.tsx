"use client";

import React, { useEffect, useMemo, useState } from 'react';
import SiteLayout from '@/components/layout/SiteLayout';
import { supabase } from '@/lib/supabase';
import { subscribeEmail } from '@/lib/crm';
import { MapPin, Briefcase, Search, X, CalendarDays, Building2, CircleCheckBig, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

type JobRecord = {
  id: string;
  title: string;
  department?: string | null;
  location?: string | null;
  job_type?: string | null;
  employment_type?: string | null;
  job_level?: string | null;
  status?: string | null;
  is_active?: boolean | null;
  closing_date?: string | null;
  posted_date?: string | null;
  created_at?: string | null;
  salary_range?: string | null;
  description?: string | null;
  short_description?: string | null;
  requirements?: string | null;
  required_qualifications?: string | null;
  experience_required?: string | null;
};

type AuthModalType = 'register' | 'login' | null;

const navigateToCandidateProfile = () => {
  window.location.href = '/recruitment/candidate/profile';
};

const formatDate = (value?: string | null) => {
  if (!value) return 'TBD';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'TBD';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};

const getEmploymentType = (job: JobRecord) => job.employment_type || job.job_type || 'Full-time';
const getJobStatus = (job: JobRecord) => job.status || (job.is_active === false ? 'Closed' : 'Open');
const getShortDescription = (job: JobRecord) => job.short_description || job.description || 'No summary provided.';
const getQualifications = (job: JobRecord) => job.required_qualifications || job.requirements || 'Not specified';
const getExperience = (job: JobRecord) => job.experience_required || 'Not specified';

const RecruitmentHome: React.FC = () => {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('all');
  const [type, setType] = useState('all');
  const [selectedJob, setSelectedJob] = useState<JobRecord | null>(null);
  const [authModal, setAuthModal] = useState<AuthModalType>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', cover_letter: '' });
  const [cv, setCv] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    password: '',
    confirm_password: '',
    accept_terms: false,
    privacy_consent: false,
  });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [authSuccess, setAuthSuccess] = useState('');

  useEffect(() => {
    const demoJob: JobRecord = {
      id: 'demo-healthcare-helper',
      title: 'Healthcare Helper',
      department: 'Support Services',
      location: 'Birmingham, UK',
      employment_type: 'Full-time',
      job_type: 'Full-time',
      job_level: 'Entry',
      status: 'Open',
      is_active: true,
      closing_date: '2026-09-15',
      posted_date: '2026-08-17',
      created_at: '2026-08-17',
      salary_range: '£22,000 - £26,000',
      short_description: 'Support patients and clinical teams by delivering compassionate daily care in a safe, welcoming environment.',
      description: 'Support patients and clinical teams by delivering compassionate daily care in a safe, welcoming environment.',
      required_qualifications: 'Level 2/3 Health and Social Care qualification or equivalent experience',
      experience_required: 'Previous care or healthcare support experience preferred but not essential.',
    };

    supabase.from('biz_jobs').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      const dbJobs = ((data as JobRecord[]) || []).filter((job) => job.is_active !== false);
      setJobs([demoJob, ...dbJobs]);
      setLoading(false);
    });
  }, []);

  const departments = useMemo(
  () => [
    'all',
    ...Array.from(
      new Set(
        jobs
          .map((j) => j.department)
          .filter((department): department is string => Boolean(department))
      )
    ),
  ],
  [jobs]
);
  const types = useMemo(() => ['all', ...Array.from(new Set(jobs.map((j) => getEmploymentType(j)).filter(Boolean)))], [jobs]);

  const filtered = jobs.filter((job) => {
    const matchQ = !q || job.title?.toLowerCase().includes(q.toLowerCase()) || job.location?.toLowerCase().includes(q.toLowerCase());
    const matchD = dept === 'all' || job.department === dept;
    const matchT = type === 'all' || getEmploymentType(job) === type;
    return Boolean(matchQ && matchD && matchT);
  });

  useEffect(() => {
    const shouldFreezePage = Boolean(selectedJob || authModal);

    if (!shouldFreezePage) {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyLeft = document.body.style.left;
    const previousBodyWidth = document.body.style.width;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const scrollY = window.scrollY;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.width = '100%';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.left = previousBodyLeft;
      document.body.style.width = previousBodyWidth;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.scrollTo({ top: scrollY, behavior: 'auto' });
    };
  }, [selectedJob, authModal]);

  const openJob = (job: JobRecord) => {
    setSelectedJob(job);
    setShowApplicationForm(false);
    setDone(false);
    setError('');
    setForm({ full_name: '', email: '', phone: '', cover_letter: '' });
    setCv(null);
  };

  const closeAuthModal = () => {
    setAuthModal(null);
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(false);
    setRegisterForm({
      first_name: '',
      last_name: '',
      email: '',
      mobile_number: '',
      password: '',
      confirm_password: '',
      accept_terms: false,
      privacy_consent: false,
    });
    setLoginForm({ email: '', password: '' });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!registerForm.accept_terms || !registerForm.privacy_consent) {
      setAuthError('Please accept the terms and privacy policy to continue.');
      return;
    }

    if (registerForm.password !== registerForm.confirm_password) {
      setAuthError('Passwords do not match.');
      return;
    }

    if (registerForm.password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    setAuthLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
        options: {
          data: {
            first_name: registerForm.first_name,
            last_name: registerForm.last_name,
            mobile_number: registerForm.mobile_number,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        setAuthSuccess('Registration successful. Please check your email to confirm your account before signing in.');
        setAuthModal('login');
        setLoginForm({ email: registerForm.email, password: '' });
      }
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
    } finally {
      setAuthLoading(false);
    }
  };

const handleLoginSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setAuthError('');
  setAuthSuccess('');
  setAuthLoading(true);

  try {
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });

    if (signInError) throw signInError;

    if (data.user) {
      // Show success message first
      setAuthSuccess('Login successful. Redirecting to your profile...');
      setAuthModal(null);
      setLoginForm({ email: '', password: '' });
      
      // Give user time to see the success message before redirect
      // This improves perceived performance and UX
      setTimeout(() => {
        window.location.href = '/recruitment/candidate/profile';
      }, 800); // 800ms gives plenty of time to see the message
    }
  } catch (err: any) {
    setAuthError(err.message || 'Login failed.');
  } finally {
    setAuthLoading(false);
  }
};

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setSubmitting(true);
    setError('');

    try {
      let cvUrl: string | null = null;
      if (cv) {
        const fileName = `${Date.now()}-${cv.name}`;
        const { data: upload, error: uploadErr } = await supabase.storage.from('cvs').upload(fileName, cv);
        if (uploadErr) throw uploadErr;
        cvUrl = supabase.storage.from('cvs').getPublicUrl(upload.path).data.publicUrl;
      }

      const application = {
        job_id: selectedJob.id,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        cover_letter: form.cover_letter,
        cv_url: cvUrl,
      } as any;

      const { error: insertErr } = await supabase.from('biz_applications' as any).insert(application);
      if (insertErr) throw insertErr;

      try {
        await subscribeEmail({ email: form.email, name: form.full_name, source: 'job-application', tags: ['candidate', selectedJob.title] });
      } catch {}

      setDone(true);
      setShowApplicationForm(false);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <style jsx>{`
        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
          overscroll-behavior: contain;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <section className="relative overflow-hidden bg-linear-to-br from-blue-900 to-blue-700 text-white py-20">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=1600)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-2">Recruitment · Active vacancies</div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Current vacancies</h1>
          <p className="text-blue-100 mb-8">Browse {jobs.length} active healthcare roles across the UK.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => { setAuthModal('register'); setAuthError(''); setAuthSuccess(''); }} className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-blue-800 shadow-sm hover:bg-slate-100">Register</button>
            <button onClick={() => { setAuthModal('login'); setAuthError(''); setAuthSuccess(''); }} className="rounded-lg border border-white/40 bg-transparent px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Login</button>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 grid md:grid-cols-4 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title or location..." className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm" />
            </div>
            <select value={dept} onChange={(e) => setDept(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm">
              {departments.map((d) => <option key={d} value={d}>{d === 'all' ? 'All departments' : d}</option>)}
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)} className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm">
              {types.map((t) => <option key={t} value={t}>{t === 'all' ? 'All types' : t}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading roles...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No roles match your filters.</div>
          ) : (
            <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Department</th>
                    <th className="px-4 py-3 font-semibold">Location</th>
                    <th className="px-4 py-3 font-semibold">Employment Type</th>
                    <th className="px-4 py-3 font-semibold">Closing Date</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Apply</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((job) => (
                    <tr key={job.id} className="border-t border-slate-200 align-top">
                      <td className="px-4 py-4 font-semibold text-slate-900">{job.title}</td>
                      <td className="px-4 py-4 text-slate-600">{job.department || 'Not specified'}</td>
                      <td className="px-4 py-4 text-slate-600">{job.location || 'Not specified'}</td>
                      <td className="px-4 py-4 text-slate-600">{getEmploymentType(job)}</td>
                      <td className="px-4 py-4 text-slate-600">{formatDate(job.closing_date)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getJobStatus(job) === 'Open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                          {getJobStatus(job)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button onClick={() => openJob(job)} className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-3 py-2 font-semibold text-white hover:bg-blue-800">
                          Apply
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {authModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onClick={closeAuthModal}>
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl scrollbar-hide" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeAuthModal} className="absolute right-4 top-4 rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-900">
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 md:p-8">
              {authModal === 'register' ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
                    <p className="mt-1 text-sm text-slate-600">Register to apply for healthcare roles.</p>
                  </div>

                  {authError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{authError}</div>}
                  {authSuccess && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{authSuccess}</div>}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">First Name</label>
                      <input required value={registerForm.first_name} onChange={(e) => setRegisterForm({ ...registerForm, first_name: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Last Name</label>
                      <input required value={registerForm.last_name} onChange={(e) => setRegisterForm({ ...registerForm, last_name: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
                    <input required type="email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Mobile Number</label>
                    <input required type="tel" value={registerForm.mobile_number} onChange={(e) => setRegisterForm({ ...registerForm, mobile_number: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                    <input required type="password" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Confirm Password</label>
                    <input required type="password" value={registerForm.confirm_password} onChange={(e) => setRegisterForm({ ...registerForm, confirm_password: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                  </div>

                  <div className="space-y-2 text-sm text-slate-700">
                    <label className="flex items-start gap-2">
                      <input type="checkbox" checked={registerForm.accept_terms} onChange={(e) => setRegisterForm({ ...registerForm, accept_terms: e.target.checked })} className="mt-1" />
                      <span>Accept Terms &amp; Conditions</span>
                    </label>
                    <label className="flex items-start gap-2">
                      <input type="checkbox" checked={registerForm.privacy_consent} onChange={(e) => setRegisterForm({ ...registerForm, privacy_consent: e.target.checked })} className="mt-1" />
                      <span>Privacy Policy consent</span>
                    </label>
                  </div>

                  <button type="submit" disabled={authLoading} className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
                    {authLoading ? 'Registering...' : 'Register'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Login</h2>
                    <p className="mt-1 text-sm text-slate-600">Sign in with your account details.</p>
                  </div>

                  {authError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{authError}</div>}
                  {authSuccess && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{authSuccess}</div>}

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
                    <input required type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                    <input required type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                  </div>

                  <button type="submit" disabled={authLoading} className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
                    {authLoading ? 'Signing in...' : 'Login'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onClick={() => setSelectedJob(null)}>
          <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl scrollbar-hide" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedJob(null)} className="absolute right-4 top-4 rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-900">
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 md:p-8">
              {done ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                  <CircleCheckBig className="mx-auto mb-3 h-12 w-12 text-emerald-600" />
                  <h3 className="text-2xl font-bold text-slate-900">Application received</h3>
                  <p className="mt-2 text-slate-600">Thanks for applying to {selectedJob.title}. Our team will review your application shortly.</p>
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">{selectedJob.department || 'Department'}</div>
                    <h2 className="text-3xl font-bold text-slate-900">{selectedJob.title}</h2>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><Building2 className="w-4 h-4" /> Department</div>
                        <div className="mt-2 text-base font-medium text-slate-900">{selectedJob.department || 'Not specified'}</div>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><MapPin className="w-4 h-4" /> Location</div>
                        <div className="mt-2 text-base font-medium text-slate-900">{selectedJob.location || 'Not specified'}</div>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><Briefcase className="w-4 h-4" /> Employment Type</div>
                        <div className="mt-2 text-base font-medium text-slate-900">{getEmploymentType(selectedJob)}</div>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><Briefcase className="w-4 h-4" /> Job Level</div>
                        <div className="mt-2 text-base font-medium text-slate-900">{selectedJob.job_level || 'Mid'}</div>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><CalendarDays className="w-4 h-4" /> Closing Date</div>
                        <div className="mt-2 text-base font-medium text-slate-900">{formatDate(selectedJob.closing_date)}</div>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><CalendarDays className="w-4 h-4" /> Posted Date</div>
                        <div className="mt-2 text-base font-medium text-slate-900">{formatDate(selectedJob.posted_date || selectedJob.created_at)}</div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-xl border border-slate-200 p-4">
                      <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Salary Range</div>
                      <div className="mt-2 text-base font-medium text-slate-900">{selectedJob.salary_range || 'Not disclosed'}</div>
                    </div>

                    <div className="mt-6 space-y-5">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Description</h3>
                        <p className="mt-2 text-slate-700">{getShortDescription(selectedJob)}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Required Qualifications</h3>
                        <p className="mt-2 text-slate-700 whitespace-pre-line">{getQualifications(selectedJob)}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Experience Required</h3>
                        <p className="mt-2 text-slate-700">{getExperience(selectedJob)}</p>
                      </div>
                    </div>
                  </div>

                  <aside className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Status</div>
                      <div className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700">{getJobStatus(selectedJob)}</div>
                    </div>

                    {!showApplicationForm ? (
                      <button onClick={() => setShowApplicationForm(true)} className="w-full rounded-lg bg-blue-700 px-4 py-3 text-base font-semibold text-white hover:bg-blue-800">
                        Apply Now
                      </button>
                    ) : (
                      <form onSubmit={submit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                        <h3 className="text-lg font-bold text-slate-900">Application form</h3>
                        <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Full name" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                        <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                        <textarea rows={4} value={form.cover_letter} onChange={(e) => setForm({ ...form, cover_letter: e.target.value })} placeholder="Brief cover note" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-blue-500">
                          <Upload className="w-4 h-4" />
                          <span className="truncate">{cv ? cv.name : 'Upload your CV'}</span>
                          <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCv(e.target.files?.[0] || null)} className="hidden" />
                        </label>
                        {error && <div className="text-sm text-red-600">{error}</div>}
                        <button type="submit" disabled={submitting} className="w-full rounded-lg bg-blue-700 px-4 py-3 text-base font-semibold text-white disabled:opacity-60">
                          {submitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                      </form>
                    )}
                  </aside>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  );
};

export default RecruitmentHome;