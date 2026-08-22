import crypto from "crypto";
import db from "../database/db.js";

export function createLicense(req, res) {
    try {
        const requestedKey = req.body.licenseKey?.trim();
        const licenseKey = requestedKey || `CAR-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;

        const result = db
            .prepare(
                `INSERT INTO licenses (license_key)
                 VALUES (?)`
            )
            .run(licenseKey);

        return res.status(201).json({
            success: true,
            message: "License created successfully.",
            license: {
                id: result.lastInsertRowid,
                licenseKey,
                status: "active",
            },
        });
    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                success: false,
                error: "License key already exists.",
            });
        }

        console.error("License creation failed:", error);

        return res.status(500).json({
            success: false,
            error: "License creation failed.",
        });
    }
}

export function listLicenses(req, res) {
    const licenses = db
        .prepare(
            `SELECT id, license_key, user_id, status, machine_id, activated_at, created_at
             FROM licenses
             ORDER BY created_at DESC, id DESC`
        )
        .all();

    return res.json({
        success: true,
        licenses,
    });
}

export function deleteLicense(req, res) {
    const license = db
        .prepare("SELECT id, license_key FROM licenses WHERE id = ?")
        .get(req.params.id);

    if (!license) {
        return res.status(404).json({
            success: false,
            error: "License not found.",
        });
    }

    db.prepare("DELETE FROM licenses WHERE id = ?")
        .run(req.params.id);

    return res.json({
        success: true,
        message: "License deleted successfully.",
        license: {
            id: license.id,
            licenseKey: license.license_key,
        },
    });
}

export function activateLicense(req, res) {
    try {
        const { licenseKey, machineId } = req.body;

        if (!licenseKey || !machineId) {
            return res.status(400).json({
                success: false,
                error: "License key and machine ID are required.",
            });
        }

        const cleanLicenseKey = licenseKey.trim();
        const cleanMachineId = machineId.trim();
        const license = db
            .prepare(
                `SELECT id, license_key, user_id, status, machine_id, activated_at
                 FROM licenses
                 WHERE license_key = ?`
            )
            .get(cleanLicenseKey);

        if (!license) {
            return res.status(404).json({
                success: false,
                error: "License key not found.",
            });
        }

        if (license.status !== "active") {
            return res.status(409).json({
                success: false,
                error: `License is ${license.status}.`,
            });
        }

        if (license.user_id && license.user_id !== req.user.userId) {
            return res.status(409).json({
                success: false,
                error: "License is already activated by another user.",
            });
        }

        if (license.machine_id && license.machine_id !== cleanMachineId) {
            return res.status(409).json({
                success: false,
                error: "License is already activated on another device.",
            });
        }

        db.prepare(
            `UPDATE licenses
             SET user_id = ?, machine_id = ?, activated_at = COALESCE(activated_at, CURRENT_TIMESTAMP)
             WHERE id = ?`
        ).run(req.user.userId, cleanMachineId, license.id);

        return res.json({
            success: true,
            message: "License activated successfully.",
            license: {
                licenseKey: license.license_key,
                status: license.status,
                machineId: cleanMachineId,
                activatedAt: license.activated_at,
            },
        });
    } catch (error) {
        console.error("License activation failed:", error);

        return res.status(500).json({
            success: false,
            error: "License activation failed.",
        });
    }
}

export function validateLicense(req, res) {
    try {
        const { licenseKey, machineId } = req.body;

        if (!licenseKey || !machineId) {
            return res.status(400).json({
                success: false,
                error: "License key and machine ID are required.",
            });
        }

        const license = db
            .prepare(
                `SELECT license_key, status, machine_id, activated_at
                 FROM licenses
                 WHERE license_key = ? AND user_id = ?`
            )
            .get(licenseKey.trim(), req.user.userId);

        const isValid = Boolean(
            license &&
            license.status === "active" &&
            license.machine_id === machineId.trim()
        );

        return res.json({
            success: true,
            valid: isValid,
            license: license || null,
        });
    } catch (error) {
        console.error("License validation failed:", error);

        return res.status(500).json({
            success: false,
            error: "License validation failed.",
        });
    }
}
