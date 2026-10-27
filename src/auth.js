const crypto = require('node:crypto');

// A per-process random secret keeps tokens unforgeable without storing it in code.
// Set AUTH_TOKEN_SECRET in production-like environments to keep tokens valid across restarts.
const secret = process.env.AUTH_TOKEN_SECRET || crypto.randomBytes(32).toString('hex');

function createToken(user) {
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyToken(token) {
  const [payload, signature, extra] = String(token || '').split('.');
  if (!payload || !signature || extra) return null;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest();
  let supplied;
  try { supplied = Buffer.from(signature, 'base64url'); } catch { return null; }
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!Number.isInteger(data.sub) || !['requester', 'support'].includes(data.role) || data.exp <= Math.floor(Date.now() / 1000)) return null;
    return { id: data.sub, role: data.role };
  } catch { return null; }
}

function requireAuth(req, res, next) {
  const match = /^Bearer\s+(.+)$/i.exec(req.get('authorization') || '');
  const user = match && verifyToken(match[1]);
  if (!user) return res.status(401).json({ error: 'Autenticação necessária.' });
  req.auth = user;
  next();
}

module.exports = { createToken, requireAuth };
