import { Op } from "sequelize";

/**
 * Base Repository class for common database operations
 * All model-specific repositories should extend this class
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  /**
   * Find all records with optional filters and includes
   */
  async findAll(options = {}) {
    return await this.model.findAll(options);
  }

  /**
   * Find one record by primary key
   */
  async findById(id) {
    return await this.model.findByPk(id);
  }

  /**
   * Find one record with custom conditions
   */
  async findOne(options = {}) {
    return await this.model.findOne(options);
  }

  /**
   * Create a new record
   */
  async create(data) {
    return await this.model.create(data);
  }

  /**
   * Update a record
   */
  async update(id, data) {
    const record = await this.findById(id);
    if (!record) {
      throw new Error("Record not found");
    }
    return await record.update(data);
  }

  /**
   * Delete a record
   */
  async delete(id) {
    const record = await this.findById(id);
    if (!record) {
      throw new Error("Record not found");
    }
    return await record.destroy();
  }

  /**
   * Count records with optional filters
   */
  async count(options = {}) {
    return await this.model.count(options);
  }

  /**
   * Build where clause for filtering
   */
  buildWhereClause(filters) {
    const where = {};
    
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== "") {
        // Handle LIKE searches
        if (key.endsWith("_like")) {
          const field = key.replace("_like", "");
          where[field] = { [Op.like]: `%${value}%` };
        } else {
          where[key] = value;
        }
      }
    });

    return where;
  }

  /**
   * Build order clause for sorting
   */
  buildOrderClause(sort, order = "ASC") {
    if (!sort) return [];
    return [[sort, order.toUpperCase()]];
  }
}

export default BaseRepository;
