import BaseRepository from "../core/BaseRepository.js";
import Student from "../models/Student.js";

class StudentRepository extends BaseRepository {
  constructor() {
    super(Student);
  }

  async findByUserId(userId) {
    return await this.findOne({ where: { user_id: userId } });
  }

  async findByUniversity(university, options = {}) {
    return await this.findAll({
      where: { university },
      ...options,
    });
  }
}

export default new StudentRepository();
