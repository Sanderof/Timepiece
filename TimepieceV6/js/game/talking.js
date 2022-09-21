
import {drawImg, drawText} from './../libs/drawLib.js';

export default class TextBox {
  constructor(sf, ts, display, images, audioFiles, thisLang) {
    this.sf = sf;
    this.ts = ts;
    this.display = display;
    this.image = images[5];
    this.audioFiles = audioFiles;
    this.txt = thisLang.game.textBox;

    this.boxSpecs = {
      sx: 0,
      sy: 64,
      sw: 256,
      sh: 32,
      x: 0,
      y: this.display.canvas.height-(2*ts),
      w: this.display.canvas.width,
      h: this.ts*2
    }

    this.txtSpecs = {}

    this.txtSpecs.startX   = this.ts/2;
    this.txtSpecs.startY   = this.boxSpecs.y+(this.ts*(2/3)),
    this.txtSpecs.fontSize = 8*sf;
    this.txtSpecs.font     = `${this.txtSpecs.fontSize}px VT323`
    this.txtSpecs.color    = '#ffffff';
    this.txtSpecs.x        = this.txtSpecs.startX;
    this.txtSpecs.y        = this.txtSpecs.startY;
    this.txtSpecs.xBorder  = this.boxSpecs.w-((5/3)*this.ts);
    this.txtSpecs.yBorder  = this.boxSpecs.y+this.boxSpecs.h-(this.ts*2/3);
    // Next icon
    this.txtSpecs.niSX     = 0;
    this.txtSpecs.niSY     = 48;
    this.txtSpecs.niSW     = 16;
    this.txtSpecs.niSH     = 16;
    this.txtSpecs.niX      = this.boxSpecs.w-(this.ts*(4/3)); // Next icon x-position
    this.txtSpecs.niY      = this.boxSpecs.y+this.boxSpecs.h-(this.ts); // Next icon y-position
    this.txtSpecs.niW      = this.ts;
    this.txtSpecs.niH      = this.ts;
    this.txtSpecs.niBlink  = 700; // Blink speed of the next icon

    this.txtTime           = new Date().getTime();
    this.txtSpeed          = 10;
    this.txtIdx            = 0;
    this.startIdx          = 0;
    this.idxStored         = 0;
    this.canNext           = false; // If the one can press the next button to move on in the conversation
  }

  _drawBox() {
    // Drawing the text box
    drawImg(this.display.ctx, this.image, this.boxSpecs.sx, this.boxSpecs.sy, this.boxSpecs.sw, this.boxSpecs.sh, this.boxSpecs.x, this.boxSpecs.y, this.boxSpecs.w, this.boxSpecs.h);
  }

  // Writes the text in the text box at a certain speed, letter by letter
  _writeTxt(time) {
    this.txtSpecs.x = this.txtSpecs.startX;
    this.txtSpecs.y = this.txtSpecs.startY;
    this.canNext = false;
    let txtLastIdx = this.txt[this.txtIdx].length-1;

    let endOfLineReached = (idx, i) => {
      this.txtSpecs.x =  this.txtSpecs.startX;   // x-pos back to start
      this.txtSpecs.y += this.txtSpecs.fontSize; // y-pos one line down
      // If the lower y-border is reached
      if (this.txtSpecs.y >= this.txtSpecs.yBorder) {
        this.idxStored = idx; return this.txt[this.txtIdx].length; // Stores the index of the letter after the white space and ends the loop
      } else { return i; }
    }

    // Writing the letters in a loop
    for (let i = this.startIdx; i < this.txt[this.txtIdx].length; i++) {
      if (time-this.txtTime >= this.txtSpeed*i) {
        drawText(this.display.ctx, this.txtSpecs.x, this.txtSpecs.y, this.txtSpecs.font, this.txt[this.txtIdx][i], this.txtSpecs.color);

       if (this.txtSpecs.x < this.txtSpecs.xBorder) {
          if (this.txt[this.txtIdx][i] === ' ') {

            let cutString = this.txt[this.txtIdx].slice(i+1, this.txt[this.txtIdx].length-1); // Cuts the first part of the string up to this white space
            let sample    = /^\S+\s/.exec(cutString); // Saves the word in addition to the white space after
            // If the word will go past the outer x-border
            if (this.txtSpecs.x+this.display.ctx.measureText(sample).width >= this.txtSpecs.xBorder) { i = endOfLineReached(i+1, i); }
            else { this.txtSpecs.x += this.display.ctx.measureText(this.txt[this.txtIdx][i]).width; } // Moves one space

          } else { this.txtSpecs.x += this.display.ctx.measureText(this.txt[this.txtIdx][i]).width; } // Moves one space
        } else if (this.txtSpecs.x >= this.txtSpecs.xBorder) {
          if (this.txt[this.txtIdx][i+1] === ' ') { i++; } // Not starting a line with white space
          i = endOfLineReached(i, i);
        }
      }
    }

    // All the text has been written or the text box is filled
    if (time-this.txtTime >= this.txtSpeed*txtLastIdx || this.txtSpecs.y >= this.txtSpecs.yBorder) {
      if (this.idxStored === 0) { this.idxStored = txtLastIdx; }
      this.canNext = true;

      // Blinking next icon animation
      if (time-this.txtTime < (this.txtSpeed*this.idxStored)+this.txtSpecs.niBlink) {
        drawImg(this.display.ctx, this.image, this.txtSpecs.niSX, this.txtSpecs.niSY, this.txtSpecs.niSW, this.txtSpecs.niSH, this.txtSpecs.niX, this.txtSpecs.niY, this.txtSpecs.niW, this.txtSpecs.niH);
      } else if (time-this.txtTime >= (this.txtSpeed*this.idxStored)+(this.txtSpecs.niBlink*2)) { this.txtTime += (this.txtSpecs.niBlink*2); }
    }
  }

  // The next button has been pressed
  _next(engine) {
    if (this.txt.length-1 === this.txtIdx) { engine.mode = 'play'; engine._removeTalkListeners(); engine._addPlayListeners(); }
    else if (this.txtSpecs.y >= this.txtSpecs.yBorder) { this.startIdx = this.idxStored; this.canNext = false; this.txtTime = new Date().getTime()-(this.txtSpeed*this.startIdx); this.idxStored = 0; }
    else { this.txtIdx++; this.txtTime = new Date().getTime(); this.startIdx = 0; } // Move on to the next piece of text
  }



}
