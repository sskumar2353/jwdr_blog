import { NextResponse } from 'next/server';
import { getPostById, savePost, deletePost } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const post = getPostById(params.id);
  if (!post) {
    return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, post });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const existing = getPostById(params.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    const updated = savePost({ ...data, id: params.id });
    return NextResponse.json({ success: true, post: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const success = deletePost(params.id);
  if (success) {
    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } else {
    return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
  }
}
