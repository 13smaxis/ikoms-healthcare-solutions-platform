"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteLayout from '@/components/layout/SiteLayout';
import { subscribeEmail } from '@/lib/crm';
import { Users, GraduationCap, Briefcase, ShoppingBag, ArrowRight, Shield, Award, Building2, CheckCircle2 } from 'lucide-react';

const modules = [
  {
    icon: Users, to: '/recruitment', title: 'Recruitment',
    subtitle: 'Healthcare Staffing',
    desc: 'Connect with permanent, temporary and locum healthcare professionals across the UK.',
    color: 'from-blue-600 to-blue-800',
    stats: '500+ Active Roles',
  },
  {
    icon: GraduationCap, to: '/training', title: 'Training',
    subtitle: 'Accredited Courses',
    desc: 'CPD-certified clinical, compliance and leadership training delivered by experts.',
    color: 'from-emerald-600 to-teal-700',
    stats: '12+ Live Courses',
  },
  {
    icon: Briefcase, to: '/consultancy', title: 'Consultancy',
    subtitle: 'Strategic Advisory',
    desc: 'Specialist consultancy for CQC readiness, transformation and clinical governance.',
    color: 'from-indigo-600 to-purple-700',
    stats: '8 Service Lines',
  },
  {
    icon: ShoppingBag, to: '/shop', title: 'Shop',
    subtitle: 'Clinical Supplies',
    desc: 'PPE, equipment, uniforms, books and digital toolkits for healthcare providers.',
    color: 'from-rose-600 to-pink-700',
    stats: 'Free UK Delivery',
  },
];

const heroStats = [
  { target: 12, suffix: '+', label: 'Years of Experience' },
  { target: 200, suffix: '+', label: 'NHS & Private Clients' },
  {
    target: 15000,
    suffix: '+',
    label: 'Professionals Placed',
    formatter: (value: number) => `${Math.round(value / 1000)}k`,
  },
  { target: 98, suffix: '%', label: 'Client Satisfaction' },
];

const useCountUp = (target: number, duration = 1600) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * progress));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
};

const AnimatedStat: React.FC<{
  target: number;
  suffix: string;
  label: string;
  formatter?: (value: number) => string;
}> = ({ target, suffix, label, formatter }) => {
  const value = useCountUp(target);
  const displayValue = formatter ? formatter(value) : String(value);

  return (
    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4 sm:p-6 text-white">
      <div className="text-2xl sm:text-3xl font-bold mb-1">{displayValue}{suffix}</div>
      <div className="text-xs sm:text-sm text-blue-100">{label}</div>
    </div>
  );
};

