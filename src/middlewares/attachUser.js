import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "please_change_me_in_production";

// Non-blocking middleware: if Authorization Bearer token is present and valid,
// attach `req.user`. If missing or invalid, just continue without failing.
export default function attachUser(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // no token provided — continue but do not attach req.user
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
  } catch (err) {
    // invalid token — don't block the request, just don't attach user
  }
  return next();
}
