import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { getAllPosts, getAllMessages, getSettings, getCloudMessages } from '@/lib/storage';
import {
  PenSquare, Plus, Trash2, Edit3, ExternalLink,
  Mail, Settings, BookOpen, Clock, Calendar, CheckCircle,
  FileText
} from 'lucide-react';
import DeletePostButton from './DeletePostButton';
import EmailTesterButton from './EmailTesterButton';
import ReaderMessagesList from './ReaderMessagesList';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const authed = isAuthenticated();
  if (!authed) {
    redirect('/admin/login');
  }

  const posts = getAllPosts(true); // Include drafts
  const localMsgs = getAllMessages();
  const cloudMsgs = await getCloudMessages().catch(() => null);

  const messageMap = new Map();
  for (const m of [...localMsgs, ...(cloudMsgs || [])]) {
    if (m?.id) messageMap.set(m.id, m);
  }
  const messages = Array.from(messageMap.values()).sort(
    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const settings = getSettings();

  return (
    <div className="space-y-10 py-6">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-3xl font-serif font-black text-slate-900">
            My Workspace
          </h1>
          {/* <p className="text-sm text-stone-500 mt-1">
            Manage your essays, write new content, and check reader inquiries.
          </p> */}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-sm transition-colors"
          >
            <Settings className="w-4 h-4 text-stone-500" />
            <span>Settings</span>
          </Link>

          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Blog Post</span>
          </Link>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Writings</p>
            <p className="text-2xl font-serif font-bold text-slate-900 mt-1">{posts.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Published Online</p>
            <p className="text-2xl font-serif font-bold text-emerald-700 mt-1">
              {posts.filter(p => p.published).length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Reader Messages</p>
            <p className="text-2xl font-serif font-bold text-slate-900 mt-1">{messages.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <Mail className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Writings Table */}
      <section className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-bold text-slate-900">Your Writings</h2>
            <p className="text-xs text-stone-500 mt-0.5">Edit, update, or remove any published article or draft.</p>
          </div>
          <Link
            href="/admin/posts/new"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            + Add Another Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-sm">
            You have not written any posts yet.{' '}
            <Link href="/admin/posts/new" className="text-blue-600 underline font-semibold">
              Write your first post &rarr;
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {posts.map((post) => {
              const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div key={post.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        post.published ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                      }`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-xs text-stone-400">{formattedDate}</span>
                      <span className="text-xs text-stone-400">&bull;</span>
                      <span className="text-xs text-stone-400">{post.readingTime}</span>
                      {post.tableOfContents && post.tableOfContents.length > 0 && (
                        <span className="text-xs text-blue-600 font-medium">
                          ({post.tableOfContents.length} TOC sections)
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-serif font-bold text-slate-900">
                      <Link href={`/admin/posts/${post.id}/edit`} className="hover:text-blue-600 transition-colors">
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-stone-500 line-clamp-1">{post.excerpt}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/posts/${post.slug}`}
                      target="_blank"
                      className="p-2 rounded-lg text-stone-500 hover:text-slate-900 hover:bg-stone-100 transition-colors"
                      title="View Public Post"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>

                    <DeletePostButton postId={post.id} postTitle={post.title} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Reader Contact Inquiries Section */}
      <section className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <span>Reader Messages & Feedback</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Messages submitted through your public contact form.
            </p>
          </div>
          <EmailTesterButton />
        </div>

        <ReaderMessagesList initialMessages={messages} />
      </section>
    </div>
  );
}
