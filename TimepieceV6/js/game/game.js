/**/

// Importing modules
import PowerUp    from  './powerUp.js';
import {Gatherer} from    './enemy.js';
import Platform   from './platform.js';

export default class Game {
  constructor(tileSize, rightLim, leftLim, topLim, bottomLim, sf, images, audioFiles, map) {
      // Resource arrays
      this.images = images; // Array to hold all images
      this.audioFiles = audioFiles; // Collect gem audio

      // Other
      this.sf = sf; // Factor to multiply sizes with to get the correct proportions
      this.map =           []; // Will contain the active map chunks
      this.inAcBackMap =   []; // Map that contains the chunks that has been removed from this.map by having passed them
      this.inAcFrontMap =  []; // Map that contains the chunks that have not been passed yet
      this.bluePrintMap = map; // bluePrintMap is the original loaded map. It will not be altered
      this.acn =     3; // Number of active chunks
      this.chunkIdx = this.acn-1; // The index of the last chunk in the map array
      this.chunkNumber    = 0; // Number of chunks in the current map
      this.cxLength; // Number of tiles on the x-axis of one chunk
      this.cyLength; // Number of tiles on the y-axis of one chunk
      this.ts =  tileSize; // Size of each tile
      this.rightLim =  rightLim; // The position on the map where the map moves instead of the player in the x-direction
      this.leftLim =   leftLim;
      this.topLim =    topLim; // The position on the map where the map moves instead of the player in the y-direction
      this.bottomLim = bottomLim;
      this.g = 0.2*this.sf; // Gravitational pulling force
  }

  //---------------------------------------------------------------_setMapValues

  // Sets the value - which determines how the tile will look based on a number - and the position
  _setMapValues() {
    this.map         = this.bluePrintMap.map.chunks;
    this.chunkNumber = this.bluePrintMap.map.chunks.length; // Gets how many chunks the map consists of
    this.cxLength    = this.map[0][0].length;    // Finds the cxLength
    this.cyLength    = this.map[0].length;       // Finds the cyLength

    let posReg = 0; // Regulates the position according to what chunk is being positioned
    this.map.forEach((chunk, idx) => {
      for (let i = 0; i < chunk.length; i++) { // Iterating over the 2d array this.map
        for (let j = 0; j < chunk[0].length; j++) {
            // Updates each element in the array to an object containing its original value and sets new positions
            chunk[i][j] = { value: chunk[i][j].value, type: chunk[i][j].type, x: posReg+(this.ts*j), y: this.ts*i };
        }
      }
      posReg = (chunk[idx][this.cxLength-1].x + this.ts); // posReg is equal to the furthest right x-value of the previous chunk
    });

    // Moves the the chunks, except the three first, to the inactive front array now as the values are set for the tiles
    for (let i = this.map.length-1; i > this.chunkIdx; i--) { this.inAcFrontMap.unshift(this.map[i]); this.map.pop(); }
  }

  //-------------------------------------------------------------_regulateChunks

