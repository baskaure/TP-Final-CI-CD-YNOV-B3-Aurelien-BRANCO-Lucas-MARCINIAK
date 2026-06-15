const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.status(200).json({
      ready: true,
      checks: { api: "ok", database: "ok" },
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      ready: false,
      checks: { api: "ok", database: "error" },
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
