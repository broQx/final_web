const express = require("express");
const path = require("path");

const router = express.Router();

router.get("/openapi", (req, res) => {
  const filePath = path.join(__dirname, "..", "..", "docs", "openapi.json");
  res.sendFile(filePath);
});

module.exports = router;
