/* */

import {drawImg} from './../libs/drawLib.js';

class Enemy {
  constructor() {
      this.idleT = new Date().getTime(); // Idle time: Set to keep track of when the images should switch
      this.runT = new Date().getTime(); // Run time
      this.bendT = new Date().getTime(); // Bend time - Enemy bending its knees slightly before jumping
      this.attackT = new Date().getTime(); // Attack time: By subtracting eight times the attack speed, it can attack as soon as the game starts
      this.hurtT = new Date().getTime(); // Hurt timer
      this.engaged = false; // If the enemy should chase after and attack the player
      this.colX = 'null'; // Has collided in x-direction - R, L or null
  }

  // Draws the enemy
  _draw(display, time) {
    // The enemy's status determines what animation should run
    switch (this.status) {
      case "idle": // The enemy is idle; standing still on the ground
        // Determine sprite sheet coordinates according to the enemy's direction
        if (this.dir === "right") { this.sheetX = [0, 20]; this.sheetY = [0]; }
        else if (this.dir === "left") { this.sheetX = [40, 60]; this.sheetY = [0]; }
          // Animation cycle
          // The difference between the continuously updating time (time) and the idle time (this.idleT) is measured in milliseconds
          if (time - this.idleT < this.idleS) {
            drawImg(display.ctx, this.img, this.sheetX[0], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
          } else if (time - this.idleT >= this.idleS && time - this.idleT < this.idleS*2) {
            drawImg(display.ctx, this.img, this.sheetX[1], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
          } else if (time - this.idleT >= this.idleS*2) { // When the animation cycle is finished, it is restarted
            drawImg(display.ctx, this.img, this.sheetX[0], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
            this.idleT = new Date().getTime(); // Resets the time to make the animation cycle restart
          }
        break;
      case "walking": // The enemy is running
        if (this.dir === "right") { this.sheetX = [0, 20, 40, 60]; this.sheetY = [96, 128]; }
        else if (this.dir === "left") { this.sheetX = [60, 40, 20, 0]; this.sheetY = [160, 192]; }
          // Animation cycle
          if (time - this.runT < this.runS) {
            drawImg(display.ctx, this.img, this.sheetX[0], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
          } else if (time - this.runT >= this.runS && time - this.runT < this.runS*2) {
            drawImg(display.ctx, this.img, this.sheetX[1], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
          } else if (time - this.runT >= this.runS*2 && time - this.runT < this.runS*3) {
            drawImg(display.ctx, this.img, this.sheetX[2], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
          } else if (time - this.runT >= this.runS*3 && time - this.runT < this.runS*4) {
            drawImg(display.ctx, this.img, this.sheetX[3], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
          } else if (time - this.runT >= this.runS*4 && time - this.runT < this.runS*5) {
            drawImg(display.ctx, this.img, this.sheetX[0], this.sheetY[1], 20, 32, this.x, this.y, this.w, this.h);
          } else if (time - this.runT >= this.runS*5 && time - this.runT < this.runS*6) {
            drawImg(display.ctx, this.img, this.sheetX[1], this.sheetY[1], 20, 32, this.x, this.y, this.w, this.h);
          } else if (time - this.runT >= this.runS*6 && time - this.runT < this.runS*7) {
            drawImg(display.ctx, this.img, this.sheetX[2], this.sheetY[1], 20, 32, this.x, this.y, this.w, this.h);
          } else if (time - this.runT >= this.runS*7 && time - this.runT < this.runS*8) {
            drawImg(display.ctx, this.img, this.sheetX[3], this.sheetY[1], 20, 32, this.x, this.y, this.w, this.h);
          } else if (time - this.runT >= this.runS*8) {
            drawImg(display.ctx, this.img, this.sheetX[0], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
            this.runT = new Date().getTime(); // Restarts the animation cycle
          }
        break;
      case "bending": // The enemy bends its knees, preparing to jump
        if (this.dir === "right") { this.sheetX = [100]; this.sheetY = [0]; }
        else if (this.dir === "left") { this.sheetX = [160]; this.sheetY = [0]; }
          // Show image
          if (time - this.bendT < this.bendS) {
            drawImg(display.ctx, this.img, this.sheetX[0], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
          } else { // After having bent its knees, the enemy jumps of the ground by increasing its y-velocity and changing its status to "falling"
            drawImg(display.ctx, this.img, this.sheetX[0], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
            this.vy = this.jf; this.status = "falling";
          }
        break;
      case "falling": // The enemy is either jumping upwards or falling downwards - it is in the air
        if (this.dir === "right") { this.sheetX = [120, 120]; this.sheetY = [0]; }
        else if (this.dir === "left") { this.sheetX = [140, 140]; this.sheetY = [0]; }
          // Going upwards
          if (this.vy > 0) {
            drawImg(display.ctx, this.img, this.sheetX[0], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
          } else { // Going downwards
            drawImg(display.ctx, this.img, this.sheetX[0], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
          }
        break;
      case "attacking":
        if (this.dir === "right") { this.sheetX = [0, 20, 40, 60]; this.sheetY = [32]; }
        else if (this.dir === "left") { this.sheetX = [0, 20, 40, 60]; this.sheetY = [64]; }
          // Animation cycle
          if (time - this.attackT < this.attackS) {
            drawImg(display.ctx, this.img, this.sheetX[0], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
          } else if (time - this.attackT >= this.attackS && time - this.attackT < this.attackS*2) {
            drawImg(display.ctx, this.img, this.sheetX[1], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
          } else if (time - this.attackT >= this.attackS*2 && time - this.attackT < this.attackS*3) {
            drawImg(display.ctx, this.img, this.sheetX[2], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
          } else if (time - this.attackT >= this.attackS*3 && time - this.attackT < this.attackS*4) {
            drawImg(display.ctx, this.img, this.sheetX[3], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
          } else if (time - this.attackT >= this.attackS*4) { // Ends the attack
            drawImg(display.ctx, this.img, this.sheetX[3], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
            this.status = "walking";
          }
        break;
        case "rightHurt": // Hit by the player while standing on its right side
            if (time - this.hurtT < this.hurtS) { // Takes a standing pose during the hurt period
                if (this.dir === "right")      { drawImg(display.ctx, this.img, 100, 0, 20, 32, this.x, this.y, this.w, this.h); }
                else if (this.dir === "left") { drawImg(display.ctx, this.img, 160, 0, 20, 32, this.x, this.y, this.w, this.h); }
            } else { // After the hurt period is over, the enemy changes status
                if (this.dir === "right")      { drawImg(display.ctx, this.img, 100, 0, 20, 32, this.x, this.y, this.w, this.h); }
                else if (this.dir === "left") { drawImg(display.ctx, this.img, 160, 0, 20, 32, this.x, this.y, this.w, this.h); }
                this.status = "idle";
            }
        break;
        case "leftHurt": // Hit by the player while standing on its left side
        if (time - this.hurtT < this.hurtS) {
            if (this.dir === "right")      { drawImg(display.ctx, this.img, 100, 0, 20, 32, this.x, this.y, this.w, this.h); }
            else if (this.dir === "left") { drawImg(display.ctx, this.img, 160, 0, 20, 32, this.x, this.y, this.w, this.h); }
        } else {
            if (this.dir === "right")      { drawImg(display.ctx, this.img, 100, 0, 20, 32, this.x, this.y, this.w, this.h); }
            else if (this.dir === "left") { drawImg(display.ctx, this.img, 160, 0, 20, 32, this.x, this.y, this.w, this.h); }
            this.status = "idle";
        }
        break;
    }
  }

  //------------------------------------------------------------------_drawHpbar

  // Draws an healthBar over the enemy's head
  _drawHpbar(display, hpImg) {
      // If the enemy has lost some hp, the health bar will be drawn over its head
      if (this.hp < 100 && this.hp >= 0) {
          drawImg(display.ctx, hpImg, 0, 51, 22, 5, this.x - (1*this.sf), this.y - (8*this.sf), 22*this.sf, 5*this.sf); // Draws the green health bar
          drawImg(display.ctx, hpImg, 44, 51, -22+Math.ceil(this.hp/5), 5, this.x + (21*this.sf), this.y - (8*this.sf), (-22+Math.ceil(this.hp/5))*this.sf, 5*this.sf); // Draws part of the health bar, but with a grey background
      }
  }

  //-----------------------------------------------------------------------_move

  // Moves the enemy
  _move(player, time) {
    this._collisionX();
    // Enemy will be engaged in battle when the player enters its territory, or when the player is between it and its territory
    if ((player.x + player.w > this.leftBorder || player.x > this.x) &&
        (player.x < this.rightBorder || player.x < this.x + this.w)) {
          this.engaged = true;
    } else { this.engaged = false; } // Outside of the territory


    if (this.status === "rightHurt") { // Hurt by the player, moving to the right
        if (this.colX !== "R") { this.x += player.vx; }
    } else if (this.status === "leftHurt") { // Hurt by the player, moving to the left
        if (this.colX !== "L") { this.x -= player.vx; }
    // Enemy chases after the player, trying to attack it
    } else if (this.engaged) {
        // Player is not in contact with enemy, so the enemy follows the player to the right
        if (player.x > this.x + this.w && player.x < this.rightBorder && this.status !== "attacking") {
          this.dir = "right";
          if (this.colX !== "R") { // Walks if not having collided to the right
              if (this._collisionY() === "G") { this.status = "walking"; } this.x += this.vx;
          } else { // Having collided it attempts to jump over the obstacle
            let blockAbove = false;
            // Detects if there are obstacles above the enemy - this prevents the enemy from glitching through the above obstacle
            this.map.forEach((chunk, chunkIdx) => { chunk.forEach((row, rowIdx) => { row.forEach((tile, idx) => {
              if (Math.round((this.x)/this.ts) === Math.floor(tile.x/this.ts) && Math.floor(this.y/this.ts) === Math.floor(tile.y/this.ts) &&
                  (this.map[chunkIdx][rowIdx-1][idx].type === 'obst' || this.map[chunkIdx][rowIdx-1][idx-1].type === 'obst')) { blockAbove = true; }
            }); }); });
            if (!blockAbove && this.status !== "bending" && this._collisionY() === "G") { this.bendT = new Date().getTime(); this.status = "bending"; }
          }
        // Player is not in contact with enemy, so the enemy follows the player to the left
        } else if (player.x + player.w < this.x && player.x + player.w > this.leftBorder && this.status !== "attacking") {
            this.dir = "left";
            if (this.colX !== "L") { // Walks if not having collided to the left
                if (this._collisionY() === "G") { this.status = "walking"; } this.x -= this.vx;
            } else { // Having collided it attempts to jump over the obstacle
              let blockAbove = false;
              // Detects if there are obstacles above the enemy - this prevents the enemy from glitching through the above obstacle
              this.map.forEach((chunk, chunkIdx) => { chunk.forEach((row, rowIdx) => { row.forEach((tile, idx) => {
                if (Math.round((this.x)/this.ts) === Math.floor(tile.x/this.ts) && Math.floor(this.y/this.ts) === Math.floor(tile.y/this.ts) &&
                    (this.map[chunkIdx][rowIdx-1][idx].type === 'obst' || this.map[chunkIdx][rowIdx-1][idx-1].type === 'obst')) { blockAbove = true; }
              }); }); });
              if (!blockAbove && this.status !== "bending" && this._collisionY() === "G") { this.bendT = new Date().getTime(); this.status = "bending"; }

            }
        // Player and enemy are in contact on the enemy's right side - The enemy attacks
        } else if (player.x <= this.x + this.w && player.x > this.x + this.w/2) {
            this.dir = "right";
            // If the enemy and the player are physically in contact
            if (player.y + player.h > this.y && player.y < this.y + this.h) {
              // Starts the attack and lets it be completed before moving on
              if (this.status !== "attacking" && time - this.attackT > this.attackTimeout) {
                  this.attackT = new Date().getTime(); this.status = "attacking";
              // Idling if not attacking
              } else if (time - this.attackT < this.attackTimeout && time - this.attackT > this.attackS*4) { this.status = "idle"; }
            // If they touch on the x-axis, but not on the y-axis
            } else { this.status = "idle"; }
        // Player and enemy are in contact on the enemy's left side - The enemy attacks
        } else if (player.x + player.w >= this.x && player.x + player.w < this.x + this.w/2) {
            this.dir = "left";
            // If the enemy and the player are physically in contact
            if (player.y + player.h > this.y && player.y < this.y + this.h) {
              // Starts the attack and lets it be completed before moving on
              if (this.status !== "attacking" && time - this.attackT > this.attackTimeout) {
                  this.attackT = new Date().getTime(); this.status = "attacking";
              // Idling if not attacking
              } else if (time - this.attackT < this.attackTimeout && time - this.attackT > this.attackS*4) { this.status = "idle"; }
            // If they touch on the x-axis, but not on the y-axis
            } else { this.status = "idle"; }
        }
    // Enemy moves back and forth, like it is patrolling the its area
    } else {
        switch (this.dir) {
            case "right": this.status = "walking"; this.x += this.vx; break;
            case "left":  this.status = "walking"; this.x -= this.vx; break;
        }

        if      (this.x >= this.rightBorder - this.ts/3 || this.colX === "R") { this.dir = "left";  }
        else if (this.x <= this.leftBorder  + this.ts/3 || this.colX === "L") { this.dir = "right"; }
    }
  }

  //---------------------------------------------------------------------_attack

  // Checks if the enemy manages to hit the player in its attack
  _attack(player, time) {
      //  If the enemy attacks
      if (this.status === "attacking" && time - this.attackT >= this.attackS && time - this.attackT < this.attackS*4 &&
          player.status !== "rightHurt" && player.status !== "leftHurt") {
          // The enemy is facing left and hitting the player
          if (this.dir === "left" &&
              player.x + player.w >= this.x && player.x + player.w < this.x + this.w/2 &&
              player.y + player.h > this.y && player.y < this.y + this.h) {
                if (player.hp > this.damage) { player.hp -= this.damage; } // Decreases healyh points
                else { player.hp = 0; } // So not to exceed 0
                player.status = "leftHurt"; player.hurtT = new Date().getTime();
          // The enemy is facing right and hitting the player
          } else if (this.dir === "right" &&
                     player.x <= this.x + this.w && player.x > this.x + this.w/2 &&
                     player.y + player.h > this.y && player.y < this.y + this.h) {
                if (player.hp > this.damage) { player.hp -= this.damage; } // Decreases health points
                else { player.hp = 0; } // So not to exceed 0
                player.status = "rightHurt"; player.hurtT = new Date().getTime(); // Status change to give blow back
          }
      }
  }

  //-------------------------------------------------------------------_attacked

  // Checks if the player hits the enemy
  _attacked(player, time) {
      if (player.acWeapon !== player.weapons[2]) {
        // If the player attacks
        if (((player.status === "attacking" && time - player.attackT >= player.attackS && time - player.attackT < player.attackS*2) ||
            player.status === "jumpKicking") && this.status !== "rightHurt" && this.status !== "leftHurt") {
            // The player is facing left and hitting the enemy
            if (player.dir === "left" &&
                player.x <= this.x + this.w && player.x > this.x + this.w/2 &&
                player.y + player.h > this.y && player.y < this.y + this.h) {
                  if (player.status === "jumpKicking") { this.hp -= player.jkDmg*player.dmgf } // If the enemy is hit by a jumpkick
                  else { this.hp -= player.acWeapon.dmg*player.dmgf; }

                  if (player.acWeapon.type === player.weapons[1].type) { player.weapons[1].hp -= this.meleeCounterDmg; } // Damages the melee weapon
                  this.status = "leftHurt"; this.hurtT = new Date().getTime();
            // The player is facing right and hitting the enemy
            } else if (player.dir === "right" &&
                       player.x + player.w >= this.x && player.x + player.w < this.x + this.w/2 &&
                       player.y + player.h > this.y && player.y < this.y + this.h) {
                   if (player.status === "jumpKicking") { this.hp -= player.jkDmg*player.dmgf } // If the enemy is hit by a jumpkick
                   else { this.hp -= player.acWeapon.dmg*player.dmgf; }

                   if (player.acWeapon.type === player.weapons[1].type) { player.weapons[1].hp -= this.meleeCounterDmg; } // Damages the melee weapon
                   this.status = "rightHurt"; this.hurtT = new Date().getTime();
            }
        }
      }
  }

  //--------------------------------------------------------------------_gravity

  // Movement in y-direction
  _gravity() {
      this.y -= this.vy // y-position changes with the y-velocity

      switch (this._collisionY()) {
        case "G": this.vy = 0;          break; // Player on the ground - No movement in y-direction
        case "U": this.vy = -1*this.sf; break; // When crashing in a tile above, the player is immediatly going downwards
        default:  this.vy -= this.g;    break; // y-velocity changes with the gravitational acceleration
      }
  }

  //-----------------------------------------------------------------_collisionX

  _collisionX() {
    this.colX = "null"; // Resets the this.colX variable

    // Collision with the map
    for (let i = 0; i < this.map.length; i++) { for (let j = 0; j < this.map[0].length; j++) { for (let k = 0; k < this.map[0][0].length; k++) {
            const tile = this.map[i][j][k]; // Saves the tile in a variable
            if (tile.type === 'obst' || tile.type === 'finish') {
              if (this.y + this.h > tile.y && this.y < tile.y + this.ts) { // Collision in y-direction
                // Checks for collision with a tile to the right
                if (this.x + this.w >= tile.x && this.x + this.w < tile.x + (2*this.vx)) { this.colX = "R"; } // this.x = tile.x-this.w; }
                // Checks for collision with a tile to the left
                else if (this.x <= tile.x + this.ts && this.x > tile.x + this.ts - (2*this.vx)) { this.colX = "L"; } // this.x = tile.x+this.ts; }
              }
            }
    } } }
  }

  //-----------------------------------------------------------------_collisionY

  // Collision in y-direction
  _collisionY() {
    for (let i = 0; i < this.map.length; i++) { for (let j = 0; j < this.map[0].length; j++) { for (let k = 0; k < this.map[0][0].length; k++) {
        const tile = this.map[i][j][k];
        if (tile.type === 'obst' || tile.type === 'finish') {
          // Checks for a collision with the ground
          if        (this.x + this.w > tile.x + this.vx && this.x < tile.x + this.ts - this.vx &&
                     this.y + this.h >= tile.y && this.y < tile.y + this.ts/2) {
              this.y = tile.y - this.h; // Moves the player to the top of the tile
              return "G";
          // Checks for a collision with a tile above
          } else if (this.x + this.w > tile.x + this.vx && this.x < tile.x + this.ts - this.vx &&
                     this.y + this.h >= tile.y + this.ts/4 && this.y < tile.y + this.ts) {
              this.y = tile.y + this.ts; // Moves the player to the bottom of the tile
              return "U";
          }
        }
    } } }
  }

  //------------------------------------------------------------_collisionPlayer

  // Checks if the player and the enemy collides
  _collisionPlayer(player) {
      if (player.x <= this.x + this.w && player.x > this.x + this.w/2 &&
          player.y + player.h >= this.y && player.y < this.y + this.h) {
            player.enemyCollX = "L";
      } else if (player.x + player.w >= this.x && player.x + player.w < this.x + this.w/2 &&
                 player.y + player.h >= this.y && player.y < this.y + this.h) {
            player.enemyCollX = "R";
      } else if (player.x + player.w > this.x && player.x < this.x + this.w &&
          player.y + player.h >= this.y && player.y < this.y + 4*this.sf) {
            player.enemyCollY = "T";
      }
  }

}

//----------------------------------------------------------------------Gatherer

// The most primitive type of stone age enemies
export class Gatherer extends Enemy {
  constructor(chunkIdx, xTile, yTile, lbTile, rbTile, g, img, dir, hp, map, tileSize, sizeFactor) {
    super();
    this.map = map; // Fetches the map
    this.ts = tileSize; // The size of each tile of the map
    this.sf = sizeFactor; // The factor to multiply the sizes with

    this.chunkIdx = chunkIdx; // The index of the chunk it is on
    this.xTile = xTile; // The tile who's x-position will be set equal to that of the enemy
    this.yTile = yTile; // Same as xTile, but using the y-position
    // lbTile and rbTile: Objects containing the chunk index and the tile index of the respective tile
    this.lbTile = lbTile; // The tile who's x-position will be set as the left border of the enemy's territory
    this.rbTile = rbTile; // Same as lbTile, but regarding the right border
    this.x = this.map[this.chunkIdx][0][this.xTile].x; // X-position
    this.y = this.map[this.chunkIdx][this.yTile][0].y;
    this.leftBorder = this.map[this.lbTile.chunkIdx][0][this.lbTile.tileIdx].x;
    this.rightBorder = this.map[this.rbTile.chunkIdx][0][this.rbTile.tileIdx].x; // The furthest the enemy can walk to the right before turning back
    this.img = img; // Image to be used
    this.dir = dir; // The direction the enemy is facing
    this.type = 1;

    this.w = 20*this.sf; // Width
    this.h = 32*this.sf; // Height
    this.vx = 1*this.sf; // X-velocity
    this.vy = 0; // Y-velocity
    this.g = g; // Gravitational force
    this.jf = 3.4*this.sf; // Jump force
    this.damage = 15; // How much the enemy hurts the player
    this.meleeCounterDmg = 15; // Amount of hp a melee weapon loses when hitting this enemy
    this.status = "walking";
    this.maxHp = 100; // Maximum health points
    this.hp = hp; // Health points
    if (this.hp === undefined) { this.hp = this.maxHp; }
    this.expInc = 40; // The amount of exp that the enemy gives the player when defeated

    this.idleS = 250; // Idle speed: The rate of which the images should switch (framerate)
    this.runS = 100; // Run speed
    this.bendS = 80; // Bend speed
    this.attackS = 150; // Attack speed
    this.hurtS = 400; // Hurt speed: time that the enemy will be affected by the damage done by the player
    this.attackTimeout = 1300; // How long the enemy must wait to attack again
  }
}
