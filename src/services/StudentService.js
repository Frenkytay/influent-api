import BaseService from "../core/BaseService.js";
import StudentRepository from "../repositories/StudentRepository.js";

class StudentService extends BaseService {
  constructor() {
    super(StudentRepository);
  }

  async getAll(filters = {}, options = {}) {
    const { university, major, year, gpa, status } = filters;
    
    const queryFilters = {};
    if (university) queryFilters.university_like = university;
    if (major) queryFilters.major_like = major;
    if (year) queryFilters.year = year;
    if (gpa) queryFilters.gpa = gpa;
    if (status) queryFilters.status = status;

    return await super.getAll(queryFilters, options);
  }

  async getByUserId(userId) {
    return await this.repository.findByUserId(userId);
  }

  async getByUniversity(university, options = {}) {
    return await this.repository.findByUniversity(university, options);
  }
}

export default new StudentService();
