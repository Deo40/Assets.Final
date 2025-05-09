const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'avnadmin',
  host: process.env.DB_HOST || 'pg-38b8ccb-mern-stack-app.k.aivencloud.com',
  database: process.env.DB_NAME || 'Assets',
  password: process.env.DB_PASSWORD || 'AVNS_zYvgxyJ0IK_VTTNDnPv',
  port: process.env.DB_PORT || 20960,
  ssl: {
    rejectUnauthorized: false},
});

module.exports = pool;
