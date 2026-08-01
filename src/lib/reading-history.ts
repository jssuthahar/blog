/**
 * Reading history — a per-browser record of which articles a visitor has
 * opened, how far they read, and what they bookmarked.
 *
 * The whole feature is client-side and stored in localStorage. It follows the
 * same "no reader login" model as view counts and reactions: there is no
 * account, so history is scoped to one browser. Everything here is safe to
 * import into an Astro `<script>` (bundled by Vite) — the functions that touch
 * `localStorage` or `document` are only ever called in the browser, and
 * `readStore()` guards against a missing `window` so it is inert during SSR.
 *
 * Data is versioned under one key so the shape can migrate later without
 * clashing with older saves.
 */

const KEY = 'msdev:reading:v1';
/** Below this fraction we treat a read as "not really started" — no resume. */
const RESUME_MIN = 0.04;
/** At or above this fraction the article counts as finished. */
const COMPLETE_AT = 0.95;

export interface HistoryEntry {
  slug: string;
  title: string;
  url: string;
  description: string;
  /** Optimised-source URL of the cover image, or '' when the post has none. */
  cover: string;
  coverAlt: string;
  /** Category slug and its display label + hue, cached so cards render offline. */
  category: string;
  categoryLabel: string;
  hue: number;
  /** Estimated reading time in minutes. */
  minutes: number;
  /** Furthest fraction of the article the reader reached, 0–1. */
  progress: number;
  /** Document scroll ratio to restore to when resuming, 0–1. */
  scroll: number;
  completed: boolean;
  firstViewedAt: number;
  lastViewedAt: number;
  viewCount: number;
  bookmarked: boolean;
  bookmarkedAt: number;
  /**
   * True for articles hosted off-site (msdevbuild.com). We can't run on those
   * pages, so a click is all we capture — no scroll progress or resume.
   */
  external: boolean;
}

/** The fields a page supplies when recording a visit or a bookmark. */
export type ArticleMeta = Pick<
  HistoryEntry,
  'slug' | 'title' | 'url' | 'description' | 'cover' | 'coverAlt' | 'category' | 'categoryLabel' | 'hue' | 'minutes'
>;

/** An event this browser registered for, captured on a successful sign-up. */
export interface EventEntry {
  slug: string;
  title: string;
  url: string;
  /** Preformatted date label, e.g. "18 Sep 2026", for offline display. */
  dateLabel: string;
  /** ISO start date, used to sort and to tell upcoming from past. */
  startsAt: string;
  location: string;
  registeredAt: number;
}

export type EventMeta = Omit<EventEntry, 'registeredAt'>;

interface Store {
  v: 1;
  entries: Record<string, HistoryEntry>;
  /** Events this browser registered for, keyed by event slug. */
  events: Record<string, EventEntry>;
  /** ISO YYYY-MM-DD strings for every day the reader opened something. */
  days: string[];
}

const emptyStore = (): Store => ({ v: 1, entries: {}, events: {}, days: [] });

function readStore(): Store {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Store;
    if (!parsed || parsed.v !== 1 || typeof parsed.entries !== 'object') return emptyStore();
    if (!Array.isArray(parsed.days)) parsed.days = [];
    // `events` was added after the first release, so older saves lack it.
    if (!parsed.events || typeof parsed.events !== 'object') parsed.events = {};
    return parsed;
  } catch {
    return emptyStore();
  }
}

function writeStore(store: Store): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
    // Let same-tab listeners (the homepage island, the history page) refresh.
    window.dispatchEvent(new CustomEvent('reading-history-change'));
  } catch {
    // Storage full or blocked (private mode) — the feature just goes quiet.
  }
}

const dayKey = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

/**
 * Record that the reader opened an article. Creates the entry on first visit,
 * otherwise bumps the view count and last-viewed time. Called on every article
 * load, so it must never lose progress the reader already has.
 */
export function recordVisit(meta: ArticleMeta): void {
  const store = readStore();
  const now = Date.now();
  const existing = store.entries[meta.slug];

  store.entries[meta.slug] = existing
    ? { ...existing, ...meta, lastViewedAt: now, viewCount: existing.viewCount + 1 }
    : {
        ...meta,
        progress: 0,
        scroll: 0,
        completed: false,
        firstViewedAt: now,
        lastViewedAt: now,
        viewCount: 1,
        bookmarked: false,
        bookmarkedAt: 0,
        external: false,
      };

  const today = dayKey(now);
  if (!store.days.includes(today)) store.days.push(today);

  writeStore(store);
}

