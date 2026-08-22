import express from "express";

import {
    activateLicense,
    createLicense,
    deleteLicense,
    listLicenses,
    validateLicense,
} from "../controllers/licenseController.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/license/admin/create:
 *   post:
 *     summary: Create a license key
 *     tags: [License Admin]
 *     parameters:
 *       - in: header
 *         name: x-admin-secret
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               licenseKey:
 *                 type: string
 *                 example: CAR-SERVICE-2026-001
 *     responses:
 *       201:
 *         description: License created successfully
 *       401:
 *         description: Invalid admin credentials
 *       409:
 *         description: License key already exists
 *       503:
 *         description: Admin secret is not configured
 */
router.post(
    "/admin/create",
    requireAdmin,
    createLicense
);

/**
 * @swagger
 * /api/license/admin/list:
 *   get:
 *     summary: List all license keys
 *     tags: [License Admin]
 *     parameters:
 *       - in: header
 *         name: x-admin-secret
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: License list
 *       401:
 *         description: Invalid admin credentials
 *       503:
 *         description: Admin secret is not configured
 */
router.get(
    "/admin/list",
    requireAdmin,
    listLicenses
);

/**
 * @swagger
 * /api/license/admin/{id}:
 *   delete:
 *     summary: Delete a license key
 *     tags: [License Admin]
 *     parameters:
 *       - in: header
 *         name: x-admin-secret
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: License deleted successfully
 *       401:
 *         description: Invalid admin credentials
 *       404:
 *         description: License not found
 *       503:
 *         description: Admin secret is not configured
 */
router.delete(
    "/admin/:id",
    requireAdmin,
    deleteLicense
);

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
