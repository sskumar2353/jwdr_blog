'use client';

import React, { useState } from 'react';
import { TOCItem } from '@/lib/storage';
import { Plus, Trash2, ArrowUp, ArrowDown, Sparkles, ListTree } from 'lucide-react';

interface Props {
  items: TOCItem[];
  onChange: (items: TOCItem[]) => void;
  onInsertIntoEditor?: (items: TOCItem[]) => void;
}

export default function TOCBuilder({ items, onChange, onInsertIntoEditor }: Props) {
  const [newTitle, setNewTitle] = useState('');
  const [newLevel, setNewLevel] = useState<number>(2);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const slugId = newTitle
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    const newItem: TOCItem = {
      id: `${slugId || 'section'}-${Date.now().toString().slice(-4)}`,
      title: newTitle.trim(),
      level: newLevel,
    };

    onChange([...items, newItem]);
    setNewTitle('');
  };

  const handleRemove = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    onChange(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === items.length - 1)
    ) {
      return;
    }
    const updated = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  const handleUpdateItem = (index: number, title: string, level: number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], title, level };
    onChange(updated);
  };

  const getIndentClass = (level: number) => {
    switch (level) {
      case 1: return 'ml-0 bg-white border-stone-300 font-bold';
      case 2: return 'ml-2 bg-white border-stone-200 font-semibold';
      case 3: return 'ml-6 bg-stone-50/90 border-stone-200 text-xs';
      case 4: return 'ml-8 bg-stone-50/70 border-stone-200 text-xs';
      case 5: return 'ml-10 bg-stone-50/50 border-stone-200 text-xs';
      case 6: return 'ml-12 bg-stone-50/30 border-stone-200 text-xs text-stone-500';
      default: return 'ml-2 bg-white border-stone-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-stone-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ListTree className="w-5 h-5 text-blue-600" />
            <span>Table of Contents Outline</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Plan your outline from H1 to H6. Then click &ldquo;Insert Sections Into Editor&rdquo; to populate your writing space.
          </p>
        </div>

        {onInsertIntoEditor && items.length > 0 && (
          <button
            type="button"
            onClick={() => onInsertIntoEditor(items)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Insert Sections Into Editor</span>
          </button>
        )}
      </div>

      {/* Existing TOC Items */}
      {items.length === 0 ? (
        <div className="py-6 text-center text-sm text-stone-400 bg-stone-50/50 rounded-lg border border-dashed border-stone-200 mb-4">
          No sections added yet. Add your first Table of Contents section below!
        </div>
      ) : (
        <div className="space-y-2 mb-5">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${getIndentClass(item.level)}`}
            >
              {/* Title Input */}
              <input
                type="text"
                value={item.title}
                onChange={(e) => handleUpdateItem(idx, e.target.value, item.level)}
                placeholder="Section title"
                className="flex-1 text-sm bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-slate-800"
              />

              {/* Level selector: H1 to H6 */}
              <select
                value={item.level}
                onChange={(e) => handleUpdateItem(idx, item.title, Number(e.target.value))}
                className="text-xs border border-stone-200 rounded px-2 py-1 bg-stone-50 text-stone-700 focus:outline-none"
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
                <option value={4}>H4</option>
                <option value={5}>H5</option>
                <option value={6}>H6</option>
              </select>

              {/* Order Controls */}
              <button
                type="button"
                onClick={() => handleMove(idx, 'up')}
                disabled={idx === 0}
                className="p-1 text-stone-400 hover:text-slate-800 disabled:opacity-30"
                title="Move Up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleMove(idx, 'down')}
                disabled={idx === items.length - 1}
                className="p-1 text-stone-400 hover:text-slate-800 disabled:opacity-30"
                title="Move Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>

              {/* Remove */}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                title="Remove Section"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New TOC Item Form */}
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-stone-100">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="e.g. Chapter 1: Introduction / Findings"
          className="flex-1 text-sm border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-2">
          <select
            value={newLevel}
            onChange={(e) => setNewLevel(Number(e.target.value))}
            className="text-sm border border-stone-300 rounded-lg px-3 py-2 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>Heading 1 (H1)</option>
            <option value={2}>Heading 2 (H2)</option>
            <option value={3}>Heading 3 (H3)</option>
            <option value={4}>Heading 4 (H4)</option>
            <option value={5}>Heading 5 (H5)</option>
            <option value={6}>Heading 6 (H6)</option>
          </select>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Section</span>
          </button>
        </div>
      </form>
    </div>
  );
}
