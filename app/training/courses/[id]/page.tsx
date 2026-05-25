"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import SiteLayout from '@/components/layout/SiteLayout';
import { supabase } from '@/lib/supabase';
import { Clock, Calendar, Users, CheckCircle2, ArrowLeft, ShoppingCart } from 'lucide-react';
import { fmt, addToCart } from '@/lib/cart';

const CourseDetail: React.FC = () => {
  const params = useParams<{ id?: string | string[] }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', organization: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from('biz_courses').select('*').eq('id', id).single()
      .then(({ data }) => { setCourse(data); setLoading(false); });
  }, [id]);

  const book = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await supabase.from('biz_course_bookings').insert({ course_id: id, ...form });
    fetch('https://famous.ai/api/crm/69ea64be485fe0443f9c974c/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, name: form.full_name, source: 'course-booking', tags: ['training', course.title] }),
    }).catch(() => {});
    setSubmitting(false);
    setDone(true);
  };

  const payNow = () => {
    if (!course) return;
    addToCart({
      product_id: `course-${course.id}`,
      name: `Course: ${course.title}`,
      sku: `CRS-${course.id.slice(0, 8)}`,
      price: course.price,
      image: course.image_url,
    }, 1);
    router.push('/shop/cart');
  };

  if (loading) return <SiteLayout><div className="py-20 text-center">Loading...</div></SiteLayout>;
  if (!course) return <SiteLayout><div className="py-20 text-center">Course not found. <Link href="/training/courses" className="text-emerald-700">Browse all</Link></div></SiteLayout>;

  return (
    <SiteLayout>
      <section className="bg-linear-to-br from-emerald-800 to-teal-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/training/courses" className="inline-flex items-center gap-1 text-emerald-200 text-sm mb-4"><ArrowLeft className="w-4 h-4" /> All courses</Link>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-2">{course.category}</div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">{course.title}</h1>
          <div className="flex flex-wrap gap-4 text-emerald-100">
            <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" /> {course.duration}</span>
            <span className="inline-flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(course.start_date).toLocaleDateString('en-GB')}</span>
            <span className="inline-flex items-center gap-1"><Users className="w-4 h-4" /> {course.seats} seats</span>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <img src={course.image_url} alt={course.title} className="w-full h-72 object-cover rounded-2xl mb-6" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Course overview</h2>
            <p className="text-slate-700 mb-6 whitespace-pre-line">{course.description}</p>

            <h2 className="text-xl font-bold text-slate-900 mb-3">What you'll learn</h2>
            <div className="grid sm:grid-cols-2 gap-2 mb-6">
              {['Evidence-based practice', 'Practical skills demonstration', 'Case-based scenarios', 'Assessment and feedback', 'CPD certificate', 'Course materials included'].map((t, i) => (
                <div key={i} className="flex gap-2 text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" /> {t}</div>
              ))}
            </div>
          </div>

          <div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-24">
              <div className="text-3xl font-bold text-slate-900 mb-1">{fmt(course.price)}</div>
              <div className="text-sm text-slate-500 mb-5">per delegate</div>

              <button onClick={payNow} className="w-full mb-3 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold inline-flex items-center justify-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Pay & book now
              </button>
              <div className="text-center text-xs text-slate-500 mb-3">— or —</div>

              {done ? (
                <div className="text-center py-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 mb-2" />
                  <div className="font-semibold text-slate-900">Enquiry received</div>
                  <div className="text-sm text-slate-600">We'll confirm your place by email.</div>
                </div>
              ) : (
                <form onSubmit={book} className="space-y-2">
                  <div className="text-sm font-semibold text-slate-700 mb-1">Request a booking</div>
                  <input name="full_name" required placeholder="Full name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input name="email" required type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input name="phone" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input name="organization" placeholder="Organisation" value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <button type="submit" disabled={submitting} className="w-full py-2.5 border border-emerald-700 text-emerald-700 rounded-lg font-semibold hover:bg-emerald-50 disabled:opacity-50 text-sm">
                    {submitting ? 'Sending...' : 'Request booking'}
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

export default CourseDetail;