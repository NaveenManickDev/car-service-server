import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Car Service Server is running 🚗",
    });
});

// Start server
app.listen(PORT, () => {
    console.log(
        `Car Service Server running on http://localhost:${PORT}`
    );
});