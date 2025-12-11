/**
 * Base Controller class for HTTP request handling
 * All controller classes should extend this class
 */
class BaseController {
  constructor(service) {
    this.service = service;
  }

  /**
   * Handle async route handlers and catch errors
   */
  asyncHandler(fn) {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Send success response
   */
  sendSuccess(res, data, statusCode = 200) {
    res.status(statusCode).json({
      success: true,
      data,
    });
  }

  /**
   * Send error response
   */
  sendError(res, message, statusCode = 500) {
    res.status(statusCode).json({
      success: false,
      error: message,
    });
  }

  /**
   * Get all records
   */
  getAll = this.asyncHandler(async (req, res) => {
    const { sort, order, ...filters } = req.query;
    const records = await this.service.getAll(filters, { sort, order });
    this.sendSuccess(res, records);
  });

  /**
   * Get single record by ID
   */
  getById = this.asyncHandler(async (req, res) => {
    const record = await this.service.getById(req.params.id);
    this.sendSuccess(res, record);
  });

  /**
   * Create new record
   */
  create = this.asyncHandler(async (req, res) => {
    const record = await this.service.create(req.body);
    this.sendSuccess(res, record, 201);
  });

  /**
   * Update record
   */
  update = this.asyncHandler(async (req, res) => {
    const record = await this.service.update(req.params.id, req.body);
    this.sendSuccess(res, record);
  });

  /**
   * Delete record
   */
  delete = this.asyncHandler(async (req, res) => {
    await this.service.delete(req.params.id);
    this.sendSuccess(res, { message: "Record deleted successfully" });
  });
}

export default BaseController;
