'use client';

import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, CheckCircle, ExternalLink, MessageSquare, Clock } from 'lucide-react';
import { ContactMessage } from '@/lib/storage';

interface Props {
  initialMessages: ContactMessage[];
}

export default function ReaderMessagesList({ initialMessages }: Props) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages || []);
  const [loading, setLoading] = useState(false);

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

  return (
    <div>
      <div className="p-5 border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {messages.length} total
          </span>
          {messages.some((m) => !m.read) && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {messages.filter((m) => !m.read).length} unread
            </span>
          )}
        </div>

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
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-5 space-y-3 transition-colors ${
                msg.read ? 'bg-white' : 'bg-blue-50/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  {!msg.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" title="Unread message" />
                  )}
                  <span className="font-bold text-slate-900">{msg.name}</span>
                  <a
                    href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Your inquiry')}`}
                    className="text-blue-600 hover:underline"
                  >
                    &lt;{msg.email}&gt;
                  </a>
                </div>

                <div className="flex items-center gap-3 text-stone-400">
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
                </div>
              </div>

              {msg.subject && (
                <p className="text-xs font-semibold text-slate-800">{msg.subject}</p>
              )}

              <div className="text-xs text-stone-700 whitespace-pre-wrap leading-relaxed bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/60 font-sans">
                {msg.message}
              </div>

              <div>
                <a
                  href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Your inquiry on JWDR Blog')}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Reply to {msg.name}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