  // Regulates the map chunks by activating the current and next chunk when passing a certain point on the map
  // This is to save computing power
  _regulateChunks(player, enemies, inAcEnemies, powerUps, inAcPowerUps, platforms, inAcPlatforms) {
      if (player.x > this.map[this.acn-1][0][Math.floor((this.cxLength-1)*0.25)].x && this.chunkIdx < this.chunkNumber-1) {
          this.chunkIdx++;
          this.inAcBackMap.push(this.map[0]); // Pushes the chunk to be rendered inactive in the inAcBackMap array
          this.map.shift(); // Removes the first map chunk and moves the chunk the player is on to the first position
          this.map.push(this.inAcFrontMap[0]); // Adds the next chunk to the this.map array
          this.inAcFrontMap.shift(); // Removes the chunk from the inactive front map that was moved to this.map

          // Setting the positions of the new map chunk tiles
          let posReg = this.map[this.acn-2][0][this.cxLength-1].x + this.ts;
          for (let i = 0; i < this.cyLength; i++) { // Iterating over the 2d array this.map
            for (let j = 0; j < this.cxLength; j++) {
                // Updates each element in the array to an object containing its original value and sets new positions
                this.map[this.acn-1][i][j] = { value: this.map[this.acn-1][i][j].value, x: posReg+(this.ts*j), y: this.map[this.acn-2][0][0].y + this.ts*i };
            }
          }

          //----------- Enemies

          // Moving active enemies on the chunk that now was made inactive to the inAcEnemies array
          for (let i = 0; i < enemies.length; i++) {
              if (enemies[i].lbTile.chunkIdx === 0) {
                  // Saving it as an object without using an Enemy class
                  inAcEnemies.unshift({chunkIdx: enemies[i].chunkIdx, xTile: enemies[i].xTile, yTile: enemies[i].yTile, lbTile: enemies[i].lbTile, rbTile: enemies[i].rbTile,
                                       g: enemies[i].g, img: enemies[i].img, dir: enemies[i].dir, map: enemies[i].map, ts: enemies[i].ts, sf: enemies[i].sf, type: enemies[i].type, hp: enemies[i].hp});
                  enemies.splice(i, 1); // Removes the enemy from the enemies array
                  i--;
              } else { enemies[i].chunkIdx--; enemies[i].lbTile.chunkIdx--; enemies[i].rbTile.chunkIdx--; }
          }

          // Moves inactive enemies to be set on the new chunk to the enemies array
          for (let i = 0; i < inAcEnemies.length; i++) {
              if ((inAcEnemies[i].chunkIdx === this.acn && inAcEnemies[i].rbTile.chunkIdx !== this.acn+1) || (inAcEnemies[i].chunkIdx === this.acn-1 && inAcEnemies[i].rbTile.chunkIdx === this.acn)) {
                  inAcEnemies[i].lbTile.chunkIdx--; inAcEnemies[i].rbTile.chunkIdx--;
                  // Adds the newly activated enemy to the enemies array and gives it its class
                  if (inAcEnemies[i].type === 1) {
                      enemies.push(new Gatherer(inAcEnemies[i].chunkIdx-1, inAcEnemies[i].xTile, inAcEnemies[i].yTile, inAcEnemies[i].lbTile, inAcEnemies[i].rbTile,
                                   inAcEnemies[i].g, inAcEnemies[i].img, inAcEnemies[i].dir, inAcEnemies[i].hp, inAcEnemies[i].map, inAcEnemies[i].ts, inAcEnemies[i].sf));
                  }
                  inAcEnemies.splice(i, 1); // Removes the enemy from the inAcEnemies array
                  i--;
              } else { inAcEnemies[i].chunkIdx--; inAcEnemies[i].lbTile.chunkIdx--; inAcEnemies[i].rbTile.chunkIdx--; } // Changes the chunkIdxs of all the inactive enemies
          }

          //----------- Power ups

          // Moving active power ups on the chunk that now was made inactive to the inAcPowerUps array
          for (let i = 0; i < powerUps.length; i++) {
              if (powerUps[i].chunkIdx === 0) {
                  // Saving it as an object without using the PowerUp class
                  inAcPowerUps.unshift({type: powerUps[i].type, chunkIdx: 0, xTile: powerUps[i].xTile, yTile: powerUps[i].yTile,
                                        size: powerUps[i].size, img: powerUps[i].img, map: powerUps[i].map});
                  powerUps.splice(i, 1); // Removes the enemy from the enemies array
                  i--;
              } else { powerUps[i].chunkIdx--; }
          }

          // Moves inactive power ups to be set on the new chunk to the powerUps array
          for (let i = 0; i < inAcPowerUps.length; i++) {
              if (inAcPowerUps[i].chunkIdx === this.acn) {
                  // Adds the newly activated power up to the enemies array and gives it its class
                  powerUps.push(new PowerUp(inAcPowerUps[i].type, this.acn-1, inAcPowerUps[i].xTile, inAcPowerUps[i].yTile, inAcPowerUps[i].size, inAcPowerUps[i].img, inAcPowerUps[i].map, "bot"));
                  inAcPowerUps.splice(i, 1); // Removes the power up from the inAcPowerUps array
                  i--;
              } else { inAcPowerUps[i].chunkIdx--; } // Changes the chunkIdxs of all the inactive power ups

          }

          //----------- Platforms

          // Moving active platforms on the chunk made inactive to inAcPlatforms
          for (let i = 0; i < platforms.length; i++) {
              if (platforms[i].lbTile.chunkIdx === 0) {
                  // Saving it as an object without using a class
                  inAcPlatforms.unshift({type: platforms[i].type, chunkIdx: platforms[i].chunkIdx, xTile: platforms[i].xTile, yTile: platforms[i].yTile, lbTile: platforms[i].lbTile, rbTile: platforms[i].rbTile,
                                         height: platforms[i].height, vx: platforms[i].vx, ts: platforms[i].ts, sf: platforms[i].sf, map: platforms[i].map});
                  platforms.splice(i, 1); i--;
               } else { platforms[i].chunkIdx--; platforms[i].lbTile.chunkIdx--; platforms[i].rbTile.chunkIdx--; }
          }

          // Moving inactive platforms onto the newly activated chunk
          for (let i = 0; i < inAcPlatforms.length; i++) {
              if ((inAcPlatforms[i].chunkIdx === this.acn && inAcPlatforms[i].rbTile.chunkIdx !== this.acn+1) || (inAcPlatforms[i].chunkIdx === this.acn-1 && inAcPlatforms[i].rbTile.chunkIdx === this.acn)) {
                  inAcPlatforms[i].lbTile.chunkIdx--; inAcPlatforms[i].rbTile.chunkIdx--;
                  platforms.push(new Platform(inAcPlatforms[i].type, inAcPlatforms[i].chunkIdx-1, inAcPlatforms[i].xTile, inAcPlatforms[i].yTile, inAcPlatforms[i].lbTile, inAcPlatforms[i].rbTile,
                                              inAcPlatforms[i].height, inAcPlatforms[i].vx, inAcPlatforms[i].ts, inAcPlatforms[i].sf, inAcPlatforms[i].map));
                  inAcPlatforms.splice(i, 1); i--;
              } else { inAcPlatforms[i].chunkIdx--; inAcPlatforms[i].lbTile.chunkIdx--; inAcPlatforms[i].rbTile.chunkIdx--; }
          }

          //-----------

          console.log("Map chunks updated - chunkIdx: " + this.chunkIdx);

      }

      if (player.x < this.map[0][0][Math.ceil((this.cxLength-1)*0.75)].x && this.chunkIdx > this.acn-1) {
        this.chunkIdx--;
        this.inAcFrontMap.unshift(this.map[this.acn-1]); // Puts the chunk to be removed from this.map into the inactive front map array
        this.map.pop(); // Removes the last chunk
        this.map.unshift(this.inAcBackMap[this.inAcBackMap.length-1]); // Puts the last chunk in the inactiveb back map array as the first chunk in the this.map array
        this.inAcBackMap.pop(); // Removes the last chunk of the inactive back map that has been moved over to this.map

        // Setting the positions of the new map chunk tiles
        let posReg = this.map[1][0][0].x - (this.cxLength * this.ts);
        for (let i = 0; i < this.cyLength; i++) { // Iterating over the 2d array this.map
          for (let j = 0; j < this.cxLength; j++) {
              // Updates each element in the array to an object containing its original value and sets new positions
              this.map[0][i][j] = { value: this.map[0][i][j].value, x: posReg+(this.ts*j), y: this.map[1][0][0].y + this.ts*i };
          }
        }

        //----------- Enemies

        // Moving active enemies on the chunk that now was made inactive to the inAcEnemies array
        for (let i = 0; i < enemies.length; i++) {
            if (enemies[i].rbTile.chunkIdx === this.acn-1) {
                // Saving it as an object without using the Enemy class
                inAcEnemies.push({chunkIdx: enemies[i].chunkIdx, xTile: enemies[i].xTile, yTile: enemies[i].yTile, lbTile: enemies[i].lbTile, rbTile: enemies[i].rbTile,
                                  g: enemies[i].g, img: enemies[i].img, dir: enemies[i].dir, map: enemies[i].map, ts: enemies[i].ts, sf: enemies[i].sf, type: enemies[i].type, hp: enemies[i].hp});
                enemies.splice(i, 1); // Removes the enemy from the enemies array
                i--;
            } else { enemies[i].chunkIdx++; enemies[i].lbTile.chunkIdx++; enemies[i].rbTile.chunkIdx++; }
        }

        // Moves inactive enemies to be set on the new chunk to the enemies array
        for (let i = 0; i < inAcEnemies.length; i++) {
            if ((inAcEnemies[i].chunkIdx === -1 && inAcEnemies[i].lbTile.chunkIdx !== -2) || (inAcEnemies[i].chunkIdx === 0 && inAcEnemies[i].lbTile.chunkIdx === -1)) {
                inAcEnemies[i].lbTile.chunkIdx++; inAcEnemies[i].rbTile.chunkIdx++;
                // Adds the newly activated enemy to the enemies array and gives it its class
                if (inAcEnemies[i].type === 1) {
                    enemies.unshift(new Gatherer(inAcEnemies[i].chunkIdx+1, inAcEnemies[i].xTile, inAcEnemies[i].yTile, inAcEnemies[i].lbTile, inAcEnemies[i].rbTile,
                                    inAcEnemies[i].g, inAcEnemies[i].img, inAcEnemies[i].dir, inAcEnemies[i].hp, inAcEnemies[i].map, inAcEnemies[i].ts, inAcEnemies[i].sf));
                }
                inAcEnemies.splice(i, 1); // Removes the enemy from the inAcEnemies array
                i--;
            } else { inAcEnemies[i].chunkIdx++; inAcEnemies[i].lbTile.chunkIdx++; inAcEnemies[i].rbTile.chunkIdx++; }
        }

        //----------- Power ups

        // Moving active power ups on the chunk that now was made inactive to the inAcPowerUps array
        for (let i = 0; i < powerUps.length; i++) {
            if (powerUps[i].chunkIdx === this.acn-1) {
                // Saving it as an object without using the PowerUp class
                inAcPowerUps.push({type: powerUps[i].type, chunkIdx: this.acn-1, xTile: powerUps[i].xTile, yTile: powerUps[i].yTile,
                                   size: powerUps[i].size, img: powerUps[i].img, map: powerUps[i].map});
                powerUps.splice(i, 1); // Removes the power up from the powerUps array
                i--;
            } else { powerUps[i].chunkIdx++; }
        }

        // Moves inactive power ups to be set on the new chunk to the powerUps array
        for (let i = 0; i < inAcPowerUps.length; i++) {
            if (inAcPowerUps[i].chunkIdx === -1) {
                // Adds the newly activated power up to the powerUp array and gives it its class
                powerUps.unshift(new PowerUp(inAcPowerUps[i].type, 0, inAcPowerUps[i].xTile, inAcPowerUps[i].yTile,
                                             inAcPowerUps[i].size, inAcPowerUps[i].img, inAcPowerUps[i].map, "bot"));
                inAcPowerUps.splice(i, 1); // Removes the power ups from the inAcPowerUps array
                i--;
            } else { inAcPowerUps[i].chunkIdx++; }
        }

        //----------- Platforms

        // Moving active platforms on the chunk made inactive to inAcPlatforms
        for (let i = 0; i < platforms.length; i++) {
            if (platforms[i].rbTile.chunkIdx === this.acn-1) {
                // Saving it as an object without using a class
                inAcPlatforms.push({type: platforms[i].type, chunkIdx: platforms[i].chunkIdx, xTile: platforms[i].xTile, yTile: platforms[i].yTile, lbTile: platforms[i].lbTile, rbTile: platforms[i].rbTile,
                                    height: platforms[i].height, vx: platforms[i].vx, ts: platforms[i].ts, sf: platforms[i].sf, map: platforms[i].map});
                platforms.splice(i, 1); i--;
             } else { platforms[i].chunkIdx++; platforms[i].lbTile.chunkIdx++; platforms[i].rbTile.chunkIdx++; }
        }

        // Moving inactive platforms onto the newly activated chunk
        for (let i = 0; i < inAcPlatforms.length; i++) {
            if ((inAcPlatforms[i].chunkIdx === -1 && inAcPlatforms[i].lbTile.chunkIdx !== -2) || (inAcPlatforms[i].chunkIdx === 0 && inAcPlatforms[i].lbTile.chunkIdx === -1)) {
                inAcPlatforms[i].lbTile.chunkIdx++; inAcPlatforms[i].rbTile.chunkIdx++;
                platforms.unshift(new Platform(inAcPlatforms[i].type, inAcPlatforms[i].chunkIdx, inAcPlatforms[i].xTile, inAcPlatforms[i].yTile, inAcPlatforms[i].lbTile, inAcPlatforms[i].rbTile,
                                               inAcPlatforms[i].height, inAcPlatforms[i].vx, inAcPlatforms[i].ts, inAcPlatforms[i].sf, inAcPlatforms[i].map));
                inAcPlatforms.splice(i, 1); i--;
            } else { inAcPlatforms[i].chunkIdx++; inAcPlatforms[i].lbTile.chunkIdx++; inAcPlatforms[i].rbTile.chunkIdx++; }
        }

        //-----------

        console.log("Map chunks updated - chunkIdx: " + this.chunkIdx);
      }
  }

