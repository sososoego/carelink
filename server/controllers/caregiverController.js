const pool = require('../models/db');

const getList = async (req, res) => {
  const { region, min_experience, max_hourly_rate } = req.query;

  let query = `
    SELECT u.id, u.name, cp.experience, cp.certifications, cp.regions,
           cp.available_days, cp.hourly_rate, cp.bio, cp.rating
    FROM users u
    JOIN caregiver_profiles cp ON u.id = cp.user_id
    WHERE u.role = 'caregiver'
  `;
  const params = [];

  if (region) {
    params.push(region);
    query += ` AND $${params.length} = ANY(cp.regions)`;
  }
  if (min_experience) {
    params.push(Number(min_experience));
    query += ` AND cp.experience >= $${params.length}`;
  }
  if (max_hourly_rate) {
    params.push(Number(max_hourly_rate));
    query += ` AND cp.hourly_rate <= $${params.length}`;
  }

  query += ' ORDER BY cp.rating DESC';

  const result = await pool.query(query, params);
  res.json(result.rows);
};

const getRecommended = async (req, res) => {
  const { region, start_date, end_date, max_hourly_rate } = req.query;

  let query = `
    SELECT u.id, u.name, cp.experience, cp.certifications, cp.regions,
           cp.available_days, cp.hourly_rate, cp.bio, cp.rating
    FROM users u
    JOIN caregiver_profiles cp ON u.id = cp.user_id
    WHERE u.role = 'caregiver'
  `;
  const params = [];

  if (region) {
    params.push(region);
    query += ` AND $${params.length} = ANY(cp.regions)`;
  }
  if (max_hourly_rate) {
    params.push(Number(max_hourly_rate));
    query += ` AND cp.hourly_rate <= $${params.length}`;
  }

  query += ' ORDER BY cp.rating DESC LIMIT 5';

  const result = await pool.query(query, params);
  res.json(result.rows);
};

const upsertProfile = async (req, res) => {
  const userId = req.user.id;
  const { gender, birth_date, experience, certifications, regions, available_days, hourly_rate, bio } = req.body;

  const existing = await pool.query('SELECT id FROM caregiver_profiles WHERE user_id = $1', [userId]);

  if (existing.rows.length > 0) {
    const result = await pool.query(
      `UPDATE caregiver_profiles
       SET gender=$1, birth_date=$2, experience=$3, certifications=$4, regions=$5, available_days=$6, hourly_rate=$7, bio=$8
       WHERE user_id=$9 RETURNING *`,
      [gender, birth_date, experience, certifications, regions, available_days, hourly_rate, bio, userId]
    );
    return res.json(result.rows[0]);
  }

  const result = await pool.query(
    `INSERT INTO caregiver_profiles (user_id, gender, birth_date, experience, certifications, regions, available_days, hourly_rate, bio)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [userId, gender, birth_date, experience, certifications, regions, available_days, hourly_rate, bio]
  );
  res.status(201).json(result.rows[0]);
};

module.exports = { getList, getRecommended, upsertProfile };
