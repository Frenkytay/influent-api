// const sequelize = require("./src/config/db");
// const User = require("./src/models/User");
// const Student = require("./src/models/Student");
// const Campaign = require("./src/models/Campaign");
// const CampaignUsers = require("./src/models/CampaignUsers");
// const ChatRoom = require("./src/models/ChatRoom");
// const ChatMessage = require("./src/models/ChatMessage");
// const Review = require("./src/models/Review");
// const Notification = require("./src/models/Notification");
// async function seed() {
//   const { faker } = await import("@faker-js/faker");

//   await sequelize.sync({ force: true });

//   // Users
//   // ...existing code...
//   // Users
//   // USERS & STUDENTS
//   const users = [];
//   const students = [];
//   for (let i = 0; i < 100; i++) {
//     const role = faker.helpers.arrayElement(["student", "company", "admin"]);
//     const user = await User.create({
//       name: faker.person.fullName(),
//       email: faker.internet.email(),
//       password: faker.internet.password(),
//       role,
//       status: "active",
//     });
//     users.push(user);
//     if (role === "student") {
//       const student = await Student.create({
//         user_id: user.user_id,
//         university: faker.company.name(),
//         major: faker.commerce.department(),
//         year: faker.date.past({ years: 5 }),
//         phone_number: faker.phone.number(),
//         gpa: faker.number.float({ min: 2.0, max: 4.0, precision: 0.01 }),
//         status: true,
//         updated_at: new Date(),
//         created_at: new Date(),
//       });
//       students.push(student);
//     }
//   }

//   // CAMPAIGNS
//   const campaigns = [];
//   for (let i = 0; i < 20; i++) {
//     const student = faker.helpers.arrayElement(students);
//     const campaign = await Campaign.create({
//       student_id: student.user_id,
//       rating: faker.number.int({ min: 1, max: 5 }),
//       title: faker.company.catchPhrase(),
//       description: faker.lorem.paragraph(),
//       requirements: faker.lorem.sentence(),
//       salary: faker.number.float({ min: 1000, max: 10000, precision: 0.01 }),
//       status: faker.helpers.arrayElement(["active", "inactive", "completed"]),
//       deadline: faker.date.future(),
//       created_at: new Date(),
//       updated_at: new Date(),
//     });
//     campaigns.push(campaign);
//   }

//   // CAMPAIGN USERS (Applications)
//   // ...existing code...

//   // CAMPAIGN USERS (Applications)
//   const campaignUserPairs = new Set();
//   let created = 0;
//   while (created < 60) {
//     const campaign = faker.helpers.arrayElement(campaigns);
//     const student = faker.helpers.arrayElement(students);
//     const pairKey = `${campaign.campaign_id}-${student.user_id}`;
//     if (campaignUserPairs.has(pairKey)) {
//       continue; // Skip duplicates
//     }
//     campaignUserPairs.add(pairKey);
//     await CampaignUsers.create({
//       campaign_id: campaign.campaign_id,
//       student_id: student.user_id,
//       applied_at: faker.date.past({ years: 1 }),
//       application_status: faker.helpers.arrayElement([
//         "pending",
//         "accepted",
//         "rejected",
//       ]),
//       application_notes: faker.lorem.sentence(),
//       accepted_at: faker.datatype.boolean()
//         ? faker.date.past({ years: 1 })
//         : null,
//       rejected_at: faker.datatype.boolean()
//         ? faker.date.past({ years: 1 })
//         : null,
//     });
//     created++;
//   }

//   // ...existing code...

//   // CHAT ROOMS
//   const chatRooms = [];
//   for (let i = 0; i < 8; i++) {
//     chatRooms.push(
//       await ChatRoom.create({
//         name: faker.company.name(),
//         status: faker.helpers.arrayElement(["active", "archived"]),
//         created_at: new Date(),
//         updated_at: new Date(),
//       })
//     );
//   }

//   // CHAT MESSAGES
//   for (let i = 0; i < 120; i++) {
//     await ChatMessage.create({
//       user_id: faker.helpers.arrayElement(users).user_id,
//       chat_room_id: faker.helpers.arrayElement(chatRooms).id,
//       message: faker.lorem.sentence(),
//       is_read: faker.datatype.boolean(),
//       timestamp: faker.date.recent({ days: 30 }),
//       created_at: new Date(),
//     });
//   }

//   // REVIEWS
//   for (let i = 0; i < 30; i++) {
//     const creator = faker.helpers.arrayElement(users);
//     const reviewee = faker.helpers.arrayElement(
//       users.filter((u) => u.user_id !== creator.user_id)
//     );
//     const campaign = faker.helpers.arrayElement(campaigns);
//     await Review.create({
//       creator_id: creator.user_id,
//       reviewee_user_id: reviewee.user_id,
//       campaign_id: campaign.campaign_id,
//       rating: faker.number.int({ min: 1, max: 5 }),
//       comment: faker.lorem.sentences({ min: 1, max: 3 }),
//       created_at: new Date(),
//     });
//   }

//   // NOTIFICATIONS
//   for (let i = 0; i < 50; i++) {
//     await Notification.create({
//       user_id: faker.helpers.arrayElement(users).user_id,
//       type: faker.helpers.arrayElement(["info", "warning", "success", "error"]),
//       title: faker.lorem.words({ min: 2, max: 5 }),
//       message: faker.lorem.sentence(),
//       is_read: faker.datatype.boolean(),
//       created_at: new Date(),
//     });
//   }

//   console.log("Dummy data seeded!");
//   process.exit();
// }

// seed();
