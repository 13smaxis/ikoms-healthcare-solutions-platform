"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Bell } from "lucide-react";
import { COMPANY } from "@/lib/constants";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

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
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [loginLoading, setLoginLoading] = React.useState(false); 
  const { user, isAdmin, loading, hydrating, login, logout } = useAuth();

  const handleProfileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) 
    {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const isActive = (href: string) => pathname === href;

  React.useEffect(() => {
    if (loading)                                                                                                                  //- Check if auth is still loading, if so, do not proceed
    {
      return;
    }

    if (user)                                                                                                                     //- If user is logged in, close login dialog and reset login state
    {
      setLoginOpen(true);                                                                                                         //- Open the login dialog if user is logged in
      setLoginError(null);                                                                                                        //- Clear any previous login errors
      setPassword("");                                                                                                            //- Clear the password field for security
    }
  }, [loading, user]);                                                                                                            //- Dependency array ensures this effect runs when loading or user state changes

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    const { error } = await login(email, password);

    if (error) {
      setLoginError(error);
    }

    setLoginLoading(false);
  };

  const handleSignOut = async () => {
    setLoginOpen(false);
    setSidebarOpen(false);
    await logout();
  };

  const handleSidebarSignOut = async () => {
    setSidebarOpen(false);
    await handleSignOut();
  };

  if (loading || hydrating || loginLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white" />
          </div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Admin Portal</p>
          <p className="mt-3 text-2xl font-semibold text-white">
            Hang tight we fetching your Admin Portal
          </p>
          <div className="mt-5 flex items-center justify-center gap-2 text-slate-300">
            <span className="h-2 w-2 animate-bounce rounded-full bg-white/80 [animation-delay:-0.2s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-white/80 [animation-delay:-0.1s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-white/80" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                Admin access
              </div>
              <div className="space-y-4">
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  Sign in to manage the IKOMS admin workspace.
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                  You are currently logged out. Use your Supabase account to access jobs, courses,
                  consultancy and e-commerce tools.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setLoginOpen(true)}
                  className="rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Open sign in
                </button>
                <Link
                  href="/"
                  className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                >
                  Go home
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Logged out state</p>
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                <p>• Admin content is hidden until Supabase returns a signed-in user.</p>
                <p>• The login dialog stays in sync with the current auth session.</p>
                <p>• Signing out returns you to this state automatically.</p>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
          <DialogContent className="border-white/10 bg-slate-950 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl">Admin sign in</DialogTitle>
              <DialogDescription className="text-slate-300">
                Authenticate with your Supabase account to unlock the admin dashboard.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="admin-email" className="text-sm font-medium text-slate-200">
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="admin-password" className="text-sm font-medium text-slate-200">
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>

              {loginError && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="flex w-full items-center justify-center rounded-full bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loginLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full rounded-3xl border border-red-500/20 bg-red-500/10 p-8 shadow-2xl shadow-black/30">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-200">Access denied</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Your Supabase account is signed in, but it does not have admin privileges.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-red-100/90 sm:text-lg">
              Ask a manager to assign an admin role, or sign out and use a different account.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Go home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  const SignOutButton = ({ onClick }: { onClick?: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="
      block
      w-full
      rounded-full
      bg-blue-700
      px-4 py-3
      text-center
      text-sm
      font-semibold text-white
      hover:bg-blue-800
    "
    >
      Sign out
    </button>
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
          <SignOutButton onClick={handleSidebarSignOut} />                                                     {/* Sign out button at bottom of mobile sidebar */}
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
          <SignOutButton onClick={handleSignOut} />                                                            {/* Sign out button at bottom of desktop sidebar */}
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