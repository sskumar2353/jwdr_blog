import { NextResponse } from 'next/server';
import { getAllPosts, savePost } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeUnpublished = searchParams.get('all') === 'true' && isAuthenticated();
  const posts = getAllPosts(includeUnpublished);
  return NextResponse.json({ success: true, posts });
}

export async function POST(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Please login.' }, { status: 401 });
  }

  try {
    const data = await request.json();
    if (!data.title || !data.title.trim()) {
      return NextResponse.json({ success: false, error: 'Post title is required.' }, { status: 400 });
    }

    const saved = savePost(data);
    return NextResponse.json({ success: true, post: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to save post' }, { status: 500 });
  }
}
