const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DIST_PATH = path.join(__dirname, 'frontend', 'dist');
const PUBLIC_PATH = path.join(__dirname, 'public');

// Serve static files from public directory first (landing pages)
app.use(express.static(PUBLIC_PATH));

// Landing page routes (without .html extension)
app.get('/lifetime100', (req, res) => {
  res.sendFile(path.join(PUBLIC_PATH, 'lifetime100.html'));
});

app.get('/how-to-use', (req, res) => {
  res.sendFile(path.join(PUBLIC_PATH, 'how-to-use.html'));
});

// Serve static files from dist
app.use(express.static(DIST_PATH));

// Handle SPA routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
