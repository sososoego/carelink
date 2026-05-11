const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../models/db');

const signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: '이미 사용 중인 이메일입니다.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
    [name, email, hashed, role]
  );

  const user = result.rows[0];
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({ ...user, token });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, token });
};

module.exports = { signup, login };
