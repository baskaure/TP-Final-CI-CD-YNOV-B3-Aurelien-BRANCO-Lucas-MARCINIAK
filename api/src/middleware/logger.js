const { randomUUID } = require("crypto");
const log = require("../utils/logger");

module.exports = function logger(req, res, next) {
  const startedAt = Date.now();
  const requestId = req.headers["x-request-id"] || randomUUID();

  req.id = requestId;
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    log[level]({
      request_id: requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration_ms: Date.now() - startedAt,
    });
  });

  next();
};
