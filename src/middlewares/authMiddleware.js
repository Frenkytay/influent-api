import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "please_change_me_in_production";

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ error: "Missing Authorization header" });

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // attach user info to request
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
