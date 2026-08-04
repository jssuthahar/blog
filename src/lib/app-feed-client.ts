/**
 * Everything the app feed does once it is on screen.
 *
 * One module rather than a listener per card: the feed is thirty items long and
 * grows every time a short or a post is published, so all of it runs off a
 * single IntersectionObserver, a single delegated click handler and a single
 * `message` listener. Adding an item costs markup and nothing else.
 *
 * The three jobs, in the order they matter:
 *
 *   1. Decide which item is on screen, and make that the only one that is
 *      playing. Shorts are mounted when they become active and destroyed when
 *      they stop being active — see AppFeedShort.astro for why that is the
 *      right shape of control for these players.
 *   2. Bring the sound in. A sandboxed frame cannot start audible audio from a
 *      cold load, so the first real interaction anywhere on the page is
 *      forwarded to every mounted player as the gesture it needs.
 *   3. Keep the counts and the library honest — views, likes, bookmarks —
 *      using exactly the documents and baselines the rest of the site uses, so
 *      a number here always matches the same number on the item's own page.
 */
import { FIREBASE } from '../config';
import {
  getHistory,
  getResume,
  gradientFor,
  isBookmarked,
  thumbFor,
  toggleBookmark,
  type ArticleMeta,
} from './reading-history';

const BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents`;
const counters = FIREBASE.projectId.length > 0;

// Baselines match ViewCounter.astro and Reactions.astro, so an item never shows
// one number in the feed and a different one on its own page.
const VIEW_BASE = 422;
const REACT_BASE = 2;

/**
 * How long an item has to hold the screen before it counts as a view.
 *
 * A reader flicking down to find the shorts passes through six cards in a
 * second, and counting those would make the number meaningless — which matters
 * more here than anywhere else on the site, because these counts are the thing
 * the feed shows to argue that an article is worth opening.
 */
const VIEW_DWELL_MS = 900;

/** Long enough that flicking past a short never boots its player. */
const MOUNT_DELAY_MS = 180;

const SOUND_KEY = 'app-feed-sound';

type Kind = 'all' | 'short' | 'blog' | 'article';

const format = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);

const metaOf = (item: HTMLElement): ArticleMeta | null => {
  const block = item.querySelector('[data-feed-meta]');
  try {
    return block ? (JSON.parse(block.textContent ?? '') as ArticleMeta) : null;
  } catch {
    return null;
  }
};

/* ────────────────────────────────────────────────────────────────── sound ── */

/**
 * Whether the reader wants sound at all, remembered across sessions.
 *
 * Defaults to on. These shorts are scored — the effects carry the beat of the
 * explanation — and someone who opened a video feed has already said yes to
 * that. Turning it off is one tap and it sticks.
 */
function soundWanted(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'off';
  } catch {
    return true;
  }
}

function setSoundWanted(on: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, on ? 'on' : 'off');
  } catch {
    /* Private mode: the preference just does not survive the session. */
  }
}

/**
 * True once the document has had a real interaction, which is the only thing
 * that lets a player's AudioContext start. Until then a short plays silently
 * however much the reader wants sound, and the feed says so on the item.
 */
let armed = false;

/**
 * The feed currently wired up, the observer watching it, and the handlers the
 * document-level listeners delegate to.
 *
 * `initAppFeed` runs on load and again on every `astro:page-load`, which on a
 * first visit means twice against the same DOM — so it has to be idempotent or
 * one tap on Like would count as two. The listeners that live on `document`
 * rather than on the feed are bound once for the session and re-pointed at
 * whichever feed is current, so navigating away and back does not leave a
 * session's worth of dead closures behind.
 */
let bound: HTMLElement | null = null;
let watching: IntersectionObserver | undefined;
let documentBound = false;
let onArm: () => void = () => {};
let onVisibility: () => void = () => {};
let onHistory: () => void = () => {};
let onMessage: (event: MessageEvent) => void = () => {};
let onKey: (event: KeyboardEvent) => void = () => {};

export function initAppFeed(): void {
  const found = document.querySelector<HTMLElement>('[data-app-feed]');
  if (!found || found === bound) return;

  watching?.disconnect();
  bound = found;

  // Typed rather than narrowed: the helpers below are function declarations,
  // which are hoisted, and TypeScript drops a narrowing across a hoist.
  const feed: HTMLElement = found;

  /* ──────────────────────────────────────────────────── players + sound ── */

  const frames = (): HTMLIFrameElement[] => [...feed.querySelectorAll('iframe')];

  const send = (frame: HTMLIFrameElement, message: Record<string, unknown>): void => {
    // targetOrigin '*' is required: the frame has an opaque origin and cannot
    // be named. It also holds nothing worth addressing — see ShortPlayer.astro.
    frame.contentWindow?.postMessage(message, '*');
  };

  const paintSoundButton = (item: HTMLElement, on: boolean): void => {
    const btn = item.querySelector<HTMLButtonElement>('[data-feed-sound]');
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Mute this short' : 'Turn the sound on');
    const label = btn.querySelector('[data-feed-sound-label]');
    if (label) label.textContent = on ? 'Sound' : 'Muted';
  };

  /** The "tap for sound" nudge, shown only where it is actually true. */
  const paintUnlockHint = (item: HTMLElement): void => {
    const hint = item.querySelector<HTMLElement>('[data-feed-unlock]');
    if (hint) hint.hidden = armed || !soundWanted();
  };

  function mountShort(item: HTMLElement): void {
    const stage = item.querySelector<HTMLElement>('[data-short-stage]');
    const template = item.querySelector<HTMLTemplateElement>('[data-short-template]');
    if (!stage || !template || stage.querySelector('iframe')) return;

    const frame = template.content.firstElementChild?.cloneNode(true);
    if (!(frame instanceof HTMLIFrameElement)) return;

    // `load` rather than the bridge's `msd:ready`: it fires for a srcdoc frame
    // whatever the player's own script does, so a short whose template has
    // drifted still retires its poster instead of leaving it behind the frame.
    frame.addEventListener('load', () => {
      item.dataset.loaded = '';
    }, { once: true });

    stage.append(frame);
    item.dataset.playing = '';
    paintUnlockHint(item);
  }

  /**
   * Takes the frame out of the document, which is the only reliable stop these
   * players have: it ends the sequencer, the stage timers and the audio graph
   * in one move, and hands the memory back. The poster underneath is still
   * there, so the item does not go blank.
   */
  function unmountShort(item: HTMLElement): void {
    item.querySelector('iframe')?.remove();
    delete item.dataset.playing;
    // The poster is the item again until a new frame paints.
    delete item.dataset.loaded;
  }

  /**
   * Hands the page's first genuine interaction to every mounted player.
   *
   * Scrolling is not user activation as far as the autoplay policy is
   * concerned, so this is what a tap, a click or a key press is for — after it,
   * sound comes in on its own for every short the reader reaches.
   */
  function armAudio(): void {
    if (armed) return;
    armed = true;
    for (const frame of frames()) {
      send(frame, { type: 'msd:unlock' });
      send(frame, { type: 'msd:sound', on: soundWanted() });
    }
    feed.querySelectorAll<HTMLElement>('[data-feed-unlock]').forEach((hint) => {
      hint.hidden = true;
    });
  }

  function handleFrameMessage(event: MessageEvent): void {
    const data = event.data as { type?: string; sound?: boolean; on?: boolean } | null;
    if (!data || typeof data.type !== 'string') return;

    // Identity by source window, not by origin: an opaque origin reports the
    // string "null" and proves nothing.
    const frame = frames().find((f) => f.contentWindow === event.source);
    if (!frame) return;
    const item = frame.closest<HTMLElement>('[data-feed-item]');
    if (!item) return;

    if (data.type === 'msd:ready') {
      // The player boots with its effects bus on; this is where the reader's
      // own preference — and the page's activation state — are applied.
      if (armed) send(frame, { type: 'msd:unlock' });
      send(frame, { type: 'msd:sound', on: soundWanted() });
      paintSoundButton(item, soundWanted());
    }

    if (data.type === 'msd:sound') paintSoundButton(item, data.on === true);
  }

  /* ────────────────────────────────────────────────────────────── counts ── */

  async function loadCounts(item: HTMLElement): Promise<void> {
    const slug = item.dataset.slug;
    if (!counters || !slug || item.dataset.counted === '') return;
    item.dataset.counted = '';

    const views = item.querySelector('[data-feed-views]');
    if (views) {
      try {
        const doc = await fetch(`${BASE}/views/${encodeURIComponent(slug)}`).then((r) =>
          r.ok ? r.json() : null,
        );
        views.textContent = format(VIEW_BASE + Number(doc?.fields?.count?.integerValue ?? 0));
      } catch {
        views.textContent = format(VIEW_BASE);
      }
    }

    const likes = item.querySelector('[data-feed-likes]');
    if (likes) {
      try {
        const doc = await fetch(`${BASE}/reactions/${encodeURIComponent(slug)}`).then((r) =>
          r.ok ? r.json() : null,
        );
        likes.textContent = format(REACT_BASE + Number(doc?.fields?.like?.integerValue ?? 0));
      } catch {
        likes.textContent = format(REACT_BASE);
      }
      if (localStorage.getItem(`reacted:${slug}:like`) !== null) {
        item.querySelector('[data-feed-like]')?.setAttribute('aria-pressed', 'true');
      }
    }
  }

  /**
   * Records a view, once per item per browser session — the same rule and the
   * same document ViewCounter.astro uses, so opening an article from the feed
   * and opening it from search are one view, not two.
   */
  async function countView(item: HTMLElement): Promise<void> {
    const slug = item.dataset.slug;
    if (!counters || !slug) return;

    const key = `viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key) !== null) return;
      sessionStorage.setItem(key, '1');
    } catch {
      return;
    }

    try {
      await fetch(`${BASE}:commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writes: [
            {
              update: {
                name: `projects/${FIREBASE.projectId}/databases/(default)/documents/views/${slug}`,
                fields: {},
              },
              updateMask: { fieldPaths: [] },
              updateTransforms: [{ fieldPath: 'count', increment: { integerValue: '1' } }],
            },
          ],
        }),
      });
    } catch {
      // A counter is decoration; never let it surface as a broken feed.
    }
  }

  async function like(item: HTMLElement, btn: HTMLButtonElement): Promise<void> {
    const slug = item.dataset.slug;
    if (!counters || !slug) return;

    // One like per browser, matching Reactions.astro. There is no un-like
    // anywhere on the site, and adding one here only would put two different
    // rules on the same Firestore document.
    const guard = `reacted:${slug}:like`;
    if (localStorage.getItem(guard) !== null) return;
    localStorage.setItem(guard, '1');
    btn.setAttribute('aria-pressed', 'true');

    const out = item.querySelector('[data-feed-likes]');
    const shown = Number(String(out?.textContent).replace(/k$/, '000')) || REACT_BASE;
    if (out) out.textContent = format(shown + 1);

    try {
      const res = await fetch(`${BASE}:commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writes: [
            {
              update: {
                name: `projects/${FIREBASE.projectId}/databases/(default)/documents/reactions/${slug}`,
                fields: {},
              },
              updateMask: { fieldPaths: [] },
              updateTransforms: [{ fieldPath: 'like', increment: { integerValue: '1' } }],
            },
          ],
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      // Roll the guard back so a genuine failure can be retried.
      localStorage.removeItem(guard);
      btn.setAttribute('aria-pressed', 'false');
      if (out) out.textContent = format(shown);
    }
  }

  async function share(item: HTMLElement): Promise<void> {
    const meta = metaOf(item);
    if (!meta) return;
    const url = new URL(meta.url, location.origin).href;

    if (navigator.share) {
      try {
        await navigator.share({ title: meta.title, text: meta.description, url });
        return;
      } catch {
        // Cancelled, or unavailable here — fall through to the clipboard.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      const label = item.querySelector('[data-feed-share-label]');
      if (label) {
        label.textContent = 'Copied';
        setTimeout(() => {
          label.textContent = 'Share';
        }, 1600);
      }
    } catch {
      // Nothing sensible left to try; the item's own link still works.
    }
  }

  function paintSave(item: HTMLElement, on: boolean): void {
    const btn = item.querySelector<HTMLButtonElement>('[data-feed-save]');
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Remove from your library' : 'Save to your library');
    const label = btn.querySelector('[data-feed-save-label]');
    if (label) label.textContent = on ? 'Saved' : 'Save';
  }

  /* ──────────────────────────────────────────────────────── active item ── */

  let active: HTMLElement | null = null;
  let mountTimer: number | undefined;
  let viewTimer: number | undefined;

  function activate(item: HTMLElement): void {
    if (active === item) return;

    if (active) {
      delete active.dataset.active;
      unmountShort(active);
    }
    active = item;
    item.dataset.active = '';

    clearTimeout(mountTimer);
    clearTimeout(viewTimer);

    if (item.dataset.kind === 'short') {
      paintUnlockHint(item);
      // Item one is not something anyone flicks past, so it does not pay the
      // delay that keeps a fast scroll from booting four players.
      const delay = item.dataset.eager === '' ? 0 : MOUNT_DELAY_MS;
      mountTimer = window.setTimeout(() => mountShort(item), delay);
    }
    viewTimer = window.setTimeout(() => void countView(item), VIEW_DWELL_MS);
  }

  /**
   * Works out which item is on screen and activates it, without waiting for an
   * intersection to change.
   *
   * Needed because a filter change can leave the very same item on screen at
   * the very same ratio — switch from All to Shorts while a short is showing
   * and nothing intersects differently, so the observer stays silent and the
   * player that was just torn down would never come back.
   */
  function activateVisible(): void {
    const box = feed.getBoundingClientRect();
    for (const item of feed.querySelectorAll<HTMLElement>('[data-feed-item]')) {
      if (item.offsetParent === null) continue;
      const rect = item.getBoundingClientRect();
      if (rect.bottom > box.top + box.height * 0.4) {
        activate(item);
        return;
      }
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const item = entry.target as HTMLElement;
        if (entry.isIntersecting) void loadCounts(item);
        // 0.6 of the item is past the point where a snap has resolved, so the
        // winner is unambiguous and only ever one item at a time.
        if (entry.intersectionRatio >= 0.6) activate(item);
      }
    },
    { root: feed, threshold: [0.01, 0.6] },
  );

  const observe = (): void => {
    feed.querySelectorAll<HTMLElement>('[data-feed-item]').forEach((item) => {
      if (item.dataset.observed === '') return;
      item.dataset.observed = '';
      observer.observe(item);

      const meta = metaOf(item);
      if (meta) paintSave(item, isBookmarked(meta.slug));
    });
  };

  /* ─────────────────────────────────────────────────────────── controls ── */

  feed.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const item = target.closest<HTMLElement>('[data-feed-item]');
    if (!item) return;

    const likeBtn = target.closest<HTMLButtonElement>('[data-feed-like]');
    if (likeBtn) {
      void like(item, likeBtn);
      return;
    }

    if (target.closest('[data-feed-share]')) {
      void share(item);
      return;
    }

    if (target.closest('[data-feed-save]')) {
      const meta = metaOf(item);
      if (meta) paintSave(item, toggleBookmark(meta));
      return;
    }

    const soundBtn = target.closest<HTMLButtonElement>('[data-feed-sound]');
    if (soundBtn) {
      const on = soundBtn.getAttribute('aria-pressed') !== 'true';
      setSoundWanted(on);
      paintSoundButton(item, on);
      const frame = item.querySelector('iframe');
      if (frame) send(frame, { type: 'msd:sound', on });
      return;
    }
  });

  /* ───────────────────────────────────────────────────────────── filters ── */

  function applyFilter(kind: Kind): void {
    feed.dataset.filter = kind;
    document.querySelectorAll<HTMLElement>('[data-feed-tab]').forEach((tab) => {
      tab.setAttribute('aria-selected', String(tab.dataset.feedTab === kind));
    });

    // A filtered feed starts at its own first item, not wherever the reader
    // happened to be in the unfiltered one.
    if (active) {
      unmountShort(active);
      delete active.dataset.active;
      active = null;
    }
    feed.scrollTo({ top: 0 });
    // After the reflow the filter caused, so the item measured is the one the
    // reader is actually looking at.
    requestAnimationFrame(activateVisible);

    try {
      sessionStorage.setItem('app-feed-filter', kind);
    } catch {
      /* Private mode: the tab just resets on the next visit. */
    }
  }

  document.querySelectorAll<HTMLElement>('[data-feed-tab]').forEach((tab) => {
    tab.addEventListener('click', () => applyFilter((tab.dataset.feedTab ?? 'all') as Kind));
  });

  /* ──────────────────────────────────────────────────────────── resume ─── */

  /**
   * The half-read article, put back at the top of the feed.
   *
   * It is a feed item like any other rather than a banner above the scroller:
   * in a snap column, a fixed band would eat the height every other item is
   * measured against, and this is worth exactly one screen.
   *
   * Built here rather than with `createResumeCard` from reading-history. That
   * one is a wide banner — thumbnail, text and button in a row — sized for the
   * 672px column /history uses, and its row layout switches on a viewport media
   * query rather than on the width it actually gets. Dropped into this 480px
   * feed column on a desktop it squeezes the title to about sixty pixels. The
   * shape the feed needs is the same shape every other card in it has, so it is
   * drawn that way instead of fought into place.
   */
  function paintResume(): void {
    feed.querySelector('[data-feed-resume]')?.remove();

    const resume = getResume();
    if (!resume) return;

    const pct = Math.round(resume.progress * 100);
    const left = Math.max(1, Math.round(resume.minutes * (1 - resume.progress)));

    const item = document.createElement('article');
    item.className = 'feed-item feed-resume';
    item.dataset.feedItem = '';
    item.dataset.feedResume = '';
    item.dataset.kind = resume.external ? 'article' : 'blog';
    item.style.setProperty('--item-hue', String(resume.hue));

    const card = document.createElement('div');
    card.className = 'feed-resume__card';

    const media = document.createElement('a');
    media.className = 'feed-resume__media';
    media.href = `${resume.url}#resume`;
    media.tabIndex = -1;
    media.setAttribute('aria-hidden', 'true');
    media.style.background = gradientFor(resume.hue);

    const src = thumbFor(resume);
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.loading = 'eager';
      // A slug renamed since the last visit 404s; drop the broken glyph and let
      // the gradient underneath stand in.
      img.addEventListener('error', () => img.remove(), { once: true });
      media.append(img);
    }

    const body = document.createElement('div');
    body.className = 'feed-resume__body';

    const eyebrow = document.createElement('p');
    eyebrow.className = 'feed-resume__eyebrow';
    eyebrow.textContent = 'Pick up where you left off';

    const heading = document.createElement('h2');
    heading.className = 'feed-resume__title';
    const link = document.createElement('a');
    link.href = `${resume.url}#resume`;
    link.textContent = resume.title;
    heading.append(link);

    const track = document.createElement('div');
    track.className = 'feed-resume__track';
    const fill = document.createElement('span');
    fill.style.width = `${pct}%`;
    track.append(fill);

    const meta = document.createElement('p');
    meta.className = 'feed-resume__meta';
    meta.textContent = `${pct}% read · about ${left} min left`;

    const cta = document.createElement('a');
    cta.className = 'feed-resume__cta';
    cta.href = `${resume.url}#resume`;
    cta.textContent = 'Continue reading';

    body.append(eyebrow, heading, track, meta, cta);
    card.append(media, body);
    item.append(card);

    feed.prepend(item);
    observe();
  }

  /**
   * How much of each series this browser has opened, painted onto the rings on
   * the end-of-feed card. The rail ships every series' part slugs, so counting
   * reads needs nothing from the taxonomy — just the history.
   */
  function paintSeries(): void {
    const opened = new Set(getHistory().map((e) => e.slug));

    feed.querySelectorAll<HTMLElement>('[data-series-slugs]').forEach((link) => {
      const slugs = link.dataset.seriesSlugs!.split(',').filter(Boolean);
      const total = Number(link.dataset.seriesTotal) || slugs.length || 1;
      const read = slugs.filter((s) => opened.has(s)).length;

      const ring = link.querySelector<HTMLElement>('.app-ring');
      if (ring) ring.style.setProperty('--p', String(Math.round((read / total) * 100)));

      const count = link.querySelector('[data-series-count]');
      if (count) count.textContent = `${read}/${total}`;
    });
  }

  /* ─────────────────────────────────────────────────────────── keyboard ── */

  /**
   * Up and down move one item, the way a swipe does.
   *
   * On `document` rather than on the scroller, because scrolling a div never
   * focuses it — a reader who has not tabbed into anything is talking to the
   * body, and that is who this is for. Anything typed into a field (the
   * newsletter address, the search box) is left alone.
   */
  function handleKey(event: KeyboardEvent): void {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, [contenteditable]')) return;

    const items = [...feed.querySelectorAll<HTMLElement>('[data-feed-item]')].filter(
      (i) => i.offsetParent !== null,
    );
    const index = active ? items.indexOf(active) : 0;
    const next = items[index + (event.key === 'ArrowDown' ? 1 : -1)];
    if (!next) return;
    event.preventDefault();
    next.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ────────────────────────────────────────────────────────────── start ── */

  watching = observer;
  onArm = armAudio;
  onMessage = handleFrameMessage;
  onHistory = () => {
    paintResume();
    paintSeries();
  };
  onKey = handleKey;
  // Leaving the page — a tab switch, a navigation, the screen locking — should
  // stop whatever is playing rather than leave audio running out of sight.
  onVisibility = () => {
    if (document.hidden && active) unmountShort(active);
    else if (!document.hidden && active?.dataset.kind === 'short') mountShort(active);
  };

  if (!documentBound) {
    documentBound = true;
    document.addEventListener('pointerdown', () => onArm(), { passive: true });
    document.addEventListener('keydown', (event) => {
      onArm();
      onKey(event);
    });
    window.addEventListener('message', (event) => onMessage(event));
    window.addEventListener('reading-history-change', () => onHistory());
    document.addEventListener('visibilitychange', () => onVisibility());
  }

  paintResume();
  paintSeries();
  observe();

  // Validated rather than trusted: `?tab=` is whatever was in the address bar,
  // and an unknown value would set a data-filter no rule matches — a feed with
  // its promotions hidden and nothing else filtered, which looks like a bug.
  const KINDS: Kind[] = ['all', 'short', 'blog', 'article'];
  const valid = (value: string | null): Kind | undefined =>
    KINDS.find((k) => k === value);

  let restored: Kind | undefined;
  try {
    restored = valid(sessionStorage.getItem('app-feed-filter'));
  } catch {
    /* Private mode: start on All. */
  }
  const wanted = valid(new URLSearchParams(location.search).get('tab'));
  applyFilter(wanted ?? restored ?? 'all');
}
