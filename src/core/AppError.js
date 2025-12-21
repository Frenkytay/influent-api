/**
 * AppError - Custom error class for operational errors causes by users
 * These errors are "expected" and should not be treated as bugs/crashes
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode; // alias
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
