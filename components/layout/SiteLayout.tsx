/* 
 * SiteLayout.tsx
 * This component defines the overall structure of the site: header -> main content area -> footer. 
 * The component is used with layout.tsx because some pages like admin and auth pages don't use the standard site layout.
 * It uses Tailwind CSS for styling and ensures that the layout is responsive and visually consistent across 
 *  different pages of the application.
 * The SiteLayout component takes in children as props, which represent the main content of each page. 
 * The header and footer are included on every page, providing a consistent user experience throughout the site.
 */

import React from 'react';
import Header from './Header';
import Footer from './Footer';

const SiteLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default SiteLayout;
