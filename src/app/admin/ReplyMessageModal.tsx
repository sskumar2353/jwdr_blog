'use client';

import React, { useState } from 'react';
import { Mail, Send, X, Loader2, Sparkles, CheckCircle2, AlertCircle, Eye, CornerDownRight } from 'lucide-react';
import { ContactMessage } from '@/lib/storage';

interface Props {
  message: ContactMessage;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: ContactMessage) => void;
}

export default function ReplyMessageModal({ message, isOpen, onClose, onSuccess }: Props) {
  const [subject, setSubject] = useState(`Re: ${message.subject || 'Your inquiry on JWDR Blog'}`);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen) return null;

  const handleTemplate = (type: 'thanks' | 'answer' | 'ack') => {
    if (type === 'thanks') {
      setContent(
        `Dear ${message.name},\n\nThank you so much for taking the time to read my writings and reach out. It truly means a lot to hear from readers.\n\nRegarding your note: I appreciate your perspective and thought on this. I would love to explore this further in an upcoming essay.\n\nWarm regards,\nJoseph`
      );
    } else if (type === 'answer') {
      setContent(
        `Dear ${message.name},\n\nThank you for getting in touch regarding my recent reflections.\n\nTo answer your question directly:\n\n[Write your detailed thoughts here...]\n\nI hope this brings helpful clarity. Please feel free to reply if you'd like to share more thoughts.\n\nWith warm regards,\nJoseph`
      );
    } else {
      setContent(
        `Dear ${message.name},\n\nJust a quick note to confirm that I received your message. Thank you for reaching out and connecting with my work.\n\nBest regards,\nJoseph`
      );
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please write your reply message before sending.');
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/contact/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: message.id,
          replySubject: subject,
          replyContent: content,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(data.message || 'Reply dispatched successfully!');
        if (data.data) {
          onSuccess(data.data);
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(data.error || 'Failed to dispatch email reply. Please check SMTP settings.');
      }
    } catch {
      setError('Network error occurred while sending email reply.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base leading-tight">Direct Email Reply</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Replying to <span className="font-semibold text-white">{message.name}</span> &lt;{message.email}&gt;
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSendReply} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Quoted Reader Inquiry Box */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5 text-xs text-stone-600">
            <div className="flex items-center justify-between text-stone-400 font-medium">
              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                <CornerDownRight className="w-3.5 h-3.5 text-blue-600" />
                Original Inquiry: &ldquo;{message.subject}&rdquo;
              </span>
              <span>{new Date(message.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="italic text-stone-700 bg-white p-2.5 rounded-lg border border-stone-200/80 line-clamp-3">
              &ldquo;{message.message}&rdquo;
            </p>
          </div>

          {/* Quick Response Templates */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-500">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Quick Template Starters</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleTemplate('thanks')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              >
                Warm Thank You
              </button>
              <button
                type="button"
                onClick={() => handleTemplate('answer')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              >
                Detailed Answer
              </button>
              <button
                type="button"
                onClick={() => handleTemplate('ack')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              >
                Brief Note
              </button>
            </div>
          </div>

          {/* Subject Field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
              Email Subject
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-sm border border-stone-300 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Reply Content Area */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                Your Reply (Delivered via Gmail SMTP)
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showPreview ? 'Edit Message' : 'Preview Layout'}</span>
              </button>
            </div>

            {showPreview ? (
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 min-h-[160px] text-sm text-stone-800 space-y-3 font-sans">
                <p className="text-xs text-stone-400 font-medium border-b border-stone-200 pb-2">
                  Preview of how {message.name} will receive this:
                </p>
                <p className="font-semibold text-slate-900">Dear {message.name},</p>
                <div className="whitespace-pre-wrap leading-relaxed text-stone-700">
                  {content || '(Type your message to see the preview...)'}
                </div>
                <div className="pt-3 border-t border-stone-200 text-xs text-stone-500">
                  <p className="font-bold text-slate-800">Joseph</p>
                  <p>JWDR&apos;s Blog &bull; Reflections & Essays</p>
                </div>
              </div>
            ) : (
              <textarea
                required
                rows={7}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Dear ${message.name},\n\nThank you for reaching out...`}
                className="w-full text-sm border border-stone-300 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
              />
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
            <span className="text-[11px] text-stone-400">
              Formatted using JWDR&apos;s Premium Editorial Email Template
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending || !content.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending to {message.name}...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply Directly</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
