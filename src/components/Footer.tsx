import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-100/50 mt-24 py-12 text-sm text-stone-600">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="font-serif font-bold text-slate-800 text-base">JWDR Blog</p>
          <p className="text-xs text-stone-500 mt-1">A quiet, deliberate corner for essays, reflections, and writings.</p>
        </div>

        <div className="flex items-center gap-6 text-xs text-stone-500">
          <Link href="/" className="hover:text-slate-900 transition-colors">Writings</Link>
          <Link href="/about" className="hover:text-slate-900 transition-colors">About</Link>
          <Link href="/contact" className="hover:text-slate-900 transition-colors">Contact</Link>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pt-6 border-t border-stone-200/60 text-center text-xs text-stone-400">
        &copy; {new Date().getFullYear()} JWDR. All rights reserved.
      </div>
    </footer>
  );
}
