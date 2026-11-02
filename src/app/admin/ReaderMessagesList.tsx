'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail, RefreshCw, CheckCircle, ExternalLink, MessageSquare, Clock,
  Trash2, Send, CheckCheck, Archive, ChevronRight, CornerDownRight
} from 'lucide-react';
import { ContactMessage } from '@/lib/storage';
import ReplyMessageModal from './ReplyMessageModal';

interface Props {
  initialMessages: ContactMessage[];
}

export default function ReaderMessagesList({ initialMessages }: Props) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages || []);
  const [loading, setLoading] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ContactMessage | null>(null);
  const [expandedReplyId, setExpandedReplyId] = useState<string | null>(null);

  const fetchLatestMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to refresh reader messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestMessages();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, read: true } : m))
      );
    } catch {}
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Are you sure you want to clear/delete this message?')) return;
    try {
      const res = await fetch('/api/contact', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }
    } catch {}
  };

  const handleClearAllRead = async () => {
    if (!window.confirm('Clear all read notifications from this list?')) return;
    try {
      const res = await fetch('/api/contact', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearRead: true }),
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => !m.read));
      }
    } catch {}
  };

  const handleReplySuccess = (updated: ContactMessage) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === updated.id ? { ...m, ...updated, read: true, replied: true } : m))
    );
  };

  // Only show the most recent 5 on the overview dashboard
  const displayMessages = messages.slice(0, 5);

  return (
    <div>
      {/* Top Header Actions */}
      <div className="p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-stone-50/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {messages.length} total
          </span>
          {messages.some((m) => !m.read) && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {messages.filter((m) => !m.read).length} unread
            </span>
          )}
          {messages.some((m) => m.replied) && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {messages.filter((m) => m.replied).length} replied
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {messages.some((m) => m.read) && (
            <button
              type="button"
              onClick={handleClearAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 text-xs font-medium transition-colors"
              title="Clear all read messages from notifications"
            >
              <Archive className="w-3.5 h-3.5 text-stone-500" />
              <span>Clear Read</span>
            </button>
          )}

          <button
            type="button"
            onClick={fetchLatestMessages}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors disabled:opacity-50"
            title="Refresh messages list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">No reader messages yet</p>
            <p className="text-xs text-stone-400 mt-1 max-w-md mx-auto">
              When readers submit inquiries via your public contact form, they will appear here and be delivered directly to your inbox.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-stone-100">
          {displayMessages.map((msg) => (
            <div
              key={msg.id}
              className={`p-5 space-y-3 transition-colors ${
                msg.read ? 'bg-white' : 'bg-blue-50/25'
              }`}
            >
              {/* Message Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  {!msg.read ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" title="Unread notification" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-stone-300 shrink-0" title="Read" />
                  )}

                  <span className="font-bold text-slate-900">{msg.name}</span>
                  <a
                    href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Your inquiry')}`}
                    className="text-blue-600 hover:underline"
                  >
                    &lt;{msg.email}&gt;
                  </a>

                  {msg.replied && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCheck className="w-3 h-3 text-emerald-600" />
                      Replied
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 text-stone-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(msg.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {!msg.read && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(msg.id)}
                      className="text-stone-500 hover:text-emerald-700 hover:underline text-[11px]"
                    >
                      Mark read
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Clear notification / Delete message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Message Subject */}
              {msg.subject && (
                <p className="text-xs font-semibold text-slate-800">{msg.subject}</p>
              )}

              {/* Message Body */}
              <div className="text-xs text-stone-700 whitespace-pre-wrap leading-relaxed bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/60 font-sans">
                {msg.message}
              </div>

              {/* Sent Reply History (Collapsible) */}
              {msg.replied && msg.replyContent && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setExpandedReplyId(expandedReplyId === msg.id ? null : msg.id)}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>{expandedReplyId === msg.id ? 'Hide Sent Reply' : 'View Sent Reply History'}</span>
                  </button>

                  {expandedReplyId === msg.id && (
                    <div className="mt-2 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/70 text-xs text-emerald-950 space-y-1 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-[11px] text-emerald-700 font-medium">
                        <span>Your Reply:</span>
                        <span>{msg.repliedAt ? new Date(msg.repliedAt).toLocaleString() : ''}</span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed font-sans">{msg.replyContent}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action: Direct In-App Reply Button */}
              <div className="pt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setReplyTarget(msg)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{msg.replied ? 'Send Another Reply' : `Reply Directly to ${msg.name}`}</span>
                </button>

                <a
                  href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Your inquiry on JWDR Blog')}`}
                  className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
                >
                  (or open in mail app)
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation Footer to Dedicated All Past Notifications Page */}
      <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
        <span className="text-xs text-stone-500">
          Showing {displayMessages.length} of {messages.length} messages
        </span>

        <Link
          href="/admin/messages"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-blue-50 border border-stone-300 hover:border-blue-300 text-blue-700 text-xs font-semibold shadow-xs transition-all hover:translate-x-0.5"
        >
          <span>View All Past Notifications & Archive</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Reply Modal */}
      {replyTarget && (
        <ReplyMessageModal
          message={replyTarget}
          isOpen={!!replyTarget}
          onClose={() => setReplyTarget(null)}
          onSuccess={handleReplySuccess}
        />
      )}
    </div>
  );
}
