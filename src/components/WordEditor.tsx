'use client';

import React, { useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Minus,
  Table as TableIcon, Image as ImageIcon,
  Undo, Redo, Highlighter, Rows, Columns, Trash2,
  Link2, Unlink
} from 'lucide-react';

interface Props {
  content: string;
  onChange: (html: string) => void;
  editorRef?: React.MutableRefObject<any>;
}

export default function WordEditor({ content, onChange, editorRef }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800 transition-colors cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: 'Begin typing your blog post here... just like a Word document.',
      }),
    ],
    content: content || '<p></p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose-editorial tiptap focus:outline-none min-h-[450px] p-6 bg-white rounded-b-xl',
      },
    },
  });

  if (editorRef && editor) {
    editorRef.current = editor;
  }

  if (!editor) {
    return (
      <div className="border border-stone-200 rounded-xl p-8 text-center text-stone-400 bg-white">
        Loading editor toolbar...
      </div>
    );
  }

  // Handle local image upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch {
      alert('Error uploading image');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addImageUrlPrompt = () => {
    const url = window.prompt('Enter Image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleSetLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter or edit hyperlink URL (e.g. https://example.com):', previousUrl);

    if (url === null) {
      return; // cancelled
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Ensure protocol
    const finalUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  // Get current active heading level
  const getCurrentHeadingValue = () => {
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive('heading', { level: i })) return `h${i}`;
    }
    return 'p';
  };

  const handleHeadingSelect = (val: string) => {
    if (val === 'p') {
      editor.chain().focus().setParagraph().run();
    } else {
      const lvl = parseInt(val.replace('h', ''), 10) as 1 | 2 | 3 | 4 | 5 | 6;
      editor.chain().focus().toggleHeading({ level: lvl }).run();
    }
  };

  return (
    <div className="border border-stone-300 rounded-xl overflow-hidden shadow-sm bg-white">
      {/* Hidden file input for images */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Word-like Ribbon Toolbar */}
      <div className="bg-stone-100 border-b border-stone-200 p-2 flex flex-wrap items-center gap-1.5 text-slate-700 select-none">
        {/* Undo / Redo */}
        <div className="flex items-center border-r border-stone-300 pr-1.5 mr-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded hover:bg-stone-200 disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded hover:bg-stone-200 disabled:opacity-30"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Headings Selector: H1 to H6 */}
        <div className="flex items-center border-r border-stone-300 pr-2 mr-0.5">
          <select
            value={getCurrentHeadingValue()}
            onChange={(e) => handleHeadingSelect(e.target.value)}
            className="text-xs font-semibold bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm"
          >
            <option value="p">Normal Text</option>
            <option value="h1">Heading 1 (H1)</option>
            <option value="h2">Heading 2 (H2)</option>
            <option value="h3">Heading 3 (H3)</option>
            <option value="h4">Heading 4 (H4)</option>
            <option value="h5">Heading 5 (H5)</option>
            <option value="h6">Heading 6 (H6)</option>
          </select>
        </div>

        {/* Text Styles */}
        <div className="flex items-center border-r border-stone-300 pr-1.5 mr-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded ${editor.isActive('bold') ? 'bg-blue-600 text-white' : 'hover:bg-stone-200'}`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded ${editor.isActive('italic') ? 'bg-blue-600 text-white' : 'hover:bg-stone-200'}`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded ${editor.isActive('underline') ? 'bg-blue-600 text-white' : 'hover:bg-stone-200'}`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded ${editor.isActive('strike') ? 'bg-blue-600 text-white' : 'hover:bg-stone-200'}`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-1.5 rounded ${editor.isActive('highlight') ? 'bg-yellow-400 text-slate-900' : 'hover:bg-stone-200'}`}
            title="Highlight Text"
          >
            <Highlighter className="w-4 h-4" />
          </button>
        </div>

        {/* Hyperlink Tool */}
        <div className="flex items-center border-r border-stone-300 pr-1.5 mr-0.5 gap-0.5">
          <button
            type="button"
            onClick={handleSetLink}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded ${
              editor.isActive('link') ? 'bg-blue-600 text-white' : 'hover:bg-stone-200 text-stone-700'
            }`}
            title="Insert or Edit Hyperlink"
          >
            <Link2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Link</span>
          </button>
          {editor.isActive('link') && (
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="p-1.5 rounded hover:bg-stone-200 text-rose-600"
              title="Remove Hyperlink"
            >
              <Unlink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Alignments */}
        <div className="flex items-center border-r border-stone-300 pr-1.5 mr-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-1.5 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-600 text-white' : 'hover:bg-stone-200'}`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-1.5 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-600 text-white' : 'hover:bg-stone-200'}`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-1.5 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-600 text-white' : 'hover:bg-stone-200'}`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-1.5 rounded ${editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-600 text-white' : 'hover:bg-stone-200'}`}
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Lists & Quotes */}
        <div className="flex items-center border-r border-stone-300 pr-1.5 mr-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded ${editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'hover:bg-stone-200'}`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded ${editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'hover:bg-stone-200'}`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded ${editor.isActive('blockquote') ? 'bg-blue-600 text-white' : 'hover:bg-stone-200'}`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded hover:bg-stone-200"
            title="Horizontal Divider"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Images */}
        <div className="flex items-center border-r border-stone-300 pr-1.5 mr-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-white hover:bg-stone-200 border border-stone-300 shadow-sm"
            title="Upload Image from Computer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Upload Image</span>
          </button>
          <button
            type="button"
            onClick={addImageUrlPrompt}
            className="px-2 py-1 text-xs rounded hover:bg-stone-200 text-stone-600"
            title="Insert from URL"
          >
            Link Image
          </button>
        </div>

        {/* Tables */}
        <div className="flex items-center gap-0.5">
          {!editor.isActive('table') ? (
            <button
              type="button"
              onClick={insertTable}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-white hover:bg-stone-200 border border-stone-300 shadow-sm"
              title="Insert 3x3 Table"
            >
              <TableIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Insert Table</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs text-emerald-800">
              <span className="font-semibold">Table:</span>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="px-1.5 py-0.5 bg-white border border-emerald-300 rounded hover:bg-emerald-100 flex items-center gap-1"
                title="Add Row Below"
              >
                <Rows className="w-3 h-3" /> +Row
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteRow().run()}
                className="px-1.5 py-0.5 bg-white border border-emerald-300 rounded hover:bg-rose-50 text-rose-700"
                title="Delete Row"
              >
                -Row
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className="px-1.5 py-0.5 bg-white border border-emerald-300 rounded hover:bg-emerald-100 flex items-center gap-1"
                title="Add Column Right"
              >
                <Columns className="w-3 h-3" /> +Col
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteColumn().run()}
                className="px-1.5 py-0.5 bg-white border border-emerald-300 rounded hover:bg-rose-50 text-rose-700"
                title="Delete Column"
              >
                -Col
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="p-1 hover:bg-rose-100 text-rose-700 rounded"
                title="Delete Entire Table"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Editor Content Surface */}
      <div className="min-h-[500px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
