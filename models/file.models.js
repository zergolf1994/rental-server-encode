const uuid = require("uuid");
const mongoose = require("mongoose");
const { Mixed } = mongoose.Schema.Types;

exports.FileModel = mongoose.model(
  "files",
  new mongoose.Schema(
    {
      _id: { type: String, default: () => uuid?.v4() },
      title: { type: String },
      isPublic: { type: Boolean, default: true },
      poster: { type: String },
      size: { type: Mixed },
      duration: { type: Number },
      mimeType: { type: String },
      highest: { type: Number },
      slug: { type: String, require: true, unique: true },
      userId: { type: String, require: true },
      folderId: { type: String },
      categoryId: { type: String },
      trashedAt: { type: Date },
      deletedAt: { type: Date },
    },
    {
      timestamps: true,
    }
  )
);
