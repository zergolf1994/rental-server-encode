"use strict";
const express = require("express");
const router = express.Router();


router.use("/encode", require("./encode.routes"));
router.use("/task", require("./task.routes"));
router.use("/server", require("./server.routes"));
router.use("/remote", require("./remote.routes"));

router.all("*", async (req, res) => {
  return res.status(404).json({ error: true, msg: "not found!" });
});

module.exports = router;
