"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { COMPANY } from '@/lib/constants';
import { subscribeEmail } from '@/lib/crm';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const phone = COMPANY.phone || COMPANY.contact?.phone || '+44 7916 341456';
  const contactEmail = COMPANY.email || COMPANY.contact?.email || 'info@ikoms.co.uk';

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('sending');
    try {
      await subscribeEmail({ email, source: 'footer-signup', tags: ['newsletter'] });
      setStatus('success'); setEmail('');
    } catch { setStatus('error'); }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img
                src={COMPANY.logo}
                alt="IKOMS Logo"
                className="h-16 w-auto block"
              />
            </div>
            <p className="text-sm text-slate-400 mb-4 max-w-sm">
              A modern healthcare business platform — staffing, training, consultancy and clinical supplies under one roof.
            </p>
            <form onSubmit={subscribe} className="flex gap-2 max-w-sm">
              <input
                name="footer_email"
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="
                            flex-1 
                            px-3 py-2 
                            rounded-md 
                            bg-slate-800 
                            border border-slate-700 
                            text-sm text-white 
                            placeholder-slate-500 
                            focus:outline-none focus:border-blue-500
                          "
              />
              <button type="submit" disabled={status === 'sending'} 
                      className="
                                  px-4 py-2 
                                  bg-emerald-600 
                                  hover:bg-emerald-500 
                                  text-white rounded-md text-sm 
                                  font-semibold 
                                  disabled:opacity-50
                                "
              >
                {status === 'sending' ? '...' : 'Join'}
              </button>
            </form>
            {status === 'success' && <p className="text-xs text-emerald-400 mt-2">Thanks — you're subscribed.</p>}
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Recruitment</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/recruitment" className="hover:text-white">Overview</Link></li>
              <li><Link href="/recruitment/jobs" className="hover:text-white">Browse Jobs</Link></li>
              <li><Link href="/recruitment/jobs" className="hover:text-white">Submit CV</Link></li>
              <li><Link href="/contact" className="hover:text-white">Hire Staff</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Training</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/training" className="hover:text-white">Overview</Link></li>
              <li><Link href="/training/courses" className="hover:text-white">All Courses</Link></li>
              <li><Link href="/training/courses" className="hover:text-white">Book a Course</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Consultancy</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/consultancy" className="hover:text-white">Overview</Link></li>
              <li><Link href="/consultancy/topics" className="hover:text-white">Our Services</Link></li>
              <li><Link href="/consultancy/topics" className="hover:text-white">Book a Call</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="hover:text-white">Overview</Link></li>
              <li><Link href="/shop/products" className="hover:text-white">All Products</Link></li>
              <li><Link href="/shop/cart" className="hover:text-white">Cart</Link></li>
            </ul>
          </div>
        </div>

        <div className="
                        mt-12 pt-8 
                        justify-items-center
                        border-t border-slate-800 
                        grid md:grid-cols-3 
                        gap-6 text-sm 
                        text-slate-400
                      "
        >                                                                                                       {/* Contacts */}
          <div className="flex items-center gap-2">                                                             {/* Phone */}
            <Phone className="w-4 h-4" />
            <a href={`tel:${phone}`}
              className="hover:underline">{phone}
            </a>
          </div>
          <div className="flex items-center gap-2">                                                             {/* Email */}
            <Mail className="w-4 h-4" />
            <a href={`mailto:${contactEmail}`}
              className="hover:underline">{contactEmail}
            </a>
          </div>
          <div className="flex items-center gap-2">                                                             {/* City */}
            <MapPin className="w-4 h-4" />
            {COMPANY.address.city}
          </div>
        </div>

        <div className="
                          mt-8 flex flex-col 
                          md:flex-row 
                          justify-between 
                          items-center gap-4 
                          text-xs text-slate-500
                        "
        >                                                                                                       {/* Social media and copyright */}
          <div>© {new Date().getFullYear()} IKOMS Healthcare Solutions. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">LinkedIn</a>
            <a href="#" className="hover:text-white">Twitter</a>
            <a href="#" className="hover:text-white">Facebook</a>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-slate-600">
         <p>Powered by <a href="https://www.smaxis.co.za" 
                           target="_blank" rel="noreferrer"
                           className="text-green-300 hover:text-white underline"> 
                  SMAXIS Digital Solutions
            </a>
          </p>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
