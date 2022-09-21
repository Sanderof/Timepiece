/**/

import {drawFillRect, drawImg, drawText} from './../libs/drawLib.js';

export default class Display {
  constructor(canvas, context, w, h, map, tileSize, sf, images, thisLang) {
    this.canvas = document.getElementById(canvas);
    this.ctx = this.canvas.getContext(context);
    this.canvas.width = w * sf; // Creates a canvas with proportions that works with the device's resolution
    this.canvas.height = h * sf; // This allows for crisp pixel art, because the computer doesn't need to place new pixel's to make it work
    this.map = map;
    this.tileSize = tileSize;
    this.sf = sf;
    this.images = images; // (map, player, power up, enemy, bar)
    this.tileSheet = images[0];
    this.colLength = this.tileSheet.naturalHeight/16; // Number of columns in the tile sheet
    this.rowLength = this.tileSheet.naturalWidth/16;  // Number of rows in the tile sheet
    this.thisLang = thisLang.game; // Active language

    this.bTxtYT = (this.canvas.height/4)+((12*this.sf)/3); // The y-value of the text on the menu bar canvas
    this.bTxtYB = 3*(this.canvas.height/4)+((12*this.sf)/3); // The y-value of the text on the menu bar canvas
    this.fistsX = this.canvas.width-(15*this.sf); // X-position of the fist icon
    this.meleeX = this.canvas.width-(30*this.sf); // X-position of the melee icons
    this.rangeX = this.canvas.width-(45*this.sf); // X-position of the long range weapon icons
    this.ammoX = this.canvas.width-(55*this.sf); // X-position of the ammo text for long range weapons
    this.timePosX = 201.6*this.sf;

    this.VT323_12 = `${12*this.sf}px VT323`; // Font
  }

   //-------------------------------------------------------------------_drawMap

   //--- Draws the map by utilizing the information in the array game.map
  _drawMap(time) {
    drawFillRect(this.ctx, 0, 0, this.canvas.width, this.canvas.height, "lightblue"); // Blue background to form the sky
    // Loops through the map and draws every tile according to their value and position
    this.map.forEach((chunk, idx) => {
      chunk.forEach(row => {
        row.forEach(tile => {
          let x = 0; let y = 0;
          for (let i = 1; i <= (this.colLength*this.rowLength); i++) {
              if (tile.value === i) {
                  drawImg(this.ctx, this.tileSheet, x*16, y*16, 16, 16, tile.x, tile.y, this.tileSize, this.tileSize);
                  break;
              }
              x++; if (x >= this.rowLength) { y++; x = 0; }
          }
        });
      });
    });
  }

  //----------------------------------------------------------------_drawMenuBar

  // Draw the content of the menu bar on the upper canvas
  _drawMenuBar(player, time, initTime) {
    drawFillRect(this.ctx, 0, 0, this.canvas.width, this.canvas.height, "#292b30"); // Background color

    //--- Player profile
    this._playerProfile(player);

    //--- Experience point bar
    this._expRender(player);

    //--- Health bar
    this._healthBarRendering(player);

    //--- Time tracking
    this._timeTracking(time, initTime);

    //--- Weapon icons
    this._weaponIcons(player);

    //--- Balance (Gem)
    this._balanceRendering(player);

  }

  //------------------------------------------------------------------_expRender

  // Renders the experience point bar
  _expRender(player) {
      let regX = player.exp.toString().length+player.lvlExpReq.toString().length+1; // Gets number of digits/characters in the text
      drawText(this.ctx, (this.canvas.width/2)-((46+(regX*3.2))*this.sf), this.bTxtYT-(1*this.sf), `${9*this.sf}px VT323`, `${player.exp}/${player.lvlExpReq}`, "#ffffff"); // Renders the level
      drawImg(this.ctx, this.images[4], 0, 12, 96, 12, (this.canvas.width/2)-(40*this.sf), 2*this.sf, 96*this.sf, 12*this.sf); // Draws the empty experience bar
      drawImg(this.ctx, this.images[4], 0, 0, Math.ceil(96*(player.exp/player.lvlExpReq)), 12, (this.canvas.width/2)-(40*this.sf), 2*this.sf, Math.ceil((96*this.sf)*(player.exp/player.lvlExpReq)), 12*this.sf); // Draws part of the colored exp bar over the empty

  }

  //--------------------------------------------------------------_playerProfile

  // Renders the icon (head) of the player and its name in the left cornor
  _playerProfile(player) {
    drawText(this.ctx, 5*this.sf, this.bTxtYT, this.VT323_12, `${this.thisLang.menuBar[0]} ${player.level}`, "#ffffff"); // Shows the player's current level
    drawImg(this.ctx, player.img, 0, 1, 20, 16, 2*this.sf, this.canvas.height/2, 20*this.sf, 16*this.sf); // Draws player's head in the left cornor
    drawText(this.ctx, 23*this.sf, this.bTxtYB, this.VT323_12, player.name, "#ffffff"); // Shows the player's name
  }

  //---------------------------------------------------------_healthBarRendering

  // Renders the health bar and updates it as the player loses hp
  _healthBarRendering(player) {
    drawImg(this.ctx, this.images[4], 0, 24, 112, 12, (this.canvas.width/2)-(56*this.sf), (this.canvas.height/2)+2*this.sf, 112*this.sf, 12*this.sf); // Draws an empty health bar with a heart
    drawImg(this.ctx, this.images[4], 0, 36, Math.ceil(112*(player.hp/player.maxHp)), 12, (this.canvas.width/2)-(56*this.sf), (this.canvas.height/2)+2*this.sf, Math.ceil((112*this.sf)*(player.hp/player.maxHp)), 12*this.sf); // Draws part og the colored health bar

  }

