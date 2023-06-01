const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const themeSchema = new mongoose.Schema({
  bc: {
    r: { type: Number },
    g: { type: Number },
    b: { type: Number },
    a: { type: Number },
  },
  fg: {
    r: { type: Number },
    g: { type: Number },
    b: { type: Number },
    a: { type: Number },
  },
  bannerURL: {
    type: String,
  },
  bannerArray: {
    type: [String],
    default: [
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
    ],
  },
  imageURL: {
    type: String,
  },
  imageURLArray: {
    type: [String],
    default: [
      "https://i.pinimg.com/originals/d4/e0/13/d4e01341b8f4bdc193671689aaec2bbb.jpg",
      "https://i.kym-cdn.com/entries/icons/facebook/000/035/767/cover4.jpg",
      "https://i.ytimg.com/vi/UiCPytVT4bo/maxresdefault.jpg",
      "https://yt3.googleusercontent.com/JVTJHpdwc5AR6ntZu96w-K0M44uLx93RUnUfSFaSMb-BL6cyw4T6ipXJOIpKNbBUQV0fdju7=s900-c-k-c0x00ffffff-no-rj",
    ],
  },
  borderColor: {
    r: { type: Number },
    g: { type: Number },
    b: { type: Number },
    a: { type: Number },
  },
  uc: {
    r: { type: Number },
    g: { type: Number },
    b: { type: Number },
    a: { type: Number },
  },
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
    theme: { type: themeSchema, required: true },
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
