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
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-slate-700">
      {/* Mobile Sidebar - slides in from left */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-800 bg-slate-900 p-5 transition-transform duration-200 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <img src={COMPANY.logo} alt="IKOMS" className="h-10 w-auto" />
          </div>
          <button
            className="rounded-md p-2 text-slate-300 hover:bg-slate-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isActive(link.href)
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-4">
          <Link
            href="/admin/login"
            className="block rounded-full bg-slate-800 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-700"
            onClick={() => setSidebarOpen(false)}
          >
            Sign in
          </Link>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/60 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Desktop Sidebar - fixed on left */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-slate-800 lg:bg-slate-900 lg:p-5">
        <div className="flex items-center gap-3 pb-6">
          <img src={COMPANY.logo} alt="IKOMS" className="h-18 w-auto" />
        </div>
        <nav className="flex-1 flex flex-col justify-center space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isActive(link.href)
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-4">
          <Link
            href="/admin/login"
            className="block rounded-full bg-blue-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-800"
          >
            Sign in
          </Link>
        </div>
      </aside>

      {/* Main content area with header */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-800/95 px-4 py-3 backdrop-blur-sm">
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
              <button className="rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:bg-slate-700">
                <Bell className="h-5 w-5" />
              </button>
              <label htmlFor="admin-profile-upload" className="cursor-pointer">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2">
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
              />
            </div>
          </div>
        </header>
        <main className="min-h-[calc(100vh-72px)] px-4 py-4 lg:px-6 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;