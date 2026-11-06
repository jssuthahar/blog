/**
 * Reads a GitHub AI usage report (CSV) in the browser and compares it with the
 * calculator's prices. Loaded only when a reader picks a file; the file is
 * never uploaded or stored.
 *
 * Columns follow GitHub's billing reports reference: date, product, sku,
 * quantity, unit_type, applied_cost_per_quantity, gross_amount,
 * discount_amount, net_amount, username, organization, cost_center_name,
 * model, input, output, cache_read, cache_write. Each row is a total for one
 * date, model and user, not a single request.
 */
const fmt = (n, d = 0) => Number(n).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });
const cr = (n) => fmt(n, n < 10 ? 2 : 0);
const usd = (n) => '$' + fmt(n, n < 100 ? 2 : 0);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** A small RFC 4180 parser: quoted fields, doubled quotes, CRLF, and the delimiter the header uses. */
export function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const first = text.slice(0, text.indexOf('\n') + 1 || undefined);
  const delim = [',', ';', '\t'].sort((a, b) => first.split(b).length - first.split(a).length)[0];
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"') q = true;
    else if (c === delim) { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((x) => x !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((x) => x !== '')) rows.push(row);
  return rows;
}

const num = (v) => {
  const n = parseFloat(String(v ?? '').replace(/[$,\s]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

export async function analyseUsage(file, { DATA, estimate, download }) {
  const status = document.getElementById('u-status');
  const out = document.getElementById('u-out');
  out.innerHTML = '';
  if (file.size > 100 * 1024 * 1024) { status.textContent = 'That file is over 100 MB. Request a shorter period from GitHub and try again.'; return; }
  status.textContent = `Reading ${file.name}…`;

  let rows;
  try { rows = parseCsv(await file.text()); }
  catch { status.textContent = 'That file couldn’t be read as text. Choose the CSV that GitHub emailed you.'; return; }
  if (rows.length < 2) { status.textContent = 'The file has no data rows.'; return; }

  const head = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const col = (name) => head.indexOf(name);
  const C = Object.fromEntries(['date', 'username', 'model', 'product', 'sku', 'quantity', 'unit_type', 'gross_amount', 'discount_amount', 'net_amount', 'input', 'output', 'cache_read', 'cache_write', 'organization', 'cost_center_name'].map((k) => [k, col(k)]));
  if (C.model < 0 || (C.gross_amount < 0 && C.quantity < 0)) {
    status.textContent = `This doesn’t look like an AI usage report: it needs a “model” column and a “gross_amount” or “quantity” column. Found: ${head.slice(0, 12).join(', ')}${head.length > 12 ? ', …' : ''}. Download it from Billing → AI usage, not Metered usage.`;
    return;
  }

  const price = new Map(DATA.models.map((m) => [slug(m.name), m]));
  const get = (r, k) => (C[k] >= 0 ? r[C[k]] : '');
  const items = [];
  let skipped = 0;
  for (const r of rows.slice(1)) {
    const model = get(r, 'model').trim();
    if (!model) { skipped++; continue; }
    const gross = num(get(r, 'gross_amount'));
    // GitHub: 1 AI credit = $0.01. Without gross_amount, quantity is used when it is counted in credits.
    const credits = C.gross_amount >= 0 ? gross / DATA.plan.usdPerCredit : num(get(r, 'quantity'));
    const t = { input: num(get(r, 'input')), output: num(get(r, 'output')), read: num(get(r, 'cache_read')), write: num(get(r, 'cache_write')) };
    const m = price.get(slug(model));
    const est = m ? (t.input * m.in + t.read * m.cached + t.write * (m.write ?? m.in) + t.output * m.out) / 1e6 / DATA.plan.usdPerCredit : null;
    items.push({ date: get(r, 'date').slice(0, 10), user: get(r, 'username') || '—', model, credits, net: num(get(r, 'net_amount')), ...t, est, priced: !!m });
  }
  if (!items.length) { status.textContent = 'No rows in this file name a model, so there is no AI usage to analyse.'; return; }

  const sum = (arr, k) => arr.reduce((a, x) => a + (x[k] ?? 0), 0);
  const group = (k) => {
    const g = new Map();
    for (const x of items) {
      const e = g.get(x[k]) ?? { key: x[k], rows: [], };
      e.rows.push(x);
      g.set(x[k], e);
    }
    return [...g.values()].map((e) => ({ key: e.key, credits: sum(e.rows, 'credits'), input: sum(e.rows, 'input'), output: sum(e.rows, 'output'), read: sum(e.rows, 'read'), write: sum(e.rows, 'write'), est: e.rows.every((x) => x.priced) ? sum(e.rows, 'est') : null, n: e.rows.length }))
      .sort((a, b) => b.credits - a.credits);
  };
  const byModel = group('model'), byUser = group('user');
  const total = sum(items, 'credits');
  const dates = items.map((x) => x.date).filter(Boolean).sort();
  const days = dates.length ? Math.max(1, Math.round((Date.parse(dates.at(-1)) - Date.parse(dates[0])) / 864e5) + 1) : 0;
  const net = C.net_amount >= 0 ? sum(items, 'net') : null;
  const hasTokens = C.input >= 0 && C.output >= 0;
  const top = [...items].sort((a, b) => b.credits - a.credits).slice(0, 10);
  const maxModel = byModel[0]?.credits || 1;

  // The calculator's own monthly estimate, beside the report scaled to 30 days.
  const e = estimate();
  const estMonth = e ? e.c.credits * e.st.req : null;
  const perMonth = days ? (total / days) * 30 : null;

  const diff = (a, b) => (b == null || !a ? '—' : `${b >= a ? '+' : '−'}${fmt(Math.abs((b / a - 1) * 100))}%`);
  out.innerHTML = `
    <div class="counters">
      <div class="ct hot"><div class="v">${cr(total)}</div><div class="l">AI Credits used (${usd(total * DATA.plan.usdPerCredit)} gross)</div></div>
      ${net != null ? `<div class="ct"><div class="v">${usd(net)}</div><div class="l">net billed, after included credits</div></div>` : ''}
      <div class="ct"><div class="v">${days ? fmt(days) : '—'}</div><div class="l">days${dates.length ? `, ${esc(dates[0])} to ${esc(dates.at(-1))}` : ''}</div></div>
      <div class="ct"><div class="v">${fmt(byUser.length)}</div><div class="l">people · ${fmt(byModel.length)} models</div></div>
    </div>
    ${perMonth != null && estMonth != null ? `<p class="tc-actual small"><b>Against your estimate:</b> the report works out to about ${cr(perMonth)} credits per 30 days. The calculator above estimates ${cr(estMonth)} credits a month for ${fmt(e.st.req)} ${e.st.calls > 1 ? 'tasks' : 'requests'} on ${esc(e.m.name)}. Adjust its settings until the two agree, then use it to plan.</p>` : ''}

    <h4 class="tc-sub">By model</h4>
    <div class="tbl"><table class="t"><thead><tr><th scope="col">Model</th><th scope="col">Share</th><th scope="col" class="r">AI Credits</th>${hasTokens ? '<th scope="col" class="r">Input</th><th scope="col" class="r">Cache read</th><th scope="col" class="r">Cache write</th><th scope="col" class="r">Output</th><th scope="col" class="r">At list prices</th><th scope="col" class="r">Difference</th>' : ''}</tr></thead><tbody>
      ${byModel.map((g) => `<tr><th scope="row">${esc(g.key)}${g.est == null && hasTokens ? '<small>not on the price list</small>' : ''}</th><td><div class="tc-share"><i style="width:${(g.credits / maxModel) * 100}%"></i></div></td><td class="r">${cr(g.credits)}</td>${hasTokens ? `<td class="r">${fmt(g.input)}</td><td class="r">${fmt(g.read)}</td><td class="r">${fmt(g.write)}</td><td class="r">${fmt(g.output)}</td><td class="r">${g.est == null ? '—' : cr(g.est)}</td><td class="r">${diff(g.credits, g.est)}</td>` : ''}</tr>`).join('')}
    </tbody></table></div>
    ${hasTokens ? '<p class="small">“At list prices” re-prices the report’s token counts at the rates above, assuming <code>input</code> excludes cached tokens. A gap usually means discounts such as Auto (−10%), long-context rates (daily totals can’t show which requests crossed a threshold), or a price change.</p>' : '<p class="small">This report has no token columns, so it can’t be re-priced.</p>'}

    <h4 class="tc-sub">By person</h4>
    <div class="tbl"><table class="t"><thead><tr><th scope="col">User</th><th scope="col" class="r">AI Credits</th><th scope="col" class="r">Share</th><th scope="col" class="r">Days × models</th></tr></thead><tbody>
      ${byUser.slice(0, 10).map((g) => `<tr><th scope="row">${esc(g.key)}</th><td class="r">${cr(g.credits)}</td><td class="r">${fmt((g.credits / total) * 100, 1)}%</td><td class="r">${fmt(g.n)}</td></tr>`).join('')}
    </tbody></table></div>
    ${byUser.length > 10 ? `<p class="small">Top 10 of ${fmt(byUser.length)} people.</p>` : ''}

    <h4 class="tc-sub">Most expensive days</h4>
    <div class="tbl"><table class="t"><thead><tr><th scope="col">Date</th><th scope="col">User</th><th scope="col">Model</th><th scope="col" class="r">AI Credits</th>${hasTokens ? '<th scope="col" class="r">Input</th><th scope="col" class="r">Output</th>' : ''}</tr></thead><tbody>
      ${top.map((x) => `<tr><td>${esc(x.date)}</td><th scope="row">${esc(x.user)}</th><td>${esc(x.model)}</td><td class="r">${cr(x.credits)}</td>${hasTokens ? `<td class="r">${fmt(x.input)}</td><td class="r">${fmt(x.output)}</td>` : ''}</tr>`).join('')}
    </tbody></table></div>
    <p class="small">The report totals each person’s use of each model per day, so single requests can’t be singled out. A large day on one model is the place to look.</p>
    <div class="tc-actions"><button type="button" class="btn btn-outline btn-sm" id="u-csv">Download summary CSV</button></div>`;

  status.textContent = `Analysed ${fmt(items.length)} rows from ${file.name}${skipped ? `; ${fmt(skipped)} rows without a model were skipped` : ''}. Read in your browser; nothing was uploaded.`;

  document.getElementById('u-csv').addEventListener('click', () => {
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [['Section', 'Name', 'AI Credits', 'Share %', 'Input', 'Cache read', 'Cache write', 'Output', 'At list prices (credits)']];
    lines.push(['Total', file.name, total.toFixed(2), '100', sum(items, 'input'), sum(items, 'read'), sum(items, 'write'), sum(items, 'output'), '']);
    for (const g of byModel) lines.push(['Model', g.key, g.credits.toFixed(2), ((g.credits / total) * 100).toFixed(1), g.input, g.read, g.write, g.output, g.est == null ? '' : g.est.toFixed(2)]);
    for (const g of byUser) lines.push(['User', g.key, g.credits.toFixed(2), ((g.credits / total) * 100).toFixed(1), g.input, g.read, g.write, g.output, g.est == null ? '' : g.est.toFixed(2)]);
    lines.push([], [`Credits from gross_amount at $0.01 per AI credit. List prices checked ${DATA.checked}.`]);
    download(lines.map((r) => r.map(q).join(',')).join('\r\n'), 'ai-usage-summary.csv');
  });
}
