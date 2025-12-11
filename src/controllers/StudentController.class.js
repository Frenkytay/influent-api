import BaseController from "../core/BaseController.js";
import StudentService from "../services/StudentService.js";

class StudentController extends BaseController {
  constructor() {
    super(StudentService);
  }

  getAll = this.asyncHandler(async (req, res) => {
    const { university, major, year, gpa, status, sort, order } = req.query;
    
    const students = await this.service.getAll(
      { university, major, year, gpa, status },
      { sort, order }
    );
    
    this.sendSuccess(res, students);
  });

  getById = this.asyncHandler(async (req, res) => {
    const student = await this.service.getById(req.params.id);
    this.sendSuccess(res, student);
  });

  create = this.asyncHandler(async (req, res) => {
    const student = await this.service.create(req.body);
    this.sendSuccess(res, student, 201);
  });

  update = this.asyncHandler(async (req, res) => {
    const student = await this.service.update(req.params.id, req.body);
    this.sendSuccess(res, student);
  });

  delete = this.asyncHandler(async (req, res) => {
    await this.service.delete(req.params.id);
    this.sendSuccess(res, { message: "Student deleted successfully" });
  });
}

export default new StudentController();
