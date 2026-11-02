import fs from 'fs';
import path from 'path';

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
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// In-memory cache for ultra-fast response
let _postsCache: BlogPost[] | null = null;
let _settingsCache: SiteSettings | null = null;
let _messagesCache: ContactMessage[] | null = null;

const DEFAULT_SETTINGS: SiteSettings = {
  siteTitle: 'JWDR Blog',
  tagline: 'Essays, Writings & Reflections',
  authorName: 'Joseph Anna',
  authorBio: 'Writer, thinker, and blogger. Sharing thoughts, essays, and stories on life, craft, and observations.',
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
  ensureDataDir();
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
    _settingsCache = DEFAULT_SETTINGS;
    return DEFAULT_SETTINGS;
  }
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    const parsed: SiteSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    _settingsCache = parsed;
    return parsed;
  } catch {
    _settingsCache = DEFAULT_SETTINGS;
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<SiteSettings>): SiteSettings {
  ensureDataDir();
  const current = getSettings();
  const updated: SiteSettings = { ...current, ...settings };
  _settingsCache = updated;
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

export function getAllPosts(includeUnpublished = false): BlogPost[] {
  if (_postsCache) {
    if (includeUnpublished) return _postsCache;
    return _postsCache.filter(p => p.published);
  }

  ensureDataDir();
  if (!fs.existsSync(POSTS_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(POSTS_FILE, 'utf-8');
    const parsed: BlogPost[] = JSON.parse(raw);
    _postsCache = parsed;
    if (includeUnpublished) return parsed;
    return parsed.filter(p => p.published);
  } catch {
    return [];
  }
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
  ensureDataDir();
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
      fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
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
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
  return newPost;
}

export function deletePost(id: string): boolean {
  ensureDataDir();
  const posts = getAllPosts(true);
  const filtered = posts.filter(p => p.id !== id);
  if (filtered.length !== posts.length) {
    _postsCache = filtered;
    fs.writeFileSync(POSTS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
  }
  return false;
}

export function getAllMessages(): ContactMessage[] {
  if (_messagesCache) return _messagesCache;
  ensureDataDir();
  if (!fs.existsSync(MESSAGES_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(MESSAGES_FILE, 'utf-8');
    const parsed: ContactMessage[] = JSON.parse(raw);
    _messagesCache = parsed;
    return parsed;
  } catch {
    return [];
  }
}

export function saveContactMessage(msg: { name: string; email: string; subject: string; message: string }): ContactMessage {
  ensureDataDir();
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
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
  return newMsg;
}

export function markMessageRead(id: string): boolean {
  ensureDataDir();
  const messages = getAllMessages();
  const target = messages.find(m => m.id === id);
  if (target) {
    target.read = true;
    _messagesCache = messages;
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
    return true;
  }
  return false;
}
