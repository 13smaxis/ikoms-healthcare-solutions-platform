"use client";

import React, { useEffect, useState } from 'react';
import SiteLayout from '@/components/layout/SiteLayout';
import { supabase } from '@/lib/supabase';
import {
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  FileText,
  Camera,
  Save,
  Check,
  AlertCircle,
  Loader,
  LogOut
} from 'lucide-react';

type CandidateProfile = {
  id: string;
  first_name: string;
  last_name: string;
  mobile_number: string | null;
  date_of_birth: string | null;
  id_number: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  highest_qualification: string | null;
  field_of_study: string | null;
  institution: string | null;
  years_of_experience: number | null;
  current_job_title: string | null;
  current_employer: string | null;
  skills: string | null;
  cv_url: string | null;
  profile_photo_url: string | null;
  profile_completed: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

const CandidateProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [formData, setFormData] = useState<Partial<CandidateProfile>>({});
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'education' | 'experience' | 'files'>('personal');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          window.location.href = '/recruitment';
          return;
        }
        setUser(currentUser);

        // Fetch candidate profile
        const { data: candidateData, error } = await supabase
          .from('candidates')
          .select('*')
          .eq('id', currentUser.id)
          .single<CandidateProfile>();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (candidateData) {
          setProfile(candidateData);
          setFormData(candidateData);
        } else {
          // Create initial profile with auth data
          const initialProfile = {
            id: currentUser.id,
            first_name: currentUser.user_metadata?.first_name || '',
            last_name: currentUser.user_metadata?.last_name || '',
            mobile_number: currentUser.user_metadata?.mobile_number || null,
            country: 'South Africa',
          };
          setFormData(initialProfile);
        }
      } catch (err: any) {
        console.error('Failed to load profile:', err);
        setMessage({ type: 'error', text: 'Failed to load profile' });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || null,
    }));
  };

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value ? parseInt(value) : null,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      let cvUrl = formData.cv_url;
      let photoUrl = formData.profile_photo_url;

      // Upload CV if new file selected
      if (cvFile) {
        const fileName = `cv-${user.id}-${Date.now()}.pdf`;
        const { error: uploadErr } = await supabase.storage.from('cvs').upload(fileName, cvFile);
        if (uploadErr) throw uploadErr;
        cvUrl = supabase.storage.from('cvs').getPublicUrl(fileName).data.publicUrl;
      }

      // Upload profile photo if new file selected
      if (photoFile) {
        const fileName = `profile-${user.id}-${Date.now()}.jpg`;
        const { error: uploadErr } = await supabase.storage.from('profile-photos').upload(fileName, photoFile);
        if (uploadErr) throw uploadErr;
        photoUrl = supabase.storage.from('profile-photos').getPublicUrl(fileName).data.publicUrl;
      }

      // Save profile data
      const dataToSave = {
        ...formData,
        cv_url: cvUrl,
        profile_photo_url: photoUrl,
        profile_completed: true,
        updated_at: new Date().toISOString(),
      };

      if (profile) {
        // Update existing profile
        const { error } = await (supabase
          .from('candidates') as any)
          .update(dataToSave)
          .eq('id', user.id);
        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await (supabase
          .from('candidates') as any)
          .insert([{ id: user.id, ...dataToSave }]);
        if (error) throw error;
      }

      setProfile(dataToSave as CandidateProfile);
      setCvFile(null);
      setPhotoFile(null);
      setMessage({ type: 'success', text: 'Profile saved successfully!' });

      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/recruitment';
  };

  if (loading) {
    return (
      <SiteLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-700 mx-auto mb-3" />
            <p className="text-slate-600">Loading profile...</p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-linear-to-br from-blue-900 to-blue-700 text-white py-16">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-2">Candidate Portal</div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">Your Profile</h1>
              <p className="text-blue-100">Complete your candidate profile to be matched with opportunities</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {message && (
            <div
              className={`mb-6 rounded-lg border p-4 flex gap-3 ${message.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-red-200 bg-red-50'
                }`}
            >
              {message.type === 'success' ? (
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm ${message.type === 'success' ? 'text-emerald-800' : 'text-red-800'
                  }`}
              >
                {message.text}
              </p>
            </div>
          )}

          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Profile Header Section */}
            <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="relative">
                  {formData.profile_photo_url ? (
                    <img
                      src={formData.profile_photo_url}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-blue-700"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-blue-700 flex items-center justify-center">
                      <User className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 rounded-full bg-blue-700 p-2 cursor-pointer hover:bg-blue-800 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">
                    {formData.first_name} {formData.last_name}
                  </h2>
                  <p className="text-slate-600 text-sm">
                    {formData.current_job_title || 'Job title not set'} {formData.current_employer && `at ${formData.current_employer}`}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span className="text-slate-600">{user?.email}</span>
                    {profile?.profile_completed && (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-semibold">
                        <Check className="w-3 h-3" /> Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-slate-200 px-6 flex gap-8 overflow-x-auto">
              {[
                { id: 'personal', label: 'Personal Info', icon: User },
                { id: 'education', label: 'Education', icon: GraduationCap },
                { id: 'experience', label: 'Experience', icon: Briefcase },
                { id: 'files', label: 'Files', icon: FileText },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id as any)}
                  className={`py-4 px-1 border-b-2 font-semibold text-sm flex gap-2 items-center transition-colors ${activeTab === id
                      ? 'border-blue-700 text-blue-700'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 space-y-6">
              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Personal Information</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm bg-slate-50 text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Mobile Number</label>
                        <input
                          type="tel"
                          name="mobile_number"
                          value={formData.mobile_number || ''}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth</label>
                        <input
                          type="date"
                          name="date_of_birth"
                          value={formData.date_of_birth || ''}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender || ''}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">ID Number</label>
                        <input
                          type="text"
                          name="id_number"
                          value={formData.id_number || ''}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Address</h3>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Street Address</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address || ''}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city || ''}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Province</label>
                          <input
                            type="text"
                            name="province"
                            value={formData.province || ''}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Country</label>
                          <input
                            type="text"
                            name="country"
                            value={formData.country || ''}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Education Tab */}
              {activeTab === 'education' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-900">Education</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Highest Qualification</label>
                      <select
                        name="highest_qualification"
                        value={formData.highest_qualification || ''}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select qualification</option>
                        <option value="High School">High School</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Bachelor's Degree">Bachelor's Degree</option>
                        <option value="Master's Degree">Master's Degree</option>
                        <option value="PhD">PhD</option>
                        <option value="Certificate">Certificate</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Institution</label>
                      <input
                        type="text"
                        name="institution"
                        value={formData.institution || ''}
                        onChange={handleInputChange}
                        placeholder="University or College name"
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Field of Study</label>
                      <input
                        type="text"
                        name="field_of_study"
                        value={formData.field_of_study || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., Computer Science, Nursing, Business Administration"
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Experience Tab */}
              {activeTab === 'experience' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-900">Work Experience</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Job Title</label>
                      <input
                        type="text"
                        name="current_job_title"
                        value={formData.current_job_title || ''}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Employer</label>
                      <input
                        type="text"
                        name="current_employer"
                        value={formData.current_employer || ''}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Years of Experience</label>
                      <input
                        type="number"
                        name="years_of_experience"
                        value={formData.years_of_experience || ''}
                        onChange={handleNumberInput}
                        min="0"
                        max="70"
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Skills</label>
                      <textarea
                        name="skills"
                        value={formData.skills || ''}
                        onChange={handleInputChange}
                        placeholder="List your skills separated by commas (e.g., Patient care, Communication, Medical records, Nursing)"
                        rows={4}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Files Tab */}
              {activeTab === 'files' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-900">Files</h3>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Curriculum Vitae (CV)</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer group">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="cv-upload"
                      />
                      <label htmlFor="cv-upload" className="cursor-pointer block">
                        <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                        <p className="text-sm font-semibold text-slate-900 mb-1">
                          {cvFile ? cvFile.name : 'Upload your CV'}
                        </p>
                        <p className="text-xs text-slate-500">PDF, DOC, or DOCX • Max 10MB</p>
                      </label>
                    </div>
                    {formData.cv_url && !cvFile && (
                      <p className="text-xs text-slate-600 mt-2">
                        Current CV: <a href={formData.cv_url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">View</a>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Profile Photo</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer group">
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label htmlFor="photo-upload" className="cursor-pointer block">
                        <Camera className="w-10 h-10 text-slate-400 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                        <p className="text-sm font-semibold text-slate-900 mb-1">
                          {photoFile ? photoFile.name : 'Upload a profile photo'}
                        </p>
                        <p className="text-xs text-slate-500">JPG or PNG • Max 5MB</p>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/recruitment/jobs';
                }}
                className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 transition-colors"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
};

export default CandidateProfile;