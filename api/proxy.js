// /api/proxy - 文件下载代理（绕过防盗链）
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const targetUrl = req.query.url;
  if (!targetUrl) {
    res.status(400).send('Missing url parameter');
    return;
  }

  const isDownload = req.query.dl === '1';

  try {
    const resp = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.douyin.com/',
        'Accept': '*/*'
      }
    });

    if (!resp.ok) {
      res.status(resp.status).send('Proxy failed: ' + resp.status);
      return;
    }

    const contentType = resp.headers.get('Content-Type') || 'application/octet-stream';
    const contentLength = resp.headers.get('Content-Length');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    if (isDownload) {
      const filename = targetUrl.split('/').pop().split('?')[0] || 'download';
      res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    }

    // 流式返回
    const reader = resp.body.getReader();
    const stream = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.close();
      }
    });

    res.setHeader('Transfer-Encoding', 'chunked');
    const nodeStream = require('stream').Readable.from(stream);
    nodeStream.pipe(res);
  } catch (err) {
    res.status(502).send('Proxy error: ' + err.message);
  }
};
