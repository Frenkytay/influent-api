import PostSubmission from "../models/PostSubmission.js";
import WorkSubmission from "../models/WorkSubmission.js";

class PostSubmissionRepository {
  async create(data) {
    return await PostSubmission.create(data);
  }

  async findByWorkSubmissionId(workSubmissionId) {
    return await PostSubmission.findOne({
      where: { work_submission_id: workSubmissionId },
    });
  }

  async findById(id) {
    return await PostSubmission.findByPk(id, {
      include: [
        {
          model: WorkSubmission,
          as: "work_submission",
        },
      ],
    });
  }

  async updateStatus(id, status) {
    const submission = await PostSubmission.findByPk(id);
    if (!submission) return null;
    
    submission.status = status;
    await submission.save();
    return submission;
  }
}

export default new PostSubmissionRepository();
