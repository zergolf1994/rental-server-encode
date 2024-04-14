"use strict";
const express = require("express");
const router = express.Router();
const {
  bashEncode,
  videoEncode,
} = require("../controllers/encode.controllers");

router.get("/", bashEncode);
router.get("/video", videoEncode);

module.exports = router;
