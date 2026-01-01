import BaseController from "../core/BaseController.js";
import StudentService from "../services/StudentService.js";

class StudentController extends BaseController {
  constructor() {
    super(StudentService);
  }

  getAll = this.asyncHandler(async (req, res) => {
    // If the logged-in user is a student, only return their own data
    if (req.user && req.user.role === 'student') {
      const student = await this.service.getByUserId(req.user.id);
      if (!student) {
        // Return null/empty if profile not created yet, instead of 404 error
        return this.sendSuccess(res, null);
      }
      return this.sendSuccess(res, student);
    }

    // Otherwise (Admin/Business), return list of students
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
    // 1. Get user ID from authenticated token
    const userId = req.body.user_id || req.user.id;

    if (!userId) {
      return this.sendError(res, "Authentication required", 401);
    }

    // 2. Check if student profile already exists
    const existingStudent = await this.service.getByUserId(userId);
    if (existingStudent) {
      return this.sendError(res, "Student profile already exists", 400);
    }

    // 3. Create student with user_id forced
    const studentData = {
      ...req.body,
      user_id: userId,
      status: true // Default active
    };

    const student = await this.service.create(studentData);
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

  /**
   * Connect Instagram
   * POST /api/v1/students/instagram/connect
   */
  connectInstagram = this.asyncHandler(async (req, res) => {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return this.sendError(res, "Authorization code is required", 400);
    }

    const result = await this.service.connectInstagram(userId, code);
    this.sendSuccess(res, result);
  });

  /**
   * Update Profile
   * PUT /api/v1/students/profile
   */
  updateProfile = this.asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const student = await this.service.updateByUserId(userId, req.body);
    this.sendSuccess(res, student);
  });

  /**
   * Upload KTM
   * POST /api/v1/students/upload-ktm
   */
  uploadKTM = this.asyncHandler(async (req, res) => {
    if (!req.file) {
      return this.sendError(res, "KTM file is required", 400);
    }

    const userId = req.user.id;
    // Construct public URL - assuming local storage served via static middleware
    // You might want to adjust this based on your actual file serving setup
    // For now, consistent with UploadMiddleware relative path logic if any
    const ktmUrl = `/${req.file.filename}`; 

    const result = await this.service.uploadKTM(userId, ktmUrl);
    this.sendSuccess(res, result);
  });
}

export default new StudentController();
