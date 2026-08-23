// Pushes every indexable URL to IndexNow (Bing, Yandex, Seznam, Naver, and
// whoever else is subscribed) right after a deploy, instead of waiting for
// each one to be crawled on its own schedule.
//
// One bulk submission of the whole sitemap rather than a diff of "what
// changed since last deploy": IndexNow treats a resubmitted, unchanged URL as
// a no-op, so there is no penalty for over-submitting, and it means this
// script needs no state of its own to stay correct — it can't drift out of
// sync with a URL list it never tracked in the first place.
//
// Non-fatal by design (see the try/catch at the bottom and how it's called in
// deploy.yml): IndexNow is a courtesy ping for faster indexing, not a
// requirement for the site to be live or correct. A network hiccup here must
// never turn a good deploy red.

import { readFileSync } from 'node:fs';

// Plain constants rather than an import from `src/config.ts`: this script
// runs under bare `node`, the same as every other file in `scripts/`, with no
// TypeScript/Vite loader available to resolve a `.ts` import. Keep this in
// sync with `INDEXNOW_KEY` and the key file's name in `public/` if either
// ever changes.
const INDEXNOW_KEY = 'fac4b4f6b8d24cb30f334703d427d0fa';
const SITE_URL = 'https://blog.msdevbuild.com';

const SITEMAP_PATH = 'dist/sitemap-0.xml';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

function readSitemapUrls() {
  const xml = readFileSync(SITEMAP_PATH, 'utf-8');
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  const urlList = readSitemapUrls();
  if (urlList.length === 0) {
    console.warn(`[indexnow] no URLs found in ${SITEMAP_PATH} — nothing to submit`);
    return;
  }

  const host = new URL(SITE_URL).hostname;
  const body = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList,
  };

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });

  // IndexNow returns 200 (or 202) on success and no body worth reading either
  // way — the useful signal is entirely in the status code.
  if (!res.ok) {
    throw new Error(`IndexNow responded ${res.status} ${res.statusText}`);
  }

  console.log(`[indexnow] submitted ${urlList.length} URLs for ${host} (${res.status})`);
}

main().catch((err) => {
  console.warn(`[indexnow] submission failed — non-fatal, deploy already succeeded: ${err.message}`);
});
