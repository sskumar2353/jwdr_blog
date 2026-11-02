import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { getAllMessages, getCloudMessages } from '@/lib/storage';
import { ArrowLeft, Mail, Inbox } from 'lucide-react';
import MessagesArchiveClient from './MessagesArchiveClient';

export const revalidate = 0;

export default async function AdminMessagesArchivePage() {
  const authed = isAuthenticated();
  if (!authed) {
    redirect('/admin/login');
  }

  const localMsgs = getAllMessages();
  const cloudMsgs = await getCloudMessages().catch(() => null);

  const messageMap = new Map();
  for (const m of [...localMsgs, ...(cloudMsgs || [])]) {
    if (m?.id) messageMap.set(m.id, m);
  }
  const messages = Array.from(messageMap.values()).sort(
    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-8 py-6">
      {/* Top Header */}
      <div className="pb-6 border-b border-stone-200 space-y-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Author Workspace</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 mb-2">
              <Inbox className="w-3.5 h-3.5" />
              <span>Inquiries & Notifications</span>
            </div>
            <h1 className="text-3xl font-serif font-black text-slate-900 tracking-tight">
              Reader Messages Archive
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Search, review, clear notifications, and directly reply to all reader inquiries via your verified email.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Messages Archive */}
      <MessagesArchiveClient initialMessages={messages} />
    </div>
  );
}
