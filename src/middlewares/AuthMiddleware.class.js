import jwt from "jsonwebtoken";

/**
 * AuthMiddleware - Authentication and authorization middleware
 */
class AuthMiddleware {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || "please_change_me_in_production";
  }

  /**
   * Verify JWT token
   */
  verifyJWT = (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
      }

      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ error: "Invalid authorization format" });
      }

      const token = parts[1];
      const payload = jwt.verify(token, this.jwtSecret);
      
      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      return next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      }
      return res.status(401).json({ error: "Invalid token" });
    }
  };

  /**
   * Check if user has specific role
   */
  hasRole = (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: "Access denied",
          message: `This action requires one of these roles: ${allowedRoles.join(", ")}` 
        });
      }

      return next();
    };
  };

  /**
   * Check if user is admin
   */
  isAdmin = (req, res, next) => {
    return this.hasRole("admin")(req, res, next);
  };

  /**
   * Check if user is student
   */
  isStudent = (req, res, next) => {
    return this.hasRole("student")(req, res, next);
  };

  /**
   * Check if user is business
   */
  isBusiness = (req, res, next) => {
    return this.hasRole("business")(req, res, next);
  };

  /**
   * Attach user if token exists (non-blocking)
   */
  attachUser = (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return next();
      }

      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        return next();
      }

      const token = parts[1];
      const payload = jwt.verify(token, this.jwtSecret);
      
      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      return next();
    } catch (err) {
      // Silently continue without user
      return next();
    }
  };

  /**
   * Verify API key (for service-to-service auth)
   */
  verifyAPIKey = (req, res, next) => {
    const apiKey = req.headers["x-api-key"];
    const validAPIKey = process.env.API_KEY;

    if (!validAPIKey) {
      return res.status(500).json({ error: "API key not configured" });
    }

    if (!apiKey || apiKey !== validAPIKey) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    return next();
  };

  /**
   * Rate limiting check (basic implementation)
   */
  rateLimit = (maxRequests = 100, windowMs = 60000) => {
    const requests = new Map();

    return (req, res, next) => {
      const key = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      
      if (!requests.has(key)) {
        requests.set(key, []);
      }

      const userRequests = requests.get(key);
      const recentRequests = userRequests.filter(time => now - time < windowMs);
      
      if (recentRequests.length >= maxRequests) {
        return res.status(429).json({ error: "Too many requests" });
      }

      recentRequests.push(now);
      requests.set(key, recentRequests);
      
      return next();
    };
  };
}

export default new AuthMiddleware();
