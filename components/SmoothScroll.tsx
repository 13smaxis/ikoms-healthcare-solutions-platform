"use client";

import Lenis from "lenis";
import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

export default function SmoothScroll() 
{
  const pathname = usePathname();

  useLayoutEffect(() => {                                                                                       //-Run before paint so every route starts at the top
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    const lenis = new Lenis                                                                                     //-Starts the smooth scrolling system with the following settings:
    ({
      duration: 1.2,                                                                                            //-0.5 = quick, 1.2 = smooth premium feel, 2 = very floaty/slower
      smoothWheel: true,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),                                                 //-This is the easing function that controls the acceleration of the scroll, you can use any easing function you like, or even a custom one
    }); 
    
    function raf(time: number)                                                                                  //-Tells the browser to run this animation on every frame
    {
      lenis.raf(time);                                                                                          //-Updates the smooth scrolling system with the current time, without this there's no animation
      requestAnimationFrame(raf);                                                                               //-Calls this function again on the next frame, creating a loop
    }

    const frameId = requestAnimationFrame(raf);

    lenis.scrollTo(0, { immediate: true });

    const handleRouteReset = () => {
      lenis.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    };

    handleRouteReset();
    window.addEventListener('popstate', handleRouteReset);

        return () => {                                                                                          //-Clean up
        cancelAnimationFrame(frameId);
      window.removeEventListener('popstate', handleRouteReset);
            lenis.destroy();                                                                                    //-Destroys the smooth scrolling system when the component is unmounted, preventing memory leaks
        window.history.scrollRestoration = 'auto';
        };
    }, [pathname]);                                                                                             //-Reset scroll every time the route changes

    return null;                                                                                                //-This component doesn't render anything, it just sets up the smooth scrolling system, so we return null
}