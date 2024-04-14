"use strict";
const express = require("express");
const router = express.Router();
const { createTask, dataTask, updateTask, cancleTask } = require("../controllers/task.controllers");

router.get("/", createTask);
router.get("/data", dataTask);
router.all("/update/:encodeId", updateTask);
router.get("/cancle", cancleTask);

module.exports = router;
