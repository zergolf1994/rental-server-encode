"use strict";
const os = require("os");
const checkDiskSpace = require("check-disk-space").default;

exports.get_os = () => {
  try {
    const ip_v4 = Object.values(os.networkInterfaces())
      .flat()
      .filter(({ family, internal }) => family === "IPv4" && !internal)
      .map(({ address }) => address)
      .at(0);
    const hostname = os.hostname();
    return { ip_v4, hostname, platform: process.platform };
  } catch (error) {
    return { ip_v4: undefined, hostname: undefined };
  }
};

exports.get_disk = async () => {
  try {
    const { platform } = this.get_os();
    let dir = "/home";
    if (platform != "linux") {
      dir = "C:/";
    }

    return await checkDiskSpace(dir).then((diskSpace) => {
      diskSpace.used = diskSpace?.size - diskSpace?.free;
      diskSpace.percent = (
        (diskSpace.used * 100) / diskSpace?.size ?? 0
      ).toFixed(0);
      let data = {
        disk_percent: Number(diskSpace.percent),
        disk_used: diskSpace.used,
        disk_total: diskSpace.size,
      };
      return data;
    });
  } catch (error) {
    return {
      disk_percent: 0,
      disk_used: 0,
      disk_total: 0,
    };
  }
};
