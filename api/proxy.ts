// api/proxy.ts
export const config = { runtime: 'edge' };

async function fetchUpstream(url: string, method: 'GET' | 'HEAD') {
  return fetch(url, {
    method,
    headers: { 'User-Agent': 'IFTTT-Proxy' },
    redirect: 'follow',
  });
}

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get('url');
  if (!target) return new Response('Missing url', { status: 400 });

  if (!target.startsWith('https://static-assets-1.truthsocial.com/')) {
    return new Response('Forbidden', { status: 403 });
  }

  const headRes = await fetchUpstream(target, 'HEAD');
  if (!headRes.ok) return new Response('Upstream HEAD error', { status: headRes.status });

  const contentType  = headRes.headers.get('content-type')  ?? 'image/jpeg';
  const contentLength = headRes.headers.get('content-length'); 

  if (req.method === 'HEAD') {
    return new Response(null, {
      status: 200,
      headers: {
        'Content-Type':  contentType,
        ...(contentLength ? { 'Content-Length': contentLength } : {}),
        'Cache-Control': 'public, max-age=300',
      },
    });
  }

  const getRes = await fetchUpstream(target, 'GET');
  if (!getRes.ok) return new Response('Upstream GET error', { status: getRes.status });

  return new Response(getRes.body, {
    status: 200,
    headers: {
      'Content-Type':  contentType,
      ...(contentLength ? { 'Content-Length': contentLength } : {}),
      'Cache-Control': 'public, max-age=300',
    },
  });
}
