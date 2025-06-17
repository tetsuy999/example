// api/proxy.js
import https from 'https';

export default function handler(req, res) {
  const target = req.query.url;
  if (!target) return res.status(400).end('missing url');

  if (!target.startsWith('https://static-assets-1.truthsocial.com/')) {
    return res.status(403).end('forbidden');
  }

  https.get(target, { method: 'HEAD' }, head => {
    const mime = head.headers['content-type'] || 'image/jpeg';
    const len  = head.headers['content-length'] || 1;

    if (req.method === 'HEAD') {
      res.writeHead(200, {
        'Content-Type'  : mime,
        'Content-Length': len,
        'Cache-Control' : 'public, max-age=300',
      });
      return res.end(' ');
    }

    https.get(target, { headers: { 'User-Agent': 'IFTTT-Proxy' } }, img => {
      res.writeHead(200, {
        'Content-Type' : mime,
        'Cache-Control': 'public, max-age=300',
      });
      img.pipe(res);
    }).on('error', () => res.status(502).end('upstream get error'));
  }).on('error', () => res.status(502).end('upstream head error'));
}
