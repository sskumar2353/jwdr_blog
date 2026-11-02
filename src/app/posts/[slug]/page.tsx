import React from 'react';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug, getSettings } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';
import ArticleReaderView from '@/components/ArticleReaderView';

export const dynamicParams = true;
export const revalidate = 0;

export async function generateStaticParams() {
  const posts = getAllPosts(true);
  return posts.map((p) => ({
    slug: p.slug,
  }));
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const isAuthor = isAuthenticated();
  const decodedSlug = decodeURIComponent(params.slug);
  const post = getPostBySlug(decodedSlug, isAuthor) || getPostBySlug(params.slug, isAuthor);
  const settings = getSettings();

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ArticleReaderView
      post={post}
      settings={settings}
      formattedDate={formattedDate}
    />
  );
}
