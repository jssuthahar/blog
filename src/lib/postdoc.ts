/**
 * Turns editor fields into the exact Markdown file that goes in
 * src/content/blog/. Shared so the editor and any other tooling produce
 * byte-identical output.
 */

export interface FaqPair {
  q: string;
  a: string;
}

export interface PostDraft {
  slug: string;
  title: string;
  description: string;
  highlight: string;
  category: string;
  /** Additional categories, comma-separated slugs. */
  categories: string;
  tags: string;
  publishedAt: string;
  updatedAt: string;
  draft: boolean;
  featured: boolean;
  cover: string;
  coverAlt: string;
  /** Multi-part guides: a shared series slug and this post's position in it. */
  series: string;
  seriesOrder: string;
  /** Powers the FAQ section, FAQPage schema, and the article chat. */
  faq: FaqPair[];
  body: string;
}

export const emptyDraft = (): PostDraft => ({
  slug: '',
  title: '',
  description: '',
  highlight: '',
  category: 'programming',
  categories: '',
  tags: '',
  publishedAt: new Date().toISOString().slice(0, 10),
  updatedAt: '',
  draft: true,
  featured: false,
  cover: '',
  coverAlt: '',
  series: '',
  seriesOrder: '',
  faq: [],
  body: '',
});

export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** YAML single-quote escaping: double any embedded single quote. */
const yq = (s: string) => `'${s.replace(/'/g, "''")}'`;

export function toMarkdown(post: PostDraft): string {
  const tags = post.tags.split(',').map((t) => t.trim()).filter(Boolean);

  const front = [
    '---',
    `title: ${yq(post.title)}`,
    `description: ${yq(post.description)}`,
    post.highlight ? `highlight: ${yq(post.highlight)}` : null,
    `publishedAt: ${post.publishedAt}`,
    post.updatedAt ? `updatedAt: ${post.updatedAt}` : null,
    `category: ${post.category}`,
    // Additional categories, excluding the primary to avoid duplication.
    (() => {
      const extra = post.categories.split(',').map((c) => c.trim()).filter((c) => c && c !== post.category);
      return extra.length ? `categories: [${extra.join(', ')}]` : null;
    })(),
    tags.length ? `tags: [${tags.map(yq).join(', ')}]` : null,
    post.cover ? `cover: ${yq(post.cover)}` : null,
    post.cover && post.coverAlt ? `coverAlt: ${yq(post.coverAlt)}` : null,
    post.series ? `series: ${yq(post.series)}` : null,
    post.series && post.seriesOrder ? `seriesOrder: ${post.seriesOrder}` : null,
    post.featured ? 'featured: true' : null,
    `draft: ${post.draft}`,
  ];

  // FAQ is a nested YAML list, emitted only when there are complete pairs.
  const faq = post.faq.filter((f) => f.q.trim() && f.a.trim());
  if (faq.length) {
    front.push('faq:');
    for (const { q, a } of faq) {
      front.push(`  - q: ${yq(q.trim())}`);
      front.push(`    a: ${yq(a.trim())}`);
    }
  }

  front.push('---', '', post.body.trim(), '');
  return front.filter((l) => l !== null).join('\n');
}

