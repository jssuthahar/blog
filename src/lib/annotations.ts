/**
 * Reader highlights — the marks someone leaves on an article, kept in their own
 * browser.
 *
 * There is no account and no server here, and that is the design rather than a
 * limitation: the same choice the reading history made. A highlight is a private
 * note about what mattered to one person, it is worth nothing to anyone else,
 * and storing it locally means it costs no request, no consent banner and no row
 * in a database that would have to be secured.
 *
 * The hard part is anchoring. A highlight has to survive the reader closing the
 * tab, and it has to survive the article being edited — a typo fixed three
 * paragraphs above should not move every mark below it. So a highlight is stored
 * three ways at once:
 *
 *   - the index of the block it lives in, which is exact and fast;
 *   - character offsets within that block's text;
 *   - the highlighted text itself.
 *
 * On restore the text is the authority. If the offsets still produce it, nothing
 * moved. If they do not, the text is searched for across the article and the
 * anchor is rewritten. If it has genuinely gone — the paragraph was rewritten —
 * the highlight is dropped rather than painted over something the reader never
 * marked, which is the one outcome worse than losing it.
 */

const KEY = 'msd:annotations:v1';

/**
 * Four colours, and no more.
 *
 * A palette is a taxonomy the reader has to invent and then remember. Four is
 * enough to separate "the point", "disagree", "look up later" and "quote this"
 * for anyone who wants that, and few enough that the toolbar stays one row on a
 * phone. The hues are the site's own, not highlighter-pen yellow and pink.
 */
export const COLOURS = [
  { id: 'accent', label: 'Blue', hue: 252 },
  { id: 'green', label: 'Green', hue: 155 },
  { id: 'amber', label: 'Amber', hue: 75 },
  { id: 'rose', label: 'Rose', hue: 15 },
] as const;

export type ColourId = (typeof COLOURS)[number]['id'];

export interface Highlight {
  id: string;
  /** Index into the article's leaf blocks — see `blocksOf`. */
  block: number;
  /** Character offsets within that block's `textContent`. */
  start: number;
  end: number;
  /** The marked text. The authority when the offsets stop agreeing with it. */
  text: string;
  colour: ColourId;
  /** The reader's own note, if they added one. */
  note?: string;
  at: number;
}

type Store = Record<string, Highlight[]>;

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Quota, or private mode. The marks stay on screen for this visit and are
    // simply not there next time — which is better than losing the page.
  }
}

export function getHighlights(slug: string): Highlight[] {
  return (read()[slug] ?? []).sort((a, b) => a.block - b.block || a.start - b.start);
}

export function setHighlights(slug: string, list: Highlight[]): void {
  const store = read();
  if (list.length > 0) store[slug] = list;
  else delete store[slug];
  write(store);
}

/** Every article this browser has marked, newest first. */
export function annotatedSlugs(): string[] {
  const store = read();
  return Object.keys(store).sort(
    (a, b) => Math.max(...store[b]!.map((h) => h.at)) - Math.max(...store[a]!.map((h) => h.at)),
  );
}

/**
 * Adds a highlight, merging it into any it touches.
 *
 * Overlapping marks would otherwise nest one `<mark>` inside another, which
 * paints a darker band the reader never asked for and cannot remove in one tap.
 * Two marks that touch are one mark — and the newer colour wins, because the
 * colour is the thing the reader just chose.
 */
