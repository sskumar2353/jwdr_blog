import fs from 'fs';
import path from 'path';
import bundledPostsData from '../../data/posts.json';
import bundledSettingsData from '../../data/settings.json';

export interface TOCItem {
  id: string;
  title: string;
  level: number; // 1 to 6 (H1 to H6)
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  tableOfContents: TOCItem[];
  content: string; // Rich HTML content
  published: boolean;
  createdAt: string;
  updatedAt: string;
  readingTime: string;
  tags?: string[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface SiteSettings {
  siteTitle: string;
  tagline: string;
  authorName: string;
  authorBio: string;
  authorEmail: string;
  adminPassword: string;
  // Email / SMTP dispatch configuration
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpSecure?: boolean;
}

function getDataDir(): string {
  const cwdData = path.join(process.cwd(), 'data');
  if (fs.existsSync(cwdData)) return cwdData;
  const projectData = path.resolve(__dirname, '../../data');
  if (fs.existsSync(projectData)) return projectData;
  const hardcoded = 'D:\\Joseph Anna\\data';
  if (fs.existsSync(hardcoded)) return hardcoded;
  return cwdData;
}

const DATA_DIR = getDataDir();
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {}
}

// In-memory cache for ultra-fast response
let _postsCache: BlogPost[] | null = null;
let _settingsCache: SiteSettings | null = null;
let _messagesCache: ContactMessage[] | null = null;

const DEFAULT_SETTINGS: SiteSettings = {
  siteTitle: "JWDR's Blog",
  tagline: 'Joy in the Journey',
  authorName: 'Joseph ',
  authorBio: 'Writer, thinker, and blogger. Sharing thoughts, and stories on life, craft, and observations.',
  authorEmail: 'contact@jwdr.blog',
  adminPassword: 'admin',
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  smtpSecure: false,
};

export function getSettings(): SiteSettings {
  if (_settingsCache) return _settingsCache;
  try {
    ensureDataDir();
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed: SiteSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      _settingsCache = parsed;
      return parsed;
    }
  } catch {}

  // Fallback to bundled data for cloud serverless environments
  const fallback: SiteSettings = {
    ...DEFAULT_SETTINGS,
    ...(bundledSettingsData as unknown as SiteSettings),
  };
  _settingsCache = fallback;
  return fallback;
}

export function saveSettings(settings: Partial<SiteSettings>): SiteSettings {
  const current = getSettings();
  const updated: SiteSettings = { ...current, ...settings };
  _settingsCache = updated;
  try {
    ensureDataDir();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Filesystem write notice (settings):', err);
  }
  return updated;
}

export function getAllPosts(includeUnpublished = false): BlogPost[] {
  if (_postsCache) {
    if (includeUnpublished) return _postsCache;
    return _postsCache.filter(p => p.published);
  }

  try {
    ensureDataDir();
    if (fs.existsSync(POSTS_FILE)) {
      const raw = fs.readFileSync(POSTS_FILE, 'utf-8');
      const parsed: BlogPost[] = JSON.parse(raw);
      _postsCache = parsed;
      if (includeUnpublished) return parsed;
      return parsed.filter(p => p.published);
    }
  } catch {}

  // Bundled fallback ensures posts load seamlessly on Vercel
  const fallback = bundledPostsData as unknown as BlogPost[];
  _postsCache = fallback;
  if (includeUnpublished) return fallback;
  return fallback.filter(p => p.published);
}

export function getPostBySlug(slug: string, includeUnpublished = false): BlogPost | null {
  if (!slug) return null;
  const posts = getAllPosts(includeUnpublished);
  const clean = slug.toLowerCase().replace(/^\/+|\/+$/g, '').trim();
  return posts.find(p => p.slug.toLowerCase() === clean || p.id === clean) || null;
}

export function getPostById(id: string): BlogPost | null {
  const posts = getAllPosts(true);
  return posts.find(p => p.id === id) || null;
}

export function savePost(post: Partial<BlogPost> & { title: string }): BlogPost {
  const posts = getAllPosts(true);
  const now = new Date().toISOString();

  // Helper to generate slug
  const slugBase = post.slug || post.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  // Estimate reading time
  const wordCount = (post.content || '').replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  const readingTime = `${minutes} min read`;

  if (post.id) {
    // Update existing
    const index = posts.findIndex(p => p.id === post.id);
    if (index !== -1) {
      const existing = posts[index];
      const updated: BlogPost = {
        ...existing,
        ...post,
        slug: slugBase,
        readingTime,
        updatedAt: now,
      };
      posts[index] = updated;
      _postsCache = posts;
      try {
        ensureDataDir();
        fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
      } catch (err) {
        console.warn('Filesystem write notice (post update):', err);
      }
      return updated;
    }
  }

  // Create new
  const newId = 'post_' + Date.now();
  let uniqueSlug = slugBase;
  let counter = 1;
  while (posts.some(p => p.slug === uniqueSlug && p.id !== newId)) {
    uniqueSlug = `${slugBase}-${counter++}`;
  }

  const newPost: BlogPost = {
    id: newId,
    title: post.title,
    slug: uniqueSlug,
    excerpt: post.excerpt || (post.content || '').replace(/<[^>]*>/g, '').slice(0, 160) + '...',
    coverImage: post.coverImage || '',
    tableOfContents: post.tableOfContents || [],
    content: post.content || '',
    published: post.published ?? true,
    createdAt: now,
    updatedAt: now,
    readingTime,
    tags: post.tags || []
  };

  posts.unshift(newPost);
  _postsCache = posts;
  try {
    ensureDataDir();
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Filesystem write notice (new post):', err);
  }
  return newPost;
}

export function deletePost(id: string): boolean {
  const posts = getAllPosts(true);
  const filtered = posts.filter(p => p.id !== id);
  if (filtered.length !== posts.length) {
    _postsCache = filtered;
    try {
      ensureDataDir();
      fs.writeFileSync(POSTS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Filesystem write notice (delete post):', err);
    }
    return true;
  }
  return false;
}

export function getAllMessages(): ContactMessage[] {
  if (_messagesCache) return _messagesCache;
  try {
    ensureDataDir();
    if (fs.existsSync(MESSAGES_FILE)) {
      const raw = fs.readFileSync(MESSAGES_FILE, 'utf-8');
      const parsed: ContactMessage[] = JSON.parse(raw);
      _messagesCache = parsed;
      return parsed;
    }
  } catch {}
  return [];
}

export function saveContactMessage(msg: { name: string; email: string; subject: string; message: string }): ContactMessage {
  const messages = getAllMessages();
  const newMsg: ContactMessage = {
    id: 'msg_' + Date.now(),
    name: msg.name,
    email: msg.email,
    subject: msg.subject || 'New Contact Inquiry',
    message: msg.message,
    createdAt: new Date().toISOString(),
    read: false,
  };
  messages.unshift(newMsg);
  _messagesCache = messages;
  try {
    ensureDataDir();
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Filesystem write notice (contact message):', err);
  }
  return newMsg;
}

export function markMessageRead(id: string): boolean {
  const messages = getAllMessages();
  const target = messages.find(m => m.id === id);
  if (target) {
    target.read = true;
    _messagesCache = messages;
    try {
      ensureDataDir();
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Filesystem write notice (mark read):', err);
    }
    return true;
  }
  return false;
}
