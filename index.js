const express = require("express");
const app = express();
const server = require("http").Server(app);
const path = require("path");
const io = require("socket.io").listen(server);
const players = {};

app.use(express.static(path.join(__dirname, "dist")));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

io.on("connection", socket => {
  console.log("a user connected");
  players[socket.id] = {
    rotation: 0,
    x: 700,
    y: 500,
    playerId: socket.id
  };
  socket.emit("currentPlayers", players);
  socket.broadcast.emit("newPlayer", players[socket.id]);
  socket.on("disconnect", () => {
    console.log("user disconnected");
    delete players[socket.id];
    io.emit("disconnect", socket.id);
  });
  socket.on("moveUp", directionObj => {
    console.log("inmoveUp");
    socket.broadcast.emit("playerMoved", players[socket.id]);
  });
  socket.on("moveDown", directionObj => {
    console.log("inmoveDown");
    socket.broadcast.emit("playerMoved", players[socket.id]);
  });
  socket.on("moveLeft", directionObj => {
    console.log("inmoveLeft");
    socket.broadcast.emit("playerMoved", players[socket.id]);
  });
  socket.on("moveRight", directionObj => {
    console.log("inmoveRight");
    socket.broadcast.emit("playerMoved", players[socket.id]);
  });

  socket.on("playerMovement", movementData => {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    socket.broadcast.emit("playerMoved", players[socket.id]);
  });
});
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Eating dots on port ${PORT}`);
});
