require('dotenv').config();

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ───────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── POSTGRESQL CONNECTION ────────────────────────────────
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'portfolioDB',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

pool.connect((err) => {
  if (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
    console.log('⚠️  Check your DB credentials in server.js');
  } else {
    console.log('✅ PostgreSQL connected successfully!');
    initDB();
  }
});

// ─── CREATE TABLES IF NOT EXIST ───────────────────────────
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profile (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        title VARCHAR(150),
        branch VARCHAR(150),
        university VARCHAR(200),
        bio TEXT,
        email VARCHAR(100),
        phone VARCHAR(30),
        github VARCHAR(200),
        linkedin VARCHAR(200),
        location VARCHAR(150),
        skills TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        tech TEXT,
        github VARCHAR(200),
        live VARCHAR(200),
        image VARCHAR(300),
        featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        issuer VARCHAR(200),
        date VARCHAR(20),
        credential_id VARCHAR(100),
        image VARCHAR(300),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS resume (
        id SERIAL PRIMARY KEY,
        file_path VARCHAR(300),
        uploaded_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100),
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const existing = await pool.query('SELECT id FROM profile LIMIT 1');
    if (existing.rows.length === 0) {
      await pool.query(`
        INSERT INTO profile (name, title, branch, university, bio, email, phone, github, linkedin, location, skills)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      `, [
        'Aditya Singh', 'B.Tech Final Year Student', 'Computer Science & Engineering',
        'XYZ University',
        'Passionate developer building solutions that matter. Focused on full-stack development, machine learning, and open-source contributions.',
        'aditya.singh@email.com', '+91 98765 43210',
        'https://github.com/adityasingh', 'https://linkedin.com/in/adityasingh',
        'Agra, Uttar Pradesh, India',
        'React,Node.js,Python,Machine Learning,MongoDB,Git,Docker,AWS'
      ]);
      console.log('✅ Default profile inserted');
    }
    console.log('✅ All tables ready!');
  } catch (err) {
    console.error('❌ DB init error:', err.message);
  }
}