export function addHighlight(slug: string, incoming: Omit<Highlight, 'id' | 'at'>): Highlight {
  const list = getHighlights(slug);
  const keep: Highlight[] = [];
  let start = incoming.start;
  let end = incoming.end;
  let note = incoming.note;

  for (const existing of list) {
    const touches = existing.block === incoming.block && existing.start <= end && existing.end >= start;
    if (!touches) {
      keep.push(existing);
      continue;
    }
    start = Math.min(start, existing.start);
    end = Math.max(end, existing.end);
    // A note the reader typed is theirs; never drop it by merging over it.
    note = note ?? existing.note;
  }

  const highlight: Highlight = {
    id: `h${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    block: incoming.block,
    start,
    end,
    text: incoming.text,
    colour: incoming.colour,
    note,
    at: Date.now(),
  };

  setHighlights(slug, [...keep, highlight]);
  return highlight;
}

export function removeHighlight(slug: string, id: string): void {
  setHighlights(
    slug,
    getHighlights(slug).filter((h) => h.id !== id),
  );
}

export function updateNote(slug: string, id: string, note: string): void {
  setHighlights(
    slug,
    getHighlights(slug).map((h) => (h.id === id ? { ...h, note: note.trim() || undefined } : h)),
  );
}

export function clearHighlights(slug: string): void {
  setHighlights(slug, []);
}

/* ─────────────────────────────────────────────────────────────────── DOM ── */

/**
 * The blocks a highlight can live in: leaf blocks only.
 *
 * "Leaf" matters. A list item that contains a paragraph would otherwise be
 * counted twice — once as the `li` and once as the `p` — and the same character
 * would have two different offsets depending on which one the selection
 * happened to resolve to.
 *
 * Code blocks are deliberately out. They are wrapped by CodeCopyButton at
 * runtime and are often the output of a syntax highlighter that re-renders,
 * so an anchor inside one is an anchor into somebody else's DOM. Code can still
 * be copied and turned into a quote card; it just cannot be marked.
 */
export function blocksOf(root: HTMLElement): HTMLElement[] {
  const candidates = [...root.querySelectorAll<HTMLElement>('p, li, h2, h3, h4, blockquote, td, dd, dt')].filter(
    (el) => !el.closest('pre') && el.textContent!.trim().length > 0,
  );
  return candidates.filter((el) => !candidates.some((other) => other !== el && el.contains(other)));
}

/** Character offset of a DOM position within a block's text. */
function offsetIn(block: HTMLElement, node: Node, offset: number): number {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  let total = 0;
  let current: Node | null;
  while ((current = walker.nextNode())) {
    if (current === node) return total + offset;
    total += (current as Text).data.length;
  }
  // The position is an element boundary rather than a text node — the end of
  // the block is the only sensible reading.
  return total;
}

export interface PendingHighlight {
  block: number;
  start: number;
  end: number;
  text: string;
}

/**
 * Turns the current selection into one pending highlight per block it crosses.
 *
 * Per block, rather than one record spanning several, because a paragraph is
 * the unit that survives an edit. A single anchor stretching from the middle of
 * one paragraph to the middle of another breaks the moment anything between
 * them changes; four separate anchors mostly survive, and the ones that do not
 * are dropped individually.
 */
export function selectionToHighlights(root: HTMLElement, range: Range): PendingHighlight[] {
  const blocks = blocksOf(root);
  const out: PendingHighlight[] = [];

  blocks.forEach((block, index) => {
    if (!range.intersectsNode(block)) return;

    const text = block.textContent ?? '';
    let start = block.contains(range.startContainer)
      ? offsetIn(block, range.startContainer, range.startOffset)
      : 0;
    let end = block.contains(range.endContainer)
      ? offsetIn(block, range.endContainer, range.endOffset)
      : text.length;
    if (end <= start) return;

    // Trim the whitespace a drag inevitably picks up at each end, so a mark
    // never starts or finishes with a floating space.
    while (start < end && /\s/.test(text[start]!)) start++;
    while (end > start && /\s/.test(text[end - 1]!)) end--;

    const marked = text.slice(start, end);
    if (marked.trim().length < 2) return;

    out.push({ block: index, start, end, text: marked });
  });

  return out;
}

/**
 * Re-points a stored highlight at the article as it is now.
 *
 * Returns the highlight with corrected offsets, or null when the text it marked
 * is no longer anywhere in the article.
 */
function reanchor(highlight: Highlight, blocks: HTMLElement[]): Highlight | null {
  const block = blocks[highlight.block];
  if (block && (block.textContent ?? '').slice(highlight.start, highlight.end) === highlight.text) {
    return highlight;
  }

  // The offsets have drifted. The text is what the reader actually marked, so
  // find that instead — in its own block first, then anywhere.
  const search = (el: HTMLElement | undefined, index: number): Highlight | null => {
    if (!el) return null;
    const at = (el.textContent ?? '').indexOf(highlight.text);
    if (at < 0) return null;
    return { ...highlight, block: index, start: at, end: at + highlight.text.length };
  };

  const inPlace = search(block, highlight.block);
  if (inPlace) return inPlace;

  for (let i = 0; i < blocks.length; i++) {
    const found = search(blocks[i], i);
    if (found) return found;
  }
  return null;
}

/** Wraps one character range in `<mark>`, splitting text nodes as needed. */
function wrap(block: HTMLElement, highlight: Highlight): void {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) nodes.push(node as Text);

  const pieces: Text[] = [];
  let offset = 0;

  for (const text of nodes) {
    const nodeStart = offset;
    const nodeEnd = offset + text.data.length;
    offset = nodeEnd;

    const from = Math.max(highlight.start, nodeStart);
    const to = Math.min(highlight.end, nodeEnd);
    if (to <= from) continue;

    // Splitting produces new nodes after this one; they are outside the range
    // by construction, and the walk was snapshotted before any of this, so the
    // remaining offsets stay correct.
    let piece = text;
    if (from > nodeStart) piece = piece.splitText(from - nodeStart);
    if (to < nodeEnd) piece.splitText(to - from);
    pieces.push(piece);
  }

  for (const piece of pieces) {
    const mark = document.createElement('mark');
    mark.className = 'rt-mark';
    mark.dataset.hl = highlight.id;
    mark.dataset.colour = highlight.colour;
    if (highlight.note) mark.dataset.note = '';
    piece.replaceWith(mark);
    mark.append(piece);
  }
}

/** Takes every mark back out and stitches the text nodes together again. */
export function unpaint(root: HTMLElement): void {
  const marks = [...root.querySelectorAll<HTMLElement>('mark.rt-mark')];
  for (const mark of marks) {
    const parent = mark.parentNode;
    if (!parent) continue;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    mark.remove();
    (parent as Element).normalize?.();
  }
}

/**
 * Paints every stored highlight, repairing anchors as it goes and writing back
 * any that moved — so the repair happens once rather than on every visit.
 */
export function paint(root: HTMLElement, slug: string): Highlight[] {
  unpaint(root);

  const blocks = blocksOf(root);
  const stored = getHighlights(slug);
  const live: Highlight[] = [];
  let changed = false;

  for (const highlight of stored) {
    const fixed = reanchor(highlight, blocks);
    if (!fixed) {
      changed = true;
      continue;
    }
    if (fixed.block !== highlight.block || fixed.start !== highlight.start) changed = true;
    live.push(fixed);
  }

  // Latest first, so an early highlight's node splits never shift a later one's
  // offsets — each `wrap` re-walks, but only ranges after the split would move.
  for (const highlight of [...live].sort((a, b) => b.block - a.block || b.start - a.start)) {
    const block = blocks[highlight.block];
    if (block) wrap(block, highlight);
  }

  if (changed) setHighlights(slug, live);
  return live.sort((a, b) => a.block - b.block || a.start - b.start);
}

/** The reader's marks as a Markdown file they can keep. */
export function exportMarkdown(title: string, url: string, list: Highlight[]): string {
  const lines = [
    `# Notes — ${title}`,
    '',
    `Source: ${url}`,
    `Exported: ${new Date().toISOString().slice(0, 10)}`,
    '',
    '---',
    '',
  ];

  for (const highlight of list) {
    lines.push(`> ${highlight.text.replace(/\n+/g, ' ')}`);
    if (highlight.note) lines.push('', `**Note:** ${highlight.note}`);
    lines.push('');
  }

  return lines.join('\n');
}