  //---------------------------------------------------------------_timeTracking

  // Keeps track of the time spent on the current map and converts it into seconds and minutes to render it
  _timeTracking(time, initTime) {
    let mapTime = time - initTime; // The actual time in milliseconds
    let mapSec = (mapTime/1000).toFixed(0); // Converting from milliseconds to seconds, keeping no decimals
    let mapMin = Math.floor(mapSec/60); // Converting from seconds to minutes
    mapSec = mapSec-(mapMin*60); // Restarting the counting of seconds after each time a new minute has passed

    // Includes 0 in front of the numbers when they are lower than 10
    if (mapSec < 10 && mapMin < 10) {
       // Draws the time on to the canvas, showing minutes and seconds
      drawText(this.ctx, this.timePosX, this.bTxtYT, this.VT323_12, '0'+mapMin+'.0'+mapSec, "#ffffff");
    } else if (mapMin < 10 && mapSec >= 10) {
       drawText(this.ctx, this.timePosX, this.bTxtYT, this.VT323_12, '0'+mapMin+'.'+mapSec, "#ffffff");
    } else if (mapMin >= 10 && mapSec < 10) {
       drawText(this.ctx, this.timePosX, this.bTxtYT, this.VT323_12, mapMin+'.0'+mapSec, "#ffffff");
    } else {
       drawText(this.ctx, this.timePosX, this.bTxtYT, this.VT323_12, mapMin+'.'+mapSec, "#ffffff");
    }
  }

  //----------------------------------------------------------------_weaponIcons

  // Renders the icons that show which weapons are available, ammunition and which is the active one
  _weaponIcons(player) {
      let fieldX; // Will hold the x-position of a grey field surrounding the active weapon's icon
      // Regulates the y-position of the icons when activated and not
      let yRegF = 0; // Fists/Hand combat
      let yRegM = 0; // Melee
      let yRegR = 0; // Range

      // Checks what weapon is active and sets the grey field's x-position
      if (player.acWeapon.type === player.weapons[0].type) { fieldX = this.fistsX; yRegF = this.sf; }
      else if (player.acWeapon.type === player.weapons[1].type) { fieldX = this.meleeX; yRegM = this.sf; }
      else if (player.acWeapon.type === player.weapons[2].type) { fieldX = this.rangeX; yRegR = this.sf; }

      // Grey field to surround the weapon icon to show which one is active
      drawImg(this.ctx, this.images[5], 0, 0, 16, 16, fieldX, (this.canvas.height/2)+1*this.sf, 14*this.sf, 14*this.sf);

      // Fists/Hand combat
      drawImg(this.ctx, this.images[5], 16, 0, 16, 16, this.fistsX, (this.canvas.height/2)+yRegF, 14*this.sf, 14*this.sf);

      // Melee weapon
      switch (player.weapons[1].type) {
          case 4: // Wooden club
            drawImg(this.ctx, this.images[5], 32, 0, 16, 16, this.meleeX, (this.canvas.height/2)+yRegM, 14*this.sf, 14*this.sf);
          break;
      }

      // Long range weapons
      switch (player.weapons[2].type) {
          case 5: // Pistol
            drawImg(this.ctx, this.images[5], 48, 0, 16, 16, this.rangeX, (this.canvas.height/2)+yRegR, 14*this.sf, 14*this.sf);
            drawText(this.ctx, this.ammoX, this.bTxtYB-2*this.sf, `${10*this.sf}px VT323`, player.weapons[2].ammo, "#ffffff");
          break;
      }

      if (player.acWeapon.type === player.weapons[1].type) {
          if (player.weapons[1].hp < player.weapons[1].maxHp && player.weapons[1].hp > 0) { // The weapon has taken damage
              drawImg(this.ctx, this.images[4],  0, 51,  22, 5, this.meleeX,              this.canvas.height-(3*this.sf),                                                     14*this.sf, 2*this.sf);
              drawImg(this.ctx, this.images[4], 44, 51, -22, 5, this.meleeX+(14*this.sf), this.canvas.height-(3*this.sf), -(1-(player.weapons[1].hp/player.weapons[1].maxHp))*14*this.sf, 2*this.sf);
          } else if (player.weapons[1].hp <= 0) { // Weapon is broken
              player.acWeapon = player.weapons[0]; // Changes back to fists
              player.weapons[1] = {type: null, dmg: 0, maxHp: 0, hp: 0, cat: "melee"};
          }
      }
  }

  //-----------------------------------------------------------_balanceRendering

  // Renders a spinning gem and the player's balance (worth of gems) in the right cornor
  _balanceRendering(player) {
    let balPos; // Decides the text's distance from the spinning gem
    if (player.balance < 10) { balPos = 4*this.sf; } // One digits can be closer to the gem
    else if (player.balance >= 10 && player.balance < 100) { balPos = 8*this.sf; } // Two digits must be moved further away in order to not be drawn over the gem
    else { balPos = 12*this.sf; }

    // Types the balace number next to the spinning gem
    drawText(this.ctx, (this.sf*240)-balPos, this.bTxtYT, this.VT323_12, player.balance, "#ffffff");
  }


}
