'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BlogPost, SiteSettings } from '@/lib/storage';
import TableOfContents from '@/components/TableOfContents';
import { ArrowLeft, Calendar, Clock, ListFilter, X } from 'lucide-react';

interface Props {
  post: BlogPost;
  settings: SiteSettings;
  formattedDate: string;
}

// Custom diagonal expand icon matching user's exact uploaded screenshot (media_1793628037451_af3a6494.png)
function FitToScreenIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Top-left arrow ↖ */}
      <polyline points="10 4 4 4 4 10" />
      <line x1="4" y1="4" x2="11" y2="11" />
      {/* Bottom-right arrow ↘ */}
      <polyline points="14 20 20 20 20 14" />
      <line x1="20" y1="20" x2="13" y2="13" />
    </svg>
  );
}

// Inwards collapse icon when returning from Fit to Screen mode
function ExitFitToScreenIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Top-left inwards ↘ */}
      <polyline points="4 11 11 11 11 4" />
      <line x1="11" y1="11" x2="4" y2="4" />
      {/* Bottom-right inwards ↖ */}
      <polyline points="20 13 13 13 13 20" />
      <line x1="13" y1="13" x2="20" y2="20" />
    </svg>
  );
}

export default function ArticleReaderView({ post, settings, formattedDate }: Props) {
  const [isFitToScreen, setIsFitToScreen] = useState(false);
  const [showTOCDrawer, setShowTOCDrawer] = useState(false);

  const toggleFitToScreen = () => {
    setIsFitToScreen(!isFitToScreen);
  };

  return (
    <div className={`transition-all duration-300 ${isFitToScreen ? 'max-w-none px-3 sm:px-10 w-full' : 'max-w-5xl mx-auto'}`}>
      {/* Top Navigation & Fit to Screen Controls */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-stone-200">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Master Index</span>
        </Link>

        {/* Top Actions: TOC Button with Hover Tooltip & Fit to Screen Pill */}
        <div className="flex items-center gap-3">
          {post.tableOfContents && post.tableOfContents.length > 0 && (
            <div className="relative group">
              <button
                type="button"
                onClick={() => setShowTOCDrawer(!showTOCDrawer)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
                  showTOCDrawer
                    ? 'bg-blue-600 text-white shadow-blue-200'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-blue-700 border border-stone-300/80 hover:border-blue-400'
                }`}
                aria-label="Table of Contents"
              >
                <ListFilter className="w-3.5 h-3.5 text-blue-600 transition-transform group-hover:scale-110" />
                <span>TOC</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-stone-200 group-hover:bg-blue-100 group-hover:text-blue-800 rounded-full font-mono">
                  {post.tableOfContents.length}
                </span>
              </button>

              {/* Beautiful Hover Tooltip */}
              <div className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 -bottom-10 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium tracking-wide shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 ease-out transform group-hover:translate-y-0.5 z-50">
                Table of Contents
                <div className="absolute right-4 sm:left-1/2 sm:-translate-x-1/2 bottom-full w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-slate-900" />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={toggleFitToScreen}
            className={`group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
              isFitToScreen
                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                : 'bg-stone-200 hover:bg-stone-300 text-stone-800'
            }`}
            title={isFitToScreen ? 'Exit Fit to Screen' : 'Fit to Screen (Expand Canvas)'}
          >
            {isFitToScreen ? (
              <>
                <ExitFitToScreenIcon className="w-3.5 h-3.5" />
                <span>Exit Fit to Screen</span>
              </>
            ) : (
              <>
                <FitToScreenIcon className="w-3.5 h-3.5" />
                <span>Fit to Screen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Slide-over TOC Drawer (Opens smoothly from top bar button, no floating screen clutter) */}
      {showTOCDrawer && post.tableOfContents && post.tableOfContents.length > 0 && (
        <div className="fixed right-6 top-24 z-50 w-80 sm:w-96 shadow-2xl rounded-2xl bg-white border border-stone-300 p-5 max-h-[75vh] flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200 shrink-0">
            <span className="font-bold text-xs uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <ListFilter className="w-3.5 h-3.5 text-blue-600" />
              Table of Contents ({post.tableOfContents.length})
            </span>
            <button
              onClick={() => setShowTOCDrawer(false)}
              className="text-stone-400 hover:text-stone-800 p-1 rounded-md transition-colors"
              title="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 pr-1">
            <TableOfContents items={post.tableOfContents} />
          </div>
        </div>
      )}

      {/* Article Header */}
      <header className={`mb-10 transition-all ${isFitToScreen ? 'max-w-4xl mx-auto' : 'max-w-3xl'}`}>
        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mb-4 font-sans">
          <span className="flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5" />
            {post.readingTime}
          </span>
          <span>&bull;</span>
          <span className="font-medium text-slate-700">By {settings.authorName}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-slate-950 leading-[1.2]">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-6 text-xl font-serif italic text-stone-600 leading-relaxed border-l-2 border-stone-300 pl-4">
            {post.excerpt}
          </p>
        )}
      </header>

      {/* Main Reading Canvas */}
      <div className={`grid gap-12 items-start transition-all ${
        isFitToScreen
          ? 'grid-cols-1 max-w-4xl mx-auto'
          : 'grid-cols-1 lg:grid-cols-12'
      }`}>
        {/* Article Body */}
        <div className={`bg-white rounded-2xl border border-stone-200/80 p-8 sm:p-14 shadow-sm ${
          isFitToScreen ? 'w-full' : 'lg:col-span-8'
        }`}>
          <div
            className="prose-editorial max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Author Bio Signoff */}
          <div className="mt-16 pt-8 border-t border-stone-200 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-serif font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
              {settings.authorName.charAt(0)}
            </div>
            <div>
              <h4 className="font-serif font-bold text-slate-900 text-base">
                Written by {settings.authorName}
              </h4>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                {settings.authorBio}
              </p>
              <div className="mt-3">
                <Link
                  href="/contact"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Send a private message &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Table of Contents Sidebar (Normal Mode) */}
        {!isFitToScreen && (
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            {post.tableOfContents && post.tableOfContents.length > 0 ? (
              <TableOfContents items={post.tableOfContents} />
            ) : (
              <div className="p-4 rounded-xl bg-stone-100/60 border border-stone-200/60 text-xs text-stone-400">
                No sections in this article.
              </div>
            )}

            {/* Quick Actions Card */}
            <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-sm text-xs text-stone-600 space-y-3">
              <p className="font-semibold text-slate-900">Enjoyed this writing?</p>
              <p className="text-stone-500">
                Share it with someone or reach out with your thoughts through the contact page.
              </p>
              <Link
                href="/contact"
                className="block text-center py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors"
              >
                Contact Author
              </Link>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
