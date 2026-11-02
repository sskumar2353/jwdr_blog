import React from 'react';
import Link from 'next/link';
import { getAllPosts, getSettings } from '@/lib/storage';
import { Calendar, Clock, ListTree, ArrowRight, Sparkles } from 'lucide-react';

export const revalidate = 0; // Dynamic server rendering for instant updates

export default function HomePage() {
  const posts = getAllPosts(false); // Only published posts for public view
  const settings = getSettings();

  return (
    <div className="space-y-16">
      {/* Editorial Header / Intro */}
      <section className="py-12 border-b border-stone-200/80">
        <div className="max-w-3xl">
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-xs font-semibold text-blue-700 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to my writing space</span>
          </div> */}
          <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-slate-950 leading-[1.15]">
            {settings.siteTitle}
          </h1>
          <p className="mt-4 text-xl font-serif text-stone-600 leading-relaxed">
            {settings.tagline}
          </p>
          {/* <p className="mt-4 text-base text-stone-600 leading-relaxed font-sans max-w-2xl">
            {settings.authorBio}
          </p> */}
        </div>
      </section>

      {/* Index of Writings */}
      <section className="space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">
              Recent Posts
            </h2>
            {/* <p className="text-sm text-stone-500 mt-1">
              Browse essays, articles, and long-form writings.
            </p> */}
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-stone-200/70 text-stone-700">
            {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-white border border-stone-200 p-8">
            <p className="text-lg font-serif text-stone-500">No writings published yet.</p>
            <p className="text-sm text-stone-400 mt-1">Check back soon for new articles!</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {posts.map((post) => {
              const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  prefetch={false}
                  className="group relative block bg-white rounded-2xl border border-stone-200/90 p-7 sm:p-9 shadow-sm hover:shadow-lg hover:border-blue-400 transition-all duration-200 cursor-pointer"
                >
                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 mb-3 font-sans">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      {formattedDate}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {post.readingTime}
                    </span>
                    {post.tableOfContents && post.tableOfContents.length > 0 && (
                      <>
                        <span>&bull;</span>
                        <span
                          className="relative group/toc inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                        >
                          <ListTree className="w-3.5 h-3.5" />
                          <span>{post.tableOfContents.length} Sections in TOC</span>
                          <span className="absolute left-1/2 -translate-x-1/2 -top-8 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] font-normal shadow-lg whitespace-nowrap opacity-0 group-hover/toc:opacity-100 pointer-events-none transition-all duration-150 z-20">
                            Table of Contents ({post.tableOfContents.length} items)
                            <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
                          </span>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="mt-3 text-base text-stone-600 leading-relaxed font-sans line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Section preview outline chips */}
                  {post.tableOfContents && post.tableOfContents.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap gap-2">
                      <span className="text-xs text-stone-400 font-medium self-center mr-1">Outline:</span>
                      {post.tableOfContents.slice(0, 4).map((toc) => (
                        <span
                          key={toc.id}
                          className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200/80 group-hover:border-blue-200 transition-colors"
                        >
                          {toc.title}
                        </span>
                      ))}
                      {post.tableOfContents.length > 4 && (
                        <span className="text-xs px-2 py-0.5 rounded-full text-stone-400">
                          +{post.tableOfContents.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bottom Footer: Tags + Read Essay Button */}
                  <div className="mt-6 flex items-center justify-between pt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-medium text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 group-hover:bg-blue-600 text-white text-xs font-semibold shadow-sm transition-all duration-200">
                      <span>Read Blog</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
