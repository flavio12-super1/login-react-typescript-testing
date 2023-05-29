const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const themeSchema = new mongoose.Schema({
  theme: { type: Object },
});

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true, select: true },
    notifications: [
      {
        id: { type: String, required: true },
        userID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    friendList: [
      {
        userID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        channelID: {
          type: String,
          ref: "User",
          required: true,
        },
      },
    ],
    theme: { type: themeSchema },
  },
  { strict: true }
);

userSchema.methods.isValidPassword = async function (password) {
  try {
    const compare = await bcrypt.compare(password, this.password);
    return compare;
  } catch (error) {
    console.error(error);
    throw new Error("Error comparing passwords");
  }
};

module.exports = userSchema;
