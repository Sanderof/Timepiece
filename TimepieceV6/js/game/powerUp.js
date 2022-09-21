/**/

import {drawImg} from './../libs/drawLib.js';

export default class PowerUp {
  constructor(type, chunkIdx, xTile, yTile, size, img, map, canv) {
    this.type = type; // The type of powerUp e.g. emerald, ruby, red health cross
    this.map = map; // Fetches the map
    this.chunkIdx = chunkIdx; // The chunk that the power up will be on
    this.xTile = xTile; // The x-index of the tile that decides its poisition
    this.yTile = yTile; // The y-index

    if (canv === "top") { // If the power up is to be draw in the menu canvas, it cannot be connected to the map
        this.x = this.xTile;
        this.y = this.yTile;
    } else {
        this.x = this.map[this.chunkIdx][this.yTile][this.xTile].x;
        this.y = this.map[this.chunkIdx][this.yTile][this.xTile].y;
    }

    this.size = size; // Width and height: tileSize
    this.img = img; // PowerUp image
    this.turnT = new Date().getTime(); // Turn time - Animation timer
    this.turnS = 150; // Turn speed (Framerate) - changes frame each 150 milliseconds
    this.sheetX = []; // Sprite sheet x-coordinates: to simplify the code when it comes to the power up's type
    this.sheetY = []; // Sprite sheet y-coordinates

    switch (this.type) { // The power up's type decides how much it is worth
        case 1:  this.worth  =  1; this.expInc = 10; break;
        case 2:  this.worth  =  5; this.expInc = 40; break;
        case 3:  this.hpGain = 20; this.expInc =  0; break;
        default: this.worth  =  0; this.expInc =  0; break;
    }
  }

  //-----------------------------------------------------------------------_draw

  // Draws the power up animation
  _draw(display, time) {
      // Checks the power up type and fills the arrays with the x- and y-positions of where to cut the image accordingly
      switch (this.type) {
          case 1:  this.sheetX = [0, 16, 32, 48, 64, 80];          this.sheetY =  [0]; break;
          case 2:  this.sheetX = [0, 16, 32, 48, 64, 80];          this.sheetY = [16]; break;
          case 3:  this.sheetX = [0, 16, 32, 48, 64, 80, 96, 112]; this.sheetY = [32]; break;
          case 4:  this.sheetX = [0, 16, 32, 48, 64, 80, 96, 112]; this.sheetY = [48]; break;
          case 5:  this.sheetX = [0, 16, 32, 48, 64, 80, 96, 112]; this.sheetY = [64]; break;
          default: this.sheetX = [0, 16, 32, 48, 64, 80];          this.sheetY =  [0]; break;
      }

      // Draws the frame according to the timer this.turnT
      this.sheetX.forEach((sheetX, idx) => {
        if (time - this.turnT >= this.turnS*idx && time - this.turnT < this.turnS*(idx+1)) {
            drawImg(display.ctx, this.img, sheetX, this.sheetY[0], 16, 16, this.x, this.y, this.size, this.size);
        }
      });

      // Restarts the animation when a cycle has completed
      if (time - this.turnT >= this.turnS*(this.sheetX.length)) {
          drawImg(display.ctx, this.img, this.sheetX[0], this.sheetY[0], 16, 16, this.x, this.y, this.size, this.size);
          this.turnT = new Date().getTime();
      }

  }

  //--------------------------------------------------------------------_collect

  // Checks if the player collides with the power up and collects it.
  _collectCol(player, collectGemAudio) {
      if (player.x + player.w > this.x && player.x < this.x + this.size &&
          player.y + player.h > this.y && player.y < this.y + this.size) {
          return true; // Returns true if the player has collided with the power up
      }
  }

  //--------------------------------------------------------------------_collect

  // Removes the power up if the player collects it and handles the power up reward
  _collect(idx, player, powerUps, map, collectGemAudio) {
      if (this.type !== 3 || (this.type === 3 && player.hp < player.maxHp)) {
        if (this._collectCol(player, collectGemAudio)) { // Checks if the power up is being collected
            let puCount = 0; // Counts power ups in the map
            
            switch (this.type) { // Power up collect reward
              case 1: player.balance += this.worth; // Increments the player balance by the gem's worth
              collectGemAudio.currentTime = 0; // Makes the audio clip start from the beginning
              collectGemAudio.play(); // Plays the audio
              break;
              case 2: player.balance += this.worth;  // Increments the player balance by the gem's worth
              collectGemAudio.currentTime = 0;
              collectGemAudio.play();
              break;
              case 3: // The player regains some health
                  if (player.hp >= player.maxHp-this.hpGain) { player.hp = player.maxHp; } // To not exceed the max hp
                  else { player.hp += this.hpGain; }
              break;
              case 4: // Picks up wooden club - the club is added to the player's weapons array as a melee weapon
                  player.weapons[1] = {type: 4, dmg: 45, maxHp: 50, hp: 50};
              break;
              case 5: // Picks up pistol- the pistol is added to the player's weapons array as a range weapon
                  player.weapons[2] = {type: 5, dmg: 30, ammo: 2};
              break;
            }

            player.exp += this.expInc; player._leveling(); // Some power ups give exp by being collected e.g. gems
            powerUps.splice(idx, 1); // Removes the power up from the array
        }
      }
  }




}
