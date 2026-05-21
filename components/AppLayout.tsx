import React from 'react';
import Link from 'next/link';
import SiteLayout from '@/components/layout/SiteLayout';
import { Users, GraduationCap, Briefcase, ShoppingBag, ArrowRight, Shield, Heart, CheckCircle2 } from 'lucide-react';

const AppLayout: React.FC = () => {
  const modules = [
    { icon: Users, 
      to: '/recruitment', 
      title: 'Recruitment', 
      subtitle: 'Healthcare Staffing', 
      desc: 'Connect with permanent, temporary and locum healthcare professionals across the UK.', 
      color: 'from-blue-600 to-blue-800', 
      stats: '500+ Active Roles' 
    },
    { icon: GraduationCap, 
      to: '/training', 
      title: 'Training', 
      subtitle: 'Accredited Courses', 
      desc: 'CPD-certified clinical, compliance and leadership training delivered by experts.', 
      color: 'from-emerald-600 to-teal-700', 
      stats: '12+ Live Courses' 
    },
    { icon: Briefcase, 
      to: '/consultancy', 
      title: 'Consultancy', 
      subtitle: 'Strategic Advisory', 
      desc: 'Specialist consultancy for CQC readiness, transformation and clinical governance.', 
      color: 'from-indigo-600 to-purple-700', 
      stats: '8 Service Lines' 
    },
    { icon: ShoppingBag, 
      to: '/shop', 
      title: 'Shop', 
      subtitle: 'Clinical Supplies', 
      desc: 'PPE, equipment, uniforms, books and digital toolkits for healthcare providers.', 
      color: 'from-rose-600 to-pink-700', 
      stats: 'Free UK Delivery' 
    },
  ];

  return (
    <SiteLayout>
      <section className="
                            relative 
                            overflow-hidden 
                            bg-linear-to-br from-blue-900 via-blue-800 to-emerald-900
                          "
      >
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600)', 
             backgroundSize: 'cover' }} 
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
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
                  Delivered End-to-End</span>
              </h1>
              <p className="text-lg text-blue-100 mb-8 max-w-xl">
                From clinical recruitment to accredited training, strategic consultancy and clinical 
                supplies — the complete partner for modern healthcare organisations.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                <Link href="/recruitment/jobs" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-800 rounded-lg font-semibold hover:bg-slate-100 transition">Browse Jobs <ArrowRight className="w-4 h-4" /></Link>
                <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-500 transition">Talk to an Expert</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[{ n: '12+', l: 'Years of Experience' }, { n: '200+', l: 'NHS & Private Clients' }, { n: '15k+', l: 'Professionals Placed' }, { n: '98%', l: 'Client Satisfaction' }].map((s, i) => (
                <div key={i} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6 text-white">
                  <div className="text-3xl font-bold mb-1">{s.n}</div>
                  <div className="text-sm text-blue-100">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
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
                <Link key={i} href={m.to} className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 hover:shadow-2xl transition">
                  <div className={`absolute inset-0 bg-linear-to-br ${m.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative p-8">
                    <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${m.color} flex items-center justify-center mb-5 group-hover:bg-white/20`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-white/80 mb-1">{m.subtitle}</div>
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-white mb-3">{m.title}</h3>
                    <p className="text-slate-600 group-hover:text-white/90 mb-4">{m.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-white">{m.stats}</span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 group-hover:text-white">Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" /></span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Ready to transform your healthcare operation?</h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-8">Speak with our team about staffing, training, consultancy or supplies.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold">Contact Sales</Link>
            <Link href="/admin" className="hidden sm:inline-flex px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold">Admin Dashboard</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default AppLayout;
