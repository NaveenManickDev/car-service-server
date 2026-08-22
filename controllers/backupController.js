import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "../database/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backupDirectory = path.join(__dirname, "..", "backups");
const maximumBackupSize = 50 * 1024 * 1024;

fs.mkdirSync(backupDirectory, { recursive: true });

function getBackupForUser(backupId, userId) {
    return db
        .prepare(
            `SELECT id, file_name, storage_name, sha256, size_bytes, created_at
             FROM backups
             WHERE id = ? AND user_id = ?`
        )
        .get(backupId, userId);
}

export function uploadBackup(req, res) {
    try {
        if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Encrypted backup data is required.",
            });
        }

        if (req.body.length > maximumBackupSize) {
            return res.status(413).json({
                success: false,
                error: "Backup file cannot be larger than 50 MB.",
            });
        }

        const fileName = String(req.headers["x-backup-filename"] || "backup.bin")
            .replace(/[^a-zA-Z0-9._-]/g, "_")
            .slice(0, 100) || "backup.bin";
        const storageName = `${req.user.userId}-${Date.now()}-${crypto.randomBytes(8).toString("hex")}.bin`;
        const storagePath = path.join(backupDirectory, storageName);
        const sha256 = crypto.createHash("sha256").update(req.body).digest("hex");
        const requestedHash = req.headers["x-backup-sha256"];

        if (requestedHash && requestedHash !== sha256) {
            return res.status(400).json({
                success: false,
                error: "Backup checksum does not match the uploaded data.",
            });
        }

        fs.writeFileSync(storagePath, req.body, { flag: "wx" });

        try {
            const result = db
                .prepare(
                    `INSERT INTO backups (user_id, file_name, storage_name, sha256, size_bytes)
                     VALUES (?, ?, ?, ?, ?)`
                )
                .run(req.user.userId, fileName, storageName, sha256, req.body.length);

            return res.status(201).json({
                success: true,
                message: "Backup uploaded successfully.",
                backup: {
                    id: result.lastInsertRowid,
                    fileName,
                    sizeBytes: req.body.length,
                    sha256,
                },
            });
        } catch (error) {
            fs.rmSync(storagePath, { force: true });
            throw error;
        }
    } catch (error) {
        console.error("Backup upload failed:", error);

        return res.status(500).json({
            success: false,
            error: "Backup upload failed.",
        });
    }
}

export function listBackups(req, res) {
    const backups = db
        .prepare(
            `SELECT id, file_name, sha256, size_bytes, created_at
             FROM backups
             WHERE user_id = ?
             ORDER BY created_at DESC, id DESC`
        )
        .all(req.user.userId);

    return res.json({ success: true, backups });
}

export function downloadBackup(req, res) {
    const backup = getBackupForUser(req.params.id, req.user.userId);

    if (!backup) {
        return res.status(404).json({
            success: false,
            error: "Backup not found.",
        });
    }

    const storagePath = path.join(backupDirectory, backup.storage_name);

    if (!fs.existsSync(storagePath)) {
        return res.status(404).json({
            success: false,
            error: "Backup file is unavailable.",
        });
    }

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", backup.size_bytes);
    res.setHeader("Content-Disposition", `attachment; filename="${backup.file_name}"`);
    return res.sendFile(storagePath);
}

export function deleteBackup(req, res) {
    const backup = getBackupForUser(req.params.id, req.user.userId);

    if (!backup) {
        return res.status(404).json({
            success: false,
            error: "Backup not found.",
        });
    }

    db.prepare("DELETE FROM backups WHERE id = ? AND user_id = ?")
        .run(req.params.id, req.user.userId);
    fs.rmSync(path.join(backupDirectory, backup.storage_name), { force: true });

    return res.json({
        success: true,
        message: "Backup deleted successfully.",
    });
}
