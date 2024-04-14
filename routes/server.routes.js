"use strict";
const express = require("express");
const router = express.Router();
const { serverDetail, serverCreate } = require("../controllers/server.controllers");

router.get("/detail", serverDetail);
router.get("/create", serverCreate);

module.exports = router;