  //------------------------------------------------------------------_shiftView

  // Moves the map - shifting the view - when the player is moving
  _shiftView(player, powerUps, enemies, platforms, canvas) {
      // Shifts the view along the x-axis
      this._shiftViewX(player, powerUps, enemies, platforms, canvas);
      // Shifts the view along the y-axis
      this._shiftViewY(player, powerUps, enemies, platforms, canvas);
  }

  //-----------------------------------------------------------------_shiftViewX

  _shiftViewX(player, powerUps, enemies, platforms, canvas) {
      // If the player moves to the right and has reached the point this.rightLim, the map moves to the left instead of the player moving right
      if (player.colX !== "R" && player.x > this.rightLim && this.map[this.map.length-1][0][this.cxLength-1].x + this.ts > canvas.width) {
          player.x = this.rightLim; // Player is moved to the rightLim position so that the maps does not continue moving when the key is not pressed
          this.map.forEach(chunk => { chunk.forEach(row => { row.forEach(tile => { // Moving each tile at the same speed as the player has while running
                tile.x -= player.vx; // Moving the tile
          }); }); });
          powerUps.forEach(powerUp => { powerUp.x = this.map[powerUp.chunkIdx][powerUp.yTile][powerUp.xTile].x; });
          enemies.forEach(enemy => { enemy.x -= player.vx; // Moves the player to the left so not to follow the player
            enemy.leftBorder = this.map[enemy.lbTile.chunkIdx][0][enemy.lbTile.tileIdx].x; enemy.rightBorder = this.map[enemy.rbTile.chunkIdx][0][enemy.rbTile.tileIdx].x;
          });
          platforms.forEach(platform => { platform.x -= player.vx;
              platform.leftBorder = this.map[platform.lbTile.chunkIdx][0][platform.lbTile.tileIdx].x; platform.rightBorder = this.map[platform.rbTile.chunkIdx][0][platform.rbTile.tileIdx].x;
          });
      }

      // If the player moves to the left and has reached the point this.leftLim, the map moves to the right instead of the player moving left
      if (player.colX !== "L" && player.x < this.leftLim && this.map[0][0][0].x < 0) {
          player.x = this.leftLim; // Player is moved to the leftLim position so that the maps does not continue moving when the key is not pressed
          this.map.forEach(chunk => { chunk.forEach(row => { row.forEach(tile => { // Moving each tile at the same speed as the player has while running
              tile.x += player.vx; // Moving the tile
          }); }); });
          powerUps.forEach(powerUp => { powerUp.x = this.map[powerUp.chunkIdx][powerUp.yTile][powerUp.xTile].x; });
          enemies.forEach(enemy => { enemy.x += player.vx; // Moves the player to the right so not to follow the player
            enemy.leftBorder = this.map[enemy.lbTile.chunkIdx][0][enemy.lbTile.tileIdx].x; enemy.rightBorder = this.map[enemy.rbTile.chunkIdx][0][enemy.rbTile.tileIdx].x;
          });
          platforms.forEach(platform => { platform.x += player.vx;
              platform.leftBorder = this.map[platform.lbTile.chunkIdx][0][platform.lbTile.tileIdx].x; platform.rightBorder = this.map[platform.rbTile.chunkIdx][0][platform.rbTile.tileIdx].x;
          });
      }
  }