/** A stable accent hue for an off-site category label with no taxonomy colour. */
function hueFromString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return hash % 360;
}

/** The fields a page supplies when a reader clicks through to an off-site article. */
export interface ExternalMeta {
  title: string;
  url: string;
  /** Free-text category label from the source feed, e.g. "Azure". */
  category: string;
  image?: string;
}

/**
 * Record a click through to an article on msdevbuild.com. We never run on that
 * page, so the click is treated as the read: the entry is marked external and
 * carries no progress. The URL is the identity key, so re-opening the same
 * article bumps its count instead of duplicating it.
 */
export function recordExternalVisit(meta: ExternalMeta): void {
  const store = readStore();
  const now = Date.now();
  const key = `ext:${meta.url}`;
  const label = meta.category || 'Article';
  const existing = store.entries[key];

  store.entries[key] = existing
    ? { ...existing, lastViewedAt: now, viewCount: existing.viewCount + 1 }
    : {
        slug: key,
        title: meta.title,
        url: meta.url,
        description: '',
        cover: meta.image ?? '',
        coverAlt: '',
        category: label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        categoryLabel: label,
        hue: hueFromString(label),
        minutes: 0,
        progress: 0,
        scroll: 0,
        completed: false,
        firstViewedAt: now,
        lastViewedAt: now,
        viewCount: 1,
        bookmarked: false,
        bookmarkedAt: 0,
        external: true,
      };

  const today = dayKey(now);
  if (!store.days.includes(today)) store.days.push(today);

  writeStore(store);
}

/**
 * Record that this browser registered for an event. Called after a successful
 * sign-up, so the reader can find their registered events in one place. Keyed
 * by slug, so a repeat registration refreshes the details instead of duplicating.
 */
export function recordEventRegistration(meta: EventMeta): void {
  const store = readStore();
  const existing = store.events[meta.slug];
  store.events[meta.slug] = {
    ...meta,
    registeredAt: existing?.registeredAt ?? Date.now(),
  };
  writeStore(store);
}

/** Events this browser registered for, soonest upcoming first. */
export function getRegisteredEvents(): EventEntry[] {
  return Object.values(readStore().events).sort(
    (a, b) => Date.parse(a.startsAt || '0') - Date.parse(b.startsAt || '0'),
  );
}

export function removeEventRegistration(slug: string): void {
  const store = readStore();
  delete store.events[slug];
  writeStore(store);
}

/** Update how far the reader has scrolled. Progress only ever moves forward. */
export function updateProgress(slug: string, progress: number, scroll: number): void {
  const store = readStore();
  const entry = store.entries[slug];
  if (!entry) return;

  const clamped = Math.min(Math.max(progress, 0), 1);
  entry.scroll = Math.min(Math.max(scroll, 0), 1);
  if (clamped > entry.progress) entry.progress = clamped;
  if (entry.progress >= COMPLETE_AT) entry.completed = true;

  store.entries[slug] = entry;
  writeStore(store);
}

/** All history, newest first. */
export function getHistory(): HistoryEntry[] {
  return Object.values(readStore().entries).sort((a, b) => b.lastViewedAt - a.lastViewedAt);
}

export function getEntry(slug: string): HistoryEntry | undefined {
  return readStore().entries[slug];
}

export function removeEntry(slug: string): void {
  const store = readStore();
  delete store.entries[slug];
  writeStore(store);
}

export function clearHistory(): void {
  writeStore(emptyStore());
}

/**
 * The single article to offer resuming — the most recently opened one that was
 * started but not finished. Returns null when there is nothing to continue.
 */
export function getResume(): HistoryEntry | null {
  return (
    getHistory().find((e) => !e.completed && e.progress >= RESUME_MIN) ?? null
  );
}

export function isBookmarked(slug: string): boolean {
  return Boolean(readStore().entries[slug]?.bookmarked);
}

/**
 * Toggle a bookmark. Bookmarking an article the reader has not opened yet is
 * still valid, so this upserts an entry from the supplied meta when needed.
 */
export function toggleBookmark(meta: ArticleMeta): boolean {
  const store = readStore();
  const now = Date.now();
  let entry = store.entries[meta.slug];

  if (!entry) {
    entry = {
      ...meta,
      progress: 0,
      scroll: 0,
      completed: false,
      firstViewedAt: now,
      lastViewedAt: now,
      viewCount: 0,
      bookmarked: false,
      bookmarkedAt: 0,
      external: false,
    };
  }

  entry.bookmarked = !entry.bookmarked;
  entry.bookmarkedAt = entry.bookmarked ? now : 0;
  store.entries[meta.slug] = entry;
  writeStore(store);
  return entry.bookmarked;
}

