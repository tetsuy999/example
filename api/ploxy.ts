// /api/proxy.ts  (Next.js 14, Edge Runtime)
import { NextRequest } from 'next/server';
export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get('url');
  if (!target) return new Response('Missing url', { status: 400 });

  if (!target.startsWith('https://static-assets-1.truthsocial.com/')) {
    return new Response('Forbidden', { status: 403 });
  }

  const res = await fetch(target, { headers: { 'User-Agent': 'IFTTT-Proxy' } });
  if (!res.ok) return new Response('Upstream error', { status: res.status });

  return new Response(res.body, {
    status: 200,
    headers: {
      'Content-Type': res.headers.get('Content-Type') ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
