const pool = require('../models/db');

const createMatch = async (req, res) => {
  const familyId = req.user.id;
  const { caregiver_id, start_date, end_date } = req.body;

  const result = await pool.query(
    `INSERT INTO match_requests (family_id, caregiver_id, start_date, end_date)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [familyId, caregiver_id, start_date, end_date]
  );
  res.status(201).json(result.rows[0]);
};

const getMatches = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  const column = role === 'family' ? 'family_id' : 'caregiver_id';
  const result = await pool.query(
    `SELECT mr.*, u.name as partner_name
     FROM match_requests mr
     JOIN users u ON u.id = mr.${role === 'family' ? 'caregiver_id' : 'family_id'}
     WHERE mr.${column} = $1
     ORDER BY mr.created_at DESC`,
    [userId]
  );
  res.json(result.rows);
};

const updateMatchStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const caregiverId = req.user.id;

  const result = await pool.query(
    `UPDATE match_requests SET status = $1
     WHERE id = $2 AND caregiver_id = $3 RETURNING *`,
    [status, id, caregiverId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: '매칭 요청을 찾을 수 없습니다.' });
  }
  res.json(result.rows[0]);
};

module.exports = { createMatch, getMatches, updateMatchStatus };