export function getBookmarks(): HistoryEntry[] {
  return Object.values(readStore().entries)
    .filter((e) => e.bookmarked)
    .sort((a, b) => b.bookmarkedAt - a.bookmarkedAt);
}

/** Most-opened articles first, ties broken by most recent. */
export function getMostRead(limit = 6): HistoryEntry[] {
  return Object.values(readStore().entries)
    .filter((e) => e.viewCount > 0)
    .sort((a, b) => b.viewCount - a.viewCount || b.lastViewedAt - a.lastViewedAt)
    .slice(0, limit);
}

/**
 * Current reading streak in days — consecutive calendar days with at least one
 * read, ending today or yesterday. Yesterday still counts so the streak does
 * not read as broken first thing in the morning.
 */
export function getStreak(): number {
  const days = [...new Set(readStore().days)].sort().reverse();
  if (days.length === 0) return 0;

  const oneDay = 86_400_000;
  const todayMs = Date.parse(dayKey(Date.now()));
  const latestMs = Date.parse(days[0]);
  const gap = Math.round((todayMs - latestMs) / oneDay);
  if (gap > 1) return 0; // last read was before yesterday — streak is over.

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = Math.round((Date.parse(days[i - 1]) - Date.parse(days[i])) / oneDay);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export interface ReadingStats {
  /** Distinct articles opened in the last 7 days. */
  thisWeek: number;
  /** Approximate minutes spent reading (reading time weighted by progress). */
  totalMinutes: number;
  streak: number;
  /** Top categories by number of articles, with their accent hue. */
  favourites: { slug: string; label: string; hue: number; count: number }[];
}

export function getStats(): ReadingStats {
  const entries = Object.values(readStore().entries);
  const weekAgo = Date.now() - 7 * 86_400_000;

  const totalMinutes = Math.round(
    entries.reduce((sum, e) => sum + e.minutes * (e.completed ? 1 : e.progress), 0),
  );

  const byCat = new Map<string, { slug: string; label: string; hue: number; count: number }>();
  for (const e of entries) {
    if (e.viewCount === 0) continue;
    const cur = byCat.get(e.category) ?? { slug: e.category, label: e.categoryLabel, hue: e.hue, count: 0 };
    cur.count++;
    byCat.set(e.category, cur);
  }

  return {
    thisWeek: entries.filter((e) => e.viewCount > 0 && e.lastViewedAt >= weekAgo).length,
    totalMinutes,
    streak: getStreak(),
    favourites: [...byCat.values()].sort((a, b) => b.count - a.count).slice(0, 4),
  };
}

// ── Rendering helpers ───────────────────────────────────────────────────────
// Shared so the homepage strip and the /history page draw identical cards.

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

/** A deterministic gradient, shown behind a thumbnail that is missing or fails. */
export function gradientFor(hue: number): string {
  return `linear-gradient(135deg, oklch(0.62 0.17 ${hue}), oklch(0.42 0.15 ${hue + 45}))`;
}

/**
 * The thumbnail for a history card: the post's own cover when it has one,
 * otherwise its share card — the same fallback CoverArt uses on the blog index,
 * so an article looks like itself wherever the reader meets it.
 *
 * Resolved at render time rather than stored, because entries saved before this
 * existed carry `cover: ''` and would otherwise stay gradients forever.
 *
 * Off-site articles keep whatever image their feed supplied; we have no card to
 * draw for a post that isn't ours, so those fall back to the gradient.
 */
export function thumbFor(entry: HistoryEntry): string {
  if (entry.cover) return entry.cover;
  return entry.external ? '' : `/og/w800/${entry.slug}.webp`;
}

/**
 * Drop a thumbnail that 404s — a slug renamed since the reader last visited —
 * so the gradient underneath shows instead of a broken-image glyph. Attached as
 * a listener rather than an inline onerror so the markup stays CSP-friendly.
 */
function hideOnError(root: HTMLElement): void {
  root.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', () => img.remove(), { once: true });
  });
}

