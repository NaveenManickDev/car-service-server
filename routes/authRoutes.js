import express from "express";

import {
    loginUser,
    registerUser,
} from "../controllers/authController.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, mobile, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Arun Kumar
 *               mobile:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *                 example: '9876543210'
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: secret123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid or missing user details
 *       409:
 *         description: Mobile number is already registered
 *       500:
 *         description: Registration failed
 */
router.post(
    "/register",
    registerUser
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in an existing user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mobile, password]
 *             properties:
 *               mobile:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *                 example: '9876543210'
 *               password:
 *                 type: string
 *                 format: password
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Missing login details
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Login failed
 */
router.post(
    "/login",
    loginUser
);

export default router;