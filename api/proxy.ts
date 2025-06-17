// api/proxy.ts
export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  if (!url) return new Response('Missing url', { status: 400 });


  if (!url.startsWith('https://static-assets-1.truthsocial.com/')) {
    return new Response('Forbidden', { status: 403 });
  }

  const upstream = await fetch(url, {
    method: req.method, 
    headers: { 'User-Agent': 'IFTTT-Proxy' },
    redirect: 'follow',
  });
  if (!upstream.ok) {
    return new Response(`Upstream ${upstream.status}`, { status: upstream.status });
  }

  const headers = new Headers(upstream.headers);
  headers.set('Content-Type', headers.get('content-type') ?? 'image/jpeg');
  headers.set('Cache-Control', 'public, max-age=300');

  const body = req.method === 'HEAD' ? new Uint8Array(0) : upstream.body;

  return new Response(body, { status: 200, headers });
}
