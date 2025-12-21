/**
 * ErrorHandler - Centralized error handling middleware
 */
class ErrorHandler {
  /**
   * Main error handler
   */
  handle = (err, req, res, next) => {
    console.error("Error:", err);

    // Handle different error types
    if (err.name === "ValidationError") {
      return this.handleValidationError(err, res);
    }

    if (err.name === "SequelizeValidationError") {
      return this.handleSequelizeValidationError(err, res);
    }

    if (err.name === "SequelizeUniqueConstraintError") {
      return this.handleUniqueConstraintError(err, res);
    }

    if (err.name === "SequelizeForeignKeyConstraintError") {
      return this.handleForeignKeyError(err, res);
    }

    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return this.handleAuthError(err, res);
    }

    if (err.status === 404) {
      return this.handleNotFoundError(err, res);
    }

    // Default error
    return this.handleGenericError(err, res);
  };

  /**
   * Handle validation errors
   */
  handleValidationError(err, res) {
    const errors = err.errors || {};
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors,
    });
  }

  /**
   * Handle Sequelize validation errors
   */
  handleSequelizeValidationError(err, res) {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors,
    });
  }

  /**
   * Handle unique constraint errors
   */
  handleUniqueConstraintError(err, res) {
    const field = err.errors?.[0]?.path || "field";
    return res.status(409).json({
      success: false,
      error: `${field} already exists`,
      details: err.errors,
    });
  }

  /**
   * Handle foreign key constraint errors
   */
  handleForeignKeyError(err, res) {
    return res.status(400).json({
      success: false,
      error: "Invalid reference",
      message: "The referenced record does not exist",
    });
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(err, res) {
    return res.status(401).json({
      success: false,
      error: "Authentication failed",
      message: err.message,
    });
  }

  /**
   * Handle not found errors
   */
  handleNotFoundError(err, res) {
    return res.status(404).json({
      success: false,
      error: "Resource not found",
      message: err.message || "The requested resource was not found",
    });
  }

  /**
   * Handle generic errors
   */
  handleGenericError(err, res) {
    const statusCode = err.status || err.statusCode || 500;
    // Always use the error message if provided, don't hide it behind "Internal server error"
    // unless it's a true codebase crash we want to hide in production.
    // But user asked to "just tell the error".
    const message = err.message || "Internal server error";

    return res.status(statusCode).json({
      success: false,
      error: message, 
      ...(process.env.NODE_ENV === "development" && {
        stack: err.stack,
        details: err,
      }),
    });
  }

  /**
   * 404 handler (for undefined routes)
   */
  notFound = (req, res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.status = 404;
    next(error);
  };
}

export default new ErrorHandler();
