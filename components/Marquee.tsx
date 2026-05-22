"use client";

import { Truck, ShoppingBag, Shield, Leaf, MapPin, MessageCircle, Phone, ShoppingCart } from 'lucide-react';

/*
 * This declares a list of trust badges that will be displayed in a marquee format on the Home page.
 */
const badges = [
  { icon: Truck, text: 'Fast Nationwide Delivery', sub: 'Reliable supply to your facility' },
  { icon: Shield, text: 'Quality Assured Products', sub: 'Trusted healthcare-grade equipment' },
  { icon: ShoppingBag, text: 'Healthcare Supply Experts', sub: 'Years of industry experience' },
  { icon: Leaf, text: 'Safe & Compliant Sourcing', sub: 'Meets healthcare standards' },
  { icon: MapPin, text: 'Locally Distributed', sub: 'Supporting regional healthcare facilities' },
  { icon: MessageCircle, text: 'WhatsApp Support', sub: 'Quick clinical & order assistance' },
  { icon: Phone, text: 'Direct Order Support', sub: 'Speak to a consultant instantly' },
  { icon: ShoppingCart, text: 'Online Ordering', sub: 'Secure & seamless checkout' },
];

/*
 * Self contained TrustBadgeMarquee component creates a continuously scrolling marquee. 
 * It duplicates the badges array to create a seamless scrolling effect and fades both edges.
 * The marquee pauses on hover, allowing users to read the badges without distraction.
 */
export function Marquee()                                                                             
{
  const doubled = [...badges, ...badges];                                                                       

  return (
    <section className="benefit-badge-marquee bg-white py-5 border-b overflow-hidden relative">                 {/* ← relative is required */}
      <div className="
                        pointer-events-none 
                        absolute 
                        inset-y-0 left-0 
                        w-32 md:w-40
                        bg-linear-to-r from-white to-transparent 
                        z-10
                      " 
      />                                                                                                        {/* Fades edges on the left */}
      <div className="
                        pointer-events-none 
                        absolute 
                        inset-y-0 right-0 
                        w-32 md:w-40
                        bg-linear-to-l from-white to-transparent 
                        z-10
                      " 
      />                                                                                                        {/* Fades edges on the right */}
      <div className="flex w-max animate-marquee">                                                              {/* Scrolling track pauses on hover */}
        {doubled.map((badge, i) => (
          <div
            key={i}
            className="flex shrink-0 items-center gap-3 px-10 border-r border-gray-200 whitespace-nowrap"
          >
            <badge.icon className="w-8 h-8 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">{badge.text}</p>
              <p className="text-xs text-gray-500">{badge.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
export default Marquee;