'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail, RefreshCw, CheckCircle, Search, Trash2, Send,
  CheckCheck, Archive, ArrowLeft, Clock, CornerDownRight, Filter
} from 'lucide-react';
import { ContactMessage } from '@/lib/storage';
import ReplyMessageModal from '../ReplyMessageModal';

interface Props {
  initialMessages: ContactMessage[];
}

export default function MessagesArchiveClient({ initialMessages }: Props) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'replied' | 'read'>('all');
  const [loading, setLoading] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ContactMessage | null>(null);
  const [expandedReplyId, setExpandedReplyId] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
    } catch {}
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Delete this inquiry from archive permanently?')) return;
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
    if (!window.confirm('Clear all read notifications from archive?')) return;
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

  // Filter messages
  const filtered = messages.filter((m) => {
    if (activeTab === 'unread' && m.read) return false;
    if (activeTab === 'replied' && !m.replied) return false;
    if (activeTab === 'read' && !m.read) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = m.name?.toLowerCase().includes(q);
      const matchEmail = m.email?.toLowerCase().includes(q);
      const matchSubject = m.subject?.toLowerCase().includes(q);
      const matchMessage = m.message?.toLowerCase().includes(q);
      return matchName || matchEmail || matchSubject || matchMessage;
    }
    return true;
  });

  const unreadCount = messages.filter((m) => !m.read).length;
  const repliedCount = messages.filter((m) => m.replied).length;
  const readCount = messages.filter((m) => m.read).length;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or message keyword..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold shadow-xs transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Mark All Read</span>
            </button>
          )}

          {readCount > 0 && (
            <button
              type="button"
              onClick={handleClearAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 text-xs font-semibold shadow-xs transition-colors"
            >
              <Archive className="w-3.5 h-3.5 text-stone-500" />
              <span>Clear Read</span>
            </button>
          )}

          <button
            type="button"
            onClick={fetchMessages}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          All Notifications ({messages.length})
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'unread'
              ? 'bg-amber-600 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <span>Unread</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-full font-bold">
            {unreadCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('replied')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'replied'
              ? 'bg-emerald-700 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <span>Replied</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-full font-bold">
            {repliedCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('read')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'read'
              ? 'bg-stone-700 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Read Archive ({readCount})
        </button>
      </div>

      {/* Messages Card Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base font-serif font-bold text-slate-800">
                {searchTerm ? 'No messages match your search' : 'No messages in this folder'}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                {searchTerm ? 'Try searching with a different term.' : 'Inquiries submitted by readers will appear here.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filtered.map((msg) => (
              <div
                key={msg.id}
                className={`p-6 space-y-3.5 transition-colors ${
                  msg.read ? 'bg-white' : 'bg-blue-50/20'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    {!msg.read ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" title="Unread" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-stone-300 shrink-0" title="Read" />
                    )}

                    <span className="font-bold text-slate-900 text-sm">{msg.name}</span>
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Your inquiry')}`}
                      className="text-blue-600 hover:underline"
                    >
                      &lt;{msg.email}&gt;
                    </a>

                    {msg.replied && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCheck className="w-3 h-3 text-emerald-600" />
                        Directly Replied
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-stone-400">
                    <span className="flex items-center gap-1 text-xs">
                      <Clock className="w-3.5 h-3.5" />
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
                        className="text-stone-500 hover:text-emerald-700 hover:underline text-xs font-medium"
                      >
                        Mark read
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subject */}
                {msg.subject && (
                  <p className="text-sm font-bold text-slate-800">{msg.subject}</p>
                )}

                {/* Message Body */}
                <div className="text-xs text-stone-700 whitespace-pre-wrap leading-relaxed bg-stone-50/70 p-4 rounded-xl border border-stone-200/60 font-sans">
                  {msg.message}
                </div>

                {/* Sent Reply History */}
                {msg.replied && msg.replyContent && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setExpandedReplyId(expandedReplyId === msg.id ? null : msg.id)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>{expandedReplyId === msg.id ? 'Hide Sent Reply' : 'View Sent Reply History'}</span>
                    </button>

                    {expandedReplyId === msg.id && (
                      <div className="mt-2.5 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 text-xs text-emerald-950 space-y-1.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                          <span>Delivered directly to {msg.email}:</span>
                          <span>{msg.repliedAt ? new Date(msg.repliedAt).toLocaleString() : ''}</span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed font-sans">{msg.replyContent}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setReplyTarget(msg)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{msg.replied ? 'Send Another Reply' : `Reply Directly to ${msg.name}`}</span>
                  </button>

                  <a
                    href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Your inquiry on JWDR Blog')}`}
                    className="text-xs text-stone-500 hover:text-stone-700 transition-colors"
                  >
                    Open in default mail client
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
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