const Home: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const joinList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await subscribeEmail({ email, source: 'home-hero', tags: ['newsletter', 'home'] });
    } catch {}
    setSent(true); setEmail('');
  };

  return (
    <SiteLayout>

      <section className="
                          relative 
                          overflow-hidden 
                          bg-linear-to-br from-blue-900 
                          via-blue-800 to-emerald-900
                        "
      >                                                                                                         {/* Hero Section */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-15">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="
                                inline-flex 
                                items-center gap-2 
                                px-3 py-1 
                                rounded-full 
                                bg-white/10 
                                border border-white/20 
                                text-xs font-medium mb-6
                              "
              >
                <Shield className="w-3.5 h-3.5" /> Trusted by 200+ UK healthcare providers
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Healthcare Excellence,<br />
                <span className="
                                  bg-linear-to-r from-emerald-300 to-teal-200 
                                  bg-clip-text text-transparent
                                "
                >
                    Delivered End-to-End
                  </span>
              </h1>
              <p className="hidden sm:block text-lg text-blue-100 mb-8 max-w-xl">                             {/* Hides 'hidden' text on small screen and visible on larger screens 'sm:block" */}
                From clinical recruitment to accredited training, strategic consultancy and clinical supplies — 
                the complete partner for modern healthcare organisations.
              </p>
              
              <div className="block sm:hidden h-70" />                                                           {/* Mobile-only gap between hero paragraph and action links */}
              
              <div className="mt-2 flex flex-wrap gap-3 mb-8">
                <Link href="/recruitment/jobs" 
                      className="
                                  relative z-10 inline-flex 
                                  items-center 
                                  gap-2 
                                  px-4 py-2.5
                                  text-sm 
                                  sm:px-6 sm:py-3 
                                  bg-white 
                                  text-blue-800 
                                  rounded-lg 
                                  font-semibold 
                                  hover:bg-slate-100 transition
                                "
                >
                      Browse Jobs <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/contact" className="relative z-10 inline-flex items-center gap-2 px-4 py-2.5 text-sm sm:px-6 sm:py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-500 transition">
                  Talk to an Expert
                </Link>
              </div>
              <form onSubmit={joinList} className="flex gap-2 max-w-md">
                <input
                  name="newsletter_email"
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Get our monthly insights..."
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 text-sm focus:outline-none focus:bg-white/15"
                />
                <button type="submit" className="px-5 py-3 bg-white text-blue-800 rounded-lg font-semibold text-sm hover:bg-slate-100">
                  {sent ? 'Thanks!' : 'Subscribe'}
                </button>
              </form>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {heroStats.map((s) => (
                <AnimatedStat
                  key={s.label}
                  target={s.target}
                  suffix={s.suffix}
                  label={s.label}
                  formatter={s.formatter}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">                                                                               {/* Modules */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-2">Four Integrated Modules</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">One platform for your entire healthcare operation</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Each module works independently or as part of a unified solution. Scale up as your business grows.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {modules.map((m, i) => {
              const Icon = m.icon;
              return (
                <Link key={i} href={m.to} className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 hover:border-transparent hover:shadow-2xl transition-all duration-300">
                  <div className={`absolute inset-0 bg-linear-to-br ${m.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative p-8">
                    <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${m.color} flex items-center justify-center mb-5 group-hover:bg-white/20`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-white/80 mb-1">{m.subtitle}</div>
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-white mb-3">{m.title}</h3>
                    <p className="text-slate-600 group-hover:text-white/90 mb-4">{m.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-white">{m.stats}</span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 group-hover:text-white">
                        Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 bg-white border-y border-slate-200">                                        {/* Trust / Why Us */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600)' }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-2">Why IKOMS</div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">Built for the realities of modern healthcare</h2>
              <p className="text-slate-600 mb-8">We combine clinical expertise with operational excellence to help organisations deliver safer, more efficient care.</p>
              <div className="space-y-4">
                {[
                  { t: 'CQC-aligned frameworks', d: 'All services designed around current CQC assessment criteria.' },
                  { t: 'Clinically-led team', d: 'Our consultants and trainers are experienced registered professionals.' },
                  { t: 'Integrated platform', d: 'Manage staffing, training, consultancy and supplies from one dashboard.' },
                  { t: 'Scalable for growth', d: 'From single sites to multi-region providers, the platform grows with you.' },
                ].map((b, i) => (
                  <div key={i} className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900">{b.t}</div>
                      <div className="text-sm text-slate-600">{b.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { Icon: Shield, label: 'CQC Aligned', sub: 'Framework compliant' },
                { Icon: Award, label: 'CPD Accredited', sub: 'Recognised training' },
                { Icon: Building2, label: 'NHS Approved', sub: 'Framework suppliers' },
                { Icon: Users, label: 'DBS Checked', sub: 'All candidates vetted' },
              ].map((b, i) => {
                const I = b.Icon;
                return (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                    <I className="w-10 h-10 mx-auto mb-3 text-blue-700" />
                    <div className="font-semibold text-slate-900">{b.label}</div>
                    <div className="text-xs text-slate-500">{b.sub}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="
                            relative 
                            overflow-hidden 
                            rounded-3xl 
                            bg-linear-to-br from-blue-800 to-emerald-800 
                            p-10 lg:p-16 
                            text-white text-center
                          "
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to transform your healthcare operation?
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-8">
              Speak with our team to find out how the right mix of staffing, training, consultancy
              and supplies can accelerate your organisation.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/contact"
                className="
                                px-6 py-3 
                                bg-white 
                                text-blue-800 
                                rounded-lg 
                                font-semibold 
                                hover:bg-slate-100
                              "
              >
                Contact Sales
              </Link>
              <Link href="/consultancy/topics"
                className="
                                px-6 py-3 
                                bg-emerald-600 
                                text-white rounded-lg font-semibold 
                                hover:bg-emerald-500
                              "
              >
                Book a Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Home;
