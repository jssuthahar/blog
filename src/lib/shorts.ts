import { CATEGORY_SLUGS, TOPIC_GROUPS, type CategorySlug } from './taxonomy';

/**
 * Short videos — the vertical, stage-by-stage shorts in
 * `src/content/Real/<Technology>/`.
 *
 * Each one is three files sharing a filename stem:
 *
 *   <slug>.html       the self-contained 1080×1920 player (DOM + CSS + JS)
 *   <slug>.spec.json  the machine-readable script: title, stages, ending
 *   <slug>.md         the social caption and hashtags
 *
 * Nothing here is registered as an Astro content collection, because the short
 * is not Markdown — the `.spec.json` already carries every field a page needs.
 * So the folder IS the schema: drop a new technology folder in with those three
 * files and it appears on /shorts, in the category filter, in the search
 * index, in the sitemap and in llms.txt with no other edit anywhere. That is
 * deliberate — these get produced in batches, and a format that needs a code
 * change per short stops being used by the third one.
 *
 * The one convention to keep: the folder name is the technology, and the
 * filename stem is the URL.
 */

/** One beat of the short — a single idea, held on screen for `durationMs`. */
export interface ShortStage {
  title: string;
  /** The phrase inside `title` the short highlights. */
  key?: string;
  desc: string;
  /** Runtime status line shown under the caption. */
  status?: string;
  durationMs: number;
}

export interface Short {
  slug: string;
  /** Folder name as written on disk, e.g. `DesignPattern`. */
  folder: string;
  /** Human form of the folder, e.g. `Design Pattern`. */
  folderLabel: string;
  /** Site taxonomy category — what the filter chips and the accent colour use. */
  category: CategorySlug;
  /** Plain-language subject, e.g. "How Netflix works internally". */
  topic: string;
  /**
   * What a viewer walks away knowing — three short lines, from `learn` in the
   * spec.
   *
   * A short sells itself on a hook, and a hook is deliberately not an
   * explanation: "Everyone confuses these two" says nothing about what the
   * thirty seconds contain. This is the other half — the plain answer to "what
   * do I get out of this one", on the hub card before you click and on the page
   * before you press play. It is also the part an answer engine can quote,
   * because it is the only place the short states its own scope in prose.
   *
   * Empty when a spec has none, and every surface treats it as optional: a
   * short handed over without the field still publishes everywhere.
   */
  learn: string[];
  /** Headline with the short's own <em> emphasis kept. */
  titleHtml: string;
  /** Same headline as plain text — for <title>, OG tags and JSON-LD. */
  title: string;
  /** One-sentence lede under the headline. */
  sub: string;
  /** The short's own badge, e.g. "8 stages · 20 sec · Python basics". */
  pill: string;
  /**
   * What goes in <title>, brand suffix included. The headline is written to
   * stop a thumb mid-scroll, which is not the same job as fitting Google's
   * ~600px title budget — `seoTitle` in the spec overrides it when the two
   * pull apart. See `titleFor`.
   */
  seoTitle: string;
  /** Meta description, built to land inside Google's rendered width. */
  description: string;
  stages: ShortStage[];
  /** The closing card: the thing to remember once the short loops out. */
  end: { title: string; sub: string };
  /** Social caption from the .md twin. */
  caption: string;
  /** Hashtags with the leading # stripped, used as keywords. */
  tags: string[];
  /** Total runtime in seconds, end card included. */
  seconds: number;
  /**
   * The article this short is the doorway to, from `article` in the spec.
   *
   * A short states an idea; the article is where it is worked out. When the
   * spec names one, "Learn more" in the app feed goes straight there. Left out,
   * the feed picks the closest published post by category and tags — see
   * `learnMoreFor` in lib/app-feed.ts — so this is an override, not a
   * requirement.
   */
  articleSlug?: string;
  /**
   * Publication date, from `publishedAt` in the spec.
   *
   * Optional, and deliberately not defaulted. A short with a date counts as
   * dated evidence on /contributions — the record an MVP review reads — and a
   * guessed date there would be worse than no row at all. Undated shorts still
   * publish and still appear everywhere else; they just stay out of the log.
   */
  publishedAt?: Date;
  /**
   * When the short was last re-cut, from `updatedAt` in the spec.
   *
   * Same field the blog posts carry, for the same reason: freshness is a
   * ranking signal, and a short whose steps were rewritten deserves to say so
   * rather than reading as a year-old file. Optional and never defaulted — a
   * short that has not changed since it went out has no update to show, and
   * `dateModified` falls back to `publishedAt`.
   */
  updatedAt?: Date;
  /** The player HTML, prepared for embedding. See `prepareForEmbed`. */
  embedHtml: string;
}

