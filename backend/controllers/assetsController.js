const pool = require('../config/db');

exports.getAllAssets = async (req, res) => {
  const { status, department_id, category_id, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const userId = req.query.user_id; // Get user_id from query

  if (!userId) {
    return res.status(400).json({ message: 'Missing user_id in query' });
  }
  
  let query = 'SELECT * FROM assets WHERE is_deleted = FALSE AND user_id = $1';
  const values = [userId]; // 🧠 Always include userId first

  if (status) {
    values.push(status);
    query += ` AND status = $${values.length}`;
  }

  if (department_id) {
    values.push(department_id);
    query += ` AND department_id = $${values.length}`;
  }

  if (category_id) {
    values.push(category_id);
    query += ` AND category_id = $${values.length}`;
  }

  values.push(limit);
  values.push(offset);

  query += ` ORDER BY asset_id DESC LIMIT $${values.length - 1} OFFSET $${values.length}`;

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM assets WHERE asset_id = $1 AND is_deleted = FALSE', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Asset not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAsset = async (req, res) => {
  try {
    const userId = req.body.user_id; // Get user_id from body

    if (!userId) {
    return res.status(400).json({ message: 'Missing user_id in body' });
    }

    const {
      asset_tag, name, purchase_date, value, condition, status,
      warranty_expiry, warranty_provider, location,
      category_id, department_id, assigned_to
    } = req.body;

    const result = await pool.query(`
      INSERT INTO assets (
        asset_tag, name, purchase_date, value, condition, status,
        warranty_expiry, warranty_provider, location,
        category_id, department_id, assigned_to, user_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *
    `, [
      asset_tag, name, purchase_date, value, condition, status,
      warranty_expiry, warranty_provider, location,
      category_id, department_id, assigned_to, userId
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      asset_tag, name, purchase_date, value, condition, status,
      warranty_expiry, warranty_provider, location,
      category_id, department_id, assigned_to
    } = req.body;

    const result = await pool.query(`
      UPDATE assets SET
        asset_tag = $1, name = $2, purchase_date = $3, value = $4,
        condition = $5, status = $6, warranty_expiry = $7,
        warranty_provider = $8, location = $9,
        category_id = $10, department_id = $11, assigned_to = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE asset_id = $13 RETURNING *
    `, [
      asset_tag, name, purchase_date, value, condition, status,
      warranty_expiry, warranty_provider, location,
      category_id, department_id, assigned_to, id
    ]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Asset not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.softDeleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('UPDATE assets SET is_deleted = TRUE WHERE asset_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Asset not found' });
    res.json({ message: 'Asset deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};