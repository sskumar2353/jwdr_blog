import React from 'react';
import { getSettings } from '@/lib/storage';
import Link from 'next/link';
import { BookOpen, Mail, Feather } from 'lucide-react';

export default function AboutPage() {
  const settings = getSettings();

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-12">
      <header className="space-y-4 border-b border-stone-200 pb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-200/60 text-xs font-semibold text-slate-700">
          <Feather className="w-3.5 h-3.5 text-blue-600" />
          <span>About the Author</span>
        </div>
        <h1 className="text-4xl font-serif font-black tracking-tight text-slate-900">
          About {settings.authorName}
        </h1>
        <p className="text-lg font-serif text-stone-600 leading-relaxed">
          {settings.tagline}
        </p>
      </header>

      <section className="bg-white rounded-2xl border border-stone-200/80 p-8 sm:p-12 shadow-sm space-y-6 text-slate-700 leading-relaxed font-serif text-lg">
        <p>
          Hello and welcome. I am <strong>{settings.authorName}</strong>, a blog writer dedicated to crafting in-depth writings, essays, and observations.
        </p>
        <p>
          This website is built with a singular philosophy: <em>simplicity and structure</em>. Every article starts with a clear Table of Contents and is written in a distraction-free, Word-like environment to give readers the best possible experience.
        </p>
        <p>
          Unlike modern social feeds designed for rapid scrolling, this blog is a calm, deliberate place to dive deep into topics that matter.
        </p>

        <div className="pt-6 border-t border-stone-200 flex flex-wrap gap-4 font-sans text-sm font-semibold">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse Writings</span>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-100 text-slate-800 hover:bg-stone-200 border border-stone-200 transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Get in Touch</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
