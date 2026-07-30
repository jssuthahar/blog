/**
 * The share card renderer — the image that represents this site on LinkedIn,
 * X, WhatsApp, Slack, and in Google Discover.
 *
 * Written against CanvasKit directly rather than using astro-og-canvas, which
 * this replaced: that package draws one fixed layout — logo, title,
 * description — and none of its options can express what the card needs to
 * carry, which is the brand the way the site header does: avatar, MSDEVBUILD
 * wordmark, category chip in the topic's own colour, and a footer rule with
 * the domain. CanvasKit was already the engine underneath it, so the swap
 * traded one dependency for another rather than adding one.
 */
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require_ = createRequire(import.meta.url);

const WIDTH = 1200;
const HEIGHT = 630;

/** Bumped whenever the drawing changes, so cached cards from an older design are ignored. */
const DESIGN_VERSION = 5;

const CACHE_DIR = path.resolve('./node_modules/.og-cache');

/**
 * Inter, to match the site's own type. CanvasKit needs static TTFs, and
 * `@fontsource-variable/inter` ships woff2 only — which CanvasKit cannot parse
 * — so the three weights are vendored into src/assets/fonts (SIL OFL, see the
 * licence beside them). Vendored rather than fetched: a share image is not
 * worth a deploy that fails because a font CDN was having a bad day.
 */
const FONTS = ['inter-400.ttf', 'inter-600.ttf', 'inter-700.ttf'].map((file) =>
  path.resolve('./src/assets/fonts', file),
);
const FONT_FAMILY = ['Inter'];

type RGB = [number, number, number];

export interface OGCardOptions {
  title: string;
  description?: string;
  /** Uppercase chip at the top right — the post's category label. */
  eyebrow?: string;
  /**
   * OKLCH hue of the post's category, so the card is colour-coded exactly the
   * way the category chip is on the site. Defaults to the brand blue.
   */
  hue?: number;
  /** Bottom-right line: publish date, series part, or reading time. */
  meta?: string;
}

/**
 * OKLCH → sRGB. The site defines every accent as `oklch(L C H)`, and the
 * category hues in taxonomy.ts are hue angles only — converting here means the
 * card and the page agree on the colour instead of maintaining a second
 * hard-coded palette that drifts.
 */
function oklch(l: number, c: number, hDeg: number): RGB {
  const h = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);

  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const lin = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];

  return lin.map((v) => {
    const srgb = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, Math.round(srgb * 255)));
  }) as RGB;
}

/* ---------------------------------------------------------------- loaders -- */

let canvasKit: any;
let fontMgr: any;
let avatar: Uint8Array | undefined;

async function getCanvasKit() {
  if (!canvasKit) {
    const { default: init } = await import('canvaskit-wasm/full');
    canvasKit = await init({
      locateFile: (file: string) => require_.resolve(`canvaskit-wasm/bin/full/${file}`),
    });
  }
  return canvasKit;
}

async function getFontMgr() {
  if (!fontMgr) {
    const CanvasKit = await getCanvasKit();
    const files = await Promise.all(
      FONTS.map(async (file) => {
        const data = await fs.readFile(file);
        return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
      }),
    );
    fontMgr = CanvasKit.FontMgr.FromData(...files);
  }
  return fontMgr;
}

async function getAvatar() {
  if (!avatar) avatar = await fs.readFile(path.resolve('./public/images/author.jpg'));
  return avatar;
}

/* ----------------------------------------------------------------- render -- */

