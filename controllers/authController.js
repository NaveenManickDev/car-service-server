import crypto from "crypto";
import db from "../database/db.js";

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");

    const hash = crypto
        .scryptSync(password, salt, 64)
        .toString("hex");

    return `${salt}:${hash}`;
}

export function registerUser(req, res) {
    try {
        const { name, mobile, password } = req.body;

        if (!name || !mobile || !password) {
            return res.status(400).json({
                success: false,
                error: "Name, mobile and password are required.",
            });
        }

        const cleanName = name.trim();
        const cleanMobile = mobile.trim();

        if (cleanName.length < 2) {
            return res.status(400).json({
                success: false,
                error: "Invalid name.",
            });
        }

        if (!/^[0-9]{10}$/.test(cleanMobile)) {
            return res.status(400).json({
                success: false,
                error: "Mobile number must contain 10 digits.",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: "Password must be at least 6 characters.",
            });
        }

        const existingUser = db
            .prepare(
                "SELECT id FROM users WHERE mobile = ?"
            )
            .get(cleanMobile);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: "Mobile number is already registered.",
            });
        }

        const passwordHash = hashPassword(password);

        const result = db
            .prepare(`
                INSERT INTO users (
                    name,
                    mobile,
                    password_hash
                )
                VALUES (?, ?, ?)
            `)
            .run(
                cleanName,
                cleanMobile,
                passwordHash
            );

        return res.status(201).json({
            success: true,
            message: "User registered successfully.",
            user: {
                id: result.lastInsertRowid,
                name: cleanName,
                mobile: cleanMobile,
            },
        });

    } catch (error) {
        console.error(
            "User registration failed:",
            error
        );

        return res.status(500).json({
            success: false,
            error: "Registration failed.",
        });
    }
}