
import {drawFillRect, drawRect, drawStrokeRect, drawImg, drawText, drawCenteredText} from './../libs/drawLib.js';

export default class MapMaker {
  constructor(canvas, w, h, tileSize, sf, images, menuBar, thisLang) {
      this.canvas        = document.getElementById('canvas');
      this.ctx           = this.canvas.getContext('2d');
      this.ts            = tileSize;
      this.sf            = sf;
      this.canvas.width  = w * this.sf;
      this.canvas.height = h * this.sf;
      this.tileSheet     = images[0];
      this.icons         = images[5];
      this.powerUpIcons  = images[9];
      this.enemyIcons    = images[10];
      this.thisLang      = thisLang;

      // Pixel ratio between canvas and the webpage
      this.pxRatio = this.canvas.width/this.canvas.getBoundingClientRect().width;


      this.chunkNum     =  3; // Number of chunks that the map will consist of
      this.chunkLength  = 33; // Tiles in the x-direction in each chunk
      this.chunkMax     =  8; // Maximum amount of chunks that is possible
      this.chunkMin     =  3; // Minimum amount of chunks that is possible
      this.colLength    = 20; // Tiles in the y-direction
      this.temChunkNum  = this.chunkNum;  // Temporary chunk number
      this.temColLength = this.colLength; // Temporary column length
      this.colMax       = 40; // Maximum amount of tiles in the y-direction
      this.colMin       = 10; // Minimum amount of tiles in the y-direction
      this.map          = []; // The map array

      this.popUpBox = {
          x: this.canvas.width/5,
          y: this.canvas.height/8,
          w: this.canvas.width*(3/5),
          h: this.canvas.height*(5/8),
          type: null
      }

      this.headline = {
          x:   this.popUpBox.x+(this.popUpBox.w/2),
          fs:  13*this.sf,
          txt: null
      }

      this.opBoxes = {
          itx: this.popUpBox.x+60, // Instruction text x-value
          cny: this.popUpBox.y+(this.popUpBox.w*(3/20)),
          cly: this.popUpBox.y+(this.popUpBox.w*(6/20)),
          s:   13*this.sf,
          lw:  this.sf/2,
          fs:  12*this.sf
      }

      this.csBtns = { // Cancel and save buttons
          cx:  this.popUpBox.x+(this.popUpBox.w/10),   // Cancel button x
          y:   this.popUpBox.y+(this.popUpBox.h*(3/4)),
          w:   (this.popUpBox.w/3)+4*this.sf,
          h:   this.popUpBox.h/6,
          fs:  12*this.sf,
          bcc: 'orange',
          bcs: 'orange'
      }

      this.headline.y   = this.popUpBox.y+this.headline.fs;         // y-value for the headline

      this.opBoxes.x    = this.headline.x-(this.opBoxes.s/2);       // x-value for the box
      this.opBoxes.tx   = this.opBoxes.x+(this.opBoxes.s/2);        // x-value for the text inside the box
      this.opBoxes.cnty = this.opBoxes.cny+(this.opBoxes.fs*(5/6)); // y-value for the text in the chunkNum box
      this.opBoxes.clty = this.opBoxes.cly+(this.opBoxes.fs*(5/6)); // y-value for the text in the colLength box
      this.opBoxes.lax  = this.opBoxes.x-(this.opBoxes.s*1.5);      // x-value for the left arrow
      this.opBoxes.rax  = this.opBoxes.x+(this.opBoxes.s*1.5);      // x-value for the right arrow

      this.csBtns.tcx =                       this.csBtns.cx+(this.csBtns.w/2); // x-position of the cancel text
      this.csBtns.ty =      this.csBtns.y+(this.csBtns.h/2)+(this.csBtns.fs/3); // y-position of the text
      this.csBtns.sx  = this.popUpBox.x+(this.popUpBox.w*(9/10))-this.csBtns.w; // Save button x
      this.csBtns.tsx =                       this.csBtns.sx+(this.csBtns.w/2); // x-position of the save text

      this.nameInp   = document.createElement('input');
      this.chunkInp  = document.createElement('input');
      this.heightInp = document.createElement('input');
  }

  // Styling and positioning the input field
  _styleInputFields(menuBar) {

      // Save input
      this.nameInp.style.position = 'absolute';
      this.nameInp.style.margin = '0';

      let inpWidth = this.popUpBox.w*(9/20);
      this.nameInp.style.width       = `${inpWidth}px`;
      this.nameInp.style.height      = `${this.sf*10}px`;
      this.nameInp.style.marginLeft  = `${((this.popUpBox.x+(this.popUpBox.w/2))/this.pxRatio)-(inpWidth/2)-8}px`;
      this.nameInp.style.marginTop   = `${(menuBar.canvas.height+this.popUpBox.y+this.popUpBox.h*(1/3))/this.pxRatio}px`;
      this.nameInp.style.paddingLeft = '14px';

      this.nameInp.style.outline         = 'none';
      this.nameInp.style.border          = '2px orange solid';
      this.nameInp.style.borderRadius    = '10px';
      this.nameInp.style.backgroundColor = 'transparent';
      this.nameInp.style.color           = 'white';
      this.nameInp.style.fontSize        = '30px';
      this.nameInp.style.fontFamily      = 'VT323';
      this.nameInp.placeholder           = this.thisLang.mapCreator[1];

      document.getElementById('canvasWrapper').appendChild(this.nameInp); // Appends input field to the document body
  }

  //--------------------------------------------------------------------_setGrid

  //--- Makes a grid that covers the whole map
  _setGrid() {
      this.map = [];

      // Fills the map array with empty tiles
      for (let i = 0; i < this.colLength; i++) {
        this.map.push([]);
          for (let j = 0; j < this.chunkNum*this.chunkLength; j++) {
              this.map[i].push({ value: 0, puValue: 0, enemy: {value: 0, lb: 0, rb: 0}, type: null, x: j*this.ts, y: i*this.ts });
          }
      }
  }

  //------------------------------------------------------------------_renderMap

  _renderMap(tilesMap, powerUpsMap, enemiesMap, context) {
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      let cutCoT; // Cut coordinates tile
      let cutCoP; // Cut coordinates power up
      drawFillRect(context, 0, 0, this.canvas.width, this.canvas.height, 'lightblue');

      this.map.forEach(col => { col.forEach(tile => {
          cutCoT = tilesMap.get(tile.value);
          drawImg(context, this.tileSheet, cutCoT.sx, cutCoT.sy, cutCoT.ss, cutCoT.ss, tile.x, tile.y, this.ts, this.ts);

          // Placing power Up over tile, if there is a power up
          if (tile.puValue !== 0) {
              cutCoP = powerUpsMap.get(tile.puValue);

              drawImg(context, this.powerUpIcons, cutCoP.sx, cutCoP.sy, cutCoP.ss, cutCoP.ss, tile.x, tile.y, this.ts, this.ts);
          }

          // Placing enemy over tile, if there is an enemy
          if (tile.enemy.value !== 0) {
              cutCoP = enemiesMap.get(tile.enemy.value);

              drawImg(context, this.enemyIcons, cutCoP.sx, cutCoP.sy, cutCoP.sw, cutCoP.sh, tile.x, tile.y, 20*this.sf, 32*this.sf);
          }
      }); });

      this.nameInp.style.display = 'none'; // Makes the input field disappear
  }

  //----------------------------------------------------------------_renderPopUp

  //--- Renders a pop up when the save button is clicked
  _renderPopUp() {
      // Rectangle for the pop-up box
      drawFillRect(this.ctx, this.popUpBox.x, this.popUpBox.y, this.popUpBox.w, this.popUpBox.h, 'rgb(45, 47, 52)');  // Rectangle on the screen
      drawStrokeRect(this.ctx, this.popUpBox.x, this.popUpBox.y, this.popUpBox.w, this.popUpBox.h, 'orange', this.sf); // Border around rectangle

      drawCenteredText(this.ctx, this.headline.x, this.headline.y, `${this.headline.fs}px VT323`, this.headline.txt, 'white'); // Draws a headline

      // Cancel button
      drawFillRect(this.ctx, this.csBtns.cx, this.csBtns.y, this.csBtns.w, this.csBtns.h, 'rgb(45, 47, 52)');  // Rectangle on the screen
      drawStrokeRect(this.ctx, this.csBtns.cx, this.csBtns.y, this.csBtns.w, this.csBtns.h, this.csBtns.bcc, this.sf/2); // Border around rectangle
      drawCenteredText(this.ctx, this.csBtns.tcx, this.csBtns.ty, `${this.csBtns.fs}px VT323`, this.thisLang.mapCreator[2], 'white'); // Cancel text

      // Save button
      drawFillRect(this.ctx, this.csBtns.sx, this.csBtns.y, this.csBtns.w, this.csBtns.h, 'rgb(45, 47, 52)');  // Rectangle on the screen
      drawStrokeRect(this.ctx, this.csBtns.sx, this.csBtns.y, this.csBtns.w, this.csBtns.h, this.csBtns.bcs, this.sf/2); // Border around rectangle
      drawCenteredText(this.ctx, this.csBtns.tsx, this.csBtns.ty, `${this.csBtns.fs}px VT323`, this.thisLang.mapCreator[3], 'white'); // Save map text

      // If the save button was clicked, the pop up will show the name input field
      if        (this.popUpBox.type === "saveMap") {
          this.nameInp.style.display = 'initial';
      } else if (this.popUpBox.type === "options") {
          // Chunk Number Regulator
          drawText(this.ctx, this.opBoxes.itx, this.opBoxes.cnty, `${this.opBoxes.fs}px VT323`, this.thisLang.mapCreator[5], 'white'); // Instruction text
          drawStrokeRect(this.ctx, this.opBoxes.x, this.opBoxes.cny, this.opBoxes.s, this.opBoxes.s, 'orange', this.opBoxes.lw);
          drawCenteredText(this.ctx, this.opBoxes.tx, this.opBoxes.cnty, `${this.opBoxes.fs}px VT323`, this.temChunkNum, 'white');
          drawImg(this.ctx, this.icons,  0, 32, 16, 16, this.opBoxes.lax, this.opBoxes.cny, this.opBoxes.s, this.opBoxes.s); // Left arrow
          drawImg(this.ctx, this.icons, 16, 32, 16, 16, this.opBoxes.rax, this.opBoxes.cny, this.opBoxes.s, this.opBoxes.s); // Right arrow

          // Column Length Regulator
          drawText(this.ctx, this.opBoxes.itx, this.opBoxes.clty, `${this.opBoxes.fs}px VT323`, this.thisLang.mapCreator[6], 'white'); // Instruction text
          drawStrokeRect(this.ctx, this.opBoxes.x, this.opBoxes.cly, this.opBoxes.s, this.opBoxes.s, 'orange', this.opBoxes.lw);
          drawCenteredText(this.ctx, this.opBoxes.tx, this.opBoxes.clty, `${this.opBoxes.fs}px VT323`, this.temColLength, 'white');
          drawImg(this.ctx, this.icons,  0, 32, 16, 16, this.opBoxes.lax, this.opBoxes.cly, this.opBoxes.s, this.opBoxes.s); // Left arrow
          drawImg(this.ctx, this.icons, 16, 32, 16, 16, this.opBoxes.rax, this.opBoxes.cly, this.opBoxes.s, this.opBoxes.s); // Right arrow


      }
  }

  //------------------------------------------------------------_createMapImage

  // Draws the map on a new canvas and return the image shown on the canvas's data in the form of a base64 string
  _createMapImage(tilesMap, powerUpsMap, enemiesMap) {
      const imgCanvas  = document.createElement('canvas');
      const imgCtx     = imgCanvas.getContext('2d');
      imgCanvas.width  = this.canvas.width;
      imgCanvas.height = this.canvas.height;

      this._renderMap(tilesMap, powerUpsMap, enemiesMap, imgCtx);

      return imgCanvas.toDataURL();
  }
}
