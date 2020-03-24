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
  socket.on("moveUp", () => {
    console.log("inmoveUp");
    players[socket.id].y = players[socket.id].y - 3;
    socket.broadcast.emit("playerMoved", players[socket.id]);
    socket.broadcast.emit("movedUp", players[socket.id]);
  });
  socket.on("moveDown", () => {
    console.log("inmoveDown");
    players[socket.id].y = players[socket.id].y + 3;
    socket.broadcast.emit("playerMoved", players[socket.id]);
    socket.broadcast.emit("movedDown", players[socket.id]);
  });
  socket.on("moveLeft", () => {
    console.log("inmoveLeft");
    players[socket.id].x = players[socket.id].x - 3;
    socket.broadcast.emit("playerMoved", players[socket.id]);
    socket.broadcast.emit("movedLeft", players[socket.id]);
  });
  socket.on("moveRight", () => {
    console.log("inmoveRight");
    players[socket.id].x = players[socket.id].x + 3;
    socket.broadcast.emit("playerMoved", players[socket.id]);
    socket.broadcast.emit("movedRight", players[socket.id]);
  });

  // socket.on("playerMovement", movementData => {
  //   players[socket.id].x = movementData.x;
  //   players[socket.id].y = movementData.y;
  //   socket.broadcast.emit("playerMoved", players[socket.id]);
  // });
});
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Eating dots on port ${PORT}`);
});
