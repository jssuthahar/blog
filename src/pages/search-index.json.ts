import type { APIRoute } from 'astro';
import { getPublishedPosts, postUrl, CATEGORIES } from '../lib/posts';
import { allArticles, primaryCategory } from '../lib/articles';

/**
 * One combined search index for the whole site — blog posts, the 236 main-site
 * articles, and the key pages. Served as a single JSON file that the command
 * palette and the site chat both fetch once, on first use, rather than baking a
 * 240-item index into every page's HTML.
 */
export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();

  const items = [
    ...posts.map((p) => ({
      title: p.data.title,
      url: postUrl(p),
      kind: 'Post',
      category: CATEGORIES[p.data.category].label,
      text: `${p.data.title} ${p.data.description} ${p.data.tags.join(' ')}`.toLowerCase(),
      external: false,
    })),

    ...allArticles().map((a) => ({
      title: a.title,
      url: a.url,
      kind: 'Article',
      category: primaryCategory(a),
      text: `${a.title} ${a.excerpt} ${a.categories.join(' ')}`.toLowerCase(),
      external: true,
    })),

    ...[
      { title: 'About Suthahar', url: '/about', text: 'about bio profile credentials certifications' },
      { title: 'Speaking', url: '/speaking', text: 'speaking talks sessions conference book' },
      { title: 'Open source', url: '/open-source', text: 'open source github repositories code' },
      { title: 'Articles', url: '/articles', text: 'all articles archive library' },
      { title: 'Topics & technologies', url: '/topics', text: 'topics technologies dotnet azure ai mobile architecture devops career tags' },
      { title: 'Testimonials', url: '/testimonials', text: 'testimonials reviews feedback readers' },
      { title: 'Contribution record', url: '/contributions', text: 'contributions record talks community' },
      { title: 'Contact', url: '/contact', text: 'contact get in touch enquiry' },
    ].map((p) => ({ ...p, kind: 'Page', category: '', external: false, text: `${p.title} ${p.text}`.toLowerCase() })),
  ];

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json' },
  });
};
