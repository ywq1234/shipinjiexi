// /api/parse - API 解析代理
const BUGPK_API = 'https://api.bugpk.com/api/short_videos';

module.exports = async (req, res) => {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const targetUrl = req.query.url;
  if (!targetUrl) {
    res.status(400).json({ code: 400, msg: '请提供 url 参数' });
    return;
  }

  try {
    const apiUrl = BUGPK_API + '?url=' + encodeURIComponent(targetUrl);
    const resp = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const data = await resp.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ code: 500, msg: '代理请求失败: ' + err.message });
  }
};
