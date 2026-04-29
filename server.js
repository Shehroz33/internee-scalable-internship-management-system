require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_PATH = process.env.BASE_PATH || "";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(`${BASE_PATH}/public`, express.static(path.join(__dirname, "public")));

const primaryPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const readPool = mysql.createPool({
  host: process.env.DB_READ_HOST || process.env.DB_HOST,
  user: process.env.DB_READ_USER || process.env.DB_USER,
  password: process.env.DB_READ_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function getApplications() {
  const [rows] = await readPool.query(
    "SELECT id, full_name, email, track, city, status, created_at FROM intern_applications ORDER BY created_at DESC"
  );
  return rows;
}

async function getStats() {
  const [rows] = await readPool.query(`
    SELECT 
      COUNT(*) AS total,
      SUM(status = 'Pending') AS pending,
      SUM(status = 'Shortlisted') AS shortlisted,
      SUM(status = 'Rejected') AS rejected
    FROM intern_applications
  `);
  return rows[0] || {};
}

function safe(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function pageTemplate({ applications = [], stats = {}, error = "" }) {
  const appRows = applications.map(app => `
    <tr>
      <td>${safe(app.id)}</td>
      <td>${safe(app.full_name)}</td>
      <td>${safe(app.email)}</td>
      <td>${safe(app.track)}</td>
      <td>${safe(app.city)}</td>
      <td><span class="status">${safe(app.status)}</span></td>
      <td>${safe(new Date(app.created_at).toLocaleString())}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Scalable Internship Management System</title>
  <link rel="stylesheet" href="${BASE_PATH}/public/style.css" />
</head>
<body>
  <header class="hero">
    <div class="container">
      <p class="badge">AWS RDS • MySQL • Read Replica • Migration</p>
      <h1>Scalable Internship Management System</h1>
      <p class="lead">A cloud database project for managing intern applications and records using AWS RDS MySQL.</p>
    </div>
  </header>

  <main class="container">
    ${error ? `<div class="alert error">${safe(error)}</div>` : ""}

    <section class="stats">
      <div class="stat-card"><h3>${safe(stats.total || 0)}</h3><p>Total Applications</p></div>
      <div class="stat-card"><h3>${safe(stats.pending || 0)}</h3><p>Pending</p></div>
      <div class="stat-card"><h3>${safe(stats.shortlisted || 0)}</h3><p>Shortlisted</p></div>
      <div class="stat-card"><h3>${safe(stats.rejected || 0)}</h3><p>Rejected</p></div>
    </section>

    <section class="grid">
      <div class="panel">
        <h2>Add Intern Application</h2>
        <form method="POST" action="${BASE_PATH}/applications">
          <label>Full Name</label>
          <input type="text" name="full_name" placeholder="Enter full name" required />
          <label>Email</label>
          <input type="email" name="email" placeholder="Enter email address" required />
          <label>Internship Track</label>
          <select name="track" required>
            <option value="Cloud Computing">Cloud Computing</option>
            <option value="DevOps">DevOps</option>
            <option value="Frontend Development">Frontend Development</option>
            <option value="Backend Development">Backend Development</option>
            <option value="Data Science">Data Science</option>
          </select>
          <label>City</label>
          <input type="text" name="city" placeholder="Enter city" required />
          <label>Status</label>
          <select name="status" required>
            <option value="Pending">Pending</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button type="submit">Save Application</button>
        </form>
      </div>

      <div class="panel">
        <h2>Architecture</h2>
        <div class="architecture">
          <div>User Browser</div><span>→</span>
          <div>EC2 App Server</div><span>→</span>
          <div>RDS MySQL Primary</div><span>→</span>
          <div>RDS Read Replica</div>
        </div>
        <p class="note">Write operations use the primary RDS database. Read operations can use the read replica endpoint for improved read performance.</p>
      </div>
    </section>

    <section class="panel">
      <h2>Intern Applications</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Full Name</th><th>Email</th><th>Track</th><th>City</th><th>Status</th><th>Created At</th>
            </tr>
          </thead>
          <tbody>${appRows || `<tr><td colspan="7">No applications found.</td></tr>`}</tbody>
        </table>
      </div>
    </section>
  </main>

  <footer><p>Internee.pk Internship Task • Scalable Database System • Submitted by Shehroz Amjad</p></footer>
</body>
</html>`;
}

app.get(`${BASE_PATH}/health`, (req, res) => {
  res.json({ status: "ok", service: "internship-management-system" });
});

app.get(`${BASE_PATH}/`, async (req, res) => {
  try {
    const [applications, stats] = await Promise.all([getApplications(), getStats()]);
    res.send(pageTemplate({ applications, stats }));
  } catch (err) {
    console.error(err);
    res.status(500).send(pageTemplate({ error: "Database connection failed. Please check RDS credentials and security group." }));
  }
});

app.post(`${BASE_PATH}/applications`, async (req, res) => {
  const { full_name, email, track, city, status } = req.body;
  try {
    await primaryPool.query(
      "INSERT INTO intern_applications (full_name, email, track, city, status) VALUES (?, ?, ?, ?, ?)",
      [full_name, email, track, city, status]
    );
    res.redirect(`${BASE_PATH}/`);
  } catch (err) {
    console.error(err);
    res.status(500).send(pageTemplate({ error: "Could not save application. Please check database table and connection." }));
  }
});

app.listen(PORT, () => {
  console.log(`Internship Management System running on port ${PORT}`);
  console.log(`Base path: ${BASE_PATH || "/"}`);
});