/** How long the short holds its closing card. Matches END_CARD_MS in the player. */
const END_CARD_MS = 2600;

/**
 * Technology folder → site category.
 *
 * Only the folders whose name is not already a category slug need an entry. A
 * folder called `Azure` or `Mobile` resolves on its own, so the common case
 * needs nothing here at all.
 */
const FOLDER_CATEGORY: Record<string, CategorySlug> = {
  python: 'programming',
  dotnet: 'programming',
  csharp: 'programming',
  'c#': 'programming',
  java: 'programming',
  javascript: 'web',
  typescript: 'web',
  designpattern: 'architecture',
  designpatterns: 'architecture',
  systemdesign: 'architecture',
  flutter: 'mobile',
  maui: 'mobile',
  dotnetmaui: 'mobile',
  android: 'mobile',
  ios: 'mobile',
  firebase: 'mobile',
  react: 'web',
  blazor: 'web',
  webapi: 'web',
  aspnet: 'web',
  githubcopilot: 'copilot',
  copilot: 'copilot',
  docker: 'devops',
  kubernetes: 'devops',
  githubactions: 'devops',
  security: 'engineering',
  performance: 'engineering',
};

function categoryForFolder(folder: string): CategorySlug {
  const key = folder.toLowerCase().replace(/[^a-z0-9#]/g, '');
  if ((CATEGORY_SLUGS as readonly string[]).includes(key)) return key as CategorySlug;
  // An unmapped folder still publishes — it just lands under Engineering rather
  // than failing the build. A missing short is worse than an imperfect chip.
  return FOLDER_CATEGORY[key] ?? 'engineering';
}

/** `DesignPattern` → `Design Pattern`, `Azure` → `Azure`. */
function humaniseFolder(folder: string): string {
  return folder
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim();
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Reads a date field off a spec.
 *
 * A malformed date warns and is dropped rather than becoming an Invalid Date
 * that silently poisons the sort and prints "NaN" into the contribution record.
 */
function parseDate(
  value: string | undefined,
  source: string,
  field: 'publishedAt' | 'updatedAt' = 'publishedAt',
): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    console.warn(`[shorts] ${source}: ${field} "${value}" is not a valid date — ignored`);
    return undefined;
  }
  return date;
}

/**
 * The meta description.
 *
 * Google renders descriptions in ~Arial 14px and truncates around 1000px, and
 * flags anything under ~500px as too thin to earn a click — `npm run check:seo`
 * measures the built page against exactly that. A short's lede is written for a
 * title card, so on its own it often lands under the floor. Naming the format
 * closes the gap with something a searcher genuinely wants to know before
 * clicking: that this is twenty seconds of short, and that it is also
 * written out.
 *
 * The cap is characters rather than pixels because this is the coarse guard —
 * the pixel measurement is the gate, and it runs over the built HTML.
 */
const DESC_CHAR_CAP = 158;

function describe(sub: string, seconds: number): string {
  const suffix = `A ${seconds}-second short video, step by step.`;
  const full = `${sub} ${suffix}`;
  if (full.length <= DESC_CHAR_CAP) return full;
  return sub.length <= DESC_CHAR_CAP ? sub : `${sub.slice(0, DESC_CHAR_CAP - 1).trimEnd()}…`;
}

/**
 * Prepares a short for embedding on the site.
 *
 * Three jobs, in order of how much they matter:
 *
 * 1. Take the download affordances out. The standalone player ships a
 *    record-and-save button (and a `D` shortcut) so a short can be captured for
 *    LinkedIn or YouTube. That belongs to the author, not to every visitor, so
 *    the control and its hint are removed and the shortcut is dropped.
 *
 * 2. Turn the sound on by default. The standalone player boots with
 *    `soundOn = false` and waits for the toggle, which is right for a file you
 *    open to record. Opening a short on the site is already the decision to
 *    watch one, so it starts with sound and the toggle turns it OFF instead.
 *
 * 3. Add a control bridge, so the page around the player can drive it — jump to
 *    a step, replay — and can follow along as the short advances.
 *
 * What actually ENFORCES no-download is the iframe sandbox in
 * ShortPlayer.astro, not this function: without `allow-downloads` and
 * `allow-same-origin`, the anchor-click save path is blocked by the browser and
 * screen capture is denied by permissions policy. The edits here are the
 * user-facing half — no button inviting a save that the sandbox would refuse.
 * Each replacement is optional: shorts are generated from an evolving template
 * and a missed match must never break the short.
 */
function prepareForEmbed(html: string, source: string): string {
  const embed = html
    // The record button, its title-screen hint, and the keyboard shortcut.
    .replace(/<div id="record-toggle"[\s\S]*?<\/div>\s*/i, '')
    .replace(/<div id="rec-hint">[\s\S]*?<\/div>\s*/i, '')
    .replace(/var recordBtn = document\.getElementById\('record-toggle'\);/, 'var recordBtn = null;')
    .replace(/recordBtn\.addEventListener\([\s\S]*?\}\);\s*/, '')
    .replace(/if\(e\.key === 'd' \|\| e\.key === 'D'\)\{[^}]*\}\s*/, '')
    // Sound on from the first frame. Only the effects bus — `musicOn` stays
    // off, because the ambient bed is a scoring layer for recording, not
    // something to put under a reader who came to understand a concept.
    .replace(/(\bvar actx = null,\s*soundOn\s*=\s*)false/, '$1true')
    .replace('window.MSD = MSD;', `window.MSD = MSD;\n${controlBridge(html, source)}`);

  return embed.replace('</body>', `${BRIDGE_SCRIPT}\n</body>`);
}

