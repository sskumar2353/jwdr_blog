import fs from 'fs';
import path from 'path';

export interface TOCItem {
  id: string;
  title: string;
  level: number; // 1 for H1/main, 2 for H2/sub
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
  adminPassword: string; // Stored securely
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

// Default initial settings
const DEFAULT_SETTINGS: SiteSettings = {
  siteTitle: 'JWDR Blog',
  tagline: 'Essays, Writings & Reflections',
  authorName: 'Joseph Anna',
  authorBio: 'Writer, thinker, and blogger. Sharing thoughts, essays, and stories on life, craft, and observations.',
  authorEmail: 'contact@jwdr.blog',
  adminPassword: 'admin', // Can be changed in Admin -> Settings
};

// Default sample welcome post
const DEFAULT_POSTS: BlogPost[] = [
  {
    id: 'welcome-post',
    title: 'Welcome to My New Blog',
    slug: 'welcome-to-my-new-blog',
    excerpt: 'An introduction to my new writing sanctuary, organized with a clean table of contents and focused on distraction-free reading.',
    tableOfContents: [
      { id: 'why-this-platform', title: 'Why I Built This Platform', level: 1 },
      { id: 'table-of-contents-workflow', title: 'The Table of Contents Workflow', level: 1 },
      { id: 'word-like-experience', title: 'A Word-Like Writing Experience', level: 2 },
      { id: 'what-to-expect', title: 'What to Expect Next', level: 1 }
    ],
    content: `
      <h2 id="why-this-platform">Why I Built This Platform</h2>
      <p>Welcome! As a writer, I wanted a digital space that feels just like sitting down with a clean, blank sheet in a word processor. No cluttered sidebars, no confusing technical jargon, and no endless plugin configurations.</p>
      
      <p>Here, every piece of writing is structured deliberately, starting with a clear Table of Contents and followed by formatted prose, images, and tables where needed.</p>

      <h2 id="table-of-contents-workflow">The Table of Contents Workflow</h2>
      <p>Before diving into a long essay or detailed article, good structure is essential. In this platform, every article is designed around a dedicated outline:</p>
      
      <ul>
        <li><strong>Outline First:</strong> The Table of Contents is explicitly planned and crafted.</li>
        <li><strong>Seamless Navigation:</strong> Readers can jump to any section instantly by clicking on the TOC sidebar.</li>
        <li><strong>Distraction-Free:</strong> Clean typography inspired by modern editorial publications.</li>
      </ul>

      <h3 id="word-like-experience">A Word-Like Writing Experience</h3>
      <p>While the reader sees a polished, static-like website, the writing interface gives me complete freedom:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0;">
        <thead>
          <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
            <th style="padding: 10px; text-align: left;">Feature</th>
            <th style="padding: 10px; text-align: left;">Writer Capability</th>
            <th style="padding: 10px; text-align: left;">Reader Experience</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px; font-weight: 600;">Table of Contents</td>
            <td style="padding: 10px;">Custom-defined outline</td>
            <td style="padding: 10px;">Sticky sidebar navigation</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px; font-weight: 600;">Media & Tables</td>
            <td style="padding: 10px;">Drag-and-drop images, easy tables</td>
            <td style="padding: 10px;">Responsive, formatted display</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: 600;">Permissions</td>
            <td style="padding: 10px;">Password-protected editing</td>
            <td style="padding: 10px;">Strict read-only view</td>
          </tr>
        </tbody>
      </table>

      <h2 id="what-to-expect">What to Expect Next</h2>
      <p>I will be publishing essays, detailed reflections, and new writings here regularly. If you have thoughts, feedback, or would like to connect, please feel free to use the <em>Contact</em> link at the top or bottom of the page.</p>
      <p>Thank you for reading!</p>
    `,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    readingTime: '3 min read',
    tags: ['Introduction', 'Writing', 'Reflections']
  }
];

export function getSettings(): SiteSettings {
  ensureDataDir();
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
    return DEFAULT_SETTINGS;
  }
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<SiteSettings>): SiteSettings {
  ensureDataDir();
  const current = getSettings();
  const updated = { ...current, ...settings };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

export function getAllPosts(includeUnpublished = false): BlogPost[] {
  ensureDataDir();
  if (!fs.existsSync(POSTS_FILE)) {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(DEFAULT_POSTS, null, 2), 'utf-8');
    return DEFAULT_POSTS;
  }
  try {
    const raw = fs.readFileSync(POSTS_FILE, 'utf-8');
    const posts: BlogPost[] = JSON.parse(raw);
    if (includeUnpublished) return posts;
    return posts.filter(p => p.published);
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
      fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
      return updated;
    }
  }

  // Create new
  const newId = 'post_' + Date.now();
  // Ensure unique slug
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
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
  return newPost;
}

export function deletePost(id: string): boolean {
  ensureDataDir();
  const posts = getAllPosts(true);
  const filtered = posts.filter(p => p.id !== id);
  if (filtered.length !== posts.length) {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
  }
  return false;
}

export function getAllMessages(): ContactMessage[] {
  ensureDataDir();
  if (!fs.existsSync(MESSAGES_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(MESSAGES_FILE, 'utf-8');
    return JSON.parse(raw);
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
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
  return newMsg;
}

export function markMessageRead(id: string): boolean {
  ensureDataDir();
  const messages = getAllMessages();
  const target = messages.find(m => m.id === id);
  if (target) {
    target.read = true;
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
    return true;
  }
  return false;
}
