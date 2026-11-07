/**
 * The AI Token Calculator at the top of /open-source/ai-token-calculator/.
 *
 * Independent of the course below it: it reads the price list the page embeds
 * (#ta-data, built from pricing.ts), counts with gpt-tokenizer in the browser,
 * and never sends the text anywhere. Only the reader's settings, never their
 * text, are remembered on this device or put in a shared link.
 *
 * Simple mode prices one typical Copilot Chat request. Advanced mode exposes
 * every assumption: context, output, cache reads and writes, agent model calls
 * and monthly volume.
 */
import { loadO200k, loadCl100k } from './tokenizer.js';
import { SAMPLES } from './samples.js';

let controller = null;

const fmt = (n, d = 0) => Number(n).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });
const cr = (n) => fmt(n, n < 1 ? 3 : n < 100 ? 2 : 0);
const usd = (n) => '$' + fmt(n, n < 0.01 ? 4 : n < 100 ? 2 : 0);
const rate = (n) => '$' + fmt(n, n < 0.1 ? 3 : 2);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/**
 * Only OpenAI publishes its tokenizers. Other families are estimated from the
 * o200k_base count with these rough ranges, and are always labelled as such.
 */
const RANGE = { OpenAI: [1, 1], Anthropic: [1.05, 1.3], Google: [0.9, 1.1] };
const rangeOf = (p) => RANGE[p] ?? [0.95, 1.15];

/** Typical sizes of what Copilot Chat sends with a prompt. Examples, not published figures. */
const CONTEXT = [
  ['sys', 'Copilot’s system instructions', 2000, true],
  ['inst', 'Custom instructions file', 600, true],
  ['tools', 'Tool definitions (built-in + MCP)', 1900, true],
  ['hist', 'Earlier messages in this chat', 3200, false],
  ['files', 'Referenced code files', 4000, true],
];
const CONTEXT_DEFAULT = CONTEXT.reduce((a, c) => a + (c[3] ? c[2] : 0), 0);

/** What Simple mode assumes; Advanced starts from the same values. */
const DEFAULTS = { mode: 'chat', out: 800, cache: 0, write: 0, calls: 1, grow: 3000, req: 400, auto: false };

const KEY = 'ta-calc-v2';
const FIELDS = ['c-model', 'c-mode', 'c-out', 'c-cache', 'c-write', 'c-calls', 'c-grow', 'c-req', 'c-auto'];
/** Advanced number fields a shared link carries, as ?out=…&cache=… */
const LINK_NUMS = ['out', 'cache', 'write', 'calls', 'grow', 'req'];
const PAGE = '/open-source/ai-token-calculator/';

export function initCalculator() {
  const root = document.getElementById('calculator');
  const dataEl = document.getElementById('ta-data');
  if (!root || !dataEl) return;
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;
  const on = (el, ev, fn) => el?.addEventListener(ev, fn, { signal });
  const $ = (id) => document.getElementById(id);

  const DATA = JSON.parse(dataEl.textContent);
  const MODELS = DATA.models;
  const byName = (n) => MODELS.find((m) => m.name === n) ?? MODELS[0];
  let enc = window.GPTTokenizer_o200k_base ?? null;
  let level = 'simple';

  // ---- inputs ----
  const text = $('c-text');
  const text2 = $('c-text2');
  const sel = $('c-model');
  const groups = [...new Set(MODELS.map((m) => m.provider))];
  sel.innerHTML = groups
    .map((g) => `<optgroup label="${esc(g)}">${MODELS.filter((m) => m.provider === g)
      .map((m) => `<option value="${esc(m.name)}">${esc(m.name)} · $${m.in} in / $${m.out} out</option>`).join('')}</optgroup>`)
    .join('');
  sel.value = DATA.defaultModel;

  $('c-ctx').innerHTML = CONTEXT.map(([id, label, size, onByDefault]) =>
    `<div class="rbrow"><label for="cx-${id}c"><input type="checkbox" id="cx-${id}c"${onByDefault ? ' checked' : ''}> ${label}</label>` +
    `<input type="number" id="cx-${id}" min="0" step="100" value="${size}" aria-label="${label}, tokens"></div>`).join('');

  try {
    const saved = JSON.parse(localStorage.getItem(KEY)) || {};
    for (const id of FIELDS) {
      if (!(id in saved)) continue;
      if (id === 'c-auto') $(id).checked = !!saved[id];
      else if (id !== 'c-model' || MODELS.some((m) => m.name === saved[id])) $(id).value = saved[id];
    }
    if (saved.level === 'advanced') level = 'advanced';
  } catch {}
  const persist = () => {
    try {
      const v = Object.fromEntries(FIELDS.map((id) => [id, id === 'c-auto' ? $(id).checked : $(id).value]));
      localStorage.setItem(KEY, JSON.stringify({ ...v, level }));
    } catch {}
  };

  // A shared link overrides what this device remembered. It holds the prompt's
  // token count (t), never its text; the count stands in until the reader types.
  let shared = null;
  const q = new URLSearchParams(location.search);
  if (q.has('m') || q.has('t')) {
    const m = MODELS.find((x) => x.slug === q.get('m'));
    if (m) sel.value = m.name;
    if (q.get('lvl') === 'advanced') level = 'advanced';
    if (q.has('mode')) $('c-mode').value = q.get('mode') === 'api' ? 'api' : 'chat';
    for (const k of LINK_NUMS) if (q.has(k)) $(`c-${k}`).value = q.get(k);
    if (q.has('auto')) $('c-auto').checked = q.get('auto') === '1';
    (q.get('cx') ?? '').split('.').forEach((v, i) => {
      if (!CONTEXT[i] || !/^-?\d+$/.test(v)) return;
      $(`cx-${CONTEXT[i][0]}`).value = Math.abs(+v);
      $(`cx-${CONTEXT[i][0]}c`).checked = !v.startsWith('-');
    });
    const t = Number(q.get('t'));
    if (q.has('t') && Number.isInteger(t) && t >= 0) shared = t;
  }
  // Once the reader types or clears, the link's numbers no longer describe the page.
  const unshare = () => {
    if (shared === null) return;
    shared = null;
    history.replaceState(history.state, '', location.pathname + location.hash);
  };
  const blank = () => !text.value.trim() && shared === null;
  text.value = shared === null ? SAMPLES.prompt.text : '';

  // A number field: clamped to its limits, marked invalid with a reason when out of range.
  const num = (id, label) => {
    const el = $(id), v = el.value.trim(), n = Number(v);
    const min = el.min === '' ? -Infinity : +el.min, max = el.max === '' ? Infinity : +el.max;
    let err = '';
    if (v === '' || !Number.isFinite(n)) err = `${label} must be a number.`;
    else if (n < min) err = `${label} can’t be below ${fmt(min)}.`;
    else if (n > max) err = `${label} can’t be above ${fmt(max)}.`;
    el.toggleAttribute('aria-invalid', !!err);
    return { n: Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : Math.max(0, min), err };
  };

  // ---- Simple / Advanced ----
  function setLevel(next) {
    level = next;
    root.dataset.level = level;
    root.querySelectorAll('[data-level]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.level === level));
    root.querySelectorAll('.tc-adv').forEach((el) => (el.hidden = level !== 'advanced'));
    root.querySelectorAll('.tc-simple').forEach((el) => (el.hidden = level === 'advanced'));
    price();
  }
  root.querySelectorAll('[data-level]').forEach((b) => on(b, 'click', () => setLevel(b.dataset.level)));
  on($('c-reset'), 'click', () => {
    $('c-mode').value = DEFAULTS.mode;
    for (const k of ['out', 'cache', 'write', 'calls', 'grow', 'req']) $(`c-${k}`).value = DEFAULTS[k];
    $('c-auto').checked = DEFAULTS.auto;
    CONTEXT.forEach(([id, , size, onByDefault]) => { $(`cx-${id}`).value = size; $(`cx-${id}c`).checked = onByDefault; });
    price();
  });

  // Explanations sit behind an (i) button next to each setting, so the form stays short.
  root.querySelectorAll('.tc-tip').forEach((b) => on(b, 'click', () => {
    const hint = $(b.getAttribute('aria-controls'));
    const open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', open);
    hint.hidden = !open;
  }));

  // ---- counting ----
  let ids = [];
  let count = 0;
  const kindOf = (s) => {
    const t = s.trim();
    if (!t) return '';
    if (/^[[{]/.test(t)) return 'JSON';
    const lines = t.split('\n');
    if (lines.filter((l) => /^\s*(\d{2}:\d{2}|\[?\d{4}-\d{2}-\d{2}|at |\s*(ERROR|WARN|INFO|DEBUG|Error|Exception)\b)/.test(l)).length >= Math.max(2, lines.length * 0.3)) return 'log';
    const sym = (t.match(/[{}();=<>[\]]/g) || []).length / t.length;
    return sym > 0.03 || /^\s*(import|class|def|function|const|final|public|Future|#include)\b/m.test(t) ? 'code' : 'prose';
  };

  function recount() {
    const s = text.value;
    if (s) unshare();
    const enc1 = enc ? enc.encode(s) : null;
    ids = enc1 ?? [];
    count = shared ?? (enc1 ? enc1.length : Math.ceil(s.length / 4));
    const words = (s.trim().match(/\S+/g) || []).length;
    const lines = s ? s.split('\n').length : 0;
    const kind = kindOf(s);
    $('c-meta').textContent = `${fmt(s.length)} characters · ${fmt(words)} words · ${fmt(lines)} line${lines === 1 ? '' : 's'}${kind ? ` · looks like ${kind}` : ''}`;

    // Help that depends on the text itself.
    const msg = [];
    if (shared !== null) msg.push(`Opened from a shared link: ${fmt(shared)} prompt tokens. The link never holds the text itself; paste your own to count it.`);
    else if (!s.trim()) msg.push('Paste or type some text to count its tokens and estimate the cost.');
    if (kind === 'JSON') {
      try {
        const min = JSON.stringify(JSON.parse(s));
        const m = enc ? enc.encode(min).length : Math.ceil(min.length / 4);
        if (m < count) msg.push(`Valid JSON. Minified, it would be ${fmt(m)} tokens: ${fmt(count - m)} fewer (${fmt((1 - m / count) * 100)}%).`);
        else msg.push('Valid JSON, already compact.');
      } catch {
        msg.push('This looks like JSON but doesn’t parse, so it’s counted as plain text.');
      }
    }
    if (s.length > 500_000) msg.push('Very large input: counting may take a moment after each change.');
    $('c-msg').textContent = msg.join(' ');
    price();
    if ($('c-split').open) split();
    compare();
  }

  // ---- pricing ----
  let last = null;
  function settings() {
    if (level === 'simple') {
      $('c-err').textContent = '';
      return { ...DEFAULTS, cache: 0, write: 0, ctx: CONTEXT_DEFAULT, chat: true };
    }
    const out = num('c-out', 'Output tokens');
    const cache = num('c-cache', 'Cache reads');
    const write = num('c-write', 'Cache writes');
    const calls = num('c-calls', 'Model calls');
    const grow = num('c-grow', 'Context growth');
    const req = num('c-req', 'Requests per month');
    const errs = [out, cache, write, calls, grow, req].map((x) => x.err).filter(Boolean);
    if (cache.n + write.n > 100) {
      errs.push('Cache reads and writes together can’t be more than 100% of the input.');
      $('c-write').setAttribute('aria-invalid', '');
    }
    $('c-err').textContent = errs.join(' ');
    const chat = $('c-mode').value === 'chat';
    $('c-ctx-box').hidden = !chat;
    $('c-grow').disabled = calls.n <= 1;
    const ctx = chat ? CONTEXT.reduce((a, [id]) => a + ($(`cx-${id}c`).checked ? Math.max(0, +$(`cx-${id}`).value || 0) : 0), 0) : 0;
    return {
      mode: chat ? 'chat' : 'api', chat, ctx,
      out: Math.round(out.n), cache: cache.n / 100, write: Math.min(write.n, 100 - cache.n) / 100,
      calls: Math.round(calls.n), grow: Math.round(grow.n), req: Math.round(req.n), auto: $('c-auto').checked,
    };
  }

  /**
   * One request (or one agent task) on one model. Each model call re-sends the
   * prompt and context plus everything the earlier calls added. A call whose
   * input passes the model's long-context threshold is priced at the higher
   * rates for the whole call. Cache writes are charged at the model's
   * cache-write price where GitHub lists one, otherwise as normal input.
   */
  function costOn(m, textTokens, st) {
    const t = { prompt: textTokens, ctx: st.ctx, fresh: 0, cached: 0, written: 0, out: 0, input: 0 };
    const usdOf = { fresh: 0, cached: 0, written: 0, out: 0 };
    let base = 0, longCalls = 0, firstInput = 0;
    for (let k = 0; k < st.calls; k++) {
      const input = textTokens + st.ctx + k * st.grow;
      if (!k) firstInput = input;
      const cached = Math.round(input * st.cache);
      const written = Math.round(input * st.write);
      const fresh = input - cached - written;
      const long = !!(m.long && input > m.long.over);
      const r = long ? m.long : m;
      const w = (x) => x.write ?? x.in;
      usdOf.fresh += (fresh * r.in) / 1e6;
      usdOf.cached += (cached * r.cached) / 1e6;
      usdOf.written += (written * w(r)) / 1e6;
      usdOf.out += (st.out * r.out) / 1e6;
      // The same call at standard rates, to show what the long-context tier added.
      base += (fresh * m.in + cached * m.cached + written * w(m) + st.out * m.out) / 1e6;
      if (long) longCalls++;
      Object.assign(t, { fresh: t.fresh + fresh, cached: t.cached + cached, written: t.written + written, out: t.out + st.out, input: t.input + input });
    }
    const sub = usdOf.fresh + usdOf.cached + usdOf.written + usdOf.out;
    const disc = st.auto ? sub * DATA.plan.autoDiscount : 0;
    const dollars = sub - disc;
    return { t, usdOf, sub, longExtra: sub - base, longCalls, firstInput, disc, dollars, credits: dollars / DATA.plan.usdPerCredit };
  }
  const tokensFor = (m) => {
    const [a, b] = rangeOf(m.provider);
    return { mid: Math.round((count * (a + b)) / 2), lo: Math.round(count * a), hi: Math.round(count * b), exact: m.provider === 'OpenAI' };
  };

  function price() {
    const st = settings();
    const m = byName(sel.value);
    const tk = tokensFor(m);
    const c = costOn(m, tk.mid, st);
    const basis = !enc ? 'estimate: 4 characters per token' : tk.exact ? 'o200k_base count' : `estimate, ${fmt(tk.lo)}–${fmt(tk.hi)}`;
    const agent = st.calls > 1;
    $('c-in').textContent = fmt(c.t.input);
    $('c-in-note').innerHTML = `${agent ? `across ${fmt(st.calls)} model calls` : st.chat ? `${fmt(tk.mid)} your text + ${fmt(st.ctx)} context` : 'your text only'}<span class="badge ${enc && tk.exact ? 'ex' : 'es'}">${basis}</span>`;
    $('c-o').textContent = fmt(c.t.out);
    $('c-cr-l').textContent = agent ? 'AI Credits per task' : 'AI Credits per request';
    $('c-cr').textContent = cr(c.credits);
    $('c-usd').textContent = `${usd(c.dollars)} per ${agent ? 'task' : 'request'}`;
    $('c-mcr').textContent = cr(c.credits * st.req);
    $('c-musd').textContent = `${usd(c.dollars * st.req)} for ${fmt(st.req)} ${agent ? 'tasks' : 'requests'} · ${fmt((c.credits * st.req) / DATA.plan.businessCredits * 100, 1)}% of one Business seat`;
    breakdown(m, tk, c, st);

    const warn = [];
    if (c.longCalls) warn.push(`${c.longCalls === st.calls ? (agent ? 'Every call' : 'This request') : `${c.longCalls} of ${st.calls} calls`} passes ${m.name}’s long-context threshold of ${fmt(m.long.over)} input tokens, so ${c.longCalls === 1 && !agent ? 'it is' : 'those calls are'} priced at the higher rates.`);
    if (m.note) warn.push(`${m.name}: ${m.note}.`);
    if (st.write && !m.write) warn.push(`GitHub lists no cache-write price for ${m.name}, so cache writes are charged as normal input.`);
    $('c-warn').hidden = !warn.length;
    $('c-warn').textContent = warn.join(' ');
    $('c-long').textContent = m.long
      ? `${m.name} moves to higher rates above ${fmt(m.long.over)} input tokens per call: $${m.long.in} in / $${m.long.out} out per 1M. Applied automatically.`
      : `${m.name} has no long-context tier on GitHub’s price list.`;

    $('c-assume').innerHTML = [
      enc
        ? (tk.exact
          ? 'Prompt tokens use OpenAI’s o200k_base tokenizer. GitHub doesn’t say which tokenizer each Copilot model uses, so treat it as a close estimate for this model.'
          : `${m.provider} doesn’t publish a browser tokenizer: the count is the o200k_base count × ${rangeOf(m.provider).join('–')}, a rough range. Use the provider’s token-counting API for an exact figure.`)
        : 'The tokenizer hasn’t loaded, so tokens are estimated at 4 characters each.',
      st.chat ? `Copilot context of ${fmt(st.ctx)} tokens uses typical example sizes; GitHub doesn’t publish them, and yours depends on your setup.` : 'Only your text is sent: no system prompt, tools or history.',
      `Output of ${fmt(st.out)} tokens per call is an estimate. Reasoning models also write hidden thinking tokens, which OpenAI and Anthropic bill as output.`,
      agent ? `${fmt(st.calls)} model calls, each re-sending the prompt and context plus ${fmt(st.grow)} more tokens per earlier call (answers and tool output).` : 'One model call.',
      st.cache || st.write ? `${fmt(st.cache * 100)}% of input read from cache and ${fmt(st.write * 100)}% written to it. Real caching depends on the provider: short prompts aren’t cached, and entries expire after minutes of inactivity.` : 'No caching assumed.',
      st.auto ? 'Auto model selection: 10% off model costs, on paid plans in Copilot Chat and Copilot cloud agent.' : 'No Auto model discount.',
      `Prices: GitHub’s per-1M-token rates, checked ${DATA.checked}. 1 AI Credit = $0.01.`,
    ].map((x) => `<li>${esc(x)}</li>`).join('');

    // No text yet (or just cleared): show zeros, not the context and answer on their own.
    if (blank()) {
      for (const id of ['c-in', 'c-o', 'c-cr', 'c-mcr']) $(id).textContent = '0';
      $('c-in-note').textContent = $('c-usd').textContent = $('c-musd').textContent = '';
      $('c-break').innerHTML = '';
      $('c-warn').hidden = true;
    }

    last = { m, tk, c, st };
    table(st);
    announce();
    persist();
  }

  // ---- the breakdown: every line of the sum ----
  function breakdown(m, tk, c, st) {
    const agent = st.calls > 1;
    const row = (label, tokens, r, cost, cls = '') =>
      `<tr${cls ? ` class="${cls}"` : ''}><th scope="row">${label}</th><td class="r">${tokens}</td><td class="r">${r}</td><td class="r">${cost}</td></tr>`;
    const longR = (k) => (c.longCalls && m.long ? ` <small>long: ${rate(m.long[k] ?? m.long.in)}</small>` : '');
    let rows = '';
    if (level === 'advanced') {
      rows += row('Prompt tokens (your text)', fmt(tk.mid), '', '', 'is-sub');
      rows += row('+ Copilot context', fmt(st.ctx), '', '', 'is-sub');
      if (agent) rows += row(`× ${fmt(st.calls)} model calls, growing ${fmt(st.grow)} per call`, fmt(c.t.input), '', '', 'is-sub');
      rows += row('Fresh input', fmt(c.t.fresh), rate(m.in) + longR('in'), usd(c.usdOf.fresh));
      rows += row('Cached input (read)', fmt(c.t.cached), rate(m.cached) + longR('cached'), usd(c.usdOf.cached));
      rows += row('Cache writes', fmt(c.t.written), (m.write ? rate(m.write) : `${rate(m.in)} <small>no write price</small>`) + longR('write'), usd(c.usdOf.written));
      rows += row('Output', fmt(c.t.out), rate(m.out) + longR('out'), usd(c.usdOf.out));
      if (c.longCalls) rows += row(`Long-context rates (${c.longCalls} call${c.longCalls > 1 ? 's' : ''})`, '', '', `+${usd(c.longExtra)} <small>included above</small>`, 'is-sub');
    } else {
      rows += row('Input', fmt(c.t.input), rate(m.in), usd(c.usdOf.fresh + c.usdOf.cached + c.usdOf.written));
      rows += row('Output', fmt(c.t.out), rate(m.out), usd(c.usdOf.out));
    }
    if (st.auto) rows += row('Auto model discount', '', '−10%', '−' + usd(c.disc));
    rows += row('Estimated total', '', '', `${usd(c.dollars)}<small>${cr(c.credits)} AI Credits</small>`, 'is-total');
    $('c-break').innerHTML = `<thead><tr><th scope="col">Item</th><th scope="col" class="r">Tokens</th><th scope="col" class="r">Price / 1M</th><th scope="col" class="r">Cost</th></tr></thead><tbody>${rows}</tbody>`;
  }

  // ---- every model ----
  let sortBy = 'cost';
  function table(st) {
    const cur = sel.value;
    const rows = MODELS.map((m) => ({ m, t: tokensFor(m), c: costOn(m, tokensFor(m).mid, st) }));
    if (sortBy === 'cost') rows.sort((a, b) => a.c.dollars - b.c.dollars);
    const unit = st.calls > 1 ? 'task' : 'request';
    const head = `<thead><tr><th scope="col">Model</th><th scope="col" class="r">Input tokens</th><th scope="col" class="r">Credits / ${unit}</th><th scope="col" class="r">Credits / month</th><th scope="col" class="r">$ / month</th></tr></thead>`;
    $('c-table').innerHTML = head + '<tbody>' + rows.map(({ m, t, c }) =>
      `<tr${m.name === cur ? ' class="sel" aria-current="true"' : ''}><th scope="row"><button type="button" data-pick="${esc(m.name)}">${esc(m.name)}</button><small>${esc(m.provider)} · ${esc(m.tier)}${c.longCalls ? ' · long-context rate' : ''}</small></th>` +
      `<td class="r">${t.exact && enc ? '' : '~'}${fmt(c.t.input)}</td><td class="r">${cr(c.credits)}</td><td class="r">${cr(c.credits * st.req)}</td><td class="r">${usd(c.dollars * st.req)}</td></tr>`).join('') + '</tbody>';
  }
  on($('c-sort'), 'change', (e) => { sortBy = e.target.value; price(); });
  on($('c-table'), 'click', (e) => {
    const b = e.target.closest('[data-pick]');
    if (!b) return;
    sel.value = b.dataset.pick;
    price();
    sel.focus();
  });

  // ---- token split ----
  function split() {
    const s = text.value, cl = window.GPTTokenizer_cl100k_base;
    const [ca, cb] = RANGE.Anthropic, [ga, gb] = RANGE.Google;
    $('c-tz').innerHTML =
      `<div class="tzc"><span class="badge ${enc ? 'ex' : 'es'}">${enc ? 'exact' : 'estimate'}</span><b>${fmt(count)}</b><span>OpenAI o200k_base</span></div>` +
      `<div class="tzc"><span class="badge ${cl ? 'ex' : 'es'}">${cl ? 'exact' : 'loading'}</span><b>${cl ? fmt(cl.encode(s).length) : '…'}</b><span>OpenAI cl100k_base (GPT-4, GPT-3.5)</span></div>` +
      `<div class="tzc"><span class="badge es">range</span><b>${fmt(Math.round(count * ca))}–${fmt(Math.round(count * cb))}</b><span>Claude models (estimate)</span></div>` +
      `<div class="tzc"><span class="badge es">range</span><b>${fmt(Math.round(count * ga))}–${fmt(Math.round(count * gb))}</b><span>Gemini models (estimate)</span></div>` +
      `<div class="tzc"><span class="badge es">rule of thumb</span><b>${fmt(Math.ceil(s.length / 4))}</b><span>characters ÷ 4 · ${count ? fmt(s.length / count, 1) : 0} characters per token here</span></div>`;
    const box = $('c-chips');
    box.textContent = '';
    if (!enc) { box.textContent = 'The token split appears once the tokenizer has loaded.'; return; }
    const LIMIT = 2000, frag = document.createDocumentFragment();
    for (const id of ids.slice(0, LIMIT)) {
      const sp = document.createElement('span');
      sp.textContent = enc.decode([id]).replace(/\n/g, '↵\n');
      sp.title = 'Token ID ' + id;
      frag.append(sp);
    }
    if (ids.length > LIMIT) { const m = document.createElement('em'); m.textContent = ` … ${fmt(ids.length - LIMIT)} more`; frag.append(m); }
    box.append(frag);
  }
  on($('c-split'), 'toggle', () => {
    if (!$('c-split').open) return;
    split();
    loadCl100k().then(() => { if (!signal.aborted && $('c-split').open) split(); });
  });

  // ---- compare two prompts ----
  function compare() {
    const out = $('c-cmp');
    if (!$('c-compare').open || !last) return;
    const b = text2.value;
    if (!b.trim()) { out.innerHTML = '<p class="small">Paste a second version to compare it with the text above.</p>'; return; }
    const nb = enc ? enc.encode(b).length : Math.ceil(b.length / 4);
    const [lo, hi] = rangeOf(last.m.provider), f = (lo + hi) / 2;
    const cb = costOn(last.m, Math.round(nb * f), last.st);
    const diff = count - nb, pct = count ? (diff / count) * 100 : 0;
    const dc = last.c.credits - cb.credits;
    out.innerHTML = `<div class="counters">
      <div class="ct"><div class="v">${fmt(count)}</div><div class="l">tokens in the text above (A)</div></div>
      <div class="ct"><div class="v">${fmt(nb)}</div><div class="l">tokens in this version (B)</div></div>
      <div class="ct hot"><div class="v">${diff >= 0 ? '−' : '+'}${fmt(Math.abs(diff))}</div><div class="l">${diff >= 0 ? 'fewer' : 'more'} tokens in B (${fmt(Math.abs(pct))}%)</div></div>
      <div class="ct"><div class="v">${dc >= 0 ? '−' : '+'}${cr(Math.abs(dc * last.st.req))}</div><div class="l">credits per month on ${esc(last.m.name)}</div></div></div>
      <p class="small">A shorter prompt is only cheaper if it still gets the right answer first time. Retries and long answers cost far more than a few prompt tokens.</p>`;
  }
  on($('c-compare'), 'toggle', compare);
  on(text2, 'input', compare);

  // ---- a link that reopens this estimate ----
  function shareUrl() {
    const p = new URLSearchParams({ m: byName(sel.value).slug, t: String(count) });
    if (level === 'advanced') {
      p.set('lvl', 'advanced');
      p.set('mode', $('c-mode').value);
      for (const k of LINK_NUMS) p.set(k, $(`c-${k}`).value);
      p.set('auto', $('c-auto').checked ? '1' : '0');
      p.set('cx', CONTEXT.map(([id]) => ($(`cx-${id}c`).checked ? '' : '-') + Math.max(0, Math.round(+$(`cx-${id}`).value || 0))).join('.'));
    }
    return `${location.origin}${PAGE}?${p}#calculator`;
  }
  on($('c-link'), 'click', async (e) => {
    const btn = e.currentTarget;
    try { await navigator.clipboard.writeText(shareUrl()); flash(btn, 'Link copied'); }
    catch { flash(btn, 'Copy blocked by the browser'); }
  });

  // ---- result text, for copy and for screen readers ----
  function summary() {
    const { m, c, st } = last;
    const unit = st.calls > 1 ? 'task' : 'request';
    return [
      `AI Token Calculator · ${m.name} · ${level} mode`,
      `Input tokens: ${fmt(c.t.input)}${st.chat ? ` (${fmt(c.t.prompt)} text + ${fmt(st.ctx)} Copilot context${st.calls > 1 ? `, ${st.calls} model calls` : ''})` : ''}`,
      `  fresh ${fmt(c.t.fresh)} · cached ${fmt(c.t.cached)} · cache writes ${fmt(c.t.written)}`,
      `Output tokens: ${fmt(c.t.out)} (estimate)`,
      `Per ${unit}: ${usd(c.dollars)} = ${cr(c.credits)} AI Credits${c.longCalls ? ' (includes long-context rates)' : ''}${st.auto ? ' (Auto −10%)' : ''}`,
      `Per month (${fmt(st.req)} ${unit}s): ${usd(c.dollars * st.req)} = ${cr(c.credits * st.req)} AI Credits`,
      `Estimate, not provider-reported usage. Prices checked ${DATA.checked}: ${DATA.source}`,
      `Open this estimate: ${shareUrl()}`,
    ].join('\n');
  }
  let liveTimer = 0;
  function announce() {
    clearTimeout(liveTimer);
    liveTimer = setTimeout(() => {
      if (!last) return;
      if (blank()) { $('c-live').textContent = 'Text cleared. 0 input tokens.'; return; }
      $('c-live').textContent = `${fmt(last.c.t.input)} input tokens. ${cr(last.c.credits)} AI Credits per ${last.st.calls > 1 ? 'task' : 'request'} on ${last.m.name}.`;
    }, 900);
  }
  const flash = (btn, label) => { const old = btn.dataset.label ??= btn.textContent; btn.textContent = label; setTimeout(() => (btn.textContent = old), 1800); };
  on($('c-copy'), 'click', async (e) => {
    const btn = e.currentTarget;
    try { await navigator.clipboard.writeText(summary()); flash(btn, 'Copied'); }
    catch { flash(btn, 'Copy blocked by the browser'); }
  });
  on($('c-csv'), 'click', () => {
    const st = last.st;
    const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [['Model', 'Provider', 'Prompt tokens', 'Token basis', 'Context tokens', 'Model calls', 'Input tokens', 'Fresh input', 'Cached input', 'Cache writes', 'Output tokens', 'Auto discount', 'USD per request', 'AI Credits per request', 'Requests per month', 'USD per month', 'AI Credits per month', 'Calls at long-context rate']];
    for (const m of MODELS) {
      const t = tokensFor(m), c = costOn(m, t.mid, st);
      rows.push([m.name, m.provider, t.mid, t.exact && enc ? 'o200k_base' : 'estimate', st.ctx, st.calls, c.t.input, c.t.fresh, c.t.cached, c.t.written, c.t.out, st.auto ? 'yes' : 'no',
        c.dollars.toFixed(6), c.credits.toFixed(4), st.req, (c.dollars * st.req).toFixed(4), (c.credits * st.req).toFixed(2), c.longCalls]);
    }
    rows.push([], [`Estimate only, not provider-reported usage. Prices from GitHub, checked ${DATA.checked}: ${DATA.source}`]);
    download(rows.map((r) => r.map(q).join(',')).join('\r\n'), 'ai-token-estimate.csv');
  });
  const download = (body, name) => {
    const blob = new Blob([body], { type: 'text/csv;charset=utf-8' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  // ---- text tools ----
  root.querySelectorAll('[data-sample]').forEach((b) => on(b, 'click', () => {
    text.value = SAMPLES[b.dataset.sample].text;
    recount();
    text.focus();
  }));
  on($('c-clear'), 'click', () => { unshare(); text.value = ''; recount(); text.focus(); });
  on($('c-paste'), 'click', async (e) => {
    const btn = e.currentTarget;
    try {
      text.value = await navigator.clipboard.readText();
      recount();
      text.focus();
    } catch {
      text.focus();
      flash(btn, 'Press Ctrl+V / ⌘V');
    }
  });

  // Large pastes are counted after a short pause instead of on every keystroke.
  let t0 = 0;
  on(text, 'input', () => { clearTimeout(t0); t0 = setTimeout(recount, text.value.length > 50_000 ? 350 : 60); });
  on(root.querySelector('.tc-settings'), 'input', price);
  on(root.querySelector('.tc-settings'), 'change', price);
  root.querySelectorAll('[data-out]').forEach((b) => on(b, 'click', () => { $('c-out').value = b.dataset.out; price(); }));

  // The usage report analyser loads only when someone picks a file.
  on($('u-file'), 'change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { analyseUsage } = await import('./usage.js');
    analyseUsage(file, { DATA, estimate: () => last, download });
  });

  $('c-status').textContent = enc ? '' : 'Loading the tokenizer…';
  setLevel(level);
  recount();
  loadO200k().then((m) => {
    if (signal.aborted) return;
    enc = m;
    $('c-status').textContent = m ? '' : 'The tokenizer couldn’t load, so counts are estimated at 4 characters per token.';
    recount();
  });
}

document.addEventListener('astro:before-swap', () => controller?.abort());
