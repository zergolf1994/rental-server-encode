const shell = require("shelljs");
const { getLocalServer } = require("../utils/server.utils");
const { EncodeModel } = require("../models/encode.models");
const { encode_video } = require("../utils/ffmpeg");
const { ErrorModel } = require("../models/error.models");

exports.bashEncode = async (req, res) => {
  try {
    // คำสั่ง เพื่อดำเนินการ ส่งต่อไปยัง bash
    shell.exec(
      `sudo bash ${global.dir}/bash/encode.sh`,
      { async: false, silent: false },
      function (data) {}
    );
    return res.json({ msg: "start encode video" });
  } catch (err) {
    return res.json({ error: true, msg: err?.message });
  }
};

exports.videoEncode = async (req, res) => {
  try {
    const server = await getLocalServer();

    if (!server?._id) throw new Error("Server not found");

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
            {
              $project: {
                _id: 0,
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
          file_default: {
            $concat: [global.dirPublic, "$media.file_name"],
          },
          file_output: {
            $concat: [global.dirPublic, "file_", "$$ROOT.quality", ".mp4"],
          },
          file_name: "$media.file_name",
        },
      },
      {
        $project: {
          _id: 0,
          taskId: "$$ROOT._id",
          task: 1,
          quality: 1,
          percent: 1,
          fileId: 1,
          file_name: 1,
          file_default: 1,
          file_output: 1,
        },
      },
    ]);

    if (!encoding?.length) throw new Error("Encode not found");
    const file = encoding[0];

    const data_encode = await encode_video(file);

    if(data_encode?.error){
      await ErrorModel.create({
        quality: file.quality,
        message: "encode error",
        fileId: file.fileId,
      });
    }
    return res.json(data_encode);
  } catch (err) {
    return res.json({ error: true, msg: err?.message });
  }
};
