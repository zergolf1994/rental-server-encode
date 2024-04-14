const shell = require("shelljs");

const { EncodeModel } = require("../models/encode.models");
const { FileModel } = require("../models/file.models");
const { getLocalServer } = require("../utils/server.utils");
const { MediaModel } = require("../models/media.models");
const { ServerModel } = require("../models/server.models");
const { ErrorModel } = require("../models/error.models");

exports.createTask = async (req, res) => {
  try {
    const { fileId } = req.query;
    if (!fileId) throw new Error("fileId not found");

    const server = await getLocalServer([
      {
        active: true,
        "options.encode_video_resolution": { $ne: undefined },
      },
      {
        _id: {
          $nin: await EncodeModel.distinct("serverId", {
            type: "video",
          }),
        },
      },
    ]);
    if (!server?._id) throw new Error("Server is busy");

    const file = await FileModel.findOne({
      $and: [
        //ไฟล์ต้นฉบับต้องไม่อยู่ที่เซิฟเวอร์อัพโหลด
        {
          _id: {
            $nin: await MediaModel.distinct("fileId", {
              quality: "default",
              serverId: {
                $in: await ServerModel.distinct("_id", {
                  type: "upload",
                }),
              },
            }),
          },
        },
        //ต้องไม่มี error convert
        {
          _id: {
            $nin: await ErrorModel.distinct("fileId", {
              fileId,
            }),
          },
        },
        //ต้องไม่มีไฟล์ ขนาด quality นี้แล้ว
        {
          _id: {
            $nin: await MediaModel.distinct("fileId", {
              quality: server?.options?.encode_video_resolution,
            }),
          },
        },
        //ต้องไม่มีไฟล์ ขนาด quality นี้ กำลังเข้ารหัส
        {
          _id: {
            $nin: await EncodeModel.distinct("fileId", {
              quality: server?.options?.encode_video_resolution,
              type: "video",
            }),
          },
        },
        {
          _id: fileId,
          mimeType: { $ne: "folder" },
          highest: { $gte: server?.options?.encode_video_resolution },
        },
      ],
    });

    if (!file) throw new Error("File not found");

    let data_encode = {
      type: "video",
      quality: server?.options?.encode_video_resolution,
      fileId,
    };

    const encoding = await EncodeModel.countDocuments(data_encode);
    if (encoding) throw new Error("Encoding");

    data_encode.task = "prepare";
    data_encode.serverId = server?._id;

    const saveDb = await EncodeModel.create(data_encode);
    if (!saveDb?._id) throw new Error("Error");

    // คำสั่ง เพื่อดำเนินการ ส่งต่อไปยัง bash
    shell.exec(
      `sudo bash ${global.dir}/bash/download.sh`,
      { async: false, silent: false },
      function (data) {}
    );

    return res.json({ msg: "task create" });
  } catch (err) {
    return res.json({ error: true, msg: err?.message });
  }
};

exports.dataTask = async (req, res) => {
  try {
    const server = await getLocalServer();
    const encoding = await EncodeModel.aggregate([
      { $match: { serverId: server?._id } },
      { $limit: 1 },
      //media
      {
        $lookup: {
          from: "medias",
          localField: "fileId",
          foreignField: "fileId",
          as: "medias",
          pipeline: [
            { $match: { quality: "original" } },
            //server
            {
              $lookup: {
                from: "servers",
                localField: "serverId",
                foreignField: "_id",
                as: "servers",
                pipeline: [
                  {
                    $project: {
                      _id: 0,
                      sv_ip: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                server: { $arrayElemAt: ["$servers", 0] },
              },
            },
            //set
            {
              $set: {
                url_media: {
                  $concat: [
                    "http://",
                    "$server.sv_ip",
                    "/",
                    "$$ROOT.file_name",
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                url_media: 1,
                file_name: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          media: { $arrayElemAt: ["$medias", 0] },
        },
      },
      {
        $set: {
          url_media: "$media.url_media",
          file_name: "$media.file_name",
          save_dir: global.dirPublic,
        },
      },
      {
        $project: {
          _id: 0,
          encodeId: "$$ROOT._id",
          fileId: 1,
          url_media: 1,
          task: 1,
          quality: 1,
          percent: 1,
          file_name: 1,
          save_dir: 1,
        },
      },
    ]);

    if (!encoding?.length) throw new Error("Encode not found");
    const file = encoding[0];
    return res.json(file);
  } catch (err) {
    return res.json({ error: true, msg: err?.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { encodeId } = req.params;
    const { task, percent } = req.query;
    if (!encodeId) throw new Error("encodeId not found");

    const row = await EncodeModel.findOne({ _id: encodeId });

    if (!row) throw new Error("Encode not found");
    if (task != undefined) row.task = task;
    if (percent != undefined) row.percent = percent;
    if (task != undefined || percent != undefined) {
      row.save();
    }
    return res.json(row);
  } catch (err) {
    return res.json({ error: true, msg: err?.message });
  }
};

exports.cancleTask = async (req, res) => {
  try {
    const server = await getLocalServer();

    if (!server?._id) throw new Error("Server not found");

    const deleteDb = await EncodeModel.deleteMany({ serverId: server?._id });
    if (!deleteDb.deletedCount) throw new Error("Encode not found");

    // คำสั่ง เพื่อดำเนินการ ส่งต่อไปยัง bash
    shell.exec(
      `sudo bash ${global.dir}/bash/cancle-encode.sh`,
      { async: false, silent: false },
      function (data) {}
    );

    return res.json({ msg: "cancelled" });
  } catch (err) {
    return res.json({ error: true, msg: err?.message });
  }
};
