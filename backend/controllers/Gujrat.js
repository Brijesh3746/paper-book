const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

// Temp folder path (Define it once)
const tempFolder = path.join(__dirname, "..", "temp");

// Create the temp folder if it doesn't exist
if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder);
}

// Function to delete old files (Runs every 1 hour)
const cleanupTempFolder = () => {
    fs.readdir(tempFolder, (err, files) => {
        if (err) {
            console.error("Error reading temp folder:", err);
            return;
        }

        const now = Date.now();
        const twelveHours = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

        files.forEach(file => {
            const filePath = path.join(tempFolder, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error("Error getting file stats:", err);
                    return;
                }

                // Check if file is older than 12 hours
                if (now - stats.mtimeMs > twelveHours) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error("Error deleting file:", err);
                        } else {
                            console.log(`Deleted old file: ${filePath}`);
                        }
                    });
                }
            });
        });
    });
};

// Run cleanup every 1 hour (Place outside generatePDF)
setInterval(cleanupTempFolder, 60 * 60 * 1000); // 1 hour interval

// Generate PDF controller
exports.generatePDF = async (req, res) => {
    const { baseUrl, pageCount } = req.body;

    console.log("base: ", baseUrl);
    
    if (!baseUrl || !pageCount) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    const imageUrls = [];
    for (let i = 0; i < pageCount; i++) {
        imageUrls.push(`${baseUrl}${i}.jpg`);
    }


    console.log("urls:",imageUrls);
    
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Build the HTML content with images
        let htmlContent = `<!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0;">
    <style>
        @page {
            margin: 0;
        }
        body {
            margin: 0;
            padding: 0;
        }
        img {
            display: block;
            margin: 0;
            width: 100%;
            height: 100vh;
            page-break-after: always;
        }
        img:last-child {
            page-break-after: auto;
        }
    </style>
    `;

        for (const url of imageUrls) {
            htmlContent += `<img src="${url}" alt="Image" />`;
        }

        htmlContent += `</body></html>`;

        await page.setContent(htmlContent);

        const date = new Date();
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = String(date.getFullYear()).slice(-2);
        const formattedDate = `${day}-${month}-${year}`;

        // Path to save PDF
        const pdfFilename = `${formattedDate}.pdf`;
        console.log(pdfFilename);
        const pdfPath = path.join(tempFolder, pdfFilename);

        // Convert the page to PDF
        await page.pdf({
            path: pdfPath,
            format: "A4",
            printBackground: true,
        });

        await browser.close();

        // ✅ Change: Returning a downloadable URL instead of just the file path
        res.json({
            message: "PDF created successfully",
            downloadUrl: `/download/${pdfFilename}`
        });

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ error: "Error generating PDF" });
    }
};
