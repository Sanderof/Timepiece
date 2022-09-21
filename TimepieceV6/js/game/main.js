
/*
  main.js
*/

// Importing custom modules
// - In order to import modules: Use Firefox || Start node server by navigating to the correct directory in terminal and type in npm start

import mainMenu   from './../mainMenu/mainMenu.js';
import mapCreator from './../mapCreator/mapCreator.js';
import {gameMenu} from './gameMenu.js';
import TextBox    from './talking.js';

import Display    from './display.js';
import Game       from    './game.js';
import Player     from  './player.js';
import PowerUp    from './powerUp.js';
import {Gatherer} from   './enemy.js';
import Engine     from  './engine.js';

//--- Runs the function when the window has finished loading
window.onload = init;

//--- Contains the code for the main menu screen
function init() {
  const sf           = 5;     // The number to multiply the original size values with
  const ts           = 16*sf; // Size of each tile on the screen
  const canvasWidth  = 256; const canvasHeight = 160;

  WebFont.load({ // Loads fonts from google
    google: { families: ['VT323'] },
    active: function () { mainMenu(sf, ts, canvasWidth, canvasHeight, null); } // Fires when all fonts are loaded and rendered
  });
}

//--------------------------------------------------------------------- gameMain

export function gameMain(sf, ts, thisLang, mapName, images, audioFiles, textBox) {

  //------------------------------------------------------------------ Variables

  let time; // Continuously updating the time
  let keyCodes = { // Object that contains the key codes for pressed keys on the keyboard
    right:       68,
    left:        65,
    up:          87,
    down:        83,
    jump:        32,
    attack:      79,
    rangeWeapon: 49,
    meleeWeapon: 50,
    fists:       51,
    menu:        27,
    next:        13
  }

  let game; let displayBar; let display; let player; let menuGem; // Objects
  // powerUps handles power ups in the game e.g. gems for currency and health gains - It is an array so that multiple power ups can be put forth at once
  // Empty array for in-game power ups - inAcPowerUps contains inactive powerUps that's not on the active map chunks
  let powerUps = []; let inAcPowerUps = [];
  // enemies is an array that contains all enemy objects. inAcEnemies contains inactive enemies
  let enemies = []; let inAcEnemies = [];
  // platforms contains moving platforms on the map
  let platforms = []; let inAcPlatforms = [];

  //------------------------------------------------------------------ Functions

  // Runs when a key on the keyboard is pressed or released
  let keyPressed = function(evt) {
    switch (evt.type) { // Checks if the key is pressed or released
      case "keydown":
        if      (evt.keyCode === keyCodes.right)  { player.activeDir    = "right"; } // Moves to the right
        else if (evt.keyCode === keyCodes.left)   { player.activeDir    = "left";  } // Moves to the left
        else if (evt.keyCode === keyCodes.jump)   { player.jumpActive   = true;    } // Starts a jump
        else if (evt.keyCode === keyCodes.attack) { player.attackActive = true;    } // Starts an attack either on the ground or in the air
        else if (evt.keyCode === keyCodes.up)     { player.climbDir     = 'up';    } // Sets climb direction up
        else if (evt.keyCode === keyCodes.down)   { player.climbDir     = 'down';  } // Sets climb direction down
        // Weapon cycling
        else if (evt.keyCode === keyCodes.fists)  { player.acWeapon = player.weapons[0]; } // Sets fists as the active weapon
        else if (evt.keyCode === keyCodes.meleeWeapon && player.weapons[1].type !== null) { // Sets the melee weapon as the active weapon
                 player.acWeapon = player.weapons[1];
        } else if (evt.keyCode === keyCodes.rangeWeapon && player.weapons[2].type !== null) { // Sets the range weapon as the active weapon
                 player.acWeapon = player.weapons[2];
        }
        else if (evt.keyCode === keyCodes.menu) {  // Game menu
          player.activeDir = null; player.jumpActive = false;
          gameMenu(engine, keyPressed, display.canvas, display.ctx, displayBar.canvas, displayBar.ctx, sf, ts, images, audioFiles, thisLang, player, enemies, mapName);
        }
        break;
      case "keyup":
        if      ((evt.keyCode === keyCodes.right && player.activeDir !== "left") || (evt.keyCode === keyCodes.left && player.activeDir !== "right")) { player.activeDir = null; } // Deactivates movement
        else if ((evt.keyCode === keyCodes.up    && player.climbDir === 'up')    || (evt.keyCode === keyCodes.down && player.climbDir === 'down'))   { player.climbDir = null;  } // Deactivates climbing
        else if (evt.keyCode === keyCodes.jump) { player.jumpActive = false; } // Deactivates the jumpActive
        break;
    }
  }

  // Event handler when the talk mode is active
  let talkKeyPressed = function(evt) {
    switch (evt.type) {
      case 'keydown':
        if (evt.keyCode === keyCodes.menu) {  // Game menu
          gameMenu(engine, talkKeyPressed, display.canvas, display.ctx, displayBar.canvas, displayBar.ctx, sf, ts, images, audioFiles, thisLang, player, enemies, mapName);
        } else if (evt.keyCode === keyCodes.next && textBox.canNext) { textBox._next(engine); }
      break;
      case 'keyup':

      break;
    }
  }

  // Loops continuously and renders what should be rendered on the screen
  let render = function() {
      time = new Date().getTime(); // Updating the time

      //--- Draw
      // Menubar canvas
      displayBar._drawMenuBar(player, time, engine.initTime); // Drawing the menu bar
      menuGem._draw(displayBar, time);                        // Draws a spinning gem in the menu

      // Game canvas
      display._drawMap(time);                 // Drawing the map
      player._draw(display, time, platforms); // Drawing the player
      player.projectiles.forEach(projectile => { projectile._draw(); });                                    // Drawing projectiles
      platforms.forEach(platform => { platform._draw(display, images[6]); });                               // Drawing the platforms
      powerUps.forEach(powerUp =>   { powerUp._draw(display, time); });                                     // Drawing the power ups
      enemies.forEach(enemy =>      { enemy._draw(display, time); enemy._drawHpbar(display, images[4]); }); // Drawing the enemies

      game._regulateChunks(player, enemies, inAcEnemies, powerUps, inAcPowerUps, platforms, inAcPlatforms);

      // Update
      update();

      // Talking
      if (engine.mode === 'talk') {
        textBox._drawBox();
        textBox._writeTxt(time);
      }


      // Loops the this function at ideally 60 fps
      engine.animationFrameRequest = requestAnimationFrame(render);

      // Checks if the player stands on a finish tile
      if (player._collisionFinishPoint()) {
        displayBar.ctx.clearRect(0, 0, displayBar.canvas.width, displayBar.canvas.height); // Clears upper canvas
        engine._stop(keyPressed); mainMenu(sf, ts, canvas.width/sf, canvas.height/sf, thisLang);
      }
  };

  // Updates all necessary elements of the game
  let update = function() {
      player._collisionX();          // Checks player collision - x-axis
      player._move(time, platforms); // Player movement
      player._gravity(platforms);    // Gravity working on player
      platforms.forEach(platform => { platform._move(player); });
      player.projectiles.forEach((projectile, idx) => {
        projectile._move(); projectile._collisionObst(player.projectiles, idx);
        enemies.forEach(enemy => { projectile._collisionEnemy(player.projectiles, idx, enemy, player); });
      });

      enemies.forEach((enemy, idx, arr) => {
        if (engine.mode === 'play') {
          enemy._move(player, time); enemy._attack(player, time); enemy._attacked(player, time); enemy._collisionPlayer(player);
        }
        enemy._gravity();
        // If enemy is killed
        if (enemy.hp <= 0) {
          game.map.forEach((chunk, chIdx) => { chunk.forEach((column, coIdx) => { column.forEach((tile, tIdx) => {
              if (Math.floor(enemy.y/ts)+1 === Math.floor(tile.y/ts) &&
                  Math.floor(enemy.x/ts) === Math.floor(tile.x/ts)) {
                  if (player.hp < player.maxHp*0.4) { // Drops a health cross if the player's health is below 40%
                      powerUps.push(new PowerUp(3, chIdx, tIdx, coIdx, ts, images[2], game.map, "bot"));
                  } else { // Drops emerald worth 1 if health is over 40%
                      powerUps.push(new PowerUp(1, chIdx, tIdx, coIdx, ts, images[2], game.map, "bot"));
                  }
              }
          }); }); });
          arr.splice(idx, 1); // Removes enemy from array
          player.exp += enemy.expInc; player._leveling(); // player gains exp and checks if it should level up
        }
      });

      // Player collects a power up
      powerUps.forEach((powerUp, idx) => { powerUp._collect(idx, player, powerUps, game.map, audioFiles[0]); });

      // Changes the menu gem according to the balance
      if      (player.balace < 5)   { menuGem.type = 1; } // Less than 5 makes for an emerald
      else if (player.balance >= 5) { menuGem.type = 2; } // 5 or more makes for a ruby

      game._shiftView(player, powerUps, enemies, platforms, display.canvas); // Shift the map view when moving

  }

  //-------------------------------------------------------------------- setValues

  let setValues = function(mapFile) {
      // game handles the game mechanics
      // new Game(tileSize, rightLim, leftLim, topLim, bottomLim, sf, images, audioFiles, map)
      game = new Game(ts, ts*9, ts*6, ts*5, ts*6, sf, images, audioFiles, mapFile);

      // Set the maps value and position
      game._setMapValues();

      game._setPowerUps(powerUps, inAcPowerUps);

      // displayBar handles the upper canvas, the menubar, and what is displayed on it
      displayBar = new Display("barCanvas", "2d", 256, 32, game.map, ts, sf, images, thisLang);
      // display handles the lower canvas, the game window, and what is displayed on it
      display = new Display("canvas", "2d", 256, 160, game.map, ts, sf, images, thisLang);
      // player is the player which is controlled by the user
      // new Player(x, y, w, h, name, img, dir, vx, cvy, g, jf, idleS, runS, bendS, attackS, hurtS, map, tileSize, sf, rightLim, leftLim, canvas)
      player = new Player(ts*2, ts*2, 20*sf, 32*sf, "Vincenzo", images[1], "right", 1.8*sf, sf, game.g, 4.6*sf, 250, 100, 80, 150, 300, 300,
                          game.map, ts, sf, game.rightLim, game.leftLim, game.topLim, game.bottomLim, display.canvas);

      // Fills the array with enemies
      game._setEnemies(sf, enemies, inAcEnemies, game.g);

      // Fills the platform array
      //game._setPlatforms(platforms, inAcPlatforms);

      // new powerUp(type, chunkIdx, xTile, yTile, size, img, map, canv)
      // Gem to be drawn in the menubar at all times
      menuGem = new PowerUp(1, null, sf*240, 0, 16*sf, images[2], game.map, "top");

      textBox = new TextBox(sf, ts, display, images, audioFiles, thisLang);
  }

  // engine connects the other objects: game, display
  let engine = new Engine(setValues, render, keyPressed, talkKeyPressed);

  //----------------------------------------------------------------- Start game

  // Starts the game
  engine._load(mapName);
}
