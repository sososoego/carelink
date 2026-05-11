const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '인증 토큰이 없습니다.' });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: '권한이 없습니다.' });
  }
  next();
};

module.exports = { authenticate, authorize };
