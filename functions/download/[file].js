// /download/IFAQ.apk and /download/version.json serve the copies committed in download/
// (updated by hand when a new version is deployed). Cloudflare Pages caps static files at 25 MB.
const FALLBACK = 'https://raw.githubusercontent.com/Safwan11/ifaq-site/main/download/';
const TYPES = {
  'IFAQ.apk': 'application/vnd.android.package-archive',
  'version.json': 'application/json; charset=utf-8',
};

async function fetchFirst(name, method) {
  for (const base of [FALLBACK]) {
    const r = await fetch(base + name, { method, redirect: 'follow', cf: { cacheEverything: true, cacheTtl: name === 'IFAQ.apk' ? 300 : 60 } });
    if (r.ok) return r;
  }
  return null;
}

export async function onRequest({ request, params }) {
  const name = params.file;
  if (!TYPES[name]) return new Response('Not found', { status: 404 });
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405 });
  const r = await fetchFirst(name, name === 'IFAQ.apk' ? request.method : 'GET');
  if (!r) return new Response(name === 'version.json' ? '{}' : 'APK not available right now', { status: name === 'version.json' ? 200 : 502, headers: { 'content-type': TYPES[name] } });
  const h = new Headers({ 'content-type': TYPES[name], 'cache-control': name === 'IFAQ.apk' ? 'public, max-age=300' : 'public, max-age=60' });
  if (name === 'IFAQ.apk') h.set('content-disposition', 'attachment; filename="IFAQ.apk"');
  const len = r.headers.get('content-length');
  if (len) h.set('content-length', len);
  return new Response(request.method === 'HEAD' ? null : r.body, { headers: h });
}
