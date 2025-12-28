import User from "./User.js";
import Student from "./Student.js";
import Campaign from "./Campaign.js";
import CampaignUsers from "./CampaignUsers.js";
import CampaignContentTypes from "./CampaignContentTypes.js";
import ChatRoom from "./ChatRoom.js";
import ChatMessage from "./ChatMessage.js";
import ChatRoomParticipant from "./ChatRoomParticipant.js";
import Review from "./Review.js";
import Notification from "./Notification.js";
import Payment from "./Payment.js";
import WorkSubmission from "./WorkSubmission.js";
import PostSubmission from "./PostSubmission.js";
import Withdrawal from "./Withdrawal.js";
import Transaction from "./Transaction.js";

const models = {
  User,
  Student,
  Campaign,
  CampaignUsers,
  CampaignContentTypes,
  ChatRoom,
  ChatMessage,
  ChatRoomParticipant,
  Review,
  Notification,
  Payment,
  WorkSubmission,
  PostSubmission,
  Withdrawal,
  Transaction,
};

// Initialize associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

export {
  User,
  Student,
  Campaign,
  CampaignUsers,
  CampaignContentTypes,
  ChatRoom,
  ChatMessage,
  ChatRoomParticipant,
  Review,
  Notification,
  Payment,
  WorkSubmission,
  PostSubmission,
  Withdrawal,
  Transaction,
};
