const mongoose = require("mongoose");

const Data = mongoose.Schema({
  senderName: {
    type: String,
    required: true,
  },
  recipientName: {
    type: String,
    required: true,
  },
  message: {
    type: Object,
    required: false,
  },
  images: {
    type: [String],
    required: false,
  },
  messageReferance: {
    type: String,
  },
});

const MessageScheme = mongoose.Schema({
  messageID: {
    type: String,
  },
  message: {
    type: [Data],
  },
});

module.exports = mongoose.model("message", MessageScheme, "messages");
