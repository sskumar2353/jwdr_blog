import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug, getSettings } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';
import TableOfContents from '@/components/TableOfContents';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';

export const dynamicParams = true;
export const revalidate = 0;

export async function generateStaticParams() {
  const posts = getAllPosts(true);
  return posts.map((p) => ({
    slug: p.slug,
  }));
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const isAuthor = isAuthenticated();
  const decodedSlug = decodeURIComponent(params.slug);
  const post = getPostBySlug(decodedSlug, isAuthor) || getPostBySlug(params.slug, isAuthor);
  const settings = getSettings();

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto py-6">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex items-center justify-between pb-8 mb-8 border-b border-stone-200">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Master Index</span>
        </Link>
      </div>

      {/* Article Header */}
      <header className="max-w-3xl mb-12">
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

      {/* Main Grid: Article Content + Sticky Table of Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Main Article Body (8 cols on desktop) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200/80 p-8 sm:p-12 shadow-sm">
          <div
            className="prose-editorial"
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

        {/* Sticky Table of Contents Sidebar (4 cols on desktop) */}
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
              className="block text-center py-2 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold transition-colors"
            >
              Contact Author
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
