'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PenSquare, LogOut, ShieldCheck, LayoutDashboard, Menu, X, BookOpen, Mail } from 'lucide-react';

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

  return (
    <>
      {/* Top Admin Status Bar (Only visible when logged in as author) */}
      {isAdmin && (
        <aside aria-label="Author controls" className="bg-slate-900 text-slate-100 px-4 py-2 text-xs font-medium sticky top-0 z-50 shadow-md">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Author Mode Active</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/admin" 
                className="flex items-center gap-1 hover:text-white transition-colors py-0.5 px-2 rounded hover:bg-slate-800"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <Link 
                href="/admin/posts/new" 
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white transition-colors py-0.5 px-2.5 rounded font-medium shadow-sm"
              >
                <PenSquare className="w-3.5 h-3.5" />
                <span>+ New Post</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1 text-slate-400 hover:text-rose-300 transition-colors py-0.5 px-2 rounded"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Public Navigation */}
      <header className="border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex flex-col">
              <span className="text-2xl font-serif font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                {siteTitle}
              </span>
              <span className="text-xs uppercase tracking-widest text-stone-500 font-sans font-semibold">
                Writings & Reflections
              </span>
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
    </>
  );
}
