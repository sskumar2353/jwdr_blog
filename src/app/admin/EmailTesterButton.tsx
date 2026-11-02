'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function EmailTesterButton() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestEmail = async () => {
    setTesting(true);
    setResult(null);

    try {
      const res = await fetch('/api/contact/test', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult({
          success: true,
          message: data.message || 'Test email dispatched successfully! Check your inbox.',
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to dispatch test email. Please check your SMTP settings in Vercel.',
        });
      }
    } catch {
      setResult({
        success: false,
        message: 'Network request error while testing email dispatch.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleTestEmail}
        disabled={testing}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-blue-50 border border-stone-200 hover:border-blue-300 text-stone-700 hover:text-blue-700 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
        title="Send a live test email to verify your SMTP credentials"
      >
        {testing ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>Verifying SMTP...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Test Email Dispatch</span>
          </>
        )}
      </button>

      {result && (
        <div
          className={`text-xs px-3 py-2 rounded-lg border max-w-md animate-in fade-in duration-200 ${
            result.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-start gap-1.5">
            {result.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{result.success ? 'Verified' : 'Configuration Notice'}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed">{result.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
