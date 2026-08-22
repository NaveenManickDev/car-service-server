import express from "express";
import cors from "cors";
import "dotenv/config";

import db from "./database/db.js";

import authRoutes from "./routes/authRoutes.js";
import licenseRoutes from "./routes/licenseRoutes.js";

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import path from "path";
import { fileURLToPath } from "url";

const app = express();

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Car Service Server API",
            version: "1.0.0",
            description:
                "Backend API for Car Service Application",
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },

    apis: [
        path.join(__dirname, "routes", "*.js").replace(/\\/g, "/"),
        path.join(__dirname, "controllers", "*.js").replace(/\\/g, "/"),
    ],
};

const swaggerSpec =
    swaggerJsdoc(swaggerOptions);

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

// =====================================
// Middleware
// =====================================

app.use(cors());
app.use(express.json());

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/license",
    licenseRoutes
);

// =====================================
// Test Route
// =====================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Car Service Server is running 🚗",
    });
});

// =====================================
// Database Test Route
// =====================================

app.get("/db-test", (req, res) => {
    try {
        const result = db
            .prepare("SELECT 1 AS connected")
            .get();

        res.json({
            success: true,
            database: "connected",
            result,
        });

    } catch (error) {
        console.error("Database test failed:", error);

        res.status(500).json({
            success: false,
            database: "error",
            error: error.message,
        });
    }
});

// =====================================
// Start Server
// =====================================

app.listen(PORT, () => {
    console.log(
        `Car Service Server running on http://localhost:${PORT}`
    );
});