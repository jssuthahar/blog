/**
 * Ask Nimbus chat logic, loaded on first use (AskNimbus.astro loads it when the
 * reader opens the chat, taps a [data-nimbus-open] button, or another part of
 * the site sends a nimbus-chat event). Same character and feel as the Nimbus
 * on azure.msdevbuild.com, built around articles instead of exams.
 *
 * No AI service: answers are ranked in the browser from the site's own search
 * index, the article's FAQ and the article's rendered sections.
 */
import { makeRanker, rank, type Ranker } from './rank';
import { canSpeak, speak, stopSpeaking, readableText } from './speech';
import { miniSvg, currentSkin } from './skins';
import { hint } from '@msdevbuild/config/account';
import { getResume, getStats } from '../reading-history';

/* ---------- data shapes ---------- */
interface SiteItem { title: string; url: string; kind: string; category: string; text: string; external: boolean }
interface QuizQ { id?: string; q: string; o: string[]; a: number; e: string; exam?: string; skill?: string; from?: { title: string; url: string } }
interface Extra { latest: { title: string; url: string; category: string; minutes: number }[]; series: { title: string; url: string; parts: number }[]; quiz: QuizQ[] }
interface LinkT { title: string; url: string; label?: string }
interface PageCtx { title: string; url: string; description: string; highlight: string; minutes: number; category: string; faq: { q: string; a: string }[]; quiz: QuizQ[]; next: LinkT | null; prev: LinkT | null; related: LinkT[]; short: LinkT | null }
interface Para { heading: string; anchor: HTMLElement | null; node: HTMLElement | null; text: string; faq?: boolean }

const TOPICS = ['Azure', 'AI agents', '.NET MAUI', 'GitHub Copilot', 'Flutter', 'System design'];