  //-----------------------------------------------------------------_shiftViewY

  _shiftViewY(player, powerUps, enemies, platforms, canvas) {
      // If the player moves downwards and has reached the point this.bottomLim, the map moves up instead of the player moving down
      if (player.vy <= 0 && player.y >= this.bottomLim && this.map[0][this.cyLength-1][0].y + this.ts > canvas.height) {
          player.y = this.bottomLim; // Player is kept at the bottomLim so not to surpass it causing glitches
          this.map.forEach(chunk => { chunk.forEach(row => { row.forEach(tile => {
              tile.y += player.vy; // Tile moves with the player's vertical speed
          }); }); });
          powerUps.forEach(powerUp => { powerUp.y = this.map[powerUp.chunkIdx][powerUp.yTile][powerUp.xTile].y; });
          enemies.forEach(enemy => { enemy.y += player.vy; }); // Moves the player so not to follow the player
          platforms.forEach(platform => { platform.y = this.map[platform.chunkIdx][platform.yTile][0].y; });
      // If the player moves upwards and has reached the point this.topLim, the map moves down instead of the player moving up
      } else if (player.vy > 0 && player.y <= this.topLim && this.map[0][0][0].y < 0) {
          player.y = this.topLim; // Player is kept at the topLim so not to surpass it causing glitches
          this.map.forEach(chunk => { chunk.forEach(row => { row.forEach(tile => {
              tile.y += player.vy; // Tile moves with the player's vertical speed
          }); }); });
          powerUps.forEach(powerUp => { powerUp.y = this.map[powerUp.chunkIdx][powerUp.yTile][powerUp.xTile].y; });
          enemies.forEach(enemy => { enemy.y += player.vy; }); // Moves the player so not to follow the player
          platforms.forEach(platform => { platform.y = this.map[platform.chunkIdx][platform.yTile][0].y; });
      }

      // Correcting the map positioning in y-direction after it having moved
      if (this.map[0][0][0].y > 0) {
        this.map.forEach(chunk => { chunk.forEach((row, idx) => { row.forEach(tile => {
            // Top tiles are moved to the top of the canvas
            tile.y = this.ts*idx;
        }); }); });
        powerUps.forEach(powerUp => { powerUp.y = this.map[powerUp.chunkIdx][powerUp.yTile][powerUp.xTile].y; });
        // Places the enemy on top of a tile
        enemies.forEach(enemy => { enemy.y = Math.floor(enemy.y/this.ts)*this.ts; });
        platforms.forEach(platform => { platform.y = this.map[platform.chunkIdx][platform.yTile][0].y; });
      } else if (this.map[0][this.cyLength-1][0].y + this.ts < canvas.height) {
        this.map.forEach(chunk => { chunk.forEach((row, idx) => { row.forEach(tile => {
            // Lower tiles are moved to the canvas' bottom
            tile.y = (-chunk.length*this.ts + canvas.height) + this.ts*idx;
        }); }); });
        powerUps.forEach(powerUp => { powerUp.y = this.map[powerUp.chunkIdx][powerUp.yTile][powerUp.xTile].y; });
        // Places the enemy on top of a tile
        enemies.forEach(enemy => { enemy.y = Math.ceil(enemy.y/this.ts)*this.ts; });
        platforms.forEach(platform => { platform.y = this.map[platform.chunkIdx][platform.yTile][0].y; });
      }
  }

  //----------------------------------------------------------------_setPowerUps

  // Sets the power ups by pushing them into the powerUps array
  _setPowerUps(powerUps, inAcPowerUps) {
      // Pushes power ups on this map into the array powerUps
      // new PowerUp(type, chunkIdx, xTile, yTile, size, img, map, canv)

      for (let i = 0; i < this.bluePrintMap.powerUps.length; i++) {
          // The power up is sent to the inAcPowerUps array if it is not on any of the active map chunks
          if (this.bluePrintMap.powerUps[i].chunkIdx < 0 || this.bluePrintMap.powerUps[i].chunkIdx >= this.acn) {
              inAcPowerUps.push({type: this.bluePrintMap.powerUps[i].value, chunkIdx: this.bluePrintMap.powerUps[i].chunkNum, xTile: this.bluePrintMap.powerUps[i].xTile, yTile:  this.bluePrintMap.powerUps[i].yTile,
                                 size: this.ts, img: this.images[2], map: this.map, canv: "bot"});
          } else { // Power ups that are on an active map chunk are set into game by having a class added
              powerUps[i] = new PowerUp(this.bluePrintMap.powerUps[i].value, this.bluePrintMap.powerUps[i].chunkNum, this.bluePrintMap.powerUps[i].xTile, this.bluePrintMap.powerUps[i].yTile,
                                        this.ts, this.images[2], this.map, "bot");
          }
      }
  }

  //-----------------------------------------------------------------_setEnemies

  // Fills the enemies array with enemies according to the current map
  _setEnemies(sf, enemies, inAcEnemies, g) {
      // Pushes enemies on this map into the array enemies
      // new Enemy(chunkIdx, xTile, yTile, lbTile, rbTile, g, img, dir, map, ts, sizeFactor)

      for (let i = 0; i < this.bluePrintMap.enemies.length; i++) {
          // The enemy is sent to the inAcEnemies array if it is not on any of the active map chunks
          if (this.bluePrintMap.enemies[i].chunkIdx > this.acn || this.bluePrintMap.enemies[i].rb.chunkIdx === this.acn) {
              inAcEnemies.push({chunkIdx: this.bluePrintMap.enemies[i].chunkIdx, xTile: this.bluePrintMap.enemies[i].xTile, yTile: this.bluePrintMap.enemies[i].yTile, lbTile: this.bluePrintMap.enemies[i].lb, rbTile: this.bluePrintMap.enemies[i].rb, g: g, img: this.images[3], dir: "left", hp: undefined, map: this.map, ts: this.ts, sf: sf, type: this.bluePrintMap.enemies[i].value});
          } else { // Enemies that are on an active map chunk are set into game by having a class added
              if (this.bluePrintMap.enemies[i].value === 1) {
                  enemies[i] = new Gatherer(this.bluePrintMap.enemies[i].chunkIdx, this.bluePrintMap.enemies[i].xTile, this.bluePrintMap.enemies[i].yTile, this.bluePrintMap.enemies[i].lb, this.bluePrintMap.enemies[i].rb,
                               g, this.images[3], "left", undefined, this.map, this.ts, this.sf);
              }
          }
      }
  }

  //---------------------------------------------------------------_setPlatforms

  _setPlatforms(platforms, inAcPlatforms) {
      // new Platform(type, chunkIdx, xTile, yTile, lbTile, rbTile, height, vx, ts, map)
      platforms.push({type: "greenDino", chunkIdx: 6, xTile: 26, yTile: 11, lbTile: {chunkIdx: 6, tileIdx: 23}, rbTile: {chunkIdx: 6, tileIdx: 32}, height: 9, vx: this.sf, ts: this.ts, sf: this.sf, map: this.map});

      for (let i = 0; i < platforms.length; i++) {
          // The platform is sent to the inAcPlatforms array if it is not on the rendered map
          if (platforms[i].chunkIdx > this.acn || platforms[i].rbTile.chunkIdx === this.acn) {
              inAcPlatforms.push(platforms[i]); platforms.splice(i, 1); i--;
          } else {
              // If the platform is on the rendered map, it will be made into an instance og the Platform
              platforms[i] = new Platform(platforms[i].type, platforms[i].chunkIdx, platforms[i].xTile, platforms[i].yTile, platforms[i].lbTile, platforms[i].rbTile,
                                          platforms[i].height, platforms[i].vx, platforms[i].ts, platforms[i].sf, platforms[i].map);
          }
      }
  }

}