export async function renderOGCard(options: OGCardOptions): Promise<Buffer> {
  const { title, description = '', eyebrow, hue = 252, meta } = options;

  const hash = createHash('sha1')
    .update(JSON.stringify([DESIGN_VERSION, title, description, eyebrow, hue, meta]))
    .digest('hex')
    .slice(0, 16);
  const cacheFile = path.join(CACHE_DIR, `${hash}.png`);
  const cached = await fs.readFile(cacheFile).catch(() => undefined);
  if (cached) return cached;

  const CanvasKit = await getCanvasKit();
  const fonts = await getFontMgr();

  const surface = CanvasKit.MakeSurface(WIDTH, HEIGHT);
  const canvas = surface.getCanvas();

  const color = (rgb: RGB, alpha = 1) => CanvasKit.Color(rgb[0], rgb[1], rgb[2], alpha);
  const fill = (rgb: RGB, alpha = 1) => {
    const paint = new CanvasKit.Paint();
    paint.setColor(color(rgb, alpha));
    paint.setAntiAlias(true);
    return paint;
  };

  /**
   * Category colour. Same hue as the site's `oklch(0.62 0.17 <hue>)` chips,
   * lifted a little in lightness because these sit on a dark navy card rather
   * than the site's light surface.
   */
  const accent = oklch(0.7, 0.15, hue);
  const accentDeep = oklch(0.5, 0.15, hue);
  const accentLight = oklch(0.84, 0.09, hue);

  const INK: RGB = [255, 255, 255];
  const MUTED: RGB = [166, 178, 200];
  const FAINT: RGB = [124, 137, 161];

  // Layout grid. The spine is part of the frame, so content starts clear of it.
  const SPINE = 14;
  const LEFT = 86;
  const RIGHT = WIDTH - 72;
  const CONTENT = RIGHT - LEFT;

  /* Background — a deep navy gradient on the diagonal, so the card reads as
     one surface rather than a flat block behind flat text. */
  const bg = new CanvasKit.Paint();
  bg.setShader(
    CanvasKit.Shader.MakeLinearGradient(
      [0, 0],
      [WIDTH, HEIGHT],
      [color([13, 18, 30]), color([25, 34, 56])],
      null,
      CanvasKit.TileMode.Clamp,
    ),
  );
  canvas.drawRect(CanvasKit.XYWHRect(0, 0, WIDTH, HEIGHT), bg);

  // Faint engineering grid. Barely visible at full size, but it stops large
  // empty areas of the card from looking like a rendering failure.
  const grid = fill([255, 255, 255], 0.028);
  for (let x = SPINE; x < WIDTH; x += 48) canvas.drawRect(CanvasKit.XYWHRect(x, 0, 1, HEIGHT), grid);
  for (let y = 0; y < HEIGHT; y += 48) canvas.drawRect(CanvasKit.XYWHRect(0, y, WIDTH, 1), grid);

  // Category-coloured glow behind the top-right corner.
  const glow = new CanvasKit.Paint();
  glow.setShader(
    CanvasKit.Shader.MakeRadialGradient(
      [WIDTH - 190, -40],
      560,
      [color(accent, 0.32), color(accent, 0)],
      null,
      CanvasKit.TileMode.Clamp,
    ),
  );
  canvas.drawRect(CanvasKit.XYWHRect(0, 0, WIDTH, HEIGHT), glow);

  // Left spine, in the category colour.
  const spine = new CanvasKit.Paint();
  spine.setShader(
    CanvasKit.Shader.MakeLinearGradient(
      [0, 0],
      [0, HEIGHT],
      [color(accent), color(accentDeep)],
      null,
      CanvasKit.TileMode.Clamp,
    ),
  );
  canvas.drawRect(CanvasKit.XYWHRect(0, 0, SPINE, HEIGHT), spine);

  /* -------------------------------------------------------------- text --- */

  const style = (o: {
    size: number;
    weight?: number;
    color?: RGB;
    alpha?: number;
    lineHeight?: number;
    letterSpacing?: number;
  }) =>
    new CanvasKit.TextStyle({
      color: color(o.color ?? INK, o.alpha ?? 1),
      fontFamilies: FONT_FAMILY,
      fontSize: o.size,
      fontStyle: { weight: { value: o.weight ?? 400 } },
      heightMultiplier: o.lineHeight ?? 1.2,
      letterSpacing: o.letterSpacing ?? 0,
    });

  /** Build and lay out one paragraph. `parts` lets a line mix styles. */
  const paragraph = (
    parts: { text: string; style: any }[],
    width: number,
    opts: { maxLines?: number; align?: 'left' | 'right' } = {},
  ) => {
    const builder = CanvasKit.ParagraphBuilder.Make(
      new CanvasKit.ParagraphStyle({
        textStyle: parts[0].style,
        textAlign: opts.align === 'right' ? CanvasKit.TextAlign.Right : CanvasKit.TextAlign.Left,
        maxLines: opts.maxLines,
        ellipsis: opts.maxLines ? '…' : undefined,
      }),
      fonts,
    );
    for (const part of parts) {
      builder.pushStyle(part.style);
      builder.addText(part.text);
      builder.pop();
    }
    const para = builder.build();
    para.layout(width);
    return para;
  };

  /* Header: avatar + wordmark, mirroring the site header so the card and the
     page a reader lands on are recognisably the same product. */
  const AV = 72;
  const avTop = 56;
  const avImage = CanvasKit.MakeImageFromEncoded(await getAvatar());
  if (avImage) {
    canvas.save();
    canvas.clipRRect(
      CanvasKit.RRectXY(CanvasKit.XYWHRect(LEFT, avTop, AV, AV), AV / 2, AV / 2),
      CanvasKit.ClipOp.Intersect,
      true,
    );
    canvas.drawImageRect(
      avImage,
      CanvasKit.XYWHRect(0, 0, avImage.width(), avImage.height()),
      CanvasKit.XYWHRect(LEFT, avTop, AV, AV),
      new CanvasKit.Paint(),
    );
    canvas.restore();

    const ring = fill(INK, 0.22);
    ring.setStyle(CanvasKit.PaintStyle.Stroke);
    ring.setStrokeWidth(2);
    canvas.drawCircle(LEFT + AV / 2, avTop + AV / 2, AV / 2 - 1, ring);
  }

  const wordmarkX = LEFT + AV + 22;
  const wordmark = paragraph(
    [
      { text: 'MS', style: style({ size: 34, weight: 700, color: accentLight }) },
      { text: 'DEVBUILD', style: style({ size: 34, weight: 700 }) },
      { text: '  / blog', style: style({ size: 34, weight: 400, color: MUTED }) },
    ],
    CONTENT,
    { maxLines: 1 },
  );
  canvas.drawParagraph(wordmark, wordmarkX, avTop + 4);

  const byline = paragraph(
    [{ text: 'Suthahar Jegatheesan · Cloud, AI & Mobile Solutions Architect', style: style({ size: 18, color: FAINT }) }],
    CONTENT - (wordmarkX - LEFT),
    { maxLines: 1 },
  );
  canvas.drawParagraph(byline, wordmarkX, avTop + 46);

  /* Category chip, right-aligned on the header row. Drawn as a measured pill
     rather than a fixed width so long labels ("GitHub Copilot") still fit. */
  if (eyebrow) {
    const label = paragraph(
      [{ text: eyebrow.toUpperCase(), style: style({ size: 17, weight: 600, color: accentLight, letterSpacing: 1.6 }) }],
      CONTENT,
      { maxLines: 1 },
    );
    const textWidth = Math.ceil(label.getLongestLine());
    const padX = 22;
    const pillW = textWidth + padX * 2;
    const pillH = 44;
    const pillX = RIGHT - pillW;
    const pillY = avTop + (AV - pillH) / 2;
    const pill = CanvasKit.RRectXY(CanvasKit.XYWHRect(pillX, pillY, pillW, pillH), pillH / 2, pillH / 2);

    canvas.drawRRect(pill, fill(accent, 0.16));
    const pillStroke = fill(accent, 0.45);
    pillStroke.setStyle(CanvasKit.PaintStyle.Stroke);
    pillStroke.setStrokeWidth(1.5);
    canvas.drawRRect(pill, pillStroke);

    label.layout(textWidth + 2);
    canvas.drawParagraph(label, pillX + padX, pillY + 11);
  }

  /* Title + description, bottom-anchored above the footer rule. Anchoring to
     the bottom keeps the gap to the footer identical on every card; a
     top-anchored block would make one-line and three-line titles sit at
     visibly different distances from it. */
  const titlePara = paragraph(
    [{ text: title, style: style({ size: 56, weight: 700, lineHeight: 1.14 }) }],
    1000,
    { maxLines: 3 },
  );
  // Three lines fit a full 170-character description without an ellipsis —
  // the description is the meta description too, and a share card that cuts it
  // mid-sentence loses the one line that explains why the post is worth a click.
  const descPara = description
    ? paragraph([{ text: description, style: style({ size: 26, color: MUTED, lineHeight: 1.45 }) }], 1000, {
        maxLines: 3,
      })
    : undefined;

  const GAP = 26;
  const BLOCK_BOTTOM = 502;
  const blockH = titlePara.getHeight() + (descPara ? GAP + descPara.getHeight() : 0);
  const blockTop = Math.max(172, BLOCK_BOTTOM - blockH);

  canvas.drawParagraph(titlePara, LEFT, blockTop);
  if (descPara) canvas.drawParagraph(descPara, LEFT, blockTop + titlePara.getHeight() + GAP);

  /* Footer: hairline rule, domain, and optional meta. */
  canvas.drawRect(CanvasKit.XYWHRect(LEFT, 524, CONTENT, 1), fill(INK, 0.12));

  const domain = paragraph(
    [{ text: 'blog.msdevbuild.com', style: style({ size: 21, weight: 600, color: accentLight, alpha: 0.9 }) }],
    CONTENT,
    { maxLines: 1 },
  );
  canvas.drawParagraph(domain, LEFT, 550);

  if (meta) {
    const metaPara = paragraph([{ text: meta, style: style({ size: 21, color: FAINT }) }], CONTENT, {
      maxLines: 1,
      align: 'right',
    });
    canvas.drawParagraph(metaPara, LEFT, 550);
  }

  const bytes = surface.makeImageSnapshot().encodeToBytes(CanvasKit.ImageFormat.PNG, 100);
  surface.dispose();
  const png = Buffer.from(bytes ?? new Uint8Array());

  await fs.mkdir(CACHE_DIR, { recursive: true }).catch(() => {});
  await fs.writeFile(cacheFile, png).catch(() => {});

  return png;
}
