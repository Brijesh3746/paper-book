const express = require("express");
const router = express.Router();
const { generatePDF } = require("../controllers/Gujrat");
const path = require("path");

// Route to generate PDF
router.post("/generate-pdf", generatePDF);

router.get("/download/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "..", "temp", filename);

    res.download(filePath, (err) => {
        if (err) {
            res.status(500).json({ error: "Error downloading the file" });
        }
    });
});

module.exports = router;
