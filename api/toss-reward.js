const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { userKey, promotionCode } = req.body;
    if (!userKey) return res.status(400).json({ error: 'Missing userKey' });

    const cert = process.env.TOSS_CLIENT_CERT;
    const key = process.env.TOSS_CLIENT_KEY;
    const apiKey = process.env.TOSS_API_KEY;

    if (!cert || !key || !apiKey) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const postData = JSON.stringify({
      promotionCode: promotionCode || process.env.TOSS_PROMOTION_CODE
    });

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api-partner.toss.im',
        port: 443,
        path: '/api-partner/v1/apps-in-toss/promotion/execute-promotion/get-key',
        method: 'POST',
        cert: cert,
        key: key,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'x-toss-user-key': String(userKey).replace(/\D/g, ''),
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const request = https.request(options, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            resolve({ status: response.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: response.statusCode, body: data });
          }
        });
      });

      request.on('error', reject);
      request.write(postData);
      request.end();
    });

    return res.status(200).json({
      success: result.status === 200,
      data: result.body
    });
  } catch (error) {
    console.error('Reward error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
