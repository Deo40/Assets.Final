const bcrypt = require('bcrypt');
const pool = require('../config/db');
const crypto = require('crypto');

// REGISTER
const register = async (req, res) => {
  const { username, email, password } = req.body;

  // ✅ Validate inputs
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }

  try {    // Check if the email is already used
    const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email already in use. Please use a different one.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const apiKey = crypto.randomBytes(32).toString('hex');
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password, api_key) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, hashedPassword, apiKey]
    );

    // Send welcome email
    const sendMail = require('../utils/mailer');
    await sendMail({
      to: email,
      subject: 'Welcome to the Assets App!',
      html: `
        <h2>Hello ${username},</h2>
        <p>Thanks for registering with the Assets App.</p>
        <p>Your account will be reviewed by an admin before you can log in.</p>
        <br/>
        <p>Regards,<br/>Assets App Team</p>
      `,
    });

    res.status(201).json({ message: 'Registration successful. Waiting for admin verification.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// LOGIN
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    if (!user.is_verified) {
      return res.status(403).json({ message: 'Your account has not been verified by the admin yet.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // ✅ Don't generate a new API key if it already exists
    const apiKey = user.api_key;

    res.status(200).json({ apiKey, user_id: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = {
  register,
  login,
};