/**
 * The symbols the control bridge stands on. Every one is either a hoisted
 * function declaration or a `var` in the player's single IIFE, so a closure
 * installed at `window.MSD = MSD;` can reach all of them — and by the time a
 * visitor clicks anything, every assignment has run.
 *
 * `restart` is deliberately NOT on this list even though some shorts have one.
 * The newer generator dropped the named function and inlined its body into the
 * R-key handler, so two of the three shorts in the repo have no `restart` at
 * all — a bridge that called it would throw on exactly the shorts written most
 * recently. Replay is built from `jump(0)` instead, which is the same four
 * lines and exists everywhere.
 */
const REQUIRED_SYMBOLS = [
  'function goto(',
  'function clearStageTimers(',
  'function start(',
  'function ensureAudio(',
  'var stageEl',
  'var STAGE_HTML_SNAPSHOT',
  'var endCard',
  'seqTimer',
  'STAGES',
] as const;

/**
 * Builds the in-player control object — or nothing at all, if the short does not
 * look like the template this depends on.
 *
 * The point is what happens when the generator changes again. Shorts arrive in
 * batches from an evolving template, and a bridge that assumed too much would
 * fail at runtime, in an iframe, on one short, where nobody would notice for
 * weeks. Checking first turns that into a build-time warning naming the file,
 * and the page degrades to exactly what it is without JavaScript: the short
 * autoplays, the steps are still written out, and only the jump goes quiet.
 */
function controlBridge(html: string, source: string): string {
  const missing = REQUIRED_SYMBOLS.filter((symbol) => !html.includes(symbol));
  if (missing.length > 0) {
    console.warn(
      `[shorts] ${source}: player template has changed (no ${missing.join(', ')}) — ` +
        'step-jump and replay are disabled for this short. The short itself still plays.',
    );
    return '';
  }

  return `  function msdJump(i){
    if(i < 0 || i >= STAGES.length) return;
    /* Reset to the authored markup before jumping, so a step opened out of
       order paints from the same baseline the short itself starts from. */
    clearTimeout(seqTimer); clearStageTimers();
    endCard.classList.remove('show');
    stageEl.innerHTML = STAGE_HTML_SNAPSHOT;
    var titleScreen = document.getElementById('title-screen');
    if(titleScreen) titleScreen.classList.add('hide');
    running = true;
    goto(i);
  }
  window.__MSD_CTRL__ = {
    play: function(){ start(); },
    replay: function(){ msdJump(0); },
    jump: msdJump,
    count: function(){ return STAGES.length; },
    /* Creates the AudioContext, or resumes it if the autoplay policy handed it
       back suspended. Called on every user gesture until sound is actually
       running, since only a gesture can lift that block. */
    audio: function(){
      ensureAudio();
      try { if(actx && actx.state === 'suspended') actx.resume(); } catch (e) {}
      return !!actx && actx.state === 'running';
    }
  };`;
}

/**
 * Re-anchors the sound toggle.
 *
 * In the shorts that ship a record button, it is the record button that carries
 * `margin-left:auto` and pushes both controls to the right edge of the top bar.
 * Take it away and the sound toggle collapses back against the wordmark. This
 * restates the rule on the toggle itself, which is where the shorts without a
 * record button already put it — so the two variants end up identical.
 */
const EMBED_STYLE = `<style>#topbar #sound-toggle{ margin-left:auto; }</style>`;

/**
 * Runs inside the iframe. Talks to the page over postMessage — the frame is
 * sandboxed into an opaque origin, so this is the only channel there is.
 *
 * Current step is read off `#stage-num` rather than by patching the sequencer:
 * the short repaints that element on every stage it enters, whoever caused it,
 * so one observer stays correct no matter how the player's internals change.
 */
