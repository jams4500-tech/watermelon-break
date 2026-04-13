const crypto = require('crypto');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: 'Missing authorization code' });

    const decryptKeyB64 = process.env.TOSS_DECRYPT_KEY;
    const aad = process.env.TOSS_AAD;
    if (!decryptKeyB64 || !aad) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const key = Buffer.from(decryptKeyB64, 'base64');
    const payload = Buffer.from(code, 'base64');
    if (payload.length < 12 + 16) {
      return res.status(400).json({ error: 'Invalid payload length' });
    }

    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(payload.length - 16);
    const ciphertext = payload.subarray(12, payload.length - 16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAAD(Buffer.from(aad, 'utf8'));
    decipher.setAuthTag(tag);

    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
    const info = JSON.parse(plaintext);

    const rawUserKey = info.userKey ?? info.sub ?? info.id ?? '';
    const userKey = String(rawUserKey).replace(/\D/g, '');

    if (!userKey) return res.status(400).json({ error: 'userKey missing in decrypted payload' });

    return res.status(200).json({ success: true, userKey });
  } catch (error) {
    console.error('Toss login decrypt error:', error);
    return res.status(400).json({ success: false, error: 'Decryption failed' });
  }
};
