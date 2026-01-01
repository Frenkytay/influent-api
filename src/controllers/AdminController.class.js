import BaseController from "../core/BaseController.js";
import StudentService from "../services/StudentService.js";

class AdminController extends BaseController {
  constructor() {
    super(StudentService);
  }

  /**
   * Verify Student
   * POST /api/v1/admin/verify-student
   */
  verifyStudent = this.asyncHandler(async (req, res) => {
    const { userId, action, reason } = req.body;

    if (!userId || !action) {
      return this.sendError(res, "User ID and action are required", 400);
    }

    if (action === 'reject' && !reason) {
        return this.sendError(res, "Reason is required when rejecting", 400);
    }

    const result = await this.service.verifyStudent(userId, action, reason);
    this.sendSuccess(res, result);
  });
}

export default new AdminController();
