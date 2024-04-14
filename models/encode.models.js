const uuid = require("uuid");
const mongoose = require("mongoose");
const { Mixed } = mongoose.Schema.Types;

exports.EncodeModel = mongoose.model(
  "encodes",
  new mongoose.Schema(
    {
      _id: { type: String, default: () => uuid?.v4() },
      type: { type: String, default: "video" },
      task: { type: String, default: "prepare" }, //prepare,download,encode,remote
      quality: { type: String },
      percent: { type: Number, default: 0 },
      fileId: { type: String, required: true },
      serverId: { type: String, required: true },
    },
    {
      timestamps: true,
    }
  )
);