const BRIDGE_SCRIPT = `${EMBED_STYLE}
<script>
(function(){
  function post(msg){ try { parent.postMessage(msg, '*'); } catch (e) {} }

  /* Save-as, print, view-source and drag-out, turned off. The sandbox is what
     actually blocks a download; this stops the gestures that would look like
     they should work. Anything on a screen can still be filmed off it. */
  ['contextmenu','dragstart','selectstart'].forEach(function(type){
    document.addEventListener(type, function(e){ e.preventDefault(); }, true);
  });
  document.addEventListener('keydown', function(e){
    var k = (e.key || '').toLowerCase();
    if((e.ctrlKey || e.metaKey) && (k === 's' || k === 'p' || k === 'u')) e.preventDefault();
    if(k === 'd') e.preventDefault();
  }, true);

  /* ------------------------------------------------------------- sound ----
     The player owns its own toggle and its own audio graph, so the page never
     reaches into either — it clicks the button the short already ships and
     reads the state back off it. The player's own paintToggle sets opacity to
     '1' when the effects bus is live and '0.35' when it is not, and an
     untouched toggle has no inline opacity at all, which is the on state
     prepareForEmbed boots in.
     One property, set by the player itself, is a more durable reading than a
     variable this script would have to be spliced into.  */
  function soundBtn(){ return document.getElementById('sound-toggle'); }
  function soundIsOn(){ var b = soundBtn(); return !!b && b.style.opacity !== '0.35'; }

  window.addEventListener('message', function(e){
    var data = e.data || {}, ctrl = window.__MSD_CTRL__;
    if(!ctrl || typeof data.type !== 'string') return;
    if(data.type === 'msd:play') ctrl.play();
    if(data.type === 'msd:replay') ctrl.replay();
    if(data.type === 'msd:jump') ctrl.jump(Number(data.index));
    if(data.type === 'msd:sound'){
      /* Unmuting is itself a user gesture upstream, so try the audio context
         again — a short muted before the page had activation would otherwise
         come back silent. */
      var btn = soundBtn();
      if(btn && soundIsOn() !== !!data.on) btn.click();
      if(data.on) unlock();
      post({ type: 'msd:sound', on: soundIsOn() });
    }
  });

  /* ------------------------------------------------------ autoplay + sound --
     Opening a short is already the decision to watch one, so it starts itself
     rather than showing a tap-to-play card the visitor has to dismiss.

     Sound is a separate fight. Browsers refuse to start an AudioContext until
     the document has been interacted with, and a sandboxed frame starts with no
     user activation of its own — so the picture plays immediately and the audio
     may stay silent until the first tap. That is the browser's call, not a
     setting: nothing can autoplay audible sound from a cold load. What this does
     is make sure the sound is ARMED, so the very first touch anywhere — on the
     short or on the page around it — brings it in, with no toggle to find.  */
  var audioLive = false;
  function unlock(){
    if(audioLive) return;
    try {
      var ctrl = window.__MSD_CTRL__;
      if(ctrl && ctrl.audio) audioLive = ctrl.audio() === true;
    } catch (e) {}
  }

  ['pointerdown','touchstart','keydown'].forEach(function(type){
    document.addEventListener(type, unlock, { capture: true, passive: true });
  });

  /* The page forwards its own first interaction, so tapping a step or the
     Replay button counts as the gesture that brings the sound in. */
  window.addEventListener('message', function(e){
    if(e.data && e.data.type === 'msd:unlock') unlock();
  });

  if(window.__MSD_CTRL__){
    unlock();
    window.__MSD_CTRL__.play();
  }

  var num = document.getElementById('stage-num');
  if(num){
    var last = -1;
    new MutationObserver(function(){
      var m = /(\\d+)\\s*\\/\\s*(\\d+)/.exec(num.textContent || '');
      if(!m) return;
      var index = Number(m[1]) - 1;
      if(index === last) return;
      last = index;
      post({ type: 'msd:stage', index: index });
    }).observe(num, { childList: true, characterData: true, subtree: true });
  }

  post({ type: 'msd:ready', sound: soundIsOn() });
})();
</script>`;

/**
 * The spec and player files, read at build time.
 *
 * `import.meta.glob` rather than `fs`, so Vite tracks the files as build inputs
 * — editing a short in `astro dev` reloads the page instead of serving a copy
 * cached from process start.
 *
 * The `.md` twin is not read here: it holds the social caption, which the spec
 * already carries under `post.caption`. It stays in the folder as the file you
 * paste into LinkedIn, not as an input to the site.
 */
const specModules = import.meta.glob<ShortSpec>('../content/Real/*/*.spec.json', {
  eager: true,
  import: 'default',
});
const htmlModules = import.meta.glob<string>('../content/Real/*/*.html', {
  eager: true,
  query: '?raw',
  import: 'default',
});
/** The shape of a `<slug>.spec.json`. Only the fields a page reads are typed. */
interface ShortSpec {
  slug: string;
  topic: string;
  /** Three lines saying what the short teaches. See `Short.learn`. */
  learn?: string[];
  /** Optional per-short <title> override. Add it when the pixel gate complains. */
  seoTitle?: string;
  /** Slug of the blog post this short introduces. Drives "Learn more" on /app. */
  article?: string;
  /** ISO date the short was published. Required for it to count on /contributions. */
  publishedAt?: string;
  /** ISO date the short was last re-cut. Optional — only set it if it changed. */
  updatedAt?: string;
  title: { main: string; sub: string; pill: string };
  stages: ShortStage[];
  end: { title: string; sub: string };
  post: { caption: string; hashtags: string[] };
}

