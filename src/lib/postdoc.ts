/**
 * Turns editor fields into the exact Markdown file that goes in
 * src/content/blog/. Shared so the editor and any other tooling produce
 * byte-identical output.
 */

export interface PostDraft {
  slug: string;
  title: string;
  description: string;
  highlight: string;
  category: string;
  tags: string;
  publishedAt: string;
  updatedAt: string;
  draft: boolean;
  featured: boolean;
  cover: string;
  coverAlt: string;
  body: string;
}

export const emptyDraft = (): PostDraft => ({
  slug: '',
  title: '',
  description: '',
  highlight: '',
  category: 'dotnet',
  tags: '',
  publishedAt: new Date().toISOString().slice(0, 10),
  updatedAt: '',
  draft: true,
  featured: false,
  cover: '',
  coverAlt: '',
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
    tags.length ? `tags: [${tags.map(yq).join(', ')}]` : null,
    post.cover ? `cover: ${yq(post.cover)}` : null,
    post.cover && post.coverAlt ? `coverAlt: ${yq(post.coverAlt)}` : null,
    post.featured ? 'featured: true' : null,
    `draft: ${post.draft}`,
    '---',
    '',
    post.body.trim(),
    '',
  ];

  return front.filter((l) => l !== null).join('\n');
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
  if (post.body.trim().length < 20) add('body', 'Body is too short.');

  return issues;
}

export function readingStats(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return { words, minutes: Math.max(1, Math.ceil(words / 200)) };
}
