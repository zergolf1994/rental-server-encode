const { FileModel } = require("../models/file.models");
const { MediaModel } = require("../models/media.models");

const dataChar = {
  uppercase: true,
  lowercase: true,
  numbercase: true,
};

exports.randomString = (length = 8, options = { ...dataChar }) => {
  const option = Object.assign({ ...dataChar }, options);

  const uppercase_characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase_characters = "abcdefghijklmnopqrstuvwxyz";
  const numbercase_characters = "0123456789";

  let characters = "";
  if (option.uppercase) characters += uppercase_characters;
  if (option.lowercase) characters += lowercase_characters;
  if (option.numbercase) characters += numbercase_characters;

  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};

exports.randomSlug = async (length = 8, options = { ...dataChar }) => {
  try {
    const slug = this.randomString(length, options);
    const count = await FileModel.countDocuments({ slug });
    if (count > 0) {
      return this.randomSlug(length + 1, options);
    }
    return slug;
  } catch (error) {
    return null;
  }
};

exports.randomSlugVideo = async (length = 8, options = { ...dataChar }) => {
  try {
    const slug = this.randomString(length, options);
    const count = await MediaModel.countDocuments({ slug });
    if (count > 0) {
      return this.randomSlug(length + 1, options);
    }
    return slug;
  } catch (error) {
    return null;
  }
};
