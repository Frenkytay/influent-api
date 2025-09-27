// const User = require("./User");
// const Student = require("./Student");
// const Campaign = require("./Campaign");
// const CampaignUsers = require("./CampaignUsers");
// const ChatRoom = require("./ChatRoom");
// const ChatMessage = require("./ChatMessage");
// const Review = require("./Review");
// const Notification = require("./Notification");

// // Example associations (add all as per your DDL)
// User.hasOne(Student, { foreignKey: "user_id" });
// Student.belongsTo(User, { foreignKey: "user_id" });

// Student.hasMany(Campaign, { foreignKey: "student_id" });
// Campaign.belongsTo(Student, { foreignKey: "student_id" });

// Campaign.hasMany(CampaignUsers, { foreignKey: "campaign_id" });
// CampaignUsers.belongsTo(Campaign, { foreignKey: "campaign_id" });

// Student.hasMany(CampaignUsers, { foreignKey: "student_id" });
// CampaignUsers.belongsTo(Student, { foreignKey: "student_id" });

// ChatRoom.hasMany(ChatMessage, { foreignKey: "chat_room_id" });
// ChatMessage.belongsTo(ChatRoom, { foreignKey: "chat_room_id" });

// User.hasMany(ChatMessage, { foreignKey: "user_id" });
// ChatMessage.belongsTo(User, { foreignKey: "user_id" });

// User.hasMany(Notification, { foreignKey: "user_id" });
// Notification.belongsTo(User, { foreignKey: "user_id" });

// User.hasMany(Review, { foreignKey: "creator_id" });
// User.hasMany(Review, { foreignKey: "reviewee_user_id" });
// Review.belongsTo(User, { as: "creator", foreignKey: "creator_id" });
// Review.belongsTo(User, { as: "reviewee", foreignKey: "reviewee_user_id" });

// Campaign.hasMany(Review, { foreignKey: "campaign_id" });
// Review.belongsTo(Campaign, { foreignKey: "campaign_id" });

// module.exports = {
//   User,
//   Student,
//   Campaign,
//   CampaignUsers,
//   ChatRoom,
//   ChatMessage,
//   Review,
//   Notification,
// };