// ─── UPLOAD DIRS ──────────────────────────────────────────
['uploads/resume', 'uploads/projects', 'uploads/certificates'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use explicit route-based mapping instead of :type param to avoid wrong folder
    const url = req.originalUrl;
    let folder = 'uploads';
    if (url.includes('/resume')) folder = 'uploads/resume';
    else if (url.includes('/projects')) folder = 'uploads/projects';
    else if (url.includes('/certificates')) folder = 'uploads/certificates';
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ─── PROFILE ROUTES ───────────────────────────────────────
app.get('/api/profile', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM profile ORDER BY id DESC LIMIT 1');
    if (!result.rows.length) return res.json({});
    const p = result.rows[0];
    res.json({ ...p, skills: p.skills ? p.skills.split(',') : [] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/profile', async (req, res) => {
  const { name, title, branch, university, bio, email, phone, github, linkedin, location, skills } = req.body;
  const skillsStr = Array.isArray(skills) ? skills.join(',') : skills;
  try {
    const exists = await pool.query('SELECT id FROM profile LIMIT 1');
    if (exists.rows.length) {
      await pool.query(
        `UPDATE profile SET name=$1, title=$2, branch=$3, university=$4, bio=$5,
         email=$6, phone=$7, github=$8, linkedin=$9, location=$10, skills=$11, updated_at=NOW()
         WHERE id=$12`,
        [name, title, branch, university, bio, email, phone, github, linkedin, location, skillsStr, exists.rows[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO profile (name,title,branch,university,bio,email,phone,github,linkedin,location,skills)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [name, title, branch, university, bio, email, phone, github, linkedin, location, skillsStr]
      );
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── PROJECTS ROUTES ──────────────────────────────────────
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(result.rows.map(p => ({ ...p, tech: p.tech ? p.tech.split(',') : [] })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/projects', upload.single('image'), async (req, res) => {
  const data = JSON.parse(req.body.data || '{}');
  const imagePath = req.file ? `/uploads/projects/${req.file.filename}` : null;
  const techStr = Array.isArray(data.tech) ? data.tech.join(',') : (data.tech || '');
  try {
    const result = await pool.query(
      `INSERT INTO projects (title, description, tech, github, live, image, featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [data.title, data.description, techStr, data.github, data.live, imagePath, data.featured || false]
    );
    res.json({ success: true, project: { ...result.rows[0], tech: techStr.split(',') } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/projects/:id', upload.single('image'), async (req, res) => {
  const data = JSON.parse(req.body.data || '{}');
  const techStr = Array.isArray(data.tech) ? data.tech.join(',') : (data.tech || '');
  try {
    // Agar nai image upload hui hai toh use karo, warna purani rakho
    let imagePath = data.existingImage || null;
    if (req.file) imagePath = `/uploads/projects/${req.file.filename}`;
    await pool.query(
      `UPDATE projects SET title=$1, description=$2, tech=$3, github=$4, live=$5, image=$6, featured=$7
       WHERE id=$8`,
      [data.title, data.description, techStr, data.github, data.live, imagePath, data.featured || false, req.params.id]
    );
    const result = await pool.query('SELECT * FROM projects WHERE id=$1', [req.params.id]);
    res.json({ success: true, project: { ...result.rows[0], tech: techStr.split(',') } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── CERTIFICATES ROUTES ──────────────────────────────────
app.get('/api/certificates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM certificates ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/certificates', upload.single('image'), async (req, res) => {
  const data = JSON.parse(req.body.data || '{}');
  const imagePath = req.file ? `/uploads/certificates/${req.file.filename}` : null;
  try {
    const result = await pool.query(
      `INSERT INTO certificates (title, issuer, date, credential_id, image)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [data.title, data.issuer, data.date, data.credentialId, imagePath]
    );
    res.json({ success: true, cert: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/certificates/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM certificates WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── RESUME ROUTES ────────────────────────────────────────
app.get('/api/resume', async (req, res) => {
  try {
    const result = await pool.query('SELECT file_path FROM resume ORDER BY uploaded_at DESC LIMIT 1');
    res.json({ resume: result.rows.length ? result.rows[0].file_path : null });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Direct download route
app.get('/api/resume/download', async (req, res) => {
  try {
    const result = await pool.query('SELECT file_path FROM resume ORDER BY uploaded_at DESC LIMIT 1');
    if (!result.rows.length) return res.status(404).json({ error: 'No resume uploaded' });
    const filePath = path.join(__dirname, result.rows[0].file_path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on disk' });
    res.download(filePath);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/resume/:type', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const filePath = `/uploads/resume/${req.file.filename}`;
  try {
    await pool.query('DELETE FROM resume');
    await pool.query('INSERT INTO resume (file_path) VALUES ($1)', [filePath]);
    res.json({ success: true, path: filePath });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── CONTACT ROUTES ───────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'All fields required' });
  try {
    await pool.query('INSERT INTO messages (name, email, message) VALUES ($1,$2,$3)', [name, email, message]);
    res.json({ success: true, message: 'Message received!' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── STATS ROUTE ──────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  try {
    const [p, c, m, pr] = await Promise.all([
      pool.query('SELECT skills FROM profile LIMIT 1'),
      pool.query('SELECT COUNT(*) FROM certificates'),
      pool.query('SELECT COUNT(*) FROM messages'),
      pool.query('SELECT COUNT(*) FROM projects'),
    ]);
    const skills = p.rows[0]?.skills?.split(',').filter(Boolean).length || 0;
    res.json({
      projects: parseInt(pr.rows[0].count),
      certificates: parseInt(c.rows[0].count),
      messages: parseInt(m.rows[0].count),
      skills
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => {
  console.log(`🚀 Portfolio backend running on http://localhost:${PORT}`);
});
