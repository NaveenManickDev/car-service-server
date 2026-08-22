import crypto from "crypto";
import jwt from "jsonwebtoken";
import db from "../database/db.js";

const jwtSecret = process.env.JWT_SECRET || "car-service-local-development-secret";

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");

    const hash = crypto
        .scryptSync(password, salt, 64)
        .toString("hex");

    return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
    const [salt, hash] = storedHash.split(":");

    if (!salt || !hash) {
        return false;
    }

    const derivedHash = crypto
        .scryptSync(password, salt, 64)
        .toString("hex");

    return crypto.timingSafeEqual(
        Buffer.from(hash, "hex"),
        Buffer.from(derivedHash, "hex")
    );
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

export function loginUser(req, res) {
    try {
        const { mobile, password } = req.body;

        if (!mobile || !password) {
            return res.status(400).json({
                success: false,
                error: "Mobile and password are required.",
            });
        }

        const cleanMobile = mobile.trim();
        const user = db
            .prepare(
                `SELECT id, name, mobile, password_hash
                 FROM users
                 WHERE mobile = ?`
            )
            .get(cleanMobile);

        if (!user || !verifyPassword(password, user.password_hash)) {
            return res.status(401).json({
                success: false,
                error: "Invalid mobile number or password.",
            });
        }

        const token = jwt.sign(
            { userId: user.id, mobile: user.mobile },
            jwtSecret,
            { expiresIn: "1d" }
        );

        return res.json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                name: user.name,
                mobile: user.mobile,
            },
        });

    } catch (error) {
        console.error("User login failed:", error);

        return res.status(500).json({
            success: false,
            error: "Login failed.",
        });
    }
}