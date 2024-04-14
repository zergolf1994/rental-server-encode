const uuid = require("uuid");
const mongoose = require("mongoose");
const { Mixed } = mongoose.Schema.Types;

exports.ServerModel = mongoose.model(
  "servers",
  new mongoose.Schema(
    {
      _id: { type: String, default: () => uuid?.v4() },
      enable: { type: Boolean, default: true },
      type: {
        type: String,
        enum: ["upload", "remote", "encode", "storage", "stream", "player"],
        required: true,
      },
      sv_name: { type: String },
      sv_ip: { type: String, required: true },
      disk_percent: { type: Number, default: 0 },
      disk_used: { type: Mixed, default: 0 },
      disk_total: { type: Mixed, default: 0 },
      options: {
        public_url: { type: String },
        encode_video_resolution: { type: Number },
      },
      ssh_option: {
        username: { type: String },
        password: { type: String },
        port: { type: Number },
      },
    },
    {
      timestamps: true,
    }
  )
);
