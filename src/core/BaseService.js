/**
 * Base Service class for business logic
 * All service classes should extend this class
 */
class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * Get all records with optional filters
   */
  async getAll(filters = {}, options = {}) {
    const where = this.repository.buildWhereClause(filters);
    const order = this.repository.buildOrderClause(
      options.sort,
      options.order
    );

    return await this.repository.findAll({
      ...options,
      where,
      order,
    });
  }

  /**
   * Get a single record by ID
   */
  async getById(id, options = {}) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new Error("Record not found");
    }
    return record;
  }

  /**
   * Create a new record
   */
  async create(data) {
    return await this.repository.create(data);
  }

  /**
   * Update a record
   */
  async update(id, data) {
    return await this.repository.update(id, data);
  }

  /**
   * Delete a record
   */
  async delete(id) {
    return await this.repository.delete(id);
  }

  /**
   * Validate required fields
   */
  validateRequired(data, requiredFields) {
    const missing = requiredFields.filter((field) => !data[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }
  }
}

export default BaseService;
