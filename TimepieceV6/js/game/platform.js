import {drawImg} from './../libs/drawLib.js';

export default class Platform {
    constructor(type, chunkIdx, xTile, yTile, lbTile, rbTile, height, vx, ts, sf, map) {
      this.type   =   type; // Type of platform
      this.map    =    map;
      this.height = height; // Amount of tiles the platform covers
      this.ts     =     ts;
      this.sf     =     sf;
      this.vx     =     vx; // x-direction velocity
      if (this.vx >= 0) { this.dir = "right"; }
      else              { this.dir =  "left"; }

      // lbTile and rbTile: {chunkIdx, tileIdx}
      this.lbTile   = lbTile;
      this.rbTile   = rbTile;
      this.xTile    = xTile;
      this.yTile    = yTile;
      this.chunkIdx = chunkIdx;

      this.x           = this.map[this.chunkIdx][0][this.xTile].x;
      this.y           = this.map[this.chunkIdx][this.yTile][0].y;
      this.leftBorder  = this.map[this.lbTile.chunkIdx][0][this.lbTile.tileIdx].x;
      this.rightBorder = this.map[this.rbTile.chunkIdx][0][this.rbTile.tileIdx].x;
    }

    _draw(display, img) {
        switch(this.dir) {
          case  "left":
              switch(this.type) {
                case "greenDino":
                    drawImg(display.ctx, img, 16, 0, 16, 16, this.x, this.y, this.ts, this.ts);
                    for (let i = 1; i < this.height; i++) {
                        drawImg(display.ctx, img, 16, 16, 16, 16, this.x, this.y+(i*this.ts), this.ts, this.ts);
                    }
                break;
              }
          break;
          case "right":
              switch(this.type) {
                case "greenDino":
                    drawImg(display.ctx, img, 0, 0, 16, 16, this.x, this.y, this.ts, this.ts);
                    for (let i = 1; i < this.height; i++) {
                        drawImg(display.ctx, img, 0, 16, 16, 16, this.x, this.y+(i*this.ts), this.ts, this.ts);
                    }
                break;
              }
          break;
        }
    }

    _move(player) {
        switch(this.dir) { // Moves the platform
          case  "left": this.x -= this.vx; break;
          case "right": this.x += this.vx; break;
        }

        // Changes direction when reaching the left or right border
        if      (this.x <=  this.leftBorder) { this.dir = "right"; }
        else if (this.x >= this.rightBorder) { this.dir =  "left"; }

        if (player.platformIdx === null) { this._collisionX(player); } // Checks for collision on the x-axis
    }

    _collisionX(player) {
        // Collision between platform and player
        if        (player.x + player.w > this.x - 2*this.sf && player.x < this.x + player.ts/2 &&
                   player.y + player.h > this.y && player.y < this.y + this.ts*this.height) {
              if (this.dir === "left" && player.colX === "L") { this.dir = "right"; } // Changes direction when player is squeezed between platform and wall
              player.vx =           this.vx;
              player.x  = this.x - player.w - 2*this.sf;
        } else if (player.x + player.w > this.x + player.ts/2 && player.x < this.x + this.ts + 2*this.sf &&
                   player.y + player.h > this.y && player.y < this.y + this.ts*this.height) {
              if (this.dir === "right" && player.colX === "R") { this.dir = "left"; } // Changes direction when player is squeezed between platform and wall
              player.vx =          this.vx; // Compensates for the lower speed given when pushed - hinders glitches when shifting the map view
              player.x  = this.x + this.ts + 2*this.sf;
        } else { player.vx =    player.ovx; } // Resets the player's x-velocity
    }

}
