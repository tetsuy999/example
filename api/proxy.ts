// api/proxy.ts
export const config = { runtime: 'edge' };

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('url');
  if (!target) return new Response('Missing url', { status: 400 });

  if (!target.startsWith('https://static-assets-1.truthsocial.com/')) {
    return new Response('Forbidden', { status: 403 });
  }

  const res = await fetch(target, { headers: { 'User-Agent': 'IFTTT-Proxy' } });
  if (!res.ok) return new Response(`Upstream ${res.status}`, { status: res.status });

  return new Response(res.body, {
    status: 200,
    headers: {
      'Content-Type': res.headers.get('content-type') ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
