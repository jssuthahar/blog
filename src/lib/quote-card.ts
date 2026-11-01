/**
 * Turns a selected passage into a shareable image, drawn in the browser.
 *
 * The site already draws share cards at build time in lib/og-card.ts, but that
 * one renders a card per page — it cannot know which sentence a reader decided
 * was the good bit. This does, so it runs client-side on a plain 2D canvas: no
 * WASM, no service, nothing to deploy, and the file never leaves the device
 * unless the reader shares it.
 *
 * It is drawn to look like the rest of the property — the same near-black
 * canvas, the same category-hued glow, the same wordmark — because the whole
 * point of the feature is that someone else sees it in a feed and recognises
 * where it came from.
 */

export type CardSize = 'square' | 'wide' | 'story';

interface Size {
  w: number;
  h: number;
  label: string;
}

/**
 * Three shapes, one per place these actually get posted: the square that
 * LinkedIn and Instagram both render without cropping, the 1.91:1 that link
 * previews and X use, and the full-height portrait for stories and Reels.
 */
export const SIZES: Record<CardSize, Size> = {
  square: { w: 1080, h: 1080, label: 'Square · LinkedIn, Instagram' },
  wide: { w: 1200, h: 630, label: 'Wide · X, link previews' },
  story: { w: 1080, h: 1920, label: 'Story · Instagram, Reels' },
};

export interface QuoteCardOptions {
  quote: string;
  /** The article the passage came from. */
  title: string;
  /** Category label, shown as the chip. */
  category: string;
  /** Category hue from the site taxonomy — the card's only colour decision. */
  hue: number;
  /** Shown at the foot, without a scheme: this is read, not clicked. */
  domain: string;
  size: CardSize;
}

const FONT = "'Inter Variable', Inter, system-ui, -apple-system, 'Segoe UI', sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

/**
 * OKLCH to `rgba()`, done here rather than handed to the canvas.
 *
 * The site's whole palette is OKLCH, and a canvas in a current browser does
 * accept it — but one that does not silently ignores the assignment and keeps
 * whatever `fillStyle` held before, so an older browser would not fail, it would
 * quietly produce a card in the wrong colours and share it. Converting makes the
 * output identical everywhere.
 *
 * Straight OKLab → linear sRGB → sRGB, clamped into gamut by clipping, which is
 * enough for a palette that was chosen to be displayable in the first place.
 */
function oklch(l: number, c: number, hue: number, alpha = 1): string {
  const h = (hue * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);

  const lp = l + 0.3963377774 * a + 0.2158037573 * b;
  const mp = l - 0.1055613458 * a - 0.0638541728 * b;
  const sp = l - 0.0894841775 * a - 1.291485548 * b;

  const L = lp * lp * lp;
  const M = mp * mp * mp;
  const S = sp * sp * sp;

  const linear = [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ];

  const channel = (v: number): number => {
    const encoded = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, encoded)) * 255);
  };

  return `rgba(${channel(linear[0]!)}, ${channel(linear[1]!)}, ${channel(linear[2]!)}, ${alpha})`;
}

/** Wraps text to a width, returning the lines. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];

  for (const paragraph of text.split(/\n+/)) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth || !line) {
        line = candidate;
      } else {
        lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
  }

  return lines;
}

/**
 * Finds the largest type size at which the quote still fits its box.
 *
 * A fixed size would mean a six-word quote floating in a third of the card and
 * a long one running off the bottom. Binary search rather than a loop of steps
 * because the measurement is the expensive part and this needs about six of
 * them instead of forty.
 */
