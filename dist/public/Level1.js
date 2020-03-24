export default class Level1 extends Phaser.Scene {
  constructor() {
    super({ key: "Level1" });
  }
  preload() {
    //loads image for tileset
    this.load.image("largepacmanmap", "/public/assets/largepacmanmap.png");
    //loads image of map
    this.load.tilemapTiledJSON("map", "/public/assets/anothermap.json");
    //loads yellow pacman
    this.load.spritesheet("pacYellow", "/public/assets/royale.png", {
      frameWidth: 32,
      frameHeight: 28
    });
    this.load.image("sky", "/public/assets/sky.png");
  }

  create() {
    this.add.image(0, 0, "sky").setScale(5);
    const self = this;
    this.socket = io();
    this.otherPlayers = this.physics.add.group();
    this.socket.on("currentPlayers", players => {
      Object.keys(players).forEach(id => {
        if (players[id].playerId === self.socket.id) {
          addPlayer(self, players[id]);
        } else {
          addOtherPlayers(self, players[id]);
        }
      });
    });
    this.socket.on("newPlayer", playerInfo => {
      addOtherPlayers(self, playerInfo);
    });
    this.socket.on("disconnect", playerId => {
      self.otherPlayers.getChildren().forEach(otherPlayer => {
        if (playerId === otherPlayer.playerId) {
          otherPlayer.destroy();
        }
      });
    });

    //makes the tilemap and defines the height and width of the tiles
    let map = this.make.tilemap({
      key: "map",
      tileWidth: 12,
      tileHeight: 12
    });
    // let map = this.add.tilemap("map");
    //adds the tileset to the map
    const tileset = map.addTilesetImage("largepacmanmap", "largepacmanmap");
    //creates the map layer, key must match layer name in tiled
    this.layer = map.createStaticLayer("mapBaseLayer", tileset, 0, 0);
    this.collisionLayer = map.createStaticLayer(
      "collisions layer",
      tileset,
      0,
      0
    );

    //adds a yellow pacman player and makes him smaller
    // this.yellowplayer = this.physics.add.sprite(300, 200, "pacYellow", 7);
    // this.yellowplayer.setScale(1, 0.7);

    //adds a collider for yellow pacman to run into layer when that tile has a collision property of true
    // this.physics.add.collider(this.yellowplayer, this.collisionLayer);
    this.collisionLayer.setCollisionByProperty({ collision: true });

    this.layer.setScale(window.innerWidth / 1920, window.innerHeight / 972);
    this.collisionLayer.setScale(
      window.innerWidth / 1920,
      window.innerHeight / 972
    );
    // this.yellowplayer.setScale(window.innerWidth/window.innerHeight);

    //sprite movement yellow pacman
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("pacYellow", {
        start: 4,
        end: 6
      }),
      frameRate: 8,
      repeat: 0
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("pacYellow", {
        start: 7,
        end: 9
      }),
      frameRate: 8,
      repeat: 0
    });
    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers("pacYellow", {
        start: 9,
        end: 11
      }),
      frameRate: 8,
      repeat: 0
    });
    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers("pacYellow", {
        start: 0,
        end: 3
      }),
      frameRate: 8,
      repeat: 0
    });

    //processes DOM input events if true
    this.input.enabled = true;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.socket.on("playerMoved", playerInfo => {
      self.otherPlayers.getChildren().forEach(otherPlayer => {
        if (playerInfo.playerId === otherPlayer.playerId) {
          otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        }
      });
    });
  }
  update() {
    this.layer.setScale(window.innerWidth / 1920, window.innerHeight / 972);
    this.collisionLayer.setScale(
      window.innerWidth / 1920,
      window.innerHeight / 972
    );

    if (this.pac) {
      this.pac.setScale(0.91 * (window.innerWidth / window.innerHeight));
      if (this.cursors.up.isDown) {
        this.pac.setY(this.pac.y - 3);
        this.pac.anims.play("up", true);
        this.socket.emit("moveUp", { dir: "up" });
      }
      if (this.cursors.down.isDown) {
        this.pac.setY(this.pac.y + 3);
        this.pac.anims.play("down", true);
        this.socket.emit("moveDown", { dir: "down" });
      }
      if (this.cursors.left.isDown) {
        this.pac.setX(this.pac.x - 3);
        this.pac.anims.play("left", true);
        this.socket.emit("moveLeft", { dir: "left" });
      }
      if (this.cursors.right.isDown) {
        this.pac.setX(this.pac.x + 3);
        this.pac.anims.play("right", true);
        this.socket.emit("moveRight", { dir: "right" });
      }
      this.socket.on("playerMovedUp", playerInfo => {
        console.log("in playermovedupcs");
        this.otherPlayers.getChildren().forEach(otherPlayer => {
          if (playerInfo.playerId === otherPlayer.playerId) {
            otherPlayer.setY(otherPlayer.y - 3);
            console.log(otherPlayer.y);
            otherPlayer.anims.play("up", true);
          }
        });
      });
      this.socket.on("playerMovedDOwn", playerInfo => {
        console.log("in playermoveddowncs");
        this.otherPlayers.getChildren().forEach(otherPlayer => {
          if (playerInfo.playerId === otherPlayer.playerId) {
            otherPlayer.setY(otherPlayer.y + 3);
            console.log(otherPlayer.y);
            otherPlayer.anims.play("up", true);
          }
        });
      });
      this.socket.on("playerMovedLeft", playerInfo => {
        console.log("in playermovedleftcs");
        this.otherPlayers.getChildren().forEach(otherPlayer => {
          if (playerInfo.playerId === otherPlayer.playerId) {
            otherPlayer.setX(otherPlayer.x - 3);
            console.log(otherPlayer.x);
            otherPlayer.anims.play("left", true);
          }
        });
      });

      // let x = this.pac.x;
      // let y = this.pac.y;
      // if (
      //   this.pac.oldPosition &&
      //   (x !== this.pac.oldPosition.x || y !== this.pac.oldPosition.y)
      // ) {
      //   this.socket.emit("playerMovement", { x: this.pac.x, y: this.pac.y });
      // }
      // this.pac.oldPosition = {
      //   x: this.pac.x,
      //   y: this.pac.y
      // };
    }
  }
}
function addPlayer(self, playerInfo) {
  self.pac = self.physics.add.sprite(playerInfo.x, playerInfo.y, "pacYellow");
  self.pac.setScale(window.innerWidth / window.innerHeight);
  self.physics.add.collider(self.pac, self.collisionLayer);
  self.physics.add.collider(self.pac, self.otherPlayers);
}
function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, "pacYellow");
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}
