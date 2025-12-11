import BaseController from "../core/BaseController.js";
import CampaignUsersService from "../services/CampaignUsersService.js";

class CampaignUsersController extends BaseController {
  constructor() {
    super(CampaignUsersService);
  }

  getAll = this.asyncHandler(async (req, res) => {
    const { campaign_id, student_id, application_status, sort, order } = req.query;
    
    const items = await this.service.getAll(
      { campaign_id, student_id, application_status },
      { sort, order }
    );
    
    this.sendSuccess(res, items);
  });

  getById = this.asyncHandler(async (req, res) => {
    const item = await this.service.getById(req.params.id);
    this.sendSuccess(res, item);
  });

  create = this.asyncHandler(async (req, res) => {
    const item = await this.service.create(req.body);
    this.sendSuccess(res, item, 201);
  });

  update = this.asyncHandler(async (req, res) => {
    const item = await this.service.update(req.params.id, req.body);
    this.sendSuccess(res, item);
  });

  delete = this.asyncHandler(async (req, res) => {
    await this.service.delete(req.params.id);
    this.sendSuccess(res, { message: "Campaign user deleted successfully" });
  });
}

export default new CampaignUsersController();
