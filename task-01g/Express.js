const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const maxFileSize = 1 * 1024 * 1024; // 1MB

// Middleware to capture request details
app.use((req, res, next) => {
  req.requestDetails = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    url: req.originalUrl,
    protocol: req.protocol,
    method: req.method,
    hostname: req.hostname,
    query: req.query,
    headers: req.headers,
    userAgent: req.get('User-Agent'),
  };
  next();
});

// Middleware to log request details
app.use((req, res, next) => {
  const logFilePath = path.join(__dirname, 'requests.log');
  const logEntry = JSON.stringify(req.requestDetails) + '\n';

  fs.stat(logFilePath, (err, stats) => {
    if (!err && stats.size > maxFileSize) {
      const rotatedLogFile = `requests-${new Date().toISOString()}.log`;
      fs.rename(logFilePath, path.join(__dirname, rotatedLogFile), (err) => {
        if (err) console.error('Error rotating log file', err);
      });
    }

    fs.appendFile(logFilePath, logEntry, (err) => {
      if (err) console.error('Error writing to log file', err);
    });
  });

  next();
});

// Test route
app.get('/', (req, res) => {
  res.send('Welcome to the Express.js server!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});