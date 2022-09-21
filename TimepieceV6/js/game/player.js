
import {drawImg}  from './../libs/drawLib.js';
import Projectile from      './projectile.js';

export default class Player {
  constructor(x, y, w, h, name, img, dir, vx, cvy, g, jf, idleS, runS, bendS, attackS, climbS, hurtS, map, tileSize, sFactor, rightLim, leftLim, topLim, bottomLim, canvas) {
    this.x      =         x;
    this.y      =         y;
    this.w      =         w; // Width
    this.h      =         h; // Height
    this.name   =      name; // The player's name
    this.img    =       img; // Player sprite sheet
    this.status =    "idle"; // Characters status: Helps determine the character animation
    this.dir    =       dir; // Direction the player is facing
    this.ovx    =        vx; // Original x-velocity
    this.vx     =        vx; // Velocity in x-direction
    this.ocvy   =       cvy; // Original climbing velocity value
    this.cvy    = this.ocvy; // Climbing velocity
    this.g      =         g; // Gravitational acceleration
    this.jf     =        jf; // Jumping force

    this.rightActive  = false; // If key for movement to the right is pressed or not
    this.leftActive   = false; // If key for movement to the left is pressed or not
    this.activeDir    =  null; // Determines if the right- or left key has been pressed and which one
    this.jumpActive   = false; // If key for jumping has been pressed or not
    this.attackActive = false; // If key for attack has been pressed or not
    this.climbDir     =  null; // Climbing direction - up, down or null
    this.platformIdx  =  null; // If the player is on top of a platform or not - Gives the array index of the platform
    this.vy           =     0; // Velocity in y-direction

    this.idleT = new Date().getTime(); // Idle time: Set to keep track of when the images should switch
    this.idleS = idleS; // Idle speed: The rate of which the images should switch (framerate)
    this.runT  = new Date().getTime(); // Run time
    this.runS  = runS; // Run speed
    this.bendT = new Date().getTime(); // Bend time - Player bending its knees slightly before jumping
    this.bendS = bendS; // Bend speed
    this.attackT = new Date().getTime() - attackS*8; // Attack time: By subtracting eight times the attack speed, we can attack as soon as the game starts
    this.attackS = attackS; // Attack speed
    this.attackDur = this.attackS*4; // The duration of an attack
    this.climbT = new Date().getTime(); // Climbing Time
    this.climbS = climbS;
    this.climbIdx = 0; // Saves the index of the climbing image when the player stops climbing
    this.hurtT = new Date().getTime(); // Hurt time
    this.hurtS = hurtS; // The time the player will have the hurt-status after having been hit

    this.sheetX = []; // Sprite sheet x-coordinates: to simplify the code when it comes to the player's direction
    this.sheetY = []; // Sprite sheet y-coordinates
    this.map = map; // Fetches the map from the game module
    this.ts = tileSize; // Fetches the tileSize
    this.sf = sFactor; // Fetches the size factor
    this.rightLim = rightLim; // Fetches the rightLim from the game module
    this.leftLim = leftLim; // Fetches the leftLim from the game module
    this.topLim = topLim; // Fetches the topLim from the game module
    this.bottomLim = bottomLim; // Fetches the bottomLim from the game module
    this.colX = "null"; // Status of the collision on the x-axis
    this.onLadder = false; // Status of the collision with ladders
    this.canvas = canvas; // Fetches the canvas from the display module
    this.balance = 0; // Balance: Keeps track of the amount of collected gems
    this.maxHp = 100; // Maximum health points
    this.hp = this.maxHp; // Health points
    this.enemyCollY = "null"; // Collision with enemy on the x-axis
    this.enemyCollX = "null"; // Collision with enemy on the y-axis

    // Weapons
    this.dmgf = 1;
    this.jkDmg = 30;
    this.projectiles = []; // Projectiles to be shot from the long range weapons
    // The player can only hold the fists/hand combat, one melee weapon and one long range weapon
    // Template for the weapons array
    this.tempWeapons = [{type: 0, dmg: 25}, {type: null, dmg: 0, maxHp: 0, hp: 0}, {type: null, dmg: 0, ammo: 0}];
    // Array containing the player's available weapons and their stats
    this.weapons     = [];
    this.weapons.push(this.tempWeapons[0]); this.weapons.push(this.tempWeapons[1]); this.weapons.push(this.tempWeapons[2]);
    this.acWeapon    = this.weapons[0]; // Active weapon

    // Level and exp
    this.level = 1; // The player's level reached by collecting experience points
    this.lvlExpReq = 100; // Experience point requirement for current level to reach the next
    this.totalExp = 0; // Total amount of experience points
    this.exp = this.totalExp; // Experience points for current level
  }

  //-----------------------------------------------------------------------_draw

  // Draws the player
  _draw(display, time, platforms) {
    // The player's status determines what animation should run
    switch (this.status) {
      case "idle": // The player is idle; standing still on the ground
        if (this.acWeapon.type === 4) { // Holding a wooden club
            if (this.dir === "right")     { this.sheetX = [180, 200]; this.sheetY = [128]; }
            else if (this.dir === "left") { this.sheetX = [240, 220]; this.sheetY = [128]; }
        } else if (this.acWeapon.type === 5) { // Holding a gun
            if (this.dir === "right")     { this.sheetX = [320, 340]; this.sheetY = [128]; }
            else if (this.dir === "left") { this.sheetX = [360, 380]; this.sheetY = [128]; }
        } else {
            // Determines sprite sheet coordinates according to the player's direction
            if (this.dir === "right")     { this.sheetX = [0, 20]; this.sheetY = [128]; }
            else if (this.dir === "left") { this.sheetX = [60, 40]; this.sheetY = [128]; }
        }

          // Animation cycle
          this._animationCycle(display, time, this.idleT, this.idleS, () => { this.idleT = new Date().getTime(); });
        break;
      case "running": // The player is running
        if (this.acWeapon.type === 4) { // The player holds a wooden club
            if (this.dir === "right")     { this.sheetX = [180, 200, 220, 240]; this.sheetY = [0, 32]; }
            else if (this.dir === "left") { this.sheetX = [180, 200, 220, 240]; this.sheetY = [64, 96]; }
        } else if (this.acWeapon.type === 5) { // The player holds a gun
            if (this.dir === "right")     { this.sheetX = [320, 340, 360, 380]; this.sheetY = [0, 32]; }
            else if (this.dir === "left") { this.sheetX = [320, 340, 360, 380]; this.sheetY = [64, 96]; }
        } else {
            if (this.dir === "right")     { this.sheetX = [0, 20, 40, 60]; this.sheetY = [0, 32]; }
            else if (this.dir === "left") { this.sheetX = [0, 20, 40, 60]; this.sheetY = [64, 96]; }
        }

        // Animation cycle
        this._animationCycle(display, time, this.runT, this.runS, () => { this.runT = new Date().getTime(); });
        break;
      case "bending": // The player bends its knees, preparing to jump
        if (this.acWeapon.type === 4) {
            if (this.dir === "right")     { this.sheetX = [180]; this.sheetY = [160]; }
            else if (this.dir === "left") { this.sheetX = [220]; this.sheetY = [192]; }
        } else if (this.acWeapon.type === 5) {
            if (this.dir === "right")     { this.sheetX = [320]; this.sheetY = [160]; }
            else if (this.dir === "left") { this.sheetX = [360]; this.sheetY = [192]; }
        } else {
            if (this.dir === "right")     { this.sheetX = [0]; this.sheetY = [160]; }
            else if (this.dir === "left") { this.sheetX = [100]; this.sheetY = [160]; }
        }
          // Show image
          if (time - this.bendT < this.bendS) {
            drawImg(display.ctx, this.img, this.sheetX[0], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
          } else { // After having bent its knees, the player jumps of the ground by increasing its y-velocity and changing its status to "falling"
            drawImg(display.ctx, this.img, this.sheetX[0], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
            this.vy += this.jf; this.status = "falling";
          }
        break;
      case "falling": // The player is either jumping upwards or falling downwards - it is in the air
        if (this.acWeapon.type === 4) {
            if (this.dir === "right")     { this.sheetX = [200, 220]; this.sheetY = [160]; }
            else if (this.dir === "left") { this.sheetX = [200, 180]; this.sheetY = [192]; }
        } else if (this.acWeapon.type === 5) {
            if (this.dir === "right")     { this.sheetX = [340, 360]; this.sheetY = [160]; }
            else if (this.dir === "left") { this.sheetX = [340, 320]; this.sheetY = [192]; }
        } else {
            if (this.dir === "right")     { this.sheetX = [20, 40]; this.sheetY = [160]; }
            else if (this.dir === "left") { this.sheetX = [80, 60]; this.sheetY = [160]; }
        }
          // Going upwards
          if (this.vy > 0) {
            drawImg(display.ctx, this.img, this.sheetX[0], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
          } else { // Going downwards
            drawImg(display.ctx, this.img, this.sheetX[1], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
          }
        break;
      case "jumpKicking": // The player is attacking in the air; it takes on a jump kick pose
        if (this.acWeapon.type === 4) {
            if (this.dir === "right")     { this.sheetX = [240]; this.sheetY = [160]; }
            else if (this.dir === "left") { this.sheetX = [240]; this.sheetY = [192]; }
        } else if (this.acWeapon.type === 5) {
            if (this.dir === "right")     { this.sheetX = [380]; this.sheetY = [160]; }
            else if (this.dir === "left") { this.sheetX = [380]; this.sheetY = [192]; }
        } else {
            if (this.dir === "right")     { this.sheetX = [120]; this.sheetY = [160]; }
            else if (this.dir === "left") { this.sheetX = [140]; this.sheetY = [160]; }
        }
          // Show image
          drawImg(display.ctx, this.img, this.sheetX[0], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
          // Stops the jump kick if the player hits a tile
          if (this.colX !== "null" || this._collisionY(platforms) === "G") {
              this.attackActive = false;
          }
        break;
      case "attacking":
        if (this.acWeapon.type === 4) {
            if (this.dir === "right")     { this.sheetX = [260, 280]; this.sheetY = [0]; }
            else if (this.dir === "left") { this.sheetX = [260, 280]; this.sheetY = [32]; }
        } else if (this.acWeapon.type === 5) {
            if (this.dir === "right")     { this.sheetX = [400, 420, 400]; this.sheetY = [0]; }
            else if (this.dir === "left") { this.sheetX = [420, 400, 420]; this.sheetY = [32]; }
        } else {
            if (this.dir === "right")     { this.sheetX = [80, 100, 120, 140]; this.sheetY = [0]; }
            else if (this.dir === "left") { this.sheetX = [80, 100, 120, 140]; this.sheetY = [32]; }
        }

          // Animation cycle
          this._animationCycle(display, time, this.attackT, this.attackS, () => { this.attackActive = false; });
        break;
        case 'climbing': // Climbing a ladder
          this.sheetX = [0, 20]; this.sheetY = [192];
            // Animation cycle
            if (!this.climbDir) {
              drawImg(display.ctx, this.img, this.sheetX[this.climbIdx], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);
              this.climbT = new Date().getTime(); if (this.climbIdx === 0) { this.climbT -= this.climbS; }
            } else {
              if (time - this.climbT < this.climbS) {
                drawImg(display.ctx, this.img, this.sheetX[0], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h); this.climbIdx = 0;
              } else if (time - this.climbT >= this.climbS && time - this.climbT < this.climbS*2) {
                drawImg(display.ctx, this.img, this.sheetX[1], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h); this.climbIdx = 1;
              } else {
                drawImg(display.ctx, this.img, this.sheetX[1], this.sheetY[0], 20, 32, this.x, this.y, this.w, this.h);  this.climbIdx = 1;
                this.climbT = new Date().getTime();
              }
            }
        break;
        case "rightHurt": // Hit by an enemy while standing on its right side
            if (time - this.hurtT < this.hurtS) { // Takes the bending pose during the hurt period
                if (this.dir === "right")      { drawImg(display.ctx, this.img, 0, 160, 20, 32, this.x, this.y, this.w, this.h); }
                else if (this.dir === "left")  { drawImg(display.ctx, this.img, 100, 160, 20, 32, this.x, this.y, this.w, this.h); }
            } else { // After the hurt period is over, the player changes status to resume player control
                if (this.dir === "right")      { drawImg(display.ctx, this.img, 0, 160, 20, 32, this.x, this.y, this.w, this.h); }
                else if (this.dir === "left")  { drawImg(display.ctx, this.img, 100, 160, 20, 32, this.x, this.y, this.w, this.h); }
              this.status = "idle";
            }
        break;
        case "leftHurt": // Hit by an enemy while standing on its left side
        if (time - this.hurtT < this.hurtS) {
            if (this.dir === "right")      { drawImg(display.ctx, this.img, 0, 160, 20, 32, this.x, this.y, this.w, this.h); }
            else if (this.dir === "left")  { drawImg(display.ctx, this.img, 100, 160, 20, 32, this.x, this.y, this.w, this.h); }
        } else {
          if (this.dir === "right")      { drawImg(display.ctx, this.img, 0, 160, 20, 32, this.x, this.y, this.w, this.h); }
          else if (this.dir === "left")  { drawImg(display.ctx, this.img, 100, 160, 20, 32, this.x, this.y, this.w, this.h); }
          this.status = "idle";
        }
        break;
    }
  }

  //-----------------------------------------------------------------------_move

  // Move player
  _move(time, platforms) {
      switch (this.status) {
        // If player is jump kicking, it will move to the direction its facing without the user controlling it
        case "jumpKicking":
            if (this.vy > 0) { this.vy = 0; } // Stops the player from going further up in the air after the jump kick is initiated
            if (this.dir === "right") {
                // Cannot move out of the canvas screen
                // If the end of the map is not reached and the point this.rightLim is, the player does not move
                if ((this.x <= this.rightLim || this.map[this.map.length-1][0][this.map[0][0].length-1].x + this.ts <= this.canvas.width)
                    && this.x + this.w < this.canvas.width && this.colX !== 'R') { this.x += this.vx; }
            } else if (this.dir === "left") {
                // Cannot move out of the canvas screen
                // If the start of the map is not reached and the point this.limLim is, the player does not move
                if ((this.x >= this.leftLim || this.map[0][0][0].x >= 0) && this.x > 0 && this.colX !== 'L') { this.x -= this.vx; }
            }
        break;
        // If the player has been hit by an enemy
        case "rightHurt":
            if (this.colX !== "R" && (this.x <= this.rightLim || this.map[this.map.length-1][0][this.map[0][0].length-1].x + this.ts <= this.canvas.width)
                && this.x + this.w < this.canvas.width) { this.x += this.vx; }
        break;
        case "leftHurt":
            // Player must be in the area where the map doesn't need to move
            if (this.colX !== "L" && (this.x >= this.leftLim || this.map[0][0][0].x >= 0) && this.x > 0) { this.x -= this.vx; }
        break;
        default:
            this.vx = this.ovx;
            // Moving to the right if not having collided
            if (this.activeDir === "right") {
                this.dir = "right";
                if ((this.x <= this.rightLim || this.map[this.map.length-1][0][this.map[0][0].length-1].x + this.ts <= this.canvas.width)
                    && this.x + this.w < this.canvas.width && this.colX !== "R" && this.enemyCollX !== "R") { this.x += this.vx; }
            // Moving to the left if not having collided
            } else if (this.activeDir === "left") {
                this.dir = "left";
                if ((this.x >= this.leftLim || this.map[0][0][0].x >= 0) && this.x > 0
                    && this.colX !== "L" && this.enemyCollX !== "L") { this.x -= this.vx; }
            }

            // Moves the player when it is on top of a platform
            if (this.platformIdx !== null) {
                if (platforms[this.platformIdx].dir === "right" && (this.x <= this.rightLim || this.map[this.map.length-1][0][this.map[0][0].length-1].x + this.ts <= this.canvas.width)
                    && this.x + this.w < this.canvas.width && this.colX !== "R" && this.enemyCollX !== "R" && this.activeDir === null) {
                    this.vx = platforms[this.platformIdx].vx; this.x += this.vx;
                } else if (platforms[this.platformIdx].dir === "left" && (this.x >= this.leftLim || this.map[0][0][0].x >= 0) && this.x > 0
                           && this.colX !== "L" && this.enemyCollX !== "L" && this.activeDir === null) {
                    this.vx = platforms[this.platformIdx].vx; this.x -= this.vx;
                }
            }

            // If the player touches a ladder regardless of the player being in the air or not
            if (this.onLadder) {
              if (this.climbDir === 'up' && this._collisionY(platforms) !== 'U')   { this.vy = this.cvy; }
              if (this.climbDir === 'down' && this._collisionY(platforms) !== 'G') { this.vy = -this.cvy; }
            }
        break;
      }

      let attackFunc = () => {
        if (this.status !== "attacking") {
          // If the attack timeout is passed, the player can make a new attack
          if (time - this.attackT >= this.attackS*8) { this.attackT = new Date().getTime(); this.status = "attacking"; }
          // If the player has finished attacking, but have not passed the attack timeout, it must wait
          else if (time - this.attackT >= this.attackDur) { this.attackActive = false; }
          // Places a projectile in the projectiles array
          // Projectile(x, y, w, h, dir, vx, sf, ts, canvas, map)
          if (this.acWeapon === this.weapons[2] && this.attackActive && this.status === "attacking") {
            const proj = { x: null, y: this.y+(17*this.sf), dir: null }; // Projectile object to hold certain values
            switch (this.dir) {
              case 'left':  proj.x = this.x;        proj.dir = 'left';  break;
              case 'right': proj.x = this.x+this.w; proj.dir = 'right'; break;
            }
            this.projectiles.push(new Projectile(proj.x, proj.y, 2*this.sf, this.sf, proj.dir, 3*this.sf, this.sf, this.ts, this.canvas, this.map));
            this.weapons[2].ammo--; // Decreases ammo by one
            if (this.weapons[2].ammo === 0) { this.weapons[2] = this.tempWeapons[2]; this.acWeapon = this.weapons[0]; this.attackActive = false; }
          }
        }
      }

      //--- Status regulation

      // Normal movement is not allowed when the player has been hurt
      if (this.status !== "rightHurt" && this.status !== "leftHurt") {
        // If not touching a ladder, the status is set to null, so to later be decided
        if (!this.onLadder && this.status === 'climbing') { this.status = null; }
        // If the player touches a ladder and the user pushes up or down, the playter starts climbing
        if (this.onLadder && this.climbDir) { this.status = 'climbing'; }

        if (this.status !== 'climbing') {
          // On the ground
          if (this._collisionY(platforms) === "G") {
              // If the jump key is pressed - The key must be pressed for as long as the value this.bendS says to launch the jump
              if (this.jumpActive) {
                  // Starts the bending of the knees
                  if (this.status !== "bending") { this.attackActive = false; this.bendT = new Date().getTime(); this.status = "bending"; }
              // Player starts an attack on the ground
              } else if (this.attackActive) { // If it is not already attacking
                attackFunc();
              } else { // If the jump key is not pressed
                  // Running if not having collided and either the right or left key has been pressed
                  if (this.activeDir !== null && this.colX === "null") {
                      this.status = "running";
                  } else { this.status = "idle"; }
              }
          // In the air
          } else {
              // If the player attacks in the air, it jump kicks
              if (this.attackActive && this.colX === "null") {
                if (this.acWeapon !== this.weapons[2]) { this.status = "jumpKicking"; }
                else { attackFunc(); }
              } else { this.status = "falling"; }
          }
        } else { this.attackActive = false; }
      }

      this.enemyCollX = "null";
  }

  //--------------------------------------------------------------------_gravity

  // Movement in y-direction
  _gravity(platforms) {
      this.cvy = this.ocvy; // Resets the this.cvy variable

      if (this.vy > 0) { // If going upwards
          // y-position changes with the y-velocity
          if (this.y > this.topLim || this.map[0][0][0].y >= 0) { this.y -= this.vy; }
      } else if (this.vy < 0) { // If falling downwards
          // y-position changes with the y-velocity
          if (this.y < this.bottomLim || this.map[0][this.map[0].length-1][0].y + this.ts <= this.canvas.height) { this.y -= this.vy }
      }


      if (this.status !== 'climbing') {
          switch (this._collisionY(platforms)) {
            case "G": this.vy = 0;          break; // Player on the ground - No movement in y-direction
            case "U": this.vy = -1*this.sf; break; // When crashing in a tile above, the player is immediatly going downwards
            default:  this.vy -= this.g;    break; // y-velocity changes with the gravitational acceleration
          }
      } else { // No gravity when in a ladder
          if (!this.climbDir) { this.vy = 0; } // Hanging idle in the ladder
          if (this._collisionY(platforms) === 'U' && this.climbDir === 'up') { this.cvy = 0; } // Collided with platform above
      }

      // If the player lands on top of an enemy, it bounces
      if (this.enemyCollY === "T") { this.vy = 2*this.sf; this.enemyCollY = "null"; }
  }

  //-----------------------------------------------------------------_collisionX

  // Collision in x-direction
  _collisionX() {
      this.colX = "null"; // Resets the this.colX variable
      this.onLadder = false; // Resets the this.onLadder variable

      // Collision with the map
      for (let i = 0; i < this.map.length; i++) { for (let j = 0; j < this.map[0].length; j++) { for (let k = 0; k < this.map[0][0].length; k++) {
              const tile = this.map[i][j][k]; // Saves the tile in a variable
              if (tile.type === 'obst' || tile.type === 'finish') {
                if (this.y + this.h > tile.y && this.y < tile.y + this.ts) { // Collision in y-direction
                  // Checks for collision with a tile to the right
                  if (this.x + this.w >= tile.x && this.x + this.w < tile.x + this.vx) { this.colX = "R"; this.x = tile.x-this.w; }
                  // Checks for collision with a tile to the left
                  else if (this.x <= tile.x + this.ts && this.x > tile.x + this.ts - this.vx) { this.colX = "L"; this.x = tile.x+this.ts; }
                }
              }
              if (tile.type === 'ladder') {
                  if (this.x + this.w >= tile.x && this.x < tile.x + this.ts &&
                      this.y + this.h > tile.y && this.y < tile.y + this.ts) {
                      this.onLadder = true;
                  }
              } else if (!tile.type && this.status === 'climbing' && j !== this.map[i].length-1) {
                  if (this.map[i][j+1][k].type === 'ladder') {
                    if (this.x + this.w >= tile.x && this.x < tile.x + this.ts &&
                        this.y + this.h < this.map[i][j+1][k].y) {
                        this.vy = this.jf/2;
                    }
                  }
              }
      } } }
  }
  //-----------------------------------------------------------------_collisionY

  // Collision in y-direction
  _collisionY(platforms) {
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

      // Collides with the top of a platform
      for (let i = 0; i < platforms.length; i++) {
          if (this.x + this.w >  platforms[i].x && this.x < platforms[i].x + this.ts &&
              this.y + this.h >= platforms[i].y && this.y < platforms[i].y + this.ts/4) {
              this.y = platforms[i].y - this.h; // Moves the player to the top of the platform
              this.platformIdx = i;
              return "G";
          } else { this.platformIdx = null; }
      }
  }

  //-------------------------------------------------------_collisionFinishPoint

  _collisionFinishPoint() {
    for (let i = 0; i < this.map.length; i++) { for (let j = 0; j < this.map[0].length; j++) { for (let k = 0; k < this.map[0][0].length; k++) {
        if (this.map[i][j][k].type === 'finish' && this.x+this.w >  this.map[i][j][k].x && this.x <  this.map[i][j][k].x+this.ts &&
                                                   this.y+this.h >= this.map[i][j][k].y && this.y <= this.map[i][j][k].y+(this.ts/4)) {
          return true;
        }
    } } }
  }

  //-------------------------------------------------------------------_leveling

  // Handles the the action of leveling up
  _leveling() {
      // The level exp requirement has been met
      if (this.exp >= this.lvlExpReq) {
          this.level++; // Increments level by 1
          this.maxHp = Math.round(this.maxHp*1.1); // Increments the max health by 10%
          this.hp = Math.round(this.hp*1.1); // Increments the hp according to the max hp's increase
          this.dmgf = Math.round(this.dmgf*1.1); // Increments the damage factor by 10%;
          this.exp -= this.lvlExpReq; // Decreases the current exp to the excess exp from the previous level
          this.lvlExpReq = Math.round(this.lvlExpReq*1.3); // Increases the level exp requirement by 20%
      }
  }

  //------------------------------------------------------------- animationCycle

  // Controls the animation cycle
  _animationCycle(display, globTime, locTime, frameTime, endFunc) {
    let frameCount = 0; // Counts the number of frames that has been played in the animation cycle

    // The difference between the continuously updating globTime and the static locTime is measured in milliseconds
    this.sheetY.forEach((yPos, idxY) => {
        this.sheetX.forEach((xPos, idxX) => {
            if (globTime - locTime >= frameTime*frameCount && globTime - locTime < frameTime*(frameCount+1)) {
                drawImg(display.ctx, this.img, this.sheetX[idxX], this.sheetY[idxY], 20, 32, this.x, this.y, this.w, this.h);
            }
            frameCount++;
        });
    });

    if (globTime - locTime >= frameTime*this.sheetX.length*this.sheetY.length) { // Ends the attack
      drawImg(display.ctx, this.img, this.sheetX[this.sheetX.length-1], this.sheetY[this.sheetY.length-1], 20, 32, this.x, this.y, this.w, this.h);
      endFunc();
    }
  }
}
