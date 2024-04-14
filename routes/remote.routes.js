"use strict";
const express = require("express");
const { startRemote, videoRemote } = require("../controllers/remote.controllers");
const router = express.Router();

router.get("/", startRemote);
router.get("/video", videoRemote);

module.exports = router;
