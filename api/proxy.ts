// api/proxy.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import https from 'node:https'; 

export default function (req: VercelRequest, res: VercelResponse) {
  const url = req.query.url as string | undefined;
  if (!url) return res.status(400).send('missing url');

  if (!url.startsWith('https://static-assets-1.truthsocial.com/')) {
    return res.status(403).send('forbidden');
  }

  // HEAD 
  https.get(url, { method: 'HEAD' }, head => {
    const mime = head.headers['content-type'] ?? 'image/jpeg';
    const len  = head.headers['content-length'];

    // 
    if (req.method === 'HEAD') {
      res.status(200)
         .setHeader('Content-Type', mime)
         .setHeader('Cache-Control', 'public, max-age=300');
      if (len) res.setHeader('Content-Length', len);
      return res.end();
    }

    //
    https.get(url, img => {
      res.status(200)
         .setHeader('Content-Type', mime)
         .setHeader('Cache-Control', 'public, max-age=300');
      img.pipe(res);
    }).on('error', () => res.status(502).end('upstream error'));
  }).on('error', () => res.status(502).end('upstream head error'));
}