/** "just now" / "3 hours ago" / "on 12 Mar" — compact and locale-friendly. */
export function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const min = Math.round(diff / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
  const days = Math.round(hr / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export interface CardOptions {
  /** Show a "remove from history" control. */
  removable?: boolean;
  /** Show a bookmark toggle on the card. */
  bookmarkToggle?: boolean;
  /** Called after the reader removes or unbookmarks, so hosts can re-render. */
  onChange?: () => void;
}

/**
 * Build one history card as a DOM node. Kept as imperative DOM (not an HTML
 * string) so the remove/bookmark controls can carry real event listeners.
 */
export function createCard(entry: HistoryEntry, opts: CardOptions = {}): HTMLElement {
  const pct = Math.round(entry.progress * 100);
  const meta: ArticleMeta = {
    slug: entry.slug,
    title: entry.title,
    url: entry.url,
    description: entry.description,
    cover: entry.cover,
    coverAlt: entry.coverAlt,
    category: entry.category,
    categoryLabel: entry.categoryLabel,
    hue: entry.hue,
    minutes: entry.minutes,
  };

  const card = document.createElement('article');
  card.className =
    'group relative flex flex-col overflow-hidden rounded-xl border border-default transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl';

  const src = thumbFor(entry);
  const thumb = src
    ? `<img src="${escapeHtml(src)}" alt="${entry.cover ? escapeHtml(entry.coverAlt) : ''}" loading="lazy" decoding="async" class="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />`
    : `<div class="flex size-full items-end p-3">
         <span class="text-sm font-semibold tracking-tight text-white/85">${escapeHtml(entry.categoryLabel)}</span>
       </div>`;

  // Off-site articles run on msdevbuild.com: open in a new tab, and show no
  // progress affordances since we can't measure reading there.
  const linkAttrs = entry.external ? ' target="_blank" rel="noopener"' : '';

  const badge = entry.external
    ? `<span class="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">Visited ↗</span>`
    : entry.completed
      ? `<span class="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">✓ Read</span>`
      : pct > 0
        ? `<span class="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">${pct}%</span>`
        : '';

  const minutesLabel = entry.minutes > 0 ? `<span class="text-muted">${entry.minutes} min</span>` : '';

  const progressBar = entry.external
    ? ''
    : `<div class="mt-2 h-1 overflow-hidden rounded-full" style="background: var(--border);">
         <div style="width:${pct}%; height:100%; background: var(--accent);"></div>
       </div>`;

  const continueBtn =
    !entry.external && !entry.completed && entry.progress >= RESUME_MIN
      ? `<a href="${escapeHtml(entry.url)}#resume" class="btn btn-accent btn-sm mt-3 self-start">Continue reading</a>`
      : '';

  card.innerHTML = `
    <div class="relative aspect-[1200/630] overflow-hidden" style="background:${gradientFor(entry.hue)}">
      ${thumb}
      ${badge}
    </div>
    <div class="flex flex-1 flex-col p-4">
      <div class="flex items-center gap-2 text-xs">
        <span class="rounded-full px-2 py-0.5 font-medium" style="background: oklch(0.62 0.17 ${entry.hue} / 0.14); color: oklch(0.62 0.17 ${entry.hue});">${escapeHtml(entry.categoryLabel)}</span>
        ${minutesLabel}
      </div>
      <h3 class="mt-2 line-clamp-2 leading-snug font-semibold tracking-tight">
        <a href="${escapeHtml(entry.url)}"${linkAttrs} class="after:absolute after:inset-0 group-hover:text-accent">${escapeHtml(entry.title)}</a>
      </h3>
      ${progressBar}
      <div class="mt-2 flex items-center gap-2 text-xs text-muted">
        <span>${relativeTime(entry.lastViewedAt)}</span>
        ${entry.external ? '<span aria-hidden="true">·</span><span>msdevbuild.com</span>' : ''}
      </div>
      ${continueBtn}
    </div>`;

  // Controls sit above the full-card link (relative + higher stacking).
  const controls = document.createElement('div');
  controls.className = 'absolute left-2 top-2 z-10 flex gap-1.5';

  if (opts.bookmarkToggle) {
    const bm = document.createElement('button');
    bm.type = 'button';
    bm.className =
      'grid size-7 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/75';
    const paint = () => {
      bm.setAttribute('aria-label', entry.bookmarked ? 'Remove bookmark' : 'Bookmark');
      bm.innerHTML = `<svg class="size-4" viewBox="0 0 24 24" fill="${entry.bookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/></svg>`;
    };
    paint();
    bm.addEventListener('click', (e) => {
      e.preventDefault();
      entry.bookmarked = toggleBookmark(meta);
      paint();
      opts.onChange?.();
    });
    controls.appendChild(bm);
  }

  if (opts.removable) {
    const rm = document.createElement('button');
    rm.type = 'button';
    rm.setAttribute('aria-label', 'Remove from history');
    rm.className =
      'grid size-7 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/75';
    rm.innerHTML = `<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 6 6 18M6 6l12 12"/></svg>`;
    rm.addEventListener('click', (e) => {
      e.preventDefault();
      removeEntry(entry.slug);
      opts.onChange?.();
    });
    controls.appendChild(rm);
  }

  if (controls.childElementCount > 0) card.appendChild(controls);
  hideOnError(card);
  return card;
}

/** Convenience: render a list of entries into a container as a card grid. */
export function renderCards(container: HTMLElement, entries: HistoryEntry[], opts: CardOptions = {}): void {
  container.replaceChildren(...entries.map((e) => createCard(e, opts)));
}

/**
 * The wide "Resume where you left off" banner — one unfinished article with a
 * progress bar and a Continue button that deep-links to the saved position.
 */
export function createResumeCard(entry: HistoryEntry): HTMLElement {
  const pct = Math.round(entry.progress * 100);
  const el = document.createElement('div');
  el.className =
    'group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-default bg-subtle p-4 sm:flex-row sm:items-center sm:p-5';

  const src = thumbFor(entry);
  const thumb = src
    ? `<img src="${escapeHtml(src)}" alt="${entry.cover ? escapeHtml(entry.coverAlt) : ''}" loading="lazy" class="size-full object-cover" />`
    : '';

  el.innerHTML = `
    <div class="aspect-[1200/630] w-full shrink-0 overflow-hidden rounded-lg border border-default sm:w-44" style="background:${gradientFor(entry.hue)}">${thumb}</div>
    <div class="min-w-0 flex-1">
      <p class="eyebrow">Resume where you left off</p>
      <h3 class="mt-1 line-clamp-2 text-lg font-semibold tracking-tight">
        <a href="${escapeHtml(entry.url)}" class="hover:text-accent">${escapeHtml(entry.title)}</a>
      </h3>
      <div class="mt-3 flex items-center gap-3">
        <div class="h-1.5 flex-1 overflow-hidden rounded-full" style="background: var(--border);">
          <div style="width:${pct}%; height:100%; background: var(--accent);"></div>
        </div>
        <span class="shrink-0 text-xs font-medium text-muted">${pct}% · ${entry.minutes} min</span>
      </div>
    </div>
    <a href="${escapeHtml(entry.url)}#resume" class="btn btn-accent shrink-0 self-start sm:self-center">Continue reading</a>`;
  hideOnError(el);
  return el;
}

export interface EventRowOptions {
  onChange?: () => void;
}

/** One registered-event row: date, title, location, and a remove control. */
export function createEventRow(entry: EventEntry, opts: EventRowOptions = {}): HTMLElement {
  const past = entry.startsAt ? Date.parse(entry.startsAt) < Date.now() : false;

  const row = document.createElement('div');
  row.className =
    'group relative flex items-center gap-4 rounded-xl border border-default p-4 transition-colors hover:bg-subtle';

  row.innerHTML = `
    <div class="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg border border-default bg-subtle text-center leading-none">
      <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.7" aria-hidden="true">
        <rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>
      </svg>
    </div>
    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2 text-xs text-muted">
        <span>${escapeHtml(entry.dateLabel || 'Registered')}</span>
        ${entry.location ? `<span aria-hidden="true">·</span><span>${escapeHtml(entry.location)}</span>` : ''}
        <span class="rounded-full px-2 py-0.5 font-medium ${past ? 'text-muted' : ''}" style="${past ? 'background: var(--border);' : 'background: var(--accent-soft); color: var(--accent);'}">${past ? 'Attended' : 'Registered ✓'}</span>
      </div>
      <h3 class="mt-1 line-clamp-2 font-semibold leading-snug tracking-tight">
        <a href="${escapeHtml(entry.url)}" class="after:absolute after:inset-0 group-hover:text-accent">${escapeHtml(entry.title)}</a>
      </h3>
    </div>`;

  const rm = document.createElement('button');
  rm.type = 'button';
  rm.setAttribute('aria-label', 'Remove event');
  rm.className =
    'relative z-10 grid size-7 shrink-0 place-items-center rounded-full border border-default text-muted transition-colors hover:bg-[var(--bg)]';
  rm.innerHTML = `<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 6 6 18M6 6l12 12"/></svg>`;
  rm.addEventListener('click', (e) => {
    e.preventDefault();
    removeEventRegistration(entry.slug);
    opts.onChange?.();
  });
  row.appendChild(rm);

  return row;
}
