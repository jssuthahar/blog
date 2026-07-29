import type { APIRoute } from 'astro';
import { BUILD_ID } from '../lib/build-id';

/**
 * The build stamp the installed app polls to notice a new deploy.
 *
 * An installed PWA can sit in the app switcher for days without ever
 * navigating, so nothing prompts the browser to re-check the service worker or
 * the HTML. This endpoint gives the running app one cheap thing to compare
 * against: every page carries the id it was built with (the build-id meta tag),
 * and the app fetches this file when it returns to the foreground. A different
 * id means a newer version is on the server, and the reader gets a Reload
 * prompt instead of silently reading stale content.
 *
 * The header below only applies if this is ever served by a real server —
 * GitHub Pages serves the built file and ignores it — so the caller is the one
 * that must fetch with `cache: 'no-store'`.
 */
export const GET: APIRoute = () =>
  new Response(JSON.stringify({ build: BUILD_ID }), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store, max-age=0',
    },
  });
