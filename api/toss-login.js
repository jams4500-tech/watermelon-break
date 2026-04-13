const https = require('https');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Missing authorization code' });

    const clientId = process.env.TOSS_CLIENT_ID;
    const clientSecret = process.env.TOSS_CLIENT_SECRET;
    const cert = process.env.TOSS_CLIENT_CERT;
    const key = process.env.TOSS_CLIENT_KEY;

    if (!clientId || !cert || !key) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // 토스 OAuth 토큰 교환
    const postData = JSON.stringify({
      grant_type: 'authorization_code',
      code: code,
      client_id: clientId,
      client_secret: clientSecret
    });

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'oauth2.toss.im',
        port: 443,
        path: '/token',
        method: 'POST',
        cert: cert,
        key: key,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const request = https.request(options, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Failed to parse response'));
          }
        });
      });

      request.on('error', reject);
      request.write(postData);
      request.end();
    });

    if (result.access_token) {
      // 유저 프로필 가져오기
      const profile = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'oauth2.toss.im',
          port: 443,
          path: '/me',
          method: 'GET',
          cert: cert,
          key: key,
          headers: {
            'Authorization': `Bearer ${result.access_token}`
          }
        };

        const request = https.request(options, (response) => {
          let data = '';
          response.on('data', chunk => data += chunk);
          response.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error('Failed to parse profile'));
            }
          });
        });

        request.on('error', reject);
        request.end();
      });

      // userKey에서 비숫자 제거
      const userKey = String(profile.sub || profile.id || '').replace(/\D/g, '');

      return res.status(200).json({
        success: true,
        userKey: userKey,
        accessToken: result.access_token
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error || 'Token exchange failed'
      });
    }
  } catch (error) {
    console.error('Toss login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
