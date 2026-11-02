import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto py-20 text-center space-y-6">
      <div className="inline-flex p-4 rounded-full bg-stone-100 text-stone-600">
        <BookOpen className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-serif font-black text-slate-900">Page Not Found</h1>
      <p className="text-sm text-stone-500">
        The article or page you are looking for does not exist or has been moved.
      </p>
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
}
