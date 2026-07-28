import type { APIRoute } from 'astro';
import { SITE } from '../../config';
import { qrSvg } from '../../lib/qr';

/**
 * The install QR as a standalone file, so it can be dropped straight onto a
 * slide, a poster or a business card. Vector, so it survives being blown up to
 * a projector — larger `size` here only changes the default render size.
 */
export const GET: APIRoute = async () => {
  const svg = await qrSvg(`${SITE.url}/install/`, { size: 512, margin: 2 });

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=604800',
    },
  });
};
