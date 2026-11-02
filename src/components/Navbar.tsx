'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PenSquare, LogOut, ShieldCheck, LayoutDashboard, Menu, X, BookOpen, Mail, Settings as SettingsIcon, ExternalLink } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siteTitle, setSiteTitle] = useState('JWDR Blog');

  useEffect(() => {
    // Check if user is logged in as admin
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setIsAdmin(data.authenticated || false);
        if (data.siteTitle) setSiteTitle(data.siteTitle);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAdmin(false);
    router.push('/');
    router.refresh();
  };

  // When inside the admin portal: DO NOT render the public reader navbar!
  if (pathname.startsWith('/admin')) {
    // If on admin login page, render nothing for a clean, distraction-free login
    if (pathname === '/admin/login') {
      return null;
    }

    // Dedicated clean Admin Workspace Header
    return (
      <header className="bg-slate-950 text-slate-100 border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2 group">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-serif font-bold text-sm tracking-wide text-white group-hover:text-emerald-300 transition-colors">
                My Workspace
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                pathname === '/admin' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/posts/new"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>+ New Post</span>
            </Link>

            <Link
              href="/admin/settings"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                pathname === '/admin/settings' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <SettingsIcon className="w-3.5 h-3.5 text-stone-400" />
              <span>Settings</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1 text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-800/80 transition-colors"
              title="View public live blog in new tab"
            >
              <ExternalLink className="w-3 h-3" />
              <span>View Blog</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-slate-400 hover:text-rose-300 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Main Public Navigation (ONLY rendered on public reader pages: /, /posts/..., /about, /contact)
  return (
    <header className="border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex flex-col">
            <span className="text-2xl font-serif font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              {siteTitle}
            </span>
            {/* <span className="text-xs uppercase tracking-widest text-stone-500 font-sans font-semibold">
              Writings & Reflections
            </span> */}
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
          <Link 
            href="/" 
            className={`transition-colors hover:text-blue-600 flex items-center gap-1.5 ${pathname === '/' ? 'text-blue-600 font-semibold' : ''}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Writings</span>
          </Link>
          <Link 
            href="/about" 
            className={`transition-colors hover:text-blue-600 ${pathname === '/about' ? 'text-blue-600 font-semibold' : ''}`}
          >
            About
          </Link>
          <Link 
            href="/contact" 
            className={`transition-colors hover:text-blue-600 flex items-center gap-1.5 ${pathname === '/contact' ? 'text-blue-600 font-semibold' : ''}`}
          >
            <Mail className="w-4 h-4" />
            <span>Contact</span>
          </Link>
        </nav>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-stone-200/50"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <nav aria-label="Mobile navigation" className="md:hidden border-t border-stone-200 bg-stone-50 px-4 py-4 space-y-3">
          <Link 
            href="/" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-blue-600"
          >
            Writings
          </Link>
          <Link 
            href="/about" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-blue-600"
          >
            About
          </Link>
          <Link 
            href="/contact" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-blue-600"
          >
            Contact
          </Link>
        </nav>
      )}
    </header>
  );
}
