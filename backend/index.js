const express = require("express");
const cors = require("cors");
const pdfRoutes = require("./routes/pdfRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Middleware
app.use(express.json());

// Routes
app.use("/api/v1", pdfRoutes);

// Homepage Route
// app.get("/", (req, res) => {
//     res.send("<h1>This Is My HomePage</h1>");
// });

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
