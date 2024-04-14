const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs-extra");
const { taskUpdateDb } = require("./task.utils");
const { ErrorModel } = require("../models/error.models");

exports.get_video_info = async (url) => {
  try {
    return new Promise((resolve, reject) => {
      ffmpeg(url).ffprobe((err, data) => {
        if (err) {
          resolve({ error: true });
        }
        resolve(data);
      });
    });
  } catch (error) {
    return { error: true };
  }
};

exports.get_data_encode = ({ file, width, height, codec_name }) => {
  try {
    let data = {
      ...file,
      width,
      height,
      codec_name,
      video_type: width > height ? "horizontal" : "vertical",
      useType: "height",
    };
    if (data.video_type == "horizontal") {
      if (width >= 1920 || height >= 1080) {
        data.maxResolution = 1080;
        if (width >= 1920) {
          data.useType = "width";
        }
      } else if (width >= 1280 || height >= 720) {
        data.maxResolution = 720;
        if (width >= 1280) {
          data.useType = "width";
        }
      } else if (width >= 854 || height >= 480) {
        data.maxResolution = 480;
        if (width >= 854) {
          data.useType = "width";
        }
      } else {
        data.maxResolution = 360;
        if (width >= 640) {
          data.useType = "width";
        }
      }
    } else {
      if (width >= 1080 || height >= 1920) {
        data.maxResolution = 1080;
        if (width >= 1080) {
          data.useType = "width";
        }
      } else if (width >= 720 || height >= 1280) {
        data.maxResolution = 720;
        if (width >= 720) {
          data.useType = "width";
        }
      } else if (width >= 480 || height >= 854) {
        data.maxResolution = 480;
        if (width >= 480) {
          data.useType = "width";
        }
      } else {
        data.maxResolution = 360;
        if (width >= 360) {
          data.useType = "width";
        }
      }
    }

    return data;
  } catch (error) {
    console.log(error);
    return { error: true };
  }
};

exports.encode_video = async (file) => {
  try {
    if (!fs.existsSync(file.file_default))
      throw new Error("local file not found");

    const { streams } = await this.get_video_info(file.file_default);

    const videoStream = streams.find((stream) => stream.codec_type === "video");

    if (!videoStream) throw new Error("streams not found");

    let { width, height, codec_name } = videoStream;
    if (!width && !height) throw new Error("video size error");
    const data = this.get_data_encode({ file, width, height, codec_name });
    let resolWidth = {
      1080: 1920,
      720: 1280,
      480: 854,
      360: 640,
      240: 426,
    };
    let setSize = ``;
    if (data.useType == "height") {
      if (width > height) {
        setSize = `?x${data.quality}`;
      } else {
        setSize = `${data.quality}x?`;
      }
    } else {
      setSize = `${data.quality}x?`;
      if (width > height) {
        setSize = `${resolWidth[data.quality]}x?`;
      } else {
        setSize = `?x${resolWidth[data.quality]}`;
      }
    }

    return new Promise((resolve, reject) => {
      const options = [
        "-c:v libx264",
        "-crf 23",
        "-preset medium",
        "-profile:v high",
        "-level:v 4.2",
        "-movflags +faststart",
        "-c:a aac",
      ];

      if (data.quality == 1080) {
        options.push("-b:v 4096k");
      } else if (data.quality == 720) {
        options.push("-b:v 2048k");
      } else if (data.quality == 480) {
        options.push("-b:v 750k");
      } else if (data.quality == 360) {
        options.push("-b:v 276k");
      }

      let setup = ffmpeg(file.file_default);
      setup.output(path.join(file.file_output));
      setup.outputOptions(options);
      setup.size(setSize);

      setup.on("start", () => {
        console.log(`convert ${data?.quality}P`);
      });
      setup.on("progress", async (d) => {
        let percent = Math.floor(d?.percent);
        await taskUpdateDb(file.taskId, { percent: percent });
        //console.log(`convert ${data?.quality}P`, percent);
      });
      setup.on("end", async () => {
        await taskUpdateDb(file.taskId, { percent: 100 });
        //console.log(`${data?.quality}P converted`);
        resolve({ msg: "converted" });
      });
      setup.on("error", async (err, stdout, stderr) => {
        
        await ErrorModel.create({
          quality: file.quality,
          message: err?.message,
          fileId: file.fileId,
        });

        resolve({ error: true, msg: err?.message });
      });
      setup.run();
    });
  } catch (error) {
    console.error(error);
    return { error: true };
  }
};
