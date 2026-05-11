require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const caregiverRoutes = require('./routes/caregivers');
const matchRoutes = require('./routes/matches');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/caregivers', caregiverRoutes);
app.use('/api/matches', matchRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.message || '서버 오류가 발생했습니다.' });
});

app.listen(PORT, () => {
  console.log(`CareLink server running at http://localhost:${PORT}`);
});
