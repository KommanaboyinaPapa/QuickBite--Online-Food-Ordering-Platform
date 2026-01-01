// backend/src/utils/logger.js
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const getTimestamp = () => {
  return new Date().toISOString();
};

const logger = {
  info: (message) => {
    const log = `[${getTimestamp()}] INFO: ${message}`;
    console.log(log);
    fs.appendFileSync(path.join(logsDir, 'app.log'), log + '\n');
  },

  error: (message, error) => {
    const log = `[${getTimestamp()}] ERROR: ${message}${error ? '\n' + error.stack : ''}`;
    console.error(log);
    fs.appendFileSync(path.join(logsDir, 'error.log'), log + '\n');
  },

  warn: (message) => {
    const log = `[${getTimestamp()}] WARN: ${message}`;
    console.warn(log);
    fs.appendFileSync(path.join(logsDir, 'app.log'), log + '\n');
  }
};

module.exports = logger;
