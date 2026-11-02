# JWDR Blog — Custom Publishing Platform

A minimalist, distraction-free blog platform tailored specifically for thoughtful essayists and writers.

## Key Features

1. **Table of Contents First:** Plan and structure your outline with headings before writing. Readers get a sticky, interactive Table of Contents sidebar that glides to each section as they scroll.
2. **Word-like Writing Experience:** Full visual rich-text editor with support for:
   - Headings (H1, H2, H3)
   - Formatting: Bold, Italic, Underline, Strikethrough, Highlight
   - Alignment: Left, Center, Right, Justify
   - **Tables:** Insert tables, add/remove rows and columns
   - **Images:** Drag & drop or upload directly from your computer
   - Bullet lists, Numbered lists, Blockquotes, Dividers
3. **Strict Reader vs. Author Separation:**
   - **Public Readers:** Clean, fast, read-only interface. No editing tools, no upload buttons, zero technical clutter.
   - **Author Portal:** Secure password-protected dashboard (`/admin`) for creating, updating, and deleting posts.
4. **Master Index of Writings:** Beautiful, typography-focused homepage cataloging all published essays with reading time, publication date, and section summaries.
5. **Contact Functionality:** Built-in contact form where readers can send inquiries directly to your email, with a backup inbox in your Admin Dashboard.
6. **Zero Database Maintenance:** Powered by a clean, reliable local JSON database. Easily back up all your writings simply by copying the `data` folder.

---

## Getting Started Locally

In your terminal or command prompt inside `d:\Joseph Anna`:

```bash
npm run dev
```

Open your browser to:
* **Public Blog:** [http://localhost:3000](http://localhost:3000)
* **Author Portal:** [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Author Login

* **Login URL:** `/admin/login` (or click the lock icon in the footer)
* **Default Password:** `admin`
* *You can change this password anytime in **Admin &rarr; Settings**.*

---

## Writing Workflow

1. Click **+ New Post** in the top author bar or dashboard.
2. Enter your **Post Title** and brief excerpt.
3. In **Step 1 (Table of Contents)**: Add your sections (e.g., *1. Introduction*, *2. Key Analysis*, *3. Conclusion*).
4. Click **"Insert Sections into Editor"** &mdash; this automatically places matching headings into the Word writing area!
5. In **Step 2 (Word Document Mode)**: Write your matter, insert tables, drag and drop images, and style your text.
6. Click **Publish Post** &mdash; your new writing is immediately live in the Master Index with a clickable Table of Contents!

---

## Connecting to Your Domain (`jwdr.blog`)

When you are ready to point `jwdr.blog` to this new platform:
1. Deploy this folder for free to **Vercel** or **Render** (takes 2 minutes via GitHub).
2. In your domain registrar (where you bought `jwdr.blog`), update your DNS records (A Record or CNAME) to point to your new deployment.
3. Your new custom blog is live on `https://jwdr.blog` with zero ongoing platform fees!