let mounted = false;
export function mountChat() {
  if (mounted) return;
  mounted = true;

  const root = document.getElementById('ask')!;
  const fab = document.getElementById('ask-fab') as HTMLButtonElement;
  const panel = document.getElementById('ask-panel')!;
  const log = document.getElementById('ask-log')!;
  const form = document.getElementById('ask-form') as HTMLFormElement;
  const input = document.getElementById('ask-q') as HTMLInputElement;
  const chip = document.getElementById('ask-exam')!;

  let started = false;
  let ctx: PageCtx | null = null;
  let ctxUrl = '';
  let paras: Para[] = [];
  let artRanker: Ranker | null = null;
  let pendingHello = false;

  /* ---------- small DOM helpers ---------- */
  const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = '') => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  };
  const link = (text: string, href: string, cls = 'ask-link', external = false) => {
    const a = el('a', cls, text);
    a.href = href;
    if (external) { a.target = '_blank'; a.rel = 'noopener'; }
    return a;
  };
  const text = (s: string) => el('p', '', s);
  const scrollDown = () => requestAnimationFrame(() => (log.scrollTop = log.scrollHeight));
  const scrollTo = (n: HTMLElement) => requestAnimationFrame(() => requestAnimationFrame(() => (log.scrollTop = n.offsetTop - log.offsetTop - 8)));
  const row = (...nodes: Node[]) => { const w = el('div', 'ask-chips'); w.append(...nodes); return w; };
  const list = (items: string[]) => { const ul = el('ul', 'ask-list'); for (const i of items) ul.append(el('li', '', i)); return ul; };
  const short = (s: string, max = 460) => {
    if (s.length <= max) return s;
    const cut = s.slice(0, max);
    const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '));
    return (end > 200 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '')) + ' …';
  };
  const chips = (items: { label: string; on: () => void }[]) => {
    const w = el('div', 'ask-chips');
    for (const it of items) {
      const c = el('button', 'ask-chip', it.label);
      c.type = 'button';
      c.addEventListener('click', it.on);
      w.append(c);
    }
    return w;
  };

  /* ---------- Nimbus in the header: mood follows the chat ---------- */
  type Mood = 'idle' | 'wave' | 'think' | 'talk' | 'cheer' | 'listen';
  const headBot = panel.querySelector<SVGElement>('.ask-ava .nb');
  const status = document.getElementById('ask-status')!;
  const sub = status.parentElement!;
  let rest: Mood = 'wave', restLabel = 'Your reading buddy', restState: 'ok' | 'busy' | 'off' = 'ok';
  const setMood = (m: Mood) => { if (headBot) headBot.dataset.mood = m; };
  const setState = (st: 'ok' | 'busy' | 'off') => { sub.dataset.state = st; };
  const setRest = (m: Mood, label = 'Your reading buddy', st: 'ok' | 'busy' | 'off' = 'ok') => { rest = m; restLabel = label; restState = st; setMood(m); status.textContent = label; setState(st); };
  const settle = () => { setMood(rest); status.textContent = restLabel; setState(restState); };
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.hasAttribute('data-nimbus-calm');
  let settleT = 0;
  const flashMood = (m: Mood, ms = 1600) => { setMood(m); clearTimeout(settleT); settleT = window.setTimeout(settle, ms); };
  addEventListener('nimbus-skin', () => log.querySelectorAll('.ask-ava-s').forEach((a) => (a.innerHTML = miniSvg(currentSkin(), 26))));
  // Listening: Nimbus tilts its head while the reader types.
  let listenT = 0;
  const listening = () => { setMood('listen'); clearTimeout(listenT); listenT = window.setTimeout(settle, 1400); };
  input.addEventListener('focus', listening);
  input.addEventListener('input', listening);

  // Replies go into the page at once (screen readers read them straight away);
  // a short "typing" bubble hides them visually for a moment, one after another.
  let free = 0;
  const say = (node: Node, who: 'bot' | 'me' = 'bot') => {
    const b = el('div', `ask-msg ask-${who}`);
    b.append(node);
    if (who === 'me') { log.append(b); scrollDown(); return b; }
    const r = el('div', 'ask-row');
    if (log.lastElementChild?.classList.contains('ask-row')) r.classList.add('is-cont');
    const a = el('span', 'ask-ava-s');
    a.innerHTML = miniSvg(currentSkin(), 26);
    r.append(a, b);
    log.append(r);
    if (!calm()) {
      const now = performance.now();
      const at = Math.max(now, free) + 420;
      free = at;
      b.classList.add('is-typing');
      setMood('talk');
      status.textContent = 'Typing…';
      setState('busy');
      setTimeout(() => {
        b.classList.remove('is-typing');
        scrollDown();
        if (performance.now() >= free - 5) { clearTimeout(settleT); settleT = window.setTimeout(settle, 700); }
      }, at - now);
    }
    scrollDown();
    return b;
  };
  const me = (s: string) => say(text(s), 'me');

  /* ---------- greetings ---------- */
  const firstName = () => (hint()?.name || '').trim().split(/\s+/)[0] || '';
  const hello = () => {
    const h = new Date().getHours();
    const n = firstName();
    if (h >= 22 || h < 5) return n ? `Reading late, ${n}?` : 'Reading late?';
    const part = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    return n ? `${part}, ${n}` : part;
  };

  /* ---------- listen to one answer (the browser's own voice) ---------- */
  let speaking: HTMLButtonElement | null = null;
  let reading = false;
  const listen = (target: () => Element | null) => {
    const b = el('button', 'ask-listen', '🔊 Listen');
    b.type = 'button';
    b.setAttribute('aria-label', 'Read this answer aloud');
    if (!canSpeak()) b.hidden = true;
    b.addEventListener('click', async () => {
      stopReading();
      if (speaking) { stopSpeaking(); const was = speaking; speaking.textContent = '🔊 Listen'; speaking = null; if (was === b) return; }
      const t = target();
      if (!t) return;
      speaking = b;
      b.textContent = '⏹ Stop';
      setMood('talk');
      try { await speak(readableText(t).replace(/🔊 Listen|⏹ Stop/g, '')); } finally { if (speaking === b) { b.textContent = '🔊 Listen'; speaking = null; } settle(); }
    });
    return b;
  };

  /* ---------- data: site index + extras, loaded once ---------- */
  let site: { items: SiteItem[]; r: Ranker } | null = null;
  let extra: Extra | null = null;
  let loadP: Promise<boolean> | null = null;
  const loadData = () => (loadP ??= Promise.all([
    fetch('/search-index.json').then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); }),
    fetch('/nimbus.json').then((r) => (r.ok ? r.json() : null)).catch(() => null),
  ]).then(([items, x]: [SiteItem[], Extra | null]) => {
    site = { items, r: makeRanker(items.map((i) => ({ title: `${i.title} ${i.category}`, body: i.text }))) };
    extra = x;
    return true;
  }).catch(() => { loadP = null; return false; }));

  /* ---------- the article on screen ---------- */
  function readCtx() {
    const node = document.getElementById('nimbus-page');
    if (!node) { ctx = null; ctxUrl = ''; paras = []; artRanker = null; chip.textContent = ''; input.placeholder = 'Ask about any topic…'; return; }
    try { ctx = JSON.parse(node.textContent || 'null'); } catch { ctx = null; }
    if (!ctx) return;
    ctxUrl = location.pathname;
    chip.textContent = 'This article';
    input.placeholder = 'Ask about this article…';
    paras = [];
    const art = document.querySelector<HTMLElement>('article[data-reader-root]');
    if (art) {
      let heading = ctx.title;
      let anchor: HTMLElement | null = null;
      art.querySelectorAll<HTMLElement>('h2, h3, p, li, blockquote, td').forEach((n) => {
        if (n.closest('pre, figure, nav, aside, .not-prose, [data-nimbus-skip]')) return;
        if (n.tagName === 'H2' || n.tagName === 'H3') { heading = n.textContent?.trim() || heading; anchor = n; return; }
        if (n.tagName !== 'TD' && n.closest('li, blockquote') !== n && n.closest('li, blockquote')) return;
        const t = (n.textContent || '').replace(/\s+/g, ' ').trim();
        if (t.length < 40) return;
        paras.push({ heading, anchor, node: n, text: t });
      });
    }
    for (const f of ctx.faq) paras.push({ heading: f.q, anchor: document.getElementById('faq') ?? null, node: null, text: f.a, faq: true });
    artRanker = paras.length ? makeRanker(paras.map((p) => ({ title: p.heading, body: p.text }))) : null;
  }
  const sections = () => [...document.querySelectorAll<HTMLElement>('article[data-reader-root] h2[id]')].filter((h) => !h.closest('[data-nimbus-skip]'));

  function jump(target: HTMLElement | null) {
    if (!target) return;
    if (matchMedia('(max-width: 640px)').matches) close(false);
    target.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'start' });
    target.classList.remove('nimbus-flash');
    void target.offsetWidth;
    target.classList.add('nimbus-flash');
  }
  const jumpBtn = (label: string, target: HTMLElement | null, cls = 'ask-chip ask-go') => {
    const b = el('button', cls, label);
    b.type = 'button';
    b.addEventListener('click', () => jump(target));
    return b;
  };

  /* ---------- home ---------- */
  const RING = (pct: number) => `<svg width="62" height="62" viewBox="0 0 62 62" aria-hidden="true" focusable="false"><circle cx="31" cy="31" r="26" fill="none" stroke="var(--ring-track)" stroke-width="7"/><circle cx="31" cy="31" r="26" fill="none" stroke="url(#ask-ring-g)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(163.4 * pct) / 100} 163.4" transform="rotate(-90 31 31)"/><defs><linearGradient id="ask-ring-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0078d4"/><stop offset="1" stop-color="#62e6ff"/></linearGradient></defs></svg>`;
  const ICON = {
    find: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    quiz: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5V14M12 17.5v.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
    fresh: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 11h7M9 15h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    play: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 9v6l5-3z" fill="currentColor"/></svg>',
    book: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 5v16" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  };
  function tile(icon: string, title: string, note: string, act: (() => void) | string, cls = '') {
    const t = typeof act === 'string' ? link('', act, `ask-tile ${cls}`) : el('button', `ask-tile ${cls}`);
    if (t instanceof HTMLButtonElement) { t.type = 'button'; t.addEventListener('click', act as () => void); }
    const i = el('span', 'ask-tile-i');
    i.innerHTML = icon;
    t.append(i, el('b', '', title), el('span', 'ask-tile-n', note));
    return t;
  }
  const WEEK_GOAL = 3;
  function home() {
    setRest('idle', 'Online');
    const card = el('div', 'ask-home');
    const meet = el('button', 'ask-meet', '✨ Meet my Nimbus');
    meet.type = 'button';
    meet.setAttribute('data-nimbus-meet', '');
    card.append(meet);
    const top = el('div', 'ask-home-top');
    const words = el('div', 'ask-home-w');
    words.append(el('p', 'ask-hello', hello()));
    let stats: ReturnType<typeof getStats> | null = null;
    try { stats = getStats(); } catch { /* storage blocked */ }
    if (stats && (stats.thisWeek || stats.streak)) {
      const pct = Math.min(100, Math.round((stats.thisWeek / WEEK_GOAL) * 100));
      const ring = el('div', 'ask-ring');
      ring.innerHTML = RING(pct);
      ring.append(el('span', '', `${Math.min(stats.thisWeek, 99)}/${WEEK_GOAL}`));
      ring.setAttribute('role', 'img');
      ring.setAttribute('aria-label', `${stats.thisWeek} of ${WEEK_GOAL} articles read this week`);
      top.append(ring);
      const left = Math.max(0, WEEK_GOAL - stats.thisWeek);
      words.append(el('p', 'ask-home-sub', `${stats.streak > 1 ? `Day ${stats.streak} in a row. ` : ''}${left ? `${left} more article${left === 1 ? '' : 's'} hits this week’s goal.` : 'Weekly goal done. Nice reading.'}`));
    } else {
      words.append(el('p', 'ask-home-sub', 'Tell me a topic and I’ll find the article. Everything stays on your device.'));
    }
    top.append(words);
    card.append(top);
    let resume: ReturnType<typeof getResume> = null;
    try { resume = getResume(); } catch { /* storage blocked */ }
    if (resume && resume.url !== location.pathname) {
      const n = el('p', 'ask-next');
      n.append(el('span', 'ask-next-l', 'Continue'), `${resume.title} · ${Math.round(resume.progress * 100)}%`);
      card.append(n, row(link('Continue reading', resume.url, 'ask-cta', resume.external)));
    }
    const tiles = el('div', 'ask-tiles');
    tiles.append(
      tile(ICON.find, 'Find an article', 'Type any topic', () => { input.focus(); setRest('listen', 'Listening…'); }),
      tile(ICON.quiz, 'Quiz me', 'One question, right now', () => quiz(), 'is-gold'),
      tile(ICON.fresh, 'What’s new', 'The latest posts', () => latest()),
      tile(ICON.play, 'Short videos', '30-second learning', '/shorts/'),
    );
    card.append(tiles);
    const f = document.createDocumentFragment();
    f.append(card);
    if (ctx) {
      f.append(el('p', 'ask-more', `You’re reading “${ctx.title}”.`));
      f.append(chips([{ label: '📖 Help me with this article', on: () => articleHello() }]));
    }
    f.append(el('p', 'ask-more', 'Or pick a topic:'));
    f.append(chips(TOPICS.map((q) => ({ label: `💡 ${q}`, on: () => { me(q); search(q); } }))));
    say(f);
  }

  function latest() {
    me('What’s new?');
    const f = document.createDocumentFragment();
    if (!extra?.latest.length) { f.append(text('I couldn’t load the latest posts just now.'), row(link('Browse all articles', '/articles/', 'ask-chip'))); say(f); return; }
    f.append(el('p', 'ask-kicker', '🆕 Fresh on the blog'));
    f.append(hitList(extra.latest.map((p) => ({ title: p.title, url: p.url, meta: `${p.category} · ${p.minutes} min read`, external: false }))));
    const more = [link('All articles', '/articles/', 'ask-chip')];
    if (extra.series.length) more.push(link(`📚 ${extra.series.length} series`, '/series/', 'ask-chip'));
    f.append(row(...more));
    say(f);
  }

  /* ---------- results ---------- */
  function hitList(items: { title: string; url: string; meta: string; external: boolean }[]) {
    const w = el('div', 'ask-hits');
    items.forEach((h, i) => {
      const a = link('', h.url, `ask-hit${i === 0 ? ' is-top' : ''}`, h.external);
      a.append(el('b', '', h.title), el('span', '', `${h.meta}${h.external ? ' ↗' : ''}`));
      w.append(a);
    });
    return w;
  }
  const siteHits = (q: string, n = 4) => {
    if (!site) return [];
    const all = rank(site.r, q, 8).filter((h) => h.cover >= 0.5);
    return all.filter((h) => site!.items[h.i].url !== location.pathname).slice(0, n).map((h) => site!.items[h.i]);
  };
  const asHit = (i: SiteItem) => ({ title: i.title, url: i.url, meta: `${i.kind}${i.category ? ` · ${i.category}` : ''}`, external: i.external });

  function search(q: string) {
    rest = 'idle';
    const hits = siteHits(q);
    const f = document.createDocumentFragment();
    if (!hits.length) {
      rest = 'think';
      f.append(text('I couldn’t find an article on that yet. Try another word, like the service or framework name, or browse here:'));
      f.append(row(link('All articles', '/articles/', 'ask-chip'), link('Topics', '/topics/', 'ask-chip'), link('Series', '/series/', 'ask-chip')));
      f.append(el('p', 'ask-more', 'Or suggest it as a topic:'), row(link('💬 Suggest a topic', '/contact/', 'ask-chip')));
      say(f);
      return;
    }
    f.append(text(hits.length === 1 ? 'This one covers it:' : `I found ${hits.length} that fit. The first is the closest:`));
    f.append(hitList(hits.map(asHit)));
    f.append(helpedRow(() => {}));
    say(f);
  }

  /* ---------- was this helpful? ---------- */
  function helpedRow(onNo: () => void, noNodes?: () => Node) {
    const helped = el('div', 'ask-helped');
    const yes = el('button', 'ask-thumb', '👍');
    const no = el('button', 'ask-thumb', '👎');
    yes.type = no.type = 'button';
    yes.setAttribute('aria-label', 'Yes, this helped');
    no.setAttribute('aria-label', 'No, not really');
    yes.addEventListener('click', () => { helped.replaceChildren(el('span', '', 'Glad it helped. Ask me anything else.')); flashMood('cheer'); });
    no.addEventListener('click', () => {
      helped.replaceChildren(el('span', '', 'Thanks for telling me. Try other words, or:'));
      helped.append(noNodes ? noNodes() : row(link('Browse topics', '/topics/', 'ask-chip')));
      onNo();
    });
    helped.append(el('span', '', 'Was this helpful?'), yes, no);
    return helped;
  }

  /* ---------- article guide ---------- */
  function guideChips(compact = false) {
    if (!ctx) return chips([]);
    const c = ctx;
    const opts = [
      { label: '⚡ Summary in 30 seconds', on: () => summary() },
      sections().length > 1 && { label: '🧭 What’s inside', on: () => inside() },
      c.faq.length > 0 && { label: '💬 Common questions', on: () => faqList() },
      c.quiz.length > 0 && { label: '🎯 Quiz me on this', on: () => quiz(true) },
      canSpeak() && !compact && { label: reading ? '⏹ Stop reading' : '🔊 Read it to me', on: () => (reading ? stopReading(true) : readAloud()) },
      (c.next || c.related.length > 0) && { label: '➡️ What should I read next?', on: () => whatsNext() },
      c.short && !compact && { label: '🎬 Watch the short video', on: () => { me('Watch the short video'); say(row(link(`▶ ${c.short!.title}`, c.short!.url, 'ask-chip ask-go'))); } },
    ].filter(Boolean) as { label: string; on: () => void }[];
    return chips(opts);
  }
  const more = () => { const f = document.createDocumentFragment(); f.append(el('p', 'ask-more', 'What next?'), guideChips(true)); return f; };
  function articleHello() {
    if (!ctx) return home();
    setRest('idle', 'Online');
    const f = document.createDocumentFragment();
    f.append(el('p', 'ask-hello ask-hello-sm', hello()));
    f.append(text(`I’m your guide for “${ctx.title}”, a ${ctx.minutes}-minute read. Pick one, or type a question and I’ll find the part of the article that answers it.`));
    f.append(guideChips());
    say(f);
  }
  function guideSay(ask: string, nodes: Node[]) {
    me(ask);
    const f = document.createDocumentFragment();
    const box = el('div');
    box.append(...nodes);
    f.append(box, listen(() => box), more());
    say(f);
  }
  function summary() {
    if (!ctx) return;
    const nodes: Node[] = [el('p', 'ask-kicker', '⚡ In 30 seconds'), text(ctx.highlight || ctx.description)];
    if (ctx.highlight && ctx.description && ctx.description !== ctx.highlight) nodes.push(el('p', 'ask-more', ctx.description));
    const hs = sections().slice(0, 5).map((h) => h.textContent?.trim() || '').filter(Boolean);
    if (hs.length) nodes.push(el('p', 'ask-more', 'It walks through:'), list(hs));
    guideSay('Summary in 30 seconds', nodes);
  }
  function inside() {
    me('What’s inside?');
    const hs = sections();
    const f = document.createDocumentFragment();
    f.append(el('p', 'ask-kicker', `🧭 ${hs.length} sections · tap one to jump there`));
    const ol = el('ol', 'ask-toc');
    for (const h of hs) {
      const li = el('li');
      const b = el('button', '', h.textContent?.trim() || '');
      b.type = 'button';
      b.addEventListener('click', () => jump(h));
      li.append(b);
      ol.append(li);
    }
    f.append(ol, more());
    say(f);
  }
  function faqList() {
    if (!ctx) return;
    me('Common questions');
    const f = document.createDocumentFragment();
    f.append(el('p', 'ask-kicker', '💬 Readers often ask'));
    f.append(chips(ctx.faq.map((x) => ({ label: x.q, on: () => guideSay(x.q, [text(x.a)]) }))));
    say(f);
  }
  function whatsNext() {
    if (!ctx) return;
    me('What should I read next?');
    const f = document.createDocumentFragment();
    const items: { title: string; url: string; meta: string; external: boolean }[] = [];
    if (ctx.next) items.push({ title: ctx.next.title, url: ctx.next.url, meta: ctx.next.label || 'Up next', external: false });
    for (const r of ctx.related) if (r.url !== ctx.next?.url) items.push({ title: r.title, url: r.url, meta: 'Related', external: false });
    f.append(text(ctx.next?.label?.startsWith('Next in this series') ? 'Carry on with the series:' : 'These pair well with this one:'));
    f.append(hitList(items.slice(0, 4)));
    say(f);
  }

  /* ---------- read the whole article aloud, highlighting as it goes ---------- */
  let readNode: HTMLElement | null = null;
  function stopReading(announce = false) {
    if (!reading) return;
    reading = false;
    stopSpeaking();
    readNode?.classList.remove('nimbus-reading');
    readNode = null;
    if (announce) { me('Stop reading'); say(text('Stopped. Tap “Read it to me” to start again.')); }
    settle();
  }
  async function readAloud() {
    const art = document.querySelector<HTMLElement>('article[data-reader-root]');
    if (!art || !canSpeak()) return;
    me('Read it to me');
    stopSpeaking();
    speaking = null;
    const nodes = [...art.querySelectorAll<HTMLElement>('h2, h3, p, li')].filter((n) => !n.closest('pre, figure, nav, aside, table, [data-nimbus-skip]') && !(n.tagName === 'P' && n.closest('li')) && (n.textContent || '').trim().length > 2);
    // Start from the first paragraph still on screen, so it picks up where the reader is.
    const from = Math.max(0, nodes.findIndex((n) => n.getBoundingClientRect().bottom > 80));
    const stop = el('button', 'ask-chip ask-go', '⏹ Stop reading');
    stop.type = 'button';
    stop.addEventListener('click', () => stopReading(true));
    const f = document.createDocumentFragment();
    f.append(text(`Reading “${ctx?.title ?? document.title}” from where you are. I’ll highlight each part as I go, so you can follow along. Close this chat if you like, I’ll keep reading.`), row(stop));
    say(f);
    reading = true;
    setRest('talk', 'Reading aloud…', 'busy');
    for (let i = from; i < nodes.length && reading; i++) {
      readNode?.classList.remove('nimbus-reading');
      readNode = nodes[i];
      readNode.classList.add('nimbus-reading');
      const r = readNode.getBoundingClientRect();
      if (r.top < 70 || r.bottom > innerHeight - 40) readNode.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'center' });
      await speak(readableText(readNode));
    }
    if (reading) { stopReading(); setRest('cheer', 'Online'); say(text('That’s the whole article. Want a quick quiz on it?')); if (ctx?.quiz.length) say(chips([{ label: '🎯 Quiz me on this', on: () => quiz(true) }])); window.setTimeout(() => setRest('idle', 'Online'), 2500); }
  }
  document.addEventListener('astro:before-swap', () => stopReading());

  /* ---------- quiz: the article's own questions, or any article's ---------- */
  const asked = new Set<string>();
  let score = { right: 0, total: 0 };
  function quiz(fromArticle = false) {
    const own = fromArticle && ctx?.quiz.length ? ctx.quiz.map((q, i) => ({ ...q, id: `here#${i}` })) : null;
    const pool: QuizQ[] = own ?? extra?.quiz ?? [];
    me(fromArticle ? 'Quiz me on this' : 'Quiz me');
    if (!pool.length) { say(text('I couldn’t load a question just now. Try again in a moment.')); return; }
    let cands = pool.filter((q) => !asked.has(q.id!));
    if (!cands.length) { pool.forEach((q) => asked.delete(q.id!)); cands = pool; }
    const q = own ? cands[0] : cands[Math.floor(Math.random() * cands.length)];
    asked.add(q.id!);
    const f = document.createDocumentFragment();
    const tag = q.exam ? ` · ${q.exam}` : '';
    f.append(el('p', 'ask-kicker', own ? `❓ Question ${ctx!.quiz.length - cands.length + 1} of ${ctx!.quiz.length}${tag}` : `❓ Quick quiz${tag}`));
    if (q.from) { const src = el('p', 'ask-more', 'From '); src.append(link(q.from.title, q.from.url)); f.append(src); }
    f.append(el('p', 'ask-strong', q.q));
    const opts = el('div', 'ask-opts');
    const out = el('div', 'ask-fb');
    q.o.forEach((o, i) => {
      const b = el('button', 'ask-opt');
      b.type = 'button';
      b.append(el('span', 'ask-opt-l', 'ABCD'[i]), el('span', '', o));
      b.addEventListener('click', () => {
        const ok = i === q.a;
        score = { right: score.right + (ok ? 1 : 0), total: score.total + 1 };
        opts.querySelectorAll('button').forEach((x, j) => { x.disabled = true; if (j === q.a) x.classList.add('is-right'); });
        if (!ok) b.classList.add('is-wrong');
        flashMood(ok ? 'cheer' : 'wave', 1800);
        out.className = `ask-fb ${ok ? 'is-ok' : 'is-no'}`;
        out.append(el('p', 'ask-strong', ok ? `Spot on. ${score.right}/${score.total} so far.` : `Not quite. The answer is ${'ABCD'[q.a]}. This one catches a lot of people.`), text(short(q.e, 520)));
        const nextChips = [{ label: 'Next question', on: () => quiz(!!own) }, { label: 'Ask something else', on: () => input.focus() }];
        if (q.from && q.from.url !== location.pathname) out.append(row(link('Read the article', q.from.url, 'ask-chip ask-go')));
        out.append(chips(nextChips));
        requestAnimationFrame(() => out.scrollIntoView({ block: 'nearest' }));
      }, { once: true });
      opts.append(b);
    });
    f.append(opts, out);
    say(f);
  }

  /* ---------- typed questions ---------- */
  const commentsCta = () => row(link('💬 Ask in the comments', '#comments-heading', 'ask-chip'));
  function articleQuestion(q: string, mine: HTMLElement) {
    const hits = artRanker ? rank(artRanker, q, 3).filter((h) => h.cover >= 0.5) : [];
    const elsewhere = siteHits(q, 3);
    if (!hits.length) {
      rest = 'think';
      const f = document.createDocumentFragment();
      if (elsewhere.length) {
        f.append(text('This article doesn’t cover that, but these do:'), hitList(elsewhere.map(asHit)));
        f.append(el('p', 'ask-more', 'Or ask the author directly:'), commentsCta());
      } else {
        f.append(text('I couldn’t find that in this article. Post it in the comments and it gets a personal answer.'), commentsCta());
      }
      say(f);
      return;
    }
    rest = 'idle';
    const top = paras[hits[0].i];
    const f = document.createDocumentFragment();
    f.append(el('p', 'ask-kicker', top.faq ? '💬 From the FAQ' : `📍 ${top.heading}`));
    const quote = el('p', 'ask-quote', short(top.text, 520));
    f.append(quote);
    const src = el('p', 'ask-src');
    src.append(listen(() => quote));
    f.append(src);
    const jumpTo = top.node ?? top.anchor;
    if (jumpTo) f.append(row(jumpBtn(top.faq ? '↓ Go to the FAQ' : '↓ Show me in the article', jumpTo)));
    const others = hits.slice(1).map((h) => paras[h.i]).filter((p) => p.heading !== top.heading);
    if (others.length) {
      f.append(el('p', 'ask-more', 'Also mentioned in:'));
      f.append(row(...others.map((p) => jumpBtn(`↓ ${p.heading}`, p.node ?? p.anchor, 'ask-chip'))));
    }
    f.append(helpedRow(() => {}, () => {
      const w = document.createDocumentFragment();
      if (elsewhere.length) w.append(hitList(elsewhere.map(asHit)));
      w.append(commentsCta());
      return w;
    }));
    say(f);
    scrollTo(mine);
  }

  async function question(q: string) {
    const mine = me(q);
    if (!site && !(await loadData())) { offline(() => question(q)); return; }
    if (ctx && location.pathname === ctxUrl) articleQuestion(q, mine);
    else { search(q); scrollTo(mine); }
  }

  function offline(retry: () => void) {
    setRest('think', 'Offline', 'off');
    const f = document.createDocumentFragment();
    f.append(el('p', 'ask-strong', 'I can’t reach my notes right now.'));
    f.append(text(navigator.onLine ? 'The article list didn’t load. It usually works on a second try.' : 'You look offline. I’ll try again as soon as you’re back.'));
    f.append(chips([{ label: '↻ Try again', on: retry }]));
    say(f);
    addEventListener('online', retry, { once: true });
  }

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    question(q);
  });

  /* ---------- open / close ---------- */
  async function start() {
    readCtx();
    setRest('think', 'Getting ready…', 'busy');
    const ok = await loadData();
    if (!ok) { offline(() => { start(); }); return; }
    if (ctx) articleHello(); else home();
  }
  function open() {
    panel.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    root.classList.add('is-open');
    if (!started) { started = true; start(); }
    else if (pendingHello) { pendingHello = false; readCtx(); if (ctx) articleHello(); }
    if (!matchMedia('(pointer: coarse)').matches) setTimeout(() => input.focus(), 60);
  }
  function close(refocus = true) {
    if (speaking) { stopSpeaking(); speaking.textContent = '🔊 Listen'; speaking = null; }
    panel.hidden = true;
    fab.setAttribute('aria-expanded', 'false');
    root.classList.remove('is-open');
    if (refocus) fab.focus();
  }
  fab.addEventListener('click', () => (panel.hidden ? open() : close()));
  document.getElementById('ask-close')!.addEventListener('click', () => close());
  document.getElementById('ask-home')!.addEventListener('click', () => { readCtx(); home(); });
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  // The chat survives page navigation; a new article gets its own guide.
  document.addEventListener('astro:page-load', () => {
    if (!started) return;
    const was = ctxUrl;
    readCtx();
    if (ctx && ctxUrl !== was) { if (panel.hidden) pendingHello = true; else articleHello(); }
  });

  /* ---------- requests from Meet my Nimbus and article buttons ---------- */
  const ready = async () => { if (!started) open(); for (let i = 0; i < 50 && !site; i++) await new Promise((r) => setTimeout(r, 100)); return !!site; };
  addEventListener('nimbus-chat', async (e) => {
    const d = (e as CustomEvent).detail ?? {};
    open();
    if (!(await ready())) return;
    if (d.quiz) quiz(!!ctx?.quiz.length);
    if (d.read) { if (ctx) readAloud(); else say(text('Open any article and tap “Read it to me”. I’ll read it out loud and highlight each part as I go.')); }
    if (d.say) say(text(d.say));
  });
  document.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest?.('[data-nimbus-open]') as HTMLElement | null;
    if (!t) return;
    const was = started;
    open();
    const action = t.dataset.nimbusOpen;
    ready().then(() => {
      if (action === 'quiz') quiz(!!ctx?.quiz.length);
      else if (action === 'read') readAloud();
      else if (action === 'summary') summary();
      else if (was && ctx) articleHello();
    });
  });
}
