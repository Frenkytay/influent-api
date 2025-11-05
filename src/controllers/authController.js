import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "please_change_me_in_production";
// Set default token expiry to 5 hours. Can be overridden with JWT_EXPIRES_IN env var (e.g. '5h')
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "5h";
const RESET_EXPIRES = process.env.RESET_EXPIRES || "1h";

// Helper to sign auth tokens
function signAuthToken(user) {
  const payload = {
    sub: user.user_id || user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: "name, email, password and role are required" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(409).json({ error: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    const token = signAuthToken(user);
    return res.status(201).json({
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Register error", err.message);
    return res.status(500).json({ error: "Registration failed" });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = signAuthToken(user);
    return res.json({
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error", err.message);
    return res.status(500).json({ error: "Login failed" });
  }
};

// Forgot password - create a short-lived reset token. In prod, send email with this token.
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(200).json({ ok: true }); // do not reveal account existence

    const resetToken = jwt.sign(
      { sub: user.user_id, email: user.email, purpose: "reset" },
      JWT_SECRET,
      { expiresIn: RESET_EXPIRES }
    );

    // In production: send email with reset link containing the token
    // e.g. https://yourfrontend.com/reset-password?token=${resetToken}
    // For now we return token in response (development). Also log it.
    console.log("Password reset token for", email, ":", resetToken);

    return res.json({ ok: true, resetToken });
  } catch (err) {
    console.error("forgotPassword error", err.message);
    return res.status(500).json({ error: "Failed to generate reset token" });
  }
};

// Reset password using token
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ error: "token and new password required" });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    if (payload.purpose !== "reset")
      return res.status(400).json({ error: "Invalid token purpose" });

    const user = await User.findByPk(payload.sub);
    if (!user) return res.status(404).json({ error: "User not found" });

    const hashed = await bcrypt.hash(password, 10);
    await user.update({ password: hashed });

    return res.json({ ok: true });
  } catch (err) {
    console.error("resetPassword error", err.message);
    return res.status(500).json({ error: "Failed to reset password" });
  }
};

export default { register, login, forgotPassword, resetPassword };
