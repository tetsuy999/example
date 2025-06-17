import https from 'https';

const CHROME_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/124.0.0.0 Safari/537.36',
  Accept:
    'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
};

export default function handler(req, res) {
  const target = req.query.url;
  if (!target) return res.status(400).end('missing url');

  if (!target.startsWith('https://static-assets-1.truthsocial.com/')) {
    return res.status(403).end('forbidden');
  }

  https.get(target, { method: 'HEAD', headers: CHROME_HEADERS }, head => {
    const mime = head.headers['content-type'] || 'image/jpeg';
    const len  = head.headers['content-length'] || 1;

    if (req.method === 'HEAD') {
      res.writeHead(200, {
        'Content-Type': mime,
        'Content-Length': len,
        'Cache-Control': 'public, max-age=300',
      });
      return res.end(' ');
    }

    https.get(target, { headers: CHROME_HEADERS }, img => {
      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=300',
      });
      img.pipe(res);
    }).on('error', () => res.status(502).end('upstream get error'));
  }).on('error', () => res.status(502).end('upstream head error'));
}
