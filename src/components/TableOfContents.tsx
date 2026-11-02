'use client';

import React, { useEffect, useState } from 'react';
import { TOCItem } from '@/lib/storage';
import { ListFilter } from 'lucide-react';

interface Props {
  items: TOCItem[];
}

export default function TableOfContents({ items }: Props) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (!items || items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0% -60% 0%',
        threshold: 0.1,
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Table of contents" className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto p-4 rounded-xl bg-stone-100/70 border border-stone-200/80 shadow-sm">
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-stone-200 text-xs font-bold uppercase tracking-wider text-stone-500">
        <ListFilter className="w-3.5 h-3.5 text-blue-600" />
        <span>Table of Contents</span>
      </div>
      <ul className="space-y-1.5 text-sm">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li
              key={item.id}
              className={`transition-all ${item.level === 2 ? 'pl-4 text-xs' : 'font-medium'}`}
            >
              <a
                href={`#${item.id}`}
                className={`block py-1 px-2 rounded transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50/80 font-semibold'
                    : 'text-stone-600 hover:text-slate-900 hover:bg-stone-200/40'
                }`}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
