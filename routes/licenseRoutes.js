import express from "express";

import {
    activateLicense,
    validateLicense,
} from "../controllers/licenseController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/license/activate:
 *   post:
 *     summary: Activate a license on the current device
 *     tags: [License]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [licenseKey, machineId]
 *             properties:
 *               licenseKey:
 *                 type: string
 *                 example: CAR-SERVICE-2026-001
 *               machineId:
 *                 type: string
 *                 example: device-abc-123
 *     responses:
 *       200:
 *         description: License activated successfully
 *       401:
 *         description: Authentication token is missing or invalid
 *       404:
 *         description: License key not found
 *       409:
 *         description: License cannot be activated
 */
router.post(
    "/activate",
    requireAuth,
    activateLicense
);

/**
 * @swagger
 * /api/license/validate:
 *   post:
 *     summary: Validate a license for the current device
 *     tags: [License]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [licenseKey, machineId]
 *             properties:
 *               licenseKey:
 *                 type: string
 *                 example: CAR-SERVICE-2026-001
 *               machineId:
 *                 type: string
 *                 example: device-abc-123
 *     responses:
 *       200:
 *         description: License validation result
 *       401:
 *         description: Authentication token is missing or invalid
 */
router.post(
    "/validate",
    requireAuth,
    validateLicense
);

export default router;
