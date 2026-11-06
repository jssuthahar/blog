/**
 * The AI Token Calculator at the top of /open-source/ai-token-calculator/.
 *
 * Independent of the course below it: it reads the price list the page embeds
 * (#ta-data, built from pricing.ts), counts with gpt-tokenizer in the browser,
 * and never sends the text anywhere. Only the reader's settings, never their
 * text, are remembered on this device.
 */
import { loadO200k, loadCl100k } from './tokenizer.js';
import { SAMPLES } from './samples.js';

let controller = null;

const fmt = (n, d = 0) => Number(n).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });
const cr = (n) => fmt(n, n < 1 ? 3 : n < 100 ? 2 : 0);
const usd = (n) => '$' + fmt(n, n < 0.01 ? 4 : n < 100 ? 2 : 0);
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

const KEY = 'ta-calc-v1';
const FIELDS = ['c-model', 'c-mode', 'c-out', 'c-cache', 'c-req', 'c-auto'];

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
  } catch {}
  const persist = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(FIELDS.map((id) => [id, id === 'c-auto' ? $(id).checked : $(id).value]))));
    } catch {}
  };
  text.value = SAMPLES.prompt.text;

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

  // ---- counting ----
  let ids = [];
  let count = 0;
  const countText = (s) => (enc ? enc.encode(s) : null);
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
    const enc1 = countText(s);
    ids = enc1 ?? [];
    count = enc1 ? enc1.length : Math.ceil(s.length / 4);
    const words = (s.trim().match(/\S+/g) || []).length;
    const lines = s ? s.split('\n').length : 0;
    const kind = kindOf(s);
    $('c-meta').textContent = `${fmt(s.length)} characters · ${fmt(words)} words · ${fmt(lines)} line${lines === 1 ? '' : 's'}${kind ? ` · looks like ${kind}` : ''}`;

    // Help that depends on the text itself.
    const msg = [];
    if (!s.trim()) msg.push('Paste or type some text to count its tokens. The cost below is then only the context and output.');
    if (kind === 'JSON') {
      try {
        const min = JSON.stringify(JSON.parse(s));
        const m = enc ? enc.encode(min).length : Math.ceil(min.length / 4);
        if (m < count) msg.push(`Valid JSON. Minified, it would be ${fmt(m)} tokens: ${fmt(count - m)} fewer (${fmt((1 - m / count) * 100)}%).`);
        else msg.push('Valid JSON, already compact.');
      } catch (e) {
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
    const out = num('c-out', 'Output tokens');
    const cache = num('c-cache', 'Cache share');
    const req = num('c-req', 'Requests per month');
    const errs = [out, cache, req].map((x) => x.err).filter(Boolean);
    $('c-err').textContent = errs.join(' ');
    const chat = $('c-mode').value === 'chat';
    $('c-ctx-box').hidden = !chat;
    const ctx = chat ? CONTEXT.reduce((a, [id]) => a + ($(`cx-${id}c`).checked ? Math.max(0, +$(`cx-${id}`).value || 0) : 0), 0) : 0;
    return { out: Math.round(out.n), cache: cache.n / 100, req: Math.round(req.n), auto: $('c-auto').checked, ctx, chat };
  }
  /** One request on one model. Uses the long-context rates once input passes the model's threshold. */
  function costOn(m, textTokens, st) {
    const input = textTokens + st.ctx;
    const cached = Math.round(input * st.cache);
    const fresh = input - cached;
    const long = !!(m.long && input > m.long.over);
    const r = long ? m.long : m;
    const parts = { fresh: (fresh * r.in) / 1e6, cached: (cached * r.cached) / 1e6, out: (st.out * r.out) / 1e6 };
    const sub = parts.fresh + parts.cached + parts.out;
    const disc = st.auto ? sub * DATA.plan.autoDiscount : 0;
    const dollars = sub - disc;
    return { input, cached, fresh, long, r, parts, disc, dollars, credits: dollars / DATA.plan.usdPerCredit };
  }
  const tokensFor = (m) => {
    const [a, b] = rangeOf(m.provider);
    return { mid: Math.round((count * (a + b)) / 2), lo: Math.round(count * a), hi: Math.round(count * b), exact: m.provider === 'OpenAI' };
  };

  function price() {
    const st = settings();
    const m = byName(sel.value);
    const t = tokensFor(m);
    const c = costOn(m, t.mid, st);
    const basis = !enc ? 'estimate: 4 characters per token' : t.exact ? 'o200k_base count' : `estimate, ${fmt(t.lo)}–${fmt(t.hi)}`;
    $('c-in').textContent = fmt(c.input);
    $('c-in-note').innerHTML = `${st.chat ? `${fmt(t.mid)} your text + ${fmt(st.ctx)} context` : 'your text only'}<span class="badge ${enc && t.exact ? 'ex' : 'es'}">${basis}</span>`;
    $('c-o').textContent = fmt(st.out);
    $('c-cr').textContent = cr(c.credits);
    $('c-usd').textContent = `${usd(c.dollars)} per request`;
    $('c-mcr').textContent = cr(c.credits * st.req);
    $('c-musd').textContent = `${usd(c.dollars * st.req)} for ${fmt(st.req)} requests · ${fmt((c.credits * st.req) / DATA.plan.businessCredits * 100, 1)}% of one Business seat`;

    const L = (label, value, sub = '') => `<div class="ln"><span>${label}${sub ? `<small>${sub}</small>` : ''}</span><span class="num">${value}</span></div>`;
    $('c-receipt').innerHTML =
      L('Fresh input', usd(c.parts.fresh), `${fmt(c.fresh)} × $${c.r.in} / 1M`) +
      L('Cached input', usd(c.parts.cached), `${fmt(c.cached)} × $${c.r.cached} / 1M`) +
      L('Output', usd(c.parts.out), `${fmt(st.out)} × $${c.r.out} / 1M`) +
      (st.auto ? L('Auto model discount', '−' + usd(c.disc), '10% off model costs') : '') +
      L('<b>Total</b>', `<b>${usd(c.dollars)} · ${cr(c.credits)} credits</b>`);

    const warn = [];
    if (c.long) warn.push(`This request passes ${m.name}’s long-context threshold of ${fmt(m.long.over)} input tokens, so the whole request is priced at the higher rates.`);
    if (m.note) warn.push(`${m.name}: ${m.note}.`);
    $('c-warn').hidden = !warn.length;
    $('c-warn').textContent = warn.join(' ');

    $('c-assume').innerHTML = [
      enc
        ? (t.exact
          ? 'Token count uses OpenAI’s o200k_base tokenizer. GitHub doesn’t say which tokenizer each Copilot model uses, so treat it as a close estimate for this model.'
          : `${m.provider} doesn’t publish a browser tokenizer: the count is the o200k_base count × ${rangeOf(m.provider).join('–')}, a rough range. Use the provider’s token-counting API for an exact figure.`)
        : 'The tokenizer hasn’t loaded, so tokens are estimated at 4 characters each.',
      st.chat ? `Copilot context of ${fmt(st.ctx)} tokens uses typical example sizes; yours depends on your setup.` : 'Only your text is sent: no system prompt, tools or history.',
      `Output of ${fmt(st.out)} tokens is your estimate. Reasoning models also write hidden thinking tokens, which providers bill as output.`,
      st.cache ? `${fmt(st.cache * 100)}% of input is read from cache. Cache-write charges, where a model has them, are not included.` : 'No caching assumed.',
      `Prices: GitHub’s per-1M-token rates, checked ${DATA.checked}. 1 AI Credit = $0.01.`,
      'Actual usage is what GitHub reports in your billing settings under AI usage.',
    ].map((x) => `<li>${esc(x)}</li>`).join('');

    last = { m, t, c, st };
    table(st);
    announce();
    persist();
  }

  // ---- every model ----
  let sortBy = 'cost';
  function table(st) {
    const cur = sel.value;
    const rows = MODELS.map((m) => ({ m, t: tokensFor(m), c: costOn(m, tokensFor(m).mid, st) }));
    if (sortBy === 'cost') rows.sort((a, b) => a.c.dollars - b.c.dollars);
    const head = `<thead><tr><th scope="col">Model</th><th scope="col" class="r">Input tokens</th><th scope="col" class="r">Credits / request</th><th scope="col" class="r">Credits / month</th><th scope="col" class="r">$ / month</th></tr></thead>`;
    $('c-table').innerHTML = head + '<tbody>' + rows.map(({ m, t, c }) =>
      `<tr${m.name === cur ? ' class="sel" aria-current="true"' : ''}><th scope="row"><button type="button" data-pick="${esc(m.name)}">${esc(m.name)}</button><small>${esc(m.provider)} · ${esc(m.tier)}${c.long ? ' · long-context rate' : ''}</small></th>` +
      `<td class="r">${t.exact && enc ? '' : '~'}${fmt(c.input)}</td><td class="r">${cr(c.credits)}</td><td class="r">${cr(c.credits * st.req)}</td><td class="r">${usd(c.dollars * st.req)}</td></tr>`).join('') + '</tbody>';
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

  // ---- result text, for copy and for screen readers ----
  function summary() {
    const { m, c, st } = last;
    return [
      `AI Token Calculator · ${m.name}`,
      `Input tokens: ${fmt(c.input)}${st.chat ? ` (${fmt(c.input - st.ctx)} text + ${fmt(st.ctx)} Copilot context)` : ''}`,
      `Output tokens: ${fmt(st.out)} (estimate)`,
      `Cached input: ${fmt(st.cache * 100)}%${st.auto ? ' · Auto model −10%' : ''}`,
      `Per request: ${usd(c.dollars)} = ${cr(c.credits)} AI Credits${c.long ? ' (long-context rate)' : ''}`,
      `Per month (${fmt(st.req)} requests): ${usd(c.dollars * st.req)} = ${cr(c.credits * st.req)} AI Credits`,
      `Estimate. Prices checked ${DATA.checked}: ${DATA.source}`,
    ].join('\n');
  }
  let liveTimer = 0;
  function announce() {
    clearTimeout(liveTimer);
    liveTimer = setTimeout(() => {
      if (!last) return;
      $('c-live').textContent = `${fmt(last.c.input)} input tokens. ${cr(last.c.credits)} AI Credits per request on ${last.m.name}.`;
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
    const rows = [['Model', 'Provider', 'Input tokens', 'Token basis', 'Output tokens', 'Cached input %', 'Auto discount', 'USD per request', 'AI Credits per request', 'Requests per month', 'USD per month', 'AI Credits per month', 'Long-context rate']];
    for (const m of MODELS) {
      const t = tokensFor(m), c = costOn(m, t.mid, st);
      rows.push([m.name, m.provider, c.input, t.exact && enc ? 'o200k_base' : 'estimate', st.out, st.cache * 100, st.auto ? 'yes' : 'no',
        c.dollars.toFixed(6), c.credits.toFixed(4), st.req, (c.dollars * st.req).toFixed(4), (c.credits * st.req).toFixed(2), c.long ? 'yes' : 'no']);
    }
    rows.push([], [`Estimate only. Prices from GitHub, checked ${DATA.checked}: ${DATA.source}`]);
    const blob = new Blob([rows.map((r) => r.map(q).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'ai-token-estimate.csv' });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  // ---- text tools ----
  root.querySelectorAll('[data-sample]').forEach((b) => on(b, 'click', () => {
    text.value = SAMPLES[b.dataset.sample].text;
    recount();
    text.focus();
  }));
  on($('c-clear'), 'click', () => { text.value = ''; recount(); text.focus(); });
  on($('c-paste'), 'click', async (e) => {
    const btn = e.currentTarget;
    try {
      const clip = await navigator.clipboard.readText();
      text.value = clip;
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
  on(root.querySelector('.tc-opts'), 'input', price);
  on(root.querySelector('.tc-opts'), 'change', price);
  on($('c-ctx'), 'input', price);
  root.querySelectorAll('[data-out]').forEach((b) => on(b, 'click', () => { $('c-out').value = b.dataset.out; price(); }));

  $('c-status').textContent = enc ? '' : 'Loading the tokenizer…';
  recount();
  loadO200k().then((m) => {
    if (signal.aborted) return;
    enc = m;
    $('c-status').textContent = m ? '' : 'The tokenizer couldn’t load, so counts are estimated at 4 characters per token.';
    recount();
  });
}

document.addEventListener('astro:before-swap', () => controller?.abort());
