const express = require("express");
const router = express.Router();

router.use("/v1/users", require("./userRoutes"));
router.use("/v1/students", require("./studentRoutes"));
router.use("/v1/campaigns", require("./campaignRoutes"));
router.use("/v1/campaign-users", require("./campaignUsersRoutes"));
router.use("/v1/chat-rooms", require("./chatRoomRoutes"));
router.use("/v1/chat-messages", require("./chatMessageRoutes"));
router.use("/v1/reviews", require("./reviewRoutes"));
router.use("/v1/notifications", require("./notificationRoutes"));

module.exports = router;
