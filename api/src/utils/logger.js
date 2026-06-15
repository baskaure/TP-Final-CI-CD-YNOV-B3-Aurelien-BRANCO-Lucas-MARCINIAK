const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, fatal: 50 };

const SENSITIVE = [
  "password",
  "passwd",
  "token",
  "secret",
  "authorization",
  "apikey",
  "api_key",
  "database_url",
  "postgres_password",
  "connectionstring",
];

const threshold = LEVELS[(process.env.LOG_LEVEL || "info").toLowerCase()] || LEVELS.info;

function sanitize(value) {
  if (Array.isArray(value)) {
    return value.map(sanitize);
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = SENSITIVE.includes(key.toLowerCase()) ? "***" : sanitize(val);
    }
    return out;
  }
  return value;
}

function log(level, fields) {
  if (LEVELS[level] < threshold) {
    return;
  }
  const line = JSON.stringify({
    level,
    timestamp: new Date().toISOString(),
    ...sanitize(fields),
  });
  if (level === "error" || level === "fatal") {
    console.error(line);
  } else {
    console.log(line);
  }
}

module.exports = {
  sanitize,
  debug: (fields) => log("debug", fields),
  info: (fields) => log("info", fields),
  warn: (fields) => log("warn", fields),
  error: (fields) => log("error", fields),
  fatal: (fields) => log("fatal", fields),
};
