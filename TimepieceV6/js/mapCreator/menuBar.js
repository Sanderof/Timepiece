
import {drawFillRect, drawRect, drawImg, drawText} from './../libs/drawLib.js';

export default class MenuBar {
  constructor(canvas, w, h, images, tileSize, sf) {
      this.canvas        = document.getElementById(canvas);
      this.ctx           = this.canvas.getContext('2d');
      this.ts            = tileSize;
      this.sf            = sf;
      this.canvas.width  = w * this.sf;
      this.canvas.height = h * this.sf;

      //--- Operation buffers - right side

      this.quitBuffer   = document.createElement('canvas'); // Canvas for the save button
      this.quitCtx      = this.quitBuffer.getContext('2d');
      this.quitBuffer.width  = this.ts;
      this.quitBuffer.height = this.ts*2;

      this.saveBuffer   = document.createElement('canvas'); // Canvas for the save button
      this.saveCtx      = this.saveBuffer.getContext('2d');
      this.saveBuffer.width = this.saveBuffer.height = this.ts;

      this.optionBuffer   = document.createElement('canvas'); // Canvas for the options button
      this.optionCtx      = this.optionBuffer.getContext('2d');
      this.optionBuffer.width = this.optionBuffer.height = this.ts;

      //--- Select buffers - left side

      this.tileBuffer = document.createElement('canvas');
      this.tileCtx    = this.tileBuffer.getContext('2d');
      this.tileBuffer.width = this.tileBuffer.height = this.ts;

      this.powerUpBuffer = document.createElement('canvas');
      this.powerUpCtx    = this.powerUpBuffer.getContext('2d');
      this.powerUpBuffer.width = this.powerUpBuffer.height = this.ts;

      this.enemyBuffer = document.createElement('canvas');
      this.enemyCtx    = this.enemyBuffer.getContext('2d');
      this.enemyBuffer.width = this.enemyBuffer.height = this.ts;

      this.eraserBuffer = document.createElement('canvas');
      this.eraserCtx    = this.eraserBuffer.getContext('2d');
      this.eraserBuffer.width = this.eraserBuffer.height = this.ts;

      //--- Choice buffer

      this.activeChoiceCat = null;
      this.choiceBuffer    = document.createElement('canvas'); // Canvas for the tile selector
      this.choiceCtx       = this.choiceBuffer.getContext('2d');
      this.choiceBufferX   = this.tileBuffer.width+this.enemyBuffer.width;
      this.choiceBuffer.width  = this.canvas.width-this.saveBuffer.width-this.quitBuffer.width-this.choiceBufferX;
      this.choiceBuffer.height = this.canvas.height;

      this.tileSheet = images[0];
      this.rowLength = this.tileSheet.naturalWidth/16;
      this.colLength = this.tileSheet.naturalHeight/16;
      this.icons        = images[5];
      this.powerUpIcons = images[9];
      this.enemyIcons   = images[10];

      this.saveSx       =  0;
      this.optionSx     = 16;
      this.tileSx       = 32;
      this.quitSx       = 32;
      this.quitSy       = 32;
      this.powerUpSx    = 48;
      this.enemySx      = 64;
      this.eraserSx     = 80;
      this.saveTime     = new Date().getTime()+200;

      this.tiles       = [];
      this.enemies     = [];
      this.powerUps    = [];
      this.tilesMap    = new Map(); // Will contain the tile types' sx, sy and ss values
      this.enemiesMap  = new Map();
      this.powerUpsMap = new Map();

      this.choiceArray = this.tiles;
  }

  // Fills the this.tiles array with information for each tile
  _setTiles() {
      this.tiles = []; this.tilesMap = new Map();

      this.tiles.push({ value: 0, puValue: 0, enemy: {value: 0, lb: 0, rb: 0}, type: null, sx: 0, sy: 0, ss: 0, x: this.sf, y: 0, ts: this.ts, w: this.ts, h: this.ts }); // Empty tile
      this.tilesMap.set(0, { sx: 0, sy: 0, ss: 0 })

      let sx = 0, sy = 0, x = 0, y = 0, w = 0, h = 0; // Values for the first tile
      for (let i = 0; i < this.rowLength*this.colLength; i++) {
        this.tiles.push({ value: i+1, puValue: 0, enemy: {value: 0, lb: 0, rb: 0}, type: null, sx: sx, sy: sy, ss: 16, x: x+this.sf, y: y, ts: this.ts, w: this.ts, h: this.ts }); // Fills the array
        this.tilesMap.set(i+1, { sx: sx, sy: sy, ss: 16 });

        sx += 16; if (sx === this.rowLength*16) { sx = 0; sy += 16; } // Sets x and y value for where to cut the next tile from the image

        if (y === this.ts) { x += (this.ts+this.sf); } y = (y === 0) ? this.ts : 0; // Sets new x and y values on screen
      }
  }

  // Fills the this.powerUps array with information for each powerUp
  _setPowerUps() {
      this.powerUps = []; this.powerUpsMap = new Map();

      let sx = 0, sy = 0, x = 0, y = 0, w = 0, h = 0; // Values for the first tile
      for (let i = 0; i < (this.powerUpIcons.naturalWidth/16)*(this.powerUpIcons.naturalHeight/16); i++) {
          this.powerUps.push({ value: i+1, sx: sx, sy: sy, ss: 16, x: x+this.sf, y: y, ts: this.ts, w: this.ts, h: this.ts }); // Fills the array
          this.powerUpsMap.set(i+1, { sx: sx, sy: sy, ss: 16 });

          sx += 16; if (sx === this.powerUpIcons.naturalWidth) { sx = 0; sy += 16; } // Sets x and y value for where to cut the next tile from the image

          if (y === this.ts) { x += (this.ts+this.sf); } y = (y === 0) ? this.ts : 0; // Sets new x and y values on screen
      }
  }

  // Fills the this.enemies array with information for each enemy
  _setEnemies() {
      this.enemies = []; this.enemiesMap = new Map();

      let sx = 0, sy = 0, x = 0, y = 0, w = 0, h = 0; // Values for the first tile
      for (let i = 0; i < (this.enemyIcons.naturalWidth/20)*(this.enemyIcons.naturalHeight/32); i++) {
          this.enemies.push({ value: i+1, sx: sx, sy: sy, sw: 20, sh: 32, x: x+this.sf, y: 0, w: 20*this.sf, h: 32*this.sf }); // Fills the array
          this.enemiesMap.set(i+1, { sx: sx, sy: sy, sw: 20, sh: 32 });

          sx += 20; if (sx === this.enemyIcons.naturalWidth) { sx = 0; sy += 32; } // Sets x and y value for where to cut the next tile from the image

          x += 21*this.sf; // Sets new x
      }
  }

  //--- Renders the content of the Menu Bar Canvas
  _render(activeTile) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clears the canvas
      drawFillRect(this.ctx, 0, 0, this.canvas.width, this.canvas.height, 'rgb(42, 38, 38)'); // Background color
      drawFillRect(this.choiceCtx, 0, 0, this.choiceBuffer.width, this.choiceBuffer.height, 'rgb(42, 38, 38)'); // Background color

      //-------- Tile Button

      drawImg(this.tileCtx, this.icons, this.tileSx, 16, 16, 16, 0, 0, this.tileBuffer.width, this.tileBuffer.height); // Draws an image tile icon
      this.ctx.drawImage(this.tileBuffer, 0, 0); // Places the tile buffer on top of the main canvas

      //-------- Power Up Button

      drawImg(this.powerUpCtx, this.icons, this.powerUpSx, 16, 16, 16, 0, 0, this.powerUpBuffer.width, this.powerUpBuffer.height);
      this.ctx.drawImage(this.powerUpBuffer, 0, this.tileBuffer.height);

      //-------- Enemy Button

      drawImg(this.enemyCtx, this.icons, this.enemySx, 16, 16, 16, 0, 0, this.enemyBuffer.width, this.enemyBuffer.height);
      this.ctx.drawImage(this.enemyBuffer, this.tileBuffer.width, 0);

      //-------- Eraser Button

      if (activeTile !== 0) {
          drawImg(this.eraserCtx, this.icons, this.eraserSx, 16, 16, 16, 0, 0, this.eraserBuffer.width, this.eraserBuffer.height);
      } else { // Eraser mark is highlighted
          drawImg(this.eraserCtx, this.icons, this.eraserSx, 32, 16, 16, 0, 0, this.eraserBuffer.width, this.eraserBuffer.height);
      }
      this.ctx.drawImage(this.eraserBuffer, this.tileBuffer.width, this.enemyBuffer.height);

      //-------- Choice Buffer - Tiles, Enemies, Power Ups

      if (this.activeChoiceCat === 'tile') {

        this.tiles.forEach(tile => {
            drawImg(this.choiceCtx, this.tileSheet, tile.sx, tile.sy, tile.ss, tile.ss, tile.x, tile.y, tile.ts, tile.ts);
            if (tile.value === activeTile && activeTile !== 0) {
                drawFillRect(this.choiceCtx, tile.x-this.sf, tile.y, this.sf, tile.ts, 'rgb(94, 140, 214)'); // Blue line on left side
                drawFillRect(this.choiceCtx, tile.x+tile.ts, tile.y, this.sf, tile.ts, 'rgb(94, 140, 214)'); // Blue line on right side
            }
        });
      } else if (this.activeChoiceCat === 'powerUp') {

        this.powerUps.forEach(powerUp => {
            drawImg(this.choiceCtx, this.powerUpIcons, powerUp.sx, powerUp.sy, powerUp.ss, powerUp.ss, powerUp.x, powerUp.y, powerUp.ts, powerUp.ts);
            if (powerUp.value === activeTile) {
                drawFillRect(this.choiceCtx, powerUp.x-this.sf, powerUp.y, this.sf, powerUp.ts, 'rgb(94, 140, 214)'); // Blue line on left side
                drawFillRect(this.choiceCtx, powerUp.x+this.ts, powerUp.y, this.sf, powerUp.ts, 'rgb(94, 140, 214)'); // Blue line on right side
            }
        });
      } else if (this.activeChoiceCat === 'enemy') {

        this.enemies.forEach(enemy => {
            drawImg(this.choiceCtx, this.enemyIcons, enemy.sx, enemy.sy, enemy.sw, enemy.sh, enemy.x, enemy.y, enemy.w, enemy.h);
            if (enemy.value === activeTile) {
                drawFillRect(this.choiceCtx, enemy.x-this.sf, enemy.y, this.sf, enemy.h, 'rgb(94, 140, 214)'); // Blue line on left side
                drawFillRect(this.choiceCtx, enemy.x+enemy.w, enemy.y, this.sf, enemy.h, 'rgb(94, 140, 214)'); // Blue line on right side
            }
        });
      }

      this.ctx.drawImage(this.choiceBuffer, this.choiceBufferX, 0); // Places the choice buffer on the main canvas

      //-------- Save button

      drawImg(this.saveCtx, this.icons, this.saveSx, 16, 16, 16, 0, 0, this.saveBuffer.width, this.saveBuffer.height); // Draws an image of a floppy disk on the save buffer
      this.ctx.drawImage(this.saveBuffer, this.canvas.width-this.saveBuffer.width-this.quitBuffer.width, 0);   // Places the save buffer on top of the main canvas

      //-------- Options button

      drawImg(this.optionCtx, this.icons, this.optionSx, 16, 16, 16, 0, 0, this.optionBuffer.width, this.optionBuffer.height); // Draws an image of a gear on the option buffer
      this.ctx.drawImage(this.optionBuffer, this.canvas.width-this.optionBuffer.width-this.quitBuffer.width, this.saveBuffer.height);   // Places the option buffer on top of the main canvas

      //-------- Quit button

      drawImg(this.quitCtx, this.icons, this.quitSx, this.quitSy, 16, 32, 0, 0, this.quitBuffer.width, this.quitBuffer.height); // Draws an image of a door on the quit buffer
      this.ctx.drawImage(this.quitBuffer, this.canvas.width-this.quitBuffer.width, 0);   // Places the quit buffer on top of the main canvas
  }
}
