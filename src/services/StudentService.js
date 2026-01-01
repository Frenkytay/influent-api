import BaseService from "../core/BaseService.js";
import StudentRepository from "../repositories/StudentRepository.js";
import UserRepository from "../repositories/UserRepository.js";
import InstagramService from "./InstagramService.js";
import AppError from "../core/AppError.js";

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

  /**
   * Connect Instagram Account
   */
  async connectInstagram(userId, code) {
    // 1. Get Access Token and Details
    const accessToken = await InstagramService.getAccessToken(code);
    const igDetails = await InstagramService.getInstagramDetails(accessToken);

    // 2. Check if this Instagram IDis already linked to ANOTHER student
    const existing = await this.repository.findOne({
        where: { instagram_id: igDetails.instagram_id }
    });

    if (existing && existing.user_id !== userId) {
        throw new AppError("This Instagram account is already connected to another user.", 409);
    }

    // 3. Update Student Record
    await this.repository.update(userId, {
        instagram_id: igDetails.instagram_id,
        instagram_username: igDetails.username,
        instagram_followers_count: igDetails.followers_count,
        facebook_access_token: accessToken
    });

    return {
        message: "Instagram connected successfully",
        instagram: {
            username: igDetails.username,
            followers_count: igDetails.followers_count
        }
    };
  }

  /**
   * Update Student Profile by User ID
   */
  async updateByUserId(userId, data) {
    // Prevent updating restricted fields
    const { verification_status, rejection_reason, ...updateData } = data;
    
    // Check if student exists
    const student = await this.repository.findByUserId(userId);
    if (!student) {
        // Create if not exists (lazy creation)
        return await this.repository.create({
            ...updateData,
            user_id: userId,
            verification_status: 'unverified'
        });
    }

    return await this.repository.update(userId, updateData);
  }

  /**
   * Upload KTM and request verification
   */
  async uploadKTM(userId, ktmUrl) {
    const student = await this.repository.findByUserId(userId);
    if (!student) {
        throw new AppError("Student profile not found. Please complete profile first.", 404);
    }

    return await this.repository.update(userId, {
        ktm_image_url: ktmUrl,
        verification_status: 'pending' // Auto-set to pending
    });
  }

  /**
   * Verify Student (Admin)
   */
  async verifyStudent(userId, action, reason) {
    // Note: userId here is the user_id (primary key of student table)
    const student = await this.repository.findByUserId(userId);
    
    if (!student) {
        throw new AppError("Student not found", 404);
    }

    const updateData = {};
    if (action === 'approve') {
        updateData.verification_status = 'verified';
        updateData.rejection_reason = null;
        
        // Activate user account
        await UserRepository.update(userId, { status: 'active' });
    } else if (action === 'reject') {
        updateData.verification_status = 'rejected';
        updateData.rejection_reason = reason;

        // Suspend user account
        await UserRepository.update(userId, { status: 'suspended' });
    } else {
        throw new AppError("Invalid action. Use 'approve' or 'reject'.", 400);
    }

    return await this.repository.update(userId, updateData);
  }
}

export default new StudentService();
