"use strict";

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");
const path = require("path");

const mongoose = require("mongoose");

global.sv_type = "encode";
global.dir = __dirname;
global.dirPublic = path.join("/home/files/");

const app = express();
app.use(
  cors({
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(express.json());

app.use(express.static(global.dirPublic));

app.use(require("./routes"));

const server = http.createServer(app);

const { HTTP_PORT, MONGO_URI } = process.env;

server.listen(HTTP_PORT, () => console.log(`Listening on port: %s`, HTTP_PORT));

try {
  if (!MONGO_URI) throw new Error("Not found MONGO_URI");

  mongoose.Promise = Promise;
  mongoose.connect(MONGO_URI);
  mongoose.connection.on("error", (error) => console.log(error));
} catch (error) {
  console.log("Mongodb error", error);
}
