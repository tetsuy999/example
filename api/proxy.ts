// api/proxy.js
import https from 'https';

export default function handler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).end('missing url');

  if (!url.startsWith('https://static-assets-1.truthsocial.com/')) {
    return res.status(403).end('forbidden');
  }

  https.get(url, { headers: { 'User-Agent': 'IFTTT-Proxy' } }, upstream => {
    const mime = upstream.headers['content-type'] || 'image/jpeg';
    const len  = upstream.headers['content-length'];

    if (req.method === 'HEAD') {
      res.writeHead(200, {
        'Content-Type':  mime,
        'Content-Length': len || 1,
        'Cache-Control': 'public, max-age=300',
      });
      return res.end(' '); 
    }

    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': 'public, max-age=300',
    });
    upstream.pipe(res);
  }).on('error', () => res.status(502).end('upstream error'));
}
