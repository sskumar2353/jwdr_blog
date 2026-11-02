'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BlogPost, SiteSettings } from '@/lib/storage';
import TableOfContents from '@/components/TableOfContents';
import { ArrowLeft, Calendar, Clock, Maximize2, Minimize2, ListFilter } from 'lucide-react';

interface Props {
  post: BlogPost;
  settings: SiteSettings;
  formattedDate: string;
}

export default function ArticleReaderView({ post, settings, formattedDate }: Props) {
  const [isFitToScreen, setIsFitToScreen] = useState(false);
  const [showTOCDrawer, setShowTOCDrawer] = useState(false);

  const toggleFitToScreen = () => {
    setIsFitToScreen(!isFitToScreen);
  };

  return (
    <div className={`transition-all duration-300 ${isFitToScreen ? 'max-w-none px-2 sm:px-6 w-full' : 'max-w-5xl mx-auto'}`}>
      {/* Top Navigation & Fit to Screen Control */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-stone-200">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Master Index</span>
        </Link>

        {/* Fit to Screen Pill Button (matches user screenshot design) */}
        <div className="flex items-center gap-3">
          {isFitToScreen && post.tableOfContents && post.tableOfContents.length > 0 && (
            <button
              type="button"
              onClick={() => setShowTOCDrawer(!showTOCDrawer)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-700 text-xs font-semibold transition-colors"
              title="Toggle Table of Contents"
            >
              <ListFilter className="w-3.5 h-3.5 text-blue-600" />
              <span>Contents</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleFitToScreen}
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-200/90 hover:bg-stone-300/90 text-stone-700 hover:text-slate-900 text-xs font-semibold transition-all shadow-sm"
            title={isFitToScreen ? 'Exit Fit to Screen' : 'Fit to Screen (Wide Reading)'}
          >
            {isFitToScreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Fit to Screen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Fit to Screen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Floating TOC for Fit to Screen Mode */}
      {isFitToScreen && showTOCDrawer && post.tableOfContents && post.tableOfContents.length > 0 && (
        <div className="fixed right-6 top-24 z-50 w-80 shadow-2xl rounded-2xl bg-white border border-stone-300 p-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 mb-3 border-b">
            <span className="font-bold text-xs uppercase text-stone-500">Table of Contents</span>
            <button
              onClick={() => setShowTOCDrawer(false)}
              className="text-stone-400 hover:text-stone-800 text-xs font-bold px-1.5 py-0.5 rounded"
            >
              &times; Close
            </button>
          </div>
          <TableOfContents items={post.tableOfContents} />
        </div>
      )}

      {/* Article Header */}
      <header className={`mb-12 transition-all ${isFitToScreen ? 'max-w-4xl' : 'max-w-3xl'}`}>
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
          ? 'grid-cols-1'
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
