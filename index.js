#!/usr/bin/node

process.env.NODE_ENV = "debug";
const package = require("./package.json");

console.log(`Starting ${package.name} v${package.version}`);

require("dotenv").config();

const logger = require("logger").get("main");

logger.info("Requiring packages...");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
logger.info("Required packages.");

logger.info("Configuring Express...");
const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use(express.static(path.join(__dirname + "/public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

////////// express-session
const session = require("express-session");
app.use(
  session({
    secret: "top-secret",
    resave: false,
    saveUninitialized: true,
  })
);
///////////

logger.info("Configured Express.");

logger.info("Instantiating globals...");
// Instantiate any global objects used by multiple route groups here
logger.info("Instantiated globals.");

logger.info("Configuring routes...");
let routeFiles = [
  "frontend",
  "api/v0/guilds",
  "api/v0/text-channels",
  "api/v0/messages",
  "api/v0/users",
  "api/v0/icons",
]; //, 'api'];
const routeManager = require("./routes/manager");
routeFiles.forEach((file) => {
  logger.info(`Adding ${file} routes...`);
  let component = require(`./routes/${file}`);
  if (component.configure)
    component.configure({
      // pass stuff to routing files here
    });
  routeManager.apply(app, component);
  logger.info(`Added ${file} routes.`);
});
logger.info("Configured routes.");

logger.info(`Listening on port ${process.env.PORT}`);

////////// socket.io
const socketio = require("socket.io");
const server = require("http").createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  socket.on("old room", (room) => {
    socket.leave(room);
  });
  socket.on("new room", (room) => {
    socket.join(room);
  });

  socket.on("message", (msg) => {
    console.log(msg);
  });
  socket.on("chatMessage", (msg) => {
    io.to(msg.currentChannel).emit("message", msg.body);
  });
});

///////////
server.listen(process.env.PORT);
