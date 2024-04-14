const uuid = require("uuid");
const mongoose = require("mongoose");
const { Mixed } = mongoose.Schema.Types;

exports.MediaModel = mongoose.model(
  "medias",
  new mongoose.Schema(
    {
      _id: { type: String, default: () => uuid?.v4() },
      isPublic: { type: Boolean, default: true },
      type: { type: String, default: "video" },
      file_name: { type: String },
      slug: { type: String },
      quality: { type: String },
      size: { type: Mixed },
      dimention: { type: String },
      fileId: { type: String, required: true },
      serverId: { type: String, required: true },
    },
    {
      timestamps: true,
    }
  )
);
