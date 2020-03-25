export default class Level1 extends Phaser.Scene {
  constructor() {
    super({ key: "Level1" });
  }
  preload() {
    //loads image for tileset
    // this.load.image("largepacmanmap", "/public/assets/largepacmanmap.png");
    this.load.image("pinksquare", "/public/assets/pinksquare.jpeg");
    this.load.image("blacksquare", "public/assets/blacksquare.png");
    //loads image of map
    this.load.tilemapTiledJSON("map", "/public/assets/newmap.json");
    //loads yellow pacman
    this.load.spritesheet("pacYellow", "/public/assets/royale.png", {
      frameWidth: 60,
      frameHeight: 60
    });
    this.load.image("sky", "/public/assets/sky.png");
  }

  create() {
    this.directions = {};
    this.add.image(0, 0,"sky").setScale(5);
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
    this.map = this.make.tilemap({
      key: "map",
      tileWidth: 60,
      tileHeight: 60
    });
    // let map = this.add.tilemap("map");
    //adds the tileset to the map

    let map = this.map;

    const pinkTileset = map.addTilesetImage("pinksquare", "pinksquare");
    const blackTileset = map.addTilesetImage("blacksquare", "blacksquare");
    //creates the map layer, key must match layer name in tiled
    this.collisionLayer = map.createStaticLayer("mapBaseLayer", [pinkTileset, blackTileset], 0, 0);
    // this.collisionLayer = map.createStaticLayer("collisions layer", tileset, 0, 0);

    //adds a collider for yellow pacman to run into layer when that tile has a collision property of true
    // this.physics.add.collider(this.yellowplayer, this.collisionLayer);
    this.collisionLayer.setCollisionByProperty({ collision: true });

    this.collisionLayer.setScale(window.innerWidth/1860);

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

    this.collisionLayer.setScale(window.innerWidth/1860);

    if (this.pac) {

      this.pac.setScale(window.innerWidth/1861);

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
      //on receive move informtaion for other players
      this.socket.on("movedUp", playerInfo => {
        console.log("in playermovedupcs");
        this.otherPlayers.getChildren().forEach(otherPlayer => {
          if (playerInfo.playerId === otherPlayer.playerId) {
            otherPlayer.anims.play("up", true);
          }
        });
      });
      this.socket.on("movedDown", playerInfo => {
        console.log("in playermoveddowncs");
        this.otherPlayers.getChildren().forEach(otherPlayer => {
          if (playerInfo.playerId === otherPlayer.playerId) {
            otherPlayer.anims.play("down", true);
          }
        });
      });
      this.socket.on("movedLeft", playerInfo => {
        console.log("in playermovedleftcs");
        this.otherPlayers.getChildren().forEach(otherPlayer => {
          if (playerInfo.playerId === otherPlayer.playerId) {
            otherPlayer.anims.play("left", true);
          }
        });
      });
      this.socket.on("movedRight", playerInfo => {
        console.log("in playermovedrightcs");
        this.otherPlayers.getChildren().forEach(otherPlayer => {
          if (playerInfo.playerId === otherPlayer.playerId) {
            otherPlayer.anims.play("right", true);
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

  self.pac = self.physics.add.sprite(self.map.tileToWorldX(12), self.map.tileToWorldY(5), "pacYellow").setOrigin(0, 0);

  self.pac.tilePositionX = self.map.worldToTileX(self.pac.x);
  self.pac.tilePositionY = self.map.worldToTileY(self.pac.y);

  self.physics.add.collider(self.pac, self.collisionLayer);
  self.physics.add.collider(self.pac, self.otherPlayers);


  self.directions[Phaser.UP] = self.map.getTileAt(self.pac.tilePositionX, self.pac.tilePositionY - 1);
  self.directions[Phaser.DOWN] = self.map.getTileAt(self.pac.tilePositionX, self.pac.tilePositionY + 1);
  self.directions[Phaser.LEFT] = self.map.getTileAt(self.pac.tilePositionX - 1, self.pac.tilePositionY);
  self.directions[Phaser.RIGHT] = self.map.getTileAt(self.pac.tilePositionX + 1, self.pac.tilePositionY);

}
function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, "pacYellow");
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}