/** `../content/Real/Python/python-mutable-vs-immutable.spec.json` → `Python`. */
function folderOf(path: string): string {
  return path.split('/').at(-2) ?? '';
}

function stemOf(path: string): string {
  return (path.split('/').at(-1) ?? '').replace(/\.(spec\.json|html|md)$/, '');
}

/**
 * Every short. Dated ones first, newest first; undated ones after, by title.
 *
 * `publishedAt` is optional, so the sort has to stay stable for shorts that
 * have no date at all — otherwise the hub would reshuffle between builds.
 */
function loadShorts(): Short[] {
  const shorts: Short[] = [];

  for (const [specPath, spec] of Object.entries(specModules)) {
    const folder = folderOf(specPath);
    const stem = stemOf(specPath);
    const dir = specPath.slice(0, specPath.lastIndexOf('/'));

    const html = htmlModules[`${dir}/${stem}.html`];
    if (!html) {
      // A spec with no player has nothing to show, and shipping a page that
      // renders an empty frame is worse than leaving the short out.
      console.warn(`[shorts] ${specPath} has no matching ${stem}.html — skipped`);
      continue;
    }

    const slug = spec.slug || stem;
    const durationMs = spec.stages.reduce((total, s) => total + s.durationMs, 0) + END_CARD_MS;
    const seconds = Math.round(durationMs / 1000);
    const title = stripTags(spec.title.main);

    shorts.push({
      slug,
      folder,
      folderLabel: humaniseFolder(folder),
      category: categoryForFolder(folder),
      topic: spec.topic,
      learn: spec.learn ?? [],
      titleHtml: spec.title.main,
      title,
      sub: spec.title.sub,
      pill: spec.title.pill,
      seoTitle: spec.seoTitle ?? title,
      description: describe(spec.title.sub, seconds),
      stages: spec.stages,
      end: spec.end,
      caption: spec.post?.caption ?? '',
      tags: (spec.post?.hashtags ?? []).map((t) => t.replace(/^#/, '')),
      seconds,
      articleSlug: spec.article,
      publishedAt: parseDate(spec.publishedAt, specPath),
      updatedAt: parseDate(spec.updatedAt, specPath, 'updatedAt'),
      embedHtml: prepareForEmbed(html, `${folder}/${stem}.html`),
    });
  }

  return shorts.sort((a, b) => {
    if (a.publishedAt && b.publishedAt) return b.publishedAt.getTime() - a.publishedAt.getTime();
    if (a.publishedAt) return -1;
    if (b.publishedAt) return 1;
    return a.title.localeCompare(b.title);
  });
}

let cache: Short[] | null = null;

/** Every short on the site. Parsed once per build. */
export function getShorts(): Short[] {
  cache ??= loadShorts();
  return cache;
}

export function getShort(slug: string): Short | undefined {
  return getShorts().find((a) => a.slug === slug);
}

export function shortUrl(short: Pick<Short, 'slug'>): string {
  return `/shorts/${short.slug}/`;
}

/**
 * Category chips for the hub, in taxonomy order with live counts. Only
 * categories that actually have a short appear — an empty filter is a dead end.
 */
export function shortCategories(
  shorts: Short[] = getShorts(),
): { slug: CategorySlug; label: string; hue: number; count: number }[] {
  return TOPIC_GROUPS.map((group) => ({
    slug: group.slug as CategorySlug,
    label: group.label,
    hue: group.hue,
    count: shorts.filter((a) => a.category === group.slug).length,
  })).filter((c) => c.count > 0);
}

/** The text a search box matches against — title, topic, steps and hashtags. */
export function shortSearchText(short: Short): string {
  return [
    short.title,
    short.topic,
    short.sub,
    short.folderLabel,
    ...short.learn,
    ...short.stages.map((s) => `${s.title} ${s.desc}`),
    ...short.tags,
  ]
    .join(' ')
    .toLowerCase();
}
