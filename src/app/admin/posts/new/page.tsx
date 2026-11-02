'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Sparkles, Check, Eye } from 'lucide-react';
import TOCBuilder from '@/components/TOCBuilder';
import WordEditor from '@/components/WordEditor';
import { TOCItem } from '@/lib/storage';

export default function NewPostPage() {
  const router = useRouter();
  const editorRef = useRef<any>(null);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState('');
  const [published, setPublished] = useState(true);
  const [tocItems, setTocItems] = useState<TOCItem[]>([
    { id: 'introduction', title: 'Introduction', level: 2 },
    { id: 'key-points', title: 'Key Observations', level: 2 },
    { id: 'conclusion', title: 'Conclusion', level: 2 },
  ]);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Insert TOC outline headings straight into the editor
  const handleInsertTOCIntoEditor = (items: TOCItem[]) => {
    if (!editorRef.current) return;

    let generatedHtml = '';
    items.forEach((item) => {
      const level = Math.min(Math.max(item.level || 2, 1), 6);
      const tag = `h${level}`;
      generatedHtml += `<${tag} id="${item.id}">${item.title}</${tag}><p>Write your matter here...</p>`;
    });

    editorRef.current.commands.setContent(generatedHtml);
    setContent(generatedHtml);
  };

  const handleSave = async (isDraft = false) => {
    if (!title.trim()) {
      setError('Please provide a title for your blog post.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          excerpt,
          tableOfContents: tocItems,
          content,
          published: isDraft ? false : published,
          tags: tagList,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Failed to save blog post');
      }
    } catch {
      setError('Connection error while saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : 'Publish Post'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Main Post Metadata */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
            Post Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. The Architecture of Modern Essay Writing"
            className="w-full text-2xl font-serif font-bold text-slate-900 border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-stone-300"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
              Short Excerpt / Summary
            </label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief 1-2 sentence preview for the homepage index"
              className="w-full text-sm border border-stone-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Writing, Reflections, Technology"
              className="w-full text-sm border border-stone-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Step 1: Table of Contents Outline Builder */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Plan Your Table of Contents
          </h2>
        </div>
        <TOCBuilder
          items={tocItems}
          onChange={setTocItems}
          onInsertIntoEditor={handleInsertTOCIntoEditor}
        />
      </section>

      {/* Step 2: Word-like Document Writing Surface */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">2</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Write Your Matter (Word Document Mode)
            </h2>
          </div>
          <span className="text-xs text-stone-400">
            Use the toolbar for tables, images, headings, and alignments.
          </span>
        </div>

        <WordEditor
          content={content}
          onChange={setContent}
          editorRef={editorRef}
        />
      </section>

      {/* Bottom Publish Bar */}
      <div className="pt-6 border-t border-stone-200 flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
          />
          <span>Make visible to readers on homepage immediately</span>
        </label>

        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Publishing...' : 'Publish Post'}</span>
        </button>
      </div>
    </div>
  );
}
