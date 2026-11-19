// Serves the APK from the same domain. Cloudflare Pages caps static files at 25 MB,
// so the file is streamed from the site's public repo instead.
const SRC = 'https://raw.githubusercontent.com/Safwan11/ifaq-site/main/download/IFAQ.apk';

export async function onRequest({ request }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405 });
  const r = await fetch(SRC, { cf: { cacheEverything: true, cacheTtl: 600 } });
  if (!r.ok) return new Response('APK not available right now', { status: 502 });
  const h = new Headers({
    'content-type': 'application/vnd.android.package-archive',
    'content-disposition': 'attachment; filename="IFAQ.apk"',
    'cache-control': 'public, max-age=300',
  });
  const len = r.headers.get('content-length');
  if (len) h.set('content-length', len);
  return new Response(request.method === 'HEAD' ? null : r.body, { headers: h });
}
