const { EncodeModel } = require("../models/encode.models");

exports.taskUpdateDb = async (taskId, data = {}) => {
  try {
    await EncodeModel.updateOne({ _id: taskId }, { ...data });
    return true;
  } catch (error) {
    return null;
  }
};