/** Unquote a YAML scalar: strips matching single/double quotes and unescapes. */
function unquote(raw: string): string {
  const s = raw.trim();
  if (s.startsWith("'") && s.endsWith("'") && s.length >= 2) {
    return s.slice(1, -1).replace(/''/g, "'");
  }
  if (s.startsWith('"') && s.endsWith('"') && s.length >= 2) {
    return s.slice(1, -1).replace(/\\"/g, '"');
  }
  return s;
}

/** Split a YAML flow sequence `[a, 'b, c', d]` into unquoted items. */
function parseList(raw: string): string[] {
  const inner = raw.trim().replace(/^\[/, '').replace(/\]$/, '');
  if (!inner.trim()) return [];
  // Split on commas that sit outside single/double quotes.
  const items: string[] = [];
  let cur = '';
  let quote = '';
  for (const ch of inner) {
    if (quote) {
      cur += ch;
      if (ch === quote) quote = '';
    } else if (ch === "'" || ch === '"') {
      quote = ch;
      cur += ch;
    } else if (ch === ',') {
      items.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) items.push(cur);
  return items.map(unquote).filter(Boolean);
}

/**
 * Parses a Markdown/MDX post file back into a PostDraft — the inverse of
 * toMarkdown, so a downloaded file can be re-imported and edited. Tolerant of
 * hand-written frontmatter (single/double quoted or bare values) and strips the
 * MDX import lines that download adds.
 */
export function fromMarkdown(text: string): PostDraft {
  const draft = emptyDraft();
  const src = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

  const match = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    // No frontmatter — treat the whole file as the body.
    draft.body = src.trim();
    return draft;
  }

  const [, front, rawBody] = match;
  const lines = front.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const kv = line.match(/^([A-Za-z][\w]*):\s?(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    const value = kv[2];

    switch (key) {
      case 'title': draft.title = unquote(value); break;
      case 'description': draft.description = unquote(value); break;
      case 'highlight': draft.highlight = unquote(value); break;
      case 'publishedAt': draft.publishedAt = unquote(value); break;
      case 'updatedAt': draft.updatedAt = unquote(value); break;
      case 'category': draft.category = unquote(value); break;
      case 'categories': draft.categories = parseList(value).join(', '); break;
      case 'tags': draft.tags = parseList(value).join(', '); break;
      case 'cover': draft.cover = unquote(value); break;
      case 'coverAlt': draft.coverAlt = unquote(value); break;
      case 'series': draft.series = unquote(value); break;
      case 'seriesOrder': draft.seriesOrder = unquote(value); break;
      case 'featured': draft.featured = unquote(value) === 'true'; break;
      case 'draft': draft.draft = unquote(value) === 'true'; break;
      case 'faq': {
        // Nested list: `  - q: ...` / `    a: ...` pairs on the following lines.
        for (let j = i + 1; j < lines.length; j++) {
          const q = lines[j].match(/^\s*-\s*q:\s?(.*)$/);
          if (!q) break;
          const aLine = lines[j + 1]?.match(/^\s*a:\s?(.*)$/);
          draft.faq.push({ q: unquote(q[1]), a: aLine ? unquote(aLine[1]) : '' });
          j += aLine ? 1 : 0;
          i = j;
        }
        break;
      }
    }
  }

  // Drop the MDX component imports that download prepends; keep authored body.
  draft.body = rawBody
    .replace(/^import\s+\w+\s+from\s+['"][^'"]+['"];\s*\n?/gm, '')
    .trim();

  return draft;
}

export interface Issue {
  field: string;
  message: string;
}

/** Mirrors the content-collection schema so the build won't reject the file. */
export function validate(post: PostDraft): Issue[] {
  const issues: Issue[] = [];
  const add = (field: string, message: string) => issues.push({ field, message });

  if (!post.title.trim()) add('title', 'Title is required.');
  if (post.title.length > 120) add('title', 'Title must be 120 characters or fewer.');

  if (!post.slug.trim()) add('slug', 'Slug is required.');
  else if (!/^[a-z0-9-]+$/.test(post.slug)) add('slug', 'Slug: lowercase letters, numbers, hyphens only.');

  const d = post.description.trim().length;
  if (d < 50) add('description', `Description is ${d}/50 minimum characters.`);
  if (d > 200) add('description', 'Description must be 200 characters or fewer.');

  if (post.highlight.length > 400) add('highlight', 'Highlight must be 400 characters or fewer.');

  if (!post.publishedAt) add('publishedAt', 'Published date is required.');
  if (post.cover && !post.coverAlt.trim()) add('coverAlt', 'Cover alt text is required when a cover is set.');

  // The schema requires seriesOrder whenever series is set, and vice versa.
  if (post.series && !post.seriesOrder) add('seriesOrder', 'Series order is required when a series is set.');
  if (post.seriesOrder && !post.series) add('series', 'Series name is required when an order is set.');

  if (post.faq.some((f) => (f.q.trim() && !f.a.trim()) || (!f.q.trim() && f.a.trim())))
    add('faq', 'Each FAQ needs both a question and an answer.');

  if (post.body.trim().length < 20) add('body', 'Body is too short.');

  return issues;
}

export function readingStats(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return { words, minutes: Math.max(1, Math.ceil(words / 200)) };
}
