const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/image-to-base64", async (req, res) => {
  const { url } = req.query;
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const base64 = Buffer.from(response.data, "binary").toString("base64");

    // Detect MIME type based on content-type header
    const contentType = response.headers["content-type"];
    const dataUrl = `data:${contentType};base64,${base64}`;

    res.json({ base64: dataUrl });
  } catch (err) {
    console.error("Image fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch and convert image" });
  }
});

module.exports = router;
