import addPlayer from "./addPlayer";
import addOtherPlayers from "./otherPlayers";
import loadImages from "./imagesToLoad";
let calledRecently = false;

export function listenForPlayerMovement(scene) {
  loadImages(scene);
  scene.socket.on("playerMoved", playerInfo => {
    scene.otherPlayers.getChildren().forEach(otherPlayer => {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        otherPlayer.big = playerInfo.big;
        otherPlayer.move(playerInfo.direction);
        otherPlayer.vulnerable = playerInfo.vulnerable;
      }
    });
  });
}

export function listenForGhostMovement(scene) {
  scene.socket.on("ghostMove", ghost => {
    scene.og.vulnerable = ghost.vulnerable;
    scene.og.setPosition(ghost.x, ghost.y);
    scene.og.move(ghost.direction);
    scene.og.wrap();
  });
}

export function listenForGhostDeath(scene) {
  scene.socket.on("ghostDied", () => {
    scene.og.dead = true;
  });
}

export function listenForSomeonesDeath(scene) {
  scene.socket.on("someoneDied", playerNumber => {
    scene.playersAlive[playerNumber].dead = true;
  });
}

export function listenForDotActivity(scene) {
  scene.socket.on("smallDotGone", dots => {
    let x = dots.x;
    let y = dots.y;
    scene.dots.getChildren().forEach(dot => {
      if (dot.x === x && dot.y === y) {
        dot.destroy();
      }
    });
  });
  scene.socket.on("foodGone", food => {
    let x = food.x;
    let y = food.y;
    scene.food.getChildren().forEach(foodItem => {
      if (foodItem.x === x && foodItem.y === y) {
        foodItem.destroy();
      }
    });
  });
  scene.socket.on("bigDotGone", dots => {
    let x = dots.x;
    let y = dots.y;
    scene.bigDots.getChildren().forEach(dot => {
      if (dot.x === x && dot.y === y) {
        dot.destroy();
      }
    });
  });
  scene.socket.on("makeNewSmallDot", dot => {
    let x = dot.x;
    let y = dot.y;
    scene.dots.create(x, y, "smallDot");
  });
  scene.socket.on("makeNewBigDot", dot => {
    let x = dot.x;
    let y = dot.y;
    scene.bigDots.create(x, y, "largeDot");
  });
  scene.socket.on("makeNewFood", food => {
    let name = food.name;
    let x = food.x;
    let y = food.y;
    scene.food.create(x, y, name);
  });

  scene.socket.on("currentPlayers", players => {
    scene.countdown = scene.add.sprite(655, 280, "3");
    scene.anims.create({
      key: "countdown",
      frameRate: 1,
      frames: [{ key: "3" }, { key: "2" }, { key: "1" }, { key: "fight" }],
      repeat: 0
    });
    scene.countdown.anims.play("countdown", true);
    let startSound = scene.sound.add("game_start");
    startSound.play();
    scene.sound.add("intro").stop();
    scene.time.delayedCall(
      4000,
      () => {
        scene.countdown.destroy();

        if (calledRecently === false) {
          calledRecently = true;
          Object.keys(players).forEach(playerId => {
            if (playerId === scene.socket.id) {
              addPlayer(scene, players[playerId]);
            } else {
              addOtherPlayers(scene, players[playerId]);
            }
          });
          setTimeout(() => {
            calledRecently = false;
          }, 3000);
        }
      },
      [],
      scene
    );
  });
}
