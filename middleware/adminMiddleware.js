import crypto from "crypto";

export function requireAdmin(req, res, next) {
    const configuredSecret = process.env.ADMIN_SECRET;
    const providedSecret = req.headers["x-admin-secret"];

    if (!configuredSecret) {
        return res.status(503).json({
            success: false,
            error: "Admin secret is not configured.",
        });
    }

    if (
        typeof providedSecret !== "string" ||
        providedSecret.length !== configuredSecret.length ||
        !crypto.timingSafeEqual(
            Buffer.from(providedSecret),
            Buffer.from(configuredSecret)
        )
    ) {
        return res.status(401).json({
            success: false,
            error: "Invalid admin credentials.",
        });
    }

    return next();
}
