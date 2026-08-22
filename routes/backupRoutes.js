import express from "express";

import {
    deleteBackup,
    downloadBackup,
    listBackups,
    uploadBackup,
} from "../controllers/backupController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/backup:
 *   post:
 *     summary: Upload an encrypted backup
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-backup-filename
 *         schema:
 *           type: string
 *         description: Original backup filename
 *       - in: header
 *         name: x-backup-sha256
 *         schema:
 *           type: string
 *         description: Optional SHA-256 checksum of the binary body
 *     requestBody:
 *       required: true
 *       content:
 *         application/octet-stream:
 *           schema:
 *             type: string
 *             format: binary
 *     responses:
 *       201:
 *         description: Backup uploaded successfully
 *       401:
 *         description: Authentication token is missing or invalid
 *       413:
 *         description: Backup exceeds the 50 MB limit
 */
router.post(
    "/",
    requireAuth,
    express.raw({ type: "application/octet-stream", limit: "50mb" }),
    uploadBackup
);

/**
 * @swagger
 * /api/backup:
 *   get:
 *     summary: List the current user's backups
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User backup list
 *       401:
 *         description: Authentication token is missing or invalid
 */
router.get("/", requireAuth, listBackups);

/**
 * @swagger
 * /api/backup/{id}/download:
 *   get:
 *     summary: Download one encrypted backup
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Encrypted backup binary
 *       401:
 *         description: Authentication token is missing or invalid
 *       404:
 *         description: Backup not found
 */
router.get("/:id/download", requireAuth, downloadBackup);

/**
 * @swagger
 * /api/backup/{id}:
 *   delete:
 *     summary: Delete one encrypted backup
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Backup deleted successfully
 *       401:
 *         description: Authentication token is missing or invalid
 *       404:
 *         description: Backup not found
 */
router.delete("/:id", requireAuth, deleteBackup);

export default router;