function fitQuote(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  bounds: { min: number; max: number },
): { size: number; lines: string[]; lineHeight: number } {
  let low = bounds.min;
  let high = bounds.max;
  let best = { size: bounds.min, lines: [] as string[], lineHeight: bounds.min * 1.32 };

  for (let step = 0; step < 7; step++) {
    const size = Math.round((low + high) / 2);
    ctx.font = `700 ${size}px ${FONT}`;
    const lines = wrapText(ctx, text, maxWidth);
    const lineHeight = size * 1.32;

    if (lines.length * lineHeight <= maxHeight) {
      best = { size, lines, lineHeight };
      low = size + 1;
    } else {
      high = size - 1;
    }
  }

  // Nothing fit even at the floor: clip to the lines that do and mark the cut.
  if (best.lines.length === 0) {
    ctx.font = `700 ${bounds.min}px ${FONT}`;
    const lineHeight = bounds.min * 1.32;
    const lines = wrapText(ctx, text, maxWidth).slice(0, Math.floor(maxHeight / lineHeight));
    if (lines.length > 0) lines[lines.length - 1] += '…';
    best = { size: bounds.min, lines, lineHeight };
  }

  return best;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Draws the card and hands back a PNG.
 *
 * `document.fonts.ready` is awaited first because a canvas silently falls back
 * to a system font for anything not yet loaded — and the card would come out in
 * the wrong typeface with no error to notice.
 */
export async function drawQuoteCard(options: QuoteCardOptions): Promise<Blob> {
  const { w, h } = SIZES[options.size];
  const portrait = options.size === 'story';
  const wide = options.size === 'wide';

  try {
    await document.fonts.ready;
  } catch {
    // No Font Loading API: the system stack is a acceptable outcome, a thrown
    // error on the way to a share sheet is not.
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');

  const pad = wide ? 72 : 88;
  const accent = oklch(0.72, 0.15, options.hue);
  const accentSoft = oklch(0.62, 0.17, options.hue);

  /* ── Canvas ── */
  ctx.fillStyle = '#0b111c';
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.5, portrait ? h * 0.2 : 0, 0, w * 0.5, portrait ? h * 0.2 : 0, w * 0.95);
  glow.addColorStop(0, oklch(0.5, 0.16, options.hue, 0.55));
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const corner = ctx.createRadialGradient(w * 0.08, h, 0, w * 0.08, h, w * 0.7);
  corner.addColorStop(0, oklch(0.42, 0.14, options.hue, 0.42));
  corner.addColorStop(1, 'transparent');
  ctx.fillStyle = corner;
  ctx.fillRect(0, 0, w, h);

  // The same faint grid the shorts and the posters carry.
  ctx.strokeStyle = 'rgba(255,255,255,0.035)';
  ctx.lineWidth = 1;
  const gap = Math.round(w / 14);
  for (let x = gap; x < w; x += gap) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
    ctx.stroke();
  }
  for (let y = gap; y < h; y += gap) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
    ctx.stroke();
  }

  // The accent edge, so the card is identifiable at thumbnail size.
  ctx.fillStyle = accentSoft;
  ctx.fillRect(0, 0, 10, h);

  /* ── Wordmark and category ── */
  const markSize = wide ? 30 : 36;
  ctx.textBaseline = 'alphabetic';
  ctx.font = `800 ${markSize}px ${FONT}`;
  ctx.fillStyle = accent;
  ctx.fillText('MS', pad, pad + markSize);
  const msWidth = ctx.measureText('MS').width;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('DEVBUILD', pad + msWidth, pad + markSize);

  const chipFont = wide ? 20 : 24;
  ctx.font = `700 ${chipFont}px ${FONT}`;
  const chipLabel = options.category.toUpperCase();
  const chipWidth = ctx.measureText(chipLabel).width + chipFont * 2;
  const chipHeight = chipFont * 2.1;
  const chipX = w - pad - chipWidth;
  const chipY = pad + markSize / 2 - chipHeight / 2 + 4;
  ctx.fillStyle = oklch(0.62, 0.17, options.hue, 0.2);
  roundedRect(ctx, chipX, chipY, chipWidth, chipHeight, chipHeight / 2);
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(chipLabel, chipX + chipWidth / 2, chipY + chipHeight / 2 + 1);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  /* ── Footer, measured first so the quote knows its ceiling ── */
  const titleSize = wide ? 24 : 30;
  const domainSize = wide ? 20 : 25;
  ctx.font = `600 ${titleSize}px ${FONT}`;
  const titleLines = wrapText(ctx, options.title, w - pad * 2).slice(0, 2);
  const footerHeight = titleLines.length * titleSize * 1.36 + domainSize * 2.4 + 28;

  /* ── The quote ── */
  const quoteTop = pad + markSize + (wide ? 56 : 84);
  const quoteBottom = h - pad - footerHeight;
  const glyphSize = wide ? 90 : 132;

  ctx.font = `800 ${glyphSize}px Georgia, ${FONT}`;
  ctx.fillStyle = oklch(0.72, 0.15, options.hue, 0.28);
  ctx.fillText('“', pad - glyphSize * 0.06, quoteTop + glyphSize * 0.7);

  const textTop = quoteTop + glyphSize * 0.82;
  const { size, lines, lineHeight } = fitQuote(
    ctx,
    options.quote,
    w - pad * 2,
    Math.max(quoteBottom - textTop, lineHeightFloor(wide)),
    wide ? { min: 26, max: 54 } : { min: 32, max: portrait ? 82 : 68 },
  );

  ctx.font = `700 ${size}px ${FONT}`;
  ctx.fillStyle = '#f2f5fa';
  lines.forEach((line, index) => {
    ctx.fillText(line, pad, textTop + (index + 1) * lineHeight - lineHeight * 0.24);
  });

  /* ── Footer ── */
  const ruleY = h - pad - footerHeight + 8;
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, ruleY);
  ctx.lineTo(pad + 96, ruleY);
  ctx.stroke();

  ctx.font = `600 ${titleSize}px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  titleLines.forEach((line, index) => {
    ctx.fillText(line, pad, ruleY + 34 + index * titleSize * 1.36);
  });

  ctx.font = `500 ${domainSize}px ${MONO}`;
  ctx.fillStyle = accent;
  ctx.fillText(
    options.domain,
    pad,
    ruleY + 34 + titleLines.length * titleSize * 1.36 + domainSize * 1.2,
  );

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('could not encode the card'))),
      'image/png',
    );
  });
}

function lineHeightFloor(wide: boolean): number {
  return wide ? 34 : 42;
}

/**
 * Hands the card to the reader — the share sheet where there is one, a download
 * everywhere else.
 *
 * The share sheet matters more than it looks: on a phone it puts the image
 * straight into LinkedIn or Instagram, where a downloaded file means opening
 * Files, finding it, and by then the moment has passed.
 */
export async function shareCard(
  blob: Blob,
  filename: string,
  text: string,
): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], filename, { type: 'image/png' });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return 'shared';
    } catch (error) {
      // A cancelled share throws exactly like a failed one. Treat the cancel as
      // done rather than dumping a file the reader did not ask for.
      if ((error as Error)?.name === 'AbortError') return 'shared';
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return 'downloaded';
}
