import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "car-service-local-development-secret";

export function requireAuth(req, res, next) {
    const authorization = req.headers.authorization || "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            success: false,
            error: "Authentication token is required.",
        });
    }

    try {
        req.user = jwt.verify(token, jwtSecret);
        return next();
    } catch {
        return res.status(401).json({
            success: false,
            error: "Invalid or expired authentication token.",
        });
    }
}
