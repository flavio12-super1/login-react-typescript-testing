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

async function getNotificaitons(notifications) {
  const promises = notifications.map((notification) => {
    return User.findById(notification.userID).select("email").lean().exec();
  });
  const results = await Promise.all(promises);
  const notificationsWithUsername = results.map((result, index) => {
    return {
      id: notifications[index].id,
      userID: notifications[index].userID,
      email: result.email,
    };
  });

  return notificationsWithUsername;
}

async function getFriends(friends) {
  const promises = friends?.map((friend) => {
    return User.findById(friend.userID).select("email").lean().exec();
  });
  const results = await Promise.all(promises);
  const friendsWithUsername = results.map((result, index) => {
    return {
      id: friends[index].id,
      userID: friends[index].userID,
      email: result.email,
      channelID: friends[index].channelID,
    };
  });

  return friendsWithUsername;
}

router.get("/", async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const notifications = user.notifications;
    const friends = user.friendList;
    console.log("friends channel id: " + friends[0]?.channelID);

    const notificationsWithUsername = await getNotificaitons(notifications);
    const friendsWithUsername = await getFriends(friends);
    console.log("user data being sent to client");
    res.json({
      notifications: notificationsWithUsername,
      friends: friendsWithUsername,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
