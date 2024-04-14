const { ServerModel } = require("../models/server.models");
const fs = require("fs-extra");
const { get_os, get_disk } = require("../utils/os");

exports.serverDetail = async (req, res) => {
  try {
    let { ip_v4, hostname } = get_os();
    const disk = await get_disk();
    return res.json({ ip_v4, hostname, ...disk });
  } catch (err) {
    return res.json({ error: true });
  }
};

exports.serverCreate = async (req, res) => {
  try {
    let { ip_v4, hostname, platform } = get_os();

    const count = await ServerModel.countDocuments({
      sv_ip: ip_v4,
      type: global.sv_type,
    });

    if (count) throw new Error("exists");

    const disk = await get_disk();
    const saveDb = await ServerModel.create({
      enable: false,
      sv_ip: ip_v4,
      sv_name: hostname,
      type: global.sv_type,
      ...disk,
    });

    if (!saveDb?._id) throw new Error("Error");
    if (platform == "linux") {
      fs.mkdirSync(global.dirPublic, { recursive: true });
    }
    return res.json({ msg: `server ${global.sv_type} created` });
  } catch (err) {
    console.log(err);
    return res.json({ error: true, msg: err?.message });
  }
};
