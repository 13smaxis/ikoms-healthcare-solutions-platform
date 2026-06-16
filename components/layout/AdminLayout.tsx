"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Bell } from "lucide-react";
import { COMPANY } from "@/lib/constants";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const navLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/jobs", label: "Recruitment" },
  { href: "/admin/courses", label: "Training" },
  { href: "/admin/consultancy", label: "Consultancy" },
  { href: "/admin/orders", label: "E-commerce" },
];

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [profileImage, setProfileImage] = React.useState<string | null>(null);

  const handleProfileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) 
    {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const isActive = (href: string) => pathname === href;

  const Navigation = ({
    onClick,
  }: {
    onClick?: () => void;
  }) => (
    <nav className="space-y-2">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClick}
          className={`
                      block 
                      bg-slate-600
                      rounded-2xl 
                      px-4 py-3 
                      text-sm 
                      font-semibold 
                      transition 
                      ${isActive(link.href)
              ? " text-amber-400 border-amber-400 border"
              : "text-slate-300 hover:bg-slate-400 hover:text-white"
            }
                    `}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );

  const SignInButton = ({ onClick }: { onClick?: () => void }) => (
    <Link
      href="/admin/login"
      onClick={onClick}
      className="
      block
      rounded-full
      bg-blue-700
      px-4 py-3
      text-center
      text-sm
      font-semibold text-white
      hover:bg-blue-800
    "
    >
      Sign in
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-700">
      <aside
        className={`
                    fixed 
                    inset-y-0 left-0 z-50 
                    w-72 
                    transform 
                    border-r border-slate-800 
                    bg-slate-900 
                    p-5 
                    transition-transform 
                    duration-200 
                    lg:hidden 
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                  `}
      >                                                                                                         {/* Mobile Sidebar - slides in from left */}
        <div className="flex items-center justify-between pb-4">
          <button
            className="rounded-md p-2 text-slate-300 hover:bg-slate-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center">                                                   {/* Mobile Navigation Links */}
          <Navigation onClick={() => setSidebarOpen(false)} />
        </div>

        <div className="mt-auto pt-4">
          <SignInButton onClick={() => setSidebarOpen(false)} />                                                {/* Sign in button at bottom of mobile sidebar */}
        </div>
      </aside>

      <div
        className={`
                    fixed 
                    inset-0 z-40 
                    bg-slate-950/60 
                    lg:hidden 
                    ${sidebarOpen ? "block" : "hidden"}
                  `}
        onClick={() => setSidebarOpen(false)}
      />                                                                                                        {/* Mobile Backdrop */}

      <aside className="
                        hidden
                        md:flex
                        fixed inset-y-0 left-0 z-50 
                        md:w-56 lg:w-72
                        flex-col
                        border-r border-slate-800
                        bg-slate-900
                        p-5
                      "
      >                                                                                                         {/* Desktop Sidebar - fixed on left */}
        <div className="flex items-center gap-3 pb-6">
          <Link
            href="/"
            className="inline-flex items-center"
            aria-label="IKOMS Home"
          >
            <img
              src={COMPANY.logo}
              alt="IKOMS Home"
              className="h-10 md:h-18 w-auto"
            />
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center">                                                   {/* Desktop Navigation Links */}
          <Navigation />
        </div>

        <div className="mt-auto pt-4">
          <SignInButton />                                                                                      {/* Sign in button at bottom of desktop sidebar */}
        </div>
      </aside>

      <div className="lg:pl-72">                                                                                {/* Main content area + header */}
        <header className="
                            sticky top-0 z-30 
                            border-b border-slate-800 
                            bg-slate-800/95 
                            px-4 py-3 
                            backdrop-blur-sm
                          "
        >                                                                                                       {/* Header with menu button, notifications, and profile */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden rounded-md p-2 text-slate-300 hover:bg-slate-700"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button className="
                                  rounded-full 
                                  border border-slate-700 
                                  bg-slate-900 p-2 
                                  text-slate-300 
                                  hover:bg-slate-700
                                "
              >
                <Bell className="h-5 w-5" />
              </button>                                                                                         {/* Notifications button */}
              
              <label htmlFor="admin-profile-upload" className="cursor-pointer">                                 {/* Profile upload - clicking opens file dialog */}
                <div className="
                                flex 
                                items-center 
                                gap-3 
                                rounded-2xl 
                                border border-slate-700 
                                bg-slate-900 
                                px-3 py-2
                              "
                >
                  <Avatar className="h-10 w-10">
                    {profileImage ? (
                      <AvatarImage src={profileImage} alt="Profile" />
                    ) : (
                      <AvatarFallback>SM</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">Admin</p>
                    <p className="text-xs text-slate-400">Smith Mbele</p>
                  </div>
                </div>
              </label>
              
              <input
                id="admin-profile-upload"
                type="file"
                accept="image/*"
                onChange={handleProfileUpload}
                className="sr-only"
              />                                                                                                {/* Hidden file input for profile image upload */}

            </div>
          </div>
        </header>
        
        <main className="
                          min-h-[calc(100vh-var(--header-height))] 
                          px-4 py-4 
                          lg:px-6 lg:py-6
                        "
        >                                                                                                       {/* Main content area */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;