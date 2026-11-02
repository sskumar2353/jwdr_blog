'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, ExternalLink } from 'lucide-react';
import TOCBuilder from '@/components/TOCBuilder';
import WordEditor from '@/components/WordEditor';
import { TOCItem, BlogPost } from '@/lib/storage';

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const editorRef = useRef<any>(null);

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState('');
  const [published, setPublished] = useState(true);
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/posts/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.post) {
          const p: BlogPost = data.post;
          setPost(p);
          setTitle(p.title);
          setExcerpt(p.excerpt);
          setTags((p.tags || []).join(', '));
          setPublished(p.published);
          setTocItems(p.tableOfContents || []);
          setContent(p.content);
        } else {
          setError('Post not found');
        }
      })
      .catch(() => setError('Failed to load post'))
      .finally(() => setLoading(false));
  }, [params.id]);

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

  const handleUpdate = async () => {
    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch(`/api/posts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          excerpt,
          tableOfContents: tocItems,
          content,
          published,
          tags: tagList,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Failed to update post');
      }
    } catch {
      setError('Connection error while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm(`Permanently delete "${title}"?`);
    if (!confirm) return;

    try {
      const res = await fetch(`/api/posts/${params.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        alert('Failed to delete');
      }
    } catch {
      alert('Error connecting to server');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-stone-400">Loading writing workspace...</div>;
  }

  if (!post && error) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-rose-600 font-semibold">{error}</p>
        <Link href="/admin" className="text-blue-600 underline text-sm">
          Return to Dashboard
        </Link>
      </div>
    );
  }

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
          {post && (
            <Link
              href={`/posts/${post.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 text-stone-600 hover:text-slate-900 text-xs font-semibold"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public</span>
            </Link>
          )}

          <button
            type="button"
            onClick={handleDelete}
            className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Delete Post"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleUpdate}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Post Metadata */}
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
            className="w-full text-2xl font-serif font-bold text-slate-900 border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full text-sm border border-stone-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Step 1: Table of Contents */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Table of Contents Outline
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
              Article Content (Word Document Mode)
            </h2>
          </div>
        </div>

        {content !== undefined && (
          <WordEditor
            content={content}
            onChange={setContent}
            editorRef={editorRef}
          />
        )}
      </section>

      {/* Bottom Save Bar */}
      <div className="pt-6 border-t border-stone-200 flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
          />
          <span>Published on public blog index</span>
        </label>

        <button
          type="button"
          onClick={handleUpdate}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
}
