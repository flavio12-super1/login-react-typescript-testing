// const express = require("express");
// const router = express.Router();
// const mongoose = require("mongoose");
// const userSchema = require("../models/userSchema");

// mongoose.model("User", userSchema); // create the User model

// router.get("/", async (req, res, next) => {
//   try {
//     // console.log(req.userId);
//     const user = await mongoose.model("User").findOne({ _id: req.userId });
//     console.log(user);
//     res.send({ message: "hello world : )" });
//   } catch (err) {
//     next(err);
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const userSchema = require("../models/userSchema");

const User = mongoose.model("User", userSchema);

router.get("/", async (req, res, next) => {
  //   try {
  //     const user = await User.findOne({ _id: req.userId });
  //     const notifications = await User.aggregate([
  //       {
  //         $match: { _id: { $in: user.notifications } },
  //       },
  //       {
  //         $project: { _id: 0, email: 1 },
  //       },
  //     ]);
  //     console.log(notifications);
  //     res.send({ notifications });
  //   } catch (err) {
  //     next(err);
  //   }
  //   try {
  //     const notifications = await User.aggregate([
  //       {
  //         $match: { _id: new mongoose.Types.ObjectId(req.userId) },
  //       },
  //       {
  //         $lookup: {
  //           from: "users",
  //           let: { notifications: "$notifications" },
  //           pipeline: [
  //             {
  //               $match: {
  //                 $expr: {
  //                   $in: ["$_id", "$$notifications"],
  //                 },
  //               },
  //             },
  //             {
  //               $project: { _id: 0, email: 1 },
  //             },
  //           ],
  //           as: "notifications",
  //         },
  //       },
  //       {
  //         $unwind: "$notifications",
  //       },
  //       {
  //         $project: {
  //           _id: 0,
  //           email: 1,
  //         },
  //       },
  //     ]);
  //     console.log(notifications);
  //     res.send({ notifications });
  //   } catch (err) {
  //     next(err);
  //   }
  //   try {
  //     const user = await User.findById(req.userId);
  //     const notifications = user.notifications;
  //     const notificationsWithUsername = [];
  //     for (const notification of notifications) {
  //       const user = await User.findById(notification);
  //       notificationsWithUsername.push({
  //         id: notification,
  //         email: user.email,
  //       });
  //     }
  //     console.log(notificationsWithUsername);
  //     res.send({ notifications: notificationsWithUsername });
  //   } catch (err) {
  //     next(err);
  //   }
  //   try {
  //     const user = await User.findById(req.userId);
  //     const notifications = user.notifications;
  //     console.log(notifications);
  //     const promises = notifications.map((notification) => {
  //       return User.findById(notification).select("email").lean().exec();
  //     });
  //     const results = await Promise.all(promises);
  //     console.log(results);
  //     const notificationsWithUsername = results.map((result, index) => {
  //       return {
  //         id: notifications[index],
  //         email: result.email,
  //       };
  //     });
  //     console.log(notificationsWithUsername);
  //     res.send({ notifications: notificationsWithUsername });
  //   } catch (err) {
  //     next(err);
  //   }
  try {
    const user = await User.findById(req.userId);
    const notifications = user.notifications;
    // console.log(notifications);
    const promises = notifications.map((notification) => {
      return User.findById(notification.userID).select("email").lean().exec();
    });
    const results = await Promise.all(promises);
    // console.log(results);
    const notificationsWithUsername = results.map((result, index) => {
      return {
        id: notifications[index].id,
        userID: notifications[index].userID,
        email: result.email,
      };
    });
    // console.log(notificationsWithUsername);
    console.log("notifications being sent to client");
    res.send({ notifications: notificationsWithUsername });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
