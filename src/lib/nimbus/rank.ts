/**
 * Browser-side ranking for Ask Nimbus: a small BM25 over each document's
 * title (weighted higher) and body, with light stemming and a few tech
 * synonyms so "VMs", "virtual machine" and "vm" all meet. Nothing the reader
 * types leaves the device.
 */

const STOP = new Set(
  'a an and are as at be by can do does for from how i in is it its me my of on or so than that the their them then there these this to us was we what when where which who why will with you your about explain tell define meaning mean please should would could use used using show find article articles post posts blog want need get'.split(' '),
);

const SYN: Record<string, string[]> = {
  vm: ['virtual', 'machine'],
  vms: ['virtual', 'machine'],
  vnet: ['virtual', 'network'],
  rbac: ['role', 'access', 'control'],
  aks: ['kubernetes'],
  k8s: ['kubernetes'],
  ai: ['artificial', 'intelligence'],
  llm: ['model', 'language'],
  maui: ['dotnet', 'mobile'],
  dotnet: ['net'],
  net: ['dotnet'],
  csharp: ['c#'],
  copilot: ['github', 'copilot'],
  gh: ['github'],
  ad: ['entra', 'id'],
  aad: ['entra', 'id'],
  auth: ['authentication', 'authorization'],
  db: ['database'],
  sql: ['database', 'query'],
  cost: ['price', 'pricing'],
  price: ['cost', 'pricing'],
  slow: ['performance', 'latency'],
  perf: ['performance'],
};

const stem = (w: string) => {
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 4 && w.endsWith('es') && !w.endsWith('ses')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  return w;
};

export const tokens = (s: string, expand = false) => {
  const out: string[] = [];
  const norm = s.toLowerCase().replace(/\.net\b/g, ' dotnet ').replace(/c#/g, ' csharp ');
  for (const raw of norm.split(/[^a-z0-9]+/)) {
    if (!raw || STOP.has(raw)) continue;
    out.push(stem(raw));
    if (expand && SYN[raw]) out.push(...SYN[raw].map(stem));
  }
  return out;
};

export interface RankDoc { title: string; body: string }
interface Doc { t: string[]; b: string[] }
export interface Ranker { docs: Doc[]; df: Map<string, number>; avgT: number; avgB: number }
export interface Hit { i: number; score: number; cover: number }

export function makeRanker(entries: RankDoc[]): Ranker {
  const docs = entries.map((e) => ({ t: tokens(e.title), b: tokens(e.body) }));
  const df = new Map<string, number>();
  for (const d of docs) for (const t of new Set([...d.t, ...d.b])) df.set(t, (df.get(t) ?? 0) + 1);
  const avg = (k: 't' | 'b') => docs.reduce((n, d) => n + d[k].length, 0) / Math.max(1, docs.length);
  return { docs, df, avgT: Math.max(1, avg('t')), avgB: Math.max(1, avg('b')) };
}

const bm25 = (tf: number, len: number, avg: number, k1 = 1.2, b = 0.75) => (tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * len) / avg));

/**
 * Best matches for a query. `cover` is the share of the reader's own words
 * (not synonyms) a document contains, so "secure minimal api" never returns a
 * post that only says "api".
 */
export function rank(r: Ranker, query: string, n = 5): Hit[] {
  const own = [...new Set(tokens(query))];
  const all = [...new Set(tokens(query, true))];
  if (!own.length) return [];
  const N = r.docs.length;
  const hits: Hit[] = [];
  r.docs.forEach((d, i) => {
    let score = 0;
    let have = 0;
    for (const t of all) {
      const tfT = d.t.filter((x) => x === t).length;
      const tfB = d.b.filter((x) => x === t).length;
      if (!tfT && !tfB) continue;
      const df = r.df.get(t) ?? 0;
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      const syn = own.includes(t) ? 1 : 0.5;
      score += syn * idf * (2.2 * bm25(tfT, d.t.length, r.avgT) + bm25(tfB, d.b.length, r.avgB));
      if (own.includes(t)) have++;
    }
    if (score > 0) hits.push({ i, score, cover: have / own.length });
  });
  return hits.sort((a, b) => b.cover - a.cover || b.score - a.score).slice(0, n);
}
