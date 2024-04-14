const uuid = require("uuid");
const mongoose = require("mongoose");
const { Mixed } = mongoose.Schema.Types;

exports.ErrorModel = mongoose.model(
  "errors",
  new mongoose.Schema(
    {
      _id: { type: String, default: () => uuid?.v4() },
      type: { type: String, default: "convert" },
      quality: { type: String },
      message: { type: String },
      fileId: { type: String, required: true },
    },
    {
      timestamps: true,
    }
  )
);
