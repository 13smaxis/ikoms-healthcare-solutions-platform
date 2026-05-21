import React from 'react';
import SiteLayout from '@/components/layout/SiteLayout';
import { Users, GraduationCap, Briefcase, ShoppingBag, Heart, Shield } from 'lucide-react';

const About: React.FC = () => (
    <SiteLayout>
        <section className="relative overflow-hidden text-white py-20">
            <div
                className="absolute inset-0 bg-cover bg-center bg-fixed opacity-20"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600)' }}
            />
            <div className="absolute inset-0 bg-linear-to-br from-blue-900/95 to-emerald-800/95" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-2">About Us</div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-4">Healthcare, reimagined under one roof</h1>
                <p className="text-lg text-blue-100 max-w-2xl">IKOMS Healthcare Solutions was founded to solve the biggest operational challenges facing healthcare providers today — with a single, integrated platform.</p>
            </div>
        </section>

        <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-5">Our Story</h2>
                    <p className="text-slate-600 mb-4">Founded in 2013, IKOMS Healthcare Solutions began as a specialist healthcare recruitment business. Over the past decade we've expanded into training, consultancy and clinical supplies — always staying true to our founding mission of supporting healthcare providers to deliver outstanding care.</p>
                    <p className="text-slate-600 mb-4">Today we serve over 200 NHS trusts, private hospitals, care homes and community providers across the UK, with a team of clinically-led experts who understand the realities of modern healthcare.</p>
                </div>
                <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1000" alt="team" className="rounded-2xl shadow-xl" />
            </div>
        </section>

        <section className="py-16 bg-white border-y border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">What we stand for</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { I: Heart, t: 'Patient-first', d: 'Every decision is measured against the outcome for the person receiving care.' },
                        { I: Shield, t: 'Uncompromising safety', d: 'We hold ourselves and our partners to the highest standards of governance.' },
                        { I: Users, t: 'People-centred', d: 'Supporting the workforce is the single most effective way to improve care.' },
                    ].map((v, i) => {
                        const I = v.I;
                        return (
                            <div key={i} className="p-6 rounded-xl border border-slate-200">
                                <I className="w-10 h-10 text-blue-700 mb-3" />
                                <div className="font-semibold text-slate-900 mb-2">{v.t}</div>
                                <div className="text-sm text-slate-600">{v.d}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>

        <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">Our four pillars</h2>
                <div className="grid md:grid-cols-4 gap-6">
                    {[
                        { I: Users, t: 'Recruitment' },
                        { I: GraduationCap, t: 'Training' },
                        { I: Briefcase, t: 'Consultancy' },
                        { I: ShoppingBag, t: 'Shop' },
                    ].map((p, i) => {
                        const I = p.I;
                        return (
                            <div key={i} className="text-center p-6 rounded-xl bg-linear-to-br from-blue-50 to-emerald-50 border border-blue-100">
                                <I className="w-10 h-10 text-blue-700 mx-auto mb-3" />
                                <div className="font-semibold text-slate-900">{p.t}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    </SiteLayout>
);

export default About;
