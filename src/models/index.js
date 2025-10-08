import User from "./User.js";
import Student from "./Student.js";
import Campaign from "./Campaign.js";
import CampaignUsers from "./CampaignUsers.js";
import CampaignContentTypes from "./CampaignContentTypes.js";
import ChatRoom from "./ChatRoom.js";
import ChatMessage from "./ChatMessage.js";
import Review from "./Review.js";
import Notification from "./Notification.js";

// Example associations (add all as per your DDL)
User.hasOne(Student, { foreignKey: "user_id" });
Student.belongsTo(User, { foreignKey: "user_id" });

Student.hasMany(Campaign, { foreignKey: "student_id" });
Campaign.belongsTo(Student, { foreignKey: "student_id" });

Campaign.hasMany(CampaignUsers, { foreignKey: "campaign_id" });
CampaignUsers.belongsTo(Campaign, { foreignKey: "campaign_id" });

Campaign.hasMany(CampaignContentTypes, {
  foreignKey: "campaign_id",
  as: "contentTypes",
});
CampaignContentTypes.belongsTo(Campaign, { foreignKey: "campaign_id" });

Student.hasMany(CampaignUsers, { foreignKey: "student_id" });
CampaignUsers.belongsTo(Student, { foreignKey: "student_id" });

// For CampaignUsers join with User and Campaign (for controller includes)
CampaignUsers.belongsTo(User, { foreignKey: "student_id", as: "user" });
CampaignUsers.belongsTo(Campaign, {
  foreignKey: "campaign_id",
  as: "campaign",
});

ChatRoom.hasMany(ChatMessage, { foreignKey: "chat_room_id" });
ChatMessage.belongsTo(ChatRoom, { foreignKey: "chat_room_id" });

User.hasMany(ChatMessage, { foreignKey: "user_id" });
ChatMessage.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Notification, { foreignKey: "user_id" });
Notification.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Review, { foreignKey: "creator_id" });
User.hasMany(Review, { foreignKey: "reviewee_user_id" });
Review.belongsTo(User, { as: "creator", foreignKey: "creator_id" });
Review.belongsTo(User, { as: "reviewee", foreignKey: "reviewee_user_id" });

Campaign.hasMany(Review, { foreignKey: "campaign_id" });
Review.belongsTo(Campaign, { foreignKey: "campaign_id" });

export {
  User,
  Student,
  Campaign,
  CampaignUsers,
  CampaignContentTypes,
  ChatRoom,
  ChatMessage,
  Review,
  Notification,
};
