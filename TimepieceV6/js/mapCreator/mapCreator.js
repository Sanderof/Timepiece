
import {loadImages} from './../libs/loaders.js';
import {drawFillRect, drawRect, drawStrokeRect, drawImg, drawText} from './../libs/drawLib.js';
import mainMenu from './../mainMenu/mainMenu.js';

import MenuBar from './menuBar.js';
import MapMaker from './mapMaker.js';

//--- Allows the user to create its own map
export default function mapCreator(sFactor, tileSize, images, thisLang) {
  let activeTile = 0; // The tile that is active and will be put on the map when the user clicks on the map

  const menuBar  = new MenuBar('barCanvas', 256, 32, images, tileSize, sFactor);
  const mapMaker = new MapMaker('canvas', 256, 160, tileSize, sFactor, images, menuBar, thisLang);
  menuBar._setTiles();
  menuBar._setPowerUps();
  menuBar._setEnemies();
  mapMaker._styleInputFields(menuBar);
  mapMaker._setGrid();

  main(sFactor, tileSize, activeTile, menuBar, mapMaker, thisLang);

}

//-----------------------------------------------------------------------------

function main(sFactor, tileSize, activeTile, menuBar, mapMaker, thisLang) {
  let topScrollInt, topScrollDir;
  let mapScrollXInt, mapScrollXDir, mapScrollYInt, mapScrollYDir;
  let placeTileInt; let looperInt;
  let time; // Constantly getting the current time

  menuBar._render(activeTile);
  mapMaker._renderMap(menuBar.tilesMap, menuBar.powerUpsMap, menuBar.enemiesMap, mapMaker.ctx);

  //---------------- Top scrolling

  //--- Starts scrolling when mouse moves over the correct area of the canvas
  menuBar.canvas.addEventListener('mousemove', topMouseIn);

  function topMouseIn(evt) {
      let mouseX = (evt.clientX - evt.target.getBoundingClientRect().left)*(evt.target.width/evt.target.getBoundingClientRect().width);

      if (activeTile !== 0) {
        if (menuBar.choiceArray[menuBar.choiceArray.length-1].x + (3*tileSize) + sFactor > menuBar.choiceBufferX+menuBar.choiceBuffer.width &&
            mouseX > menuBar.choiceBufferX+menuBar.choiceBuffer.width-tileSize && mouseX < menuBar.choiceBufferX+menuBar.choiceBuffer.width) {
            cancelAnimationFrame(topScrollInt); topScrollDir = "right"; topScroll(); switchListener(topMouseOut, topMouseIn);
        } else if (menuBar.choiceArray[0].x < menuBar.choiceBufferX && mouseX > menuBar.choiceBufferX && mouseX < menuBar.choiceBufferX+menuBar.ts) {
            cancelAnimationFrame(topScrollInt); topScrollDir = "left"; topScroll(); switchListener(topMouseOut, topMouseIn);
        } else { cancelAnimationFrame(topScrollInt); }
      }
  }

  function topMouseOut(evt) {
      let mouseX = (evt.clientX - evt.target.getBoundingClientRect().left)*(evt.target.width/evt.target.getBoundingClientRect().width);

      if (topScrollDir === "right" && (mouseX < menuBar.choiceBufferX+menuBar.choiceBuffer.width-tileSize || mouseX > menuBar.choiceBufferX+menuBar.choiceBuffer.width)) {
          cancelAnimationFrame(topScrollInt); switchListener(topMouseIn, topMouseOut);
      } else if (topScrollDir === "left" && (mouseX < menuBar.choiceBufferX || mouseX > menuBar.choiceBufferX+menuBar.ts)) {
          cancelAnimationFrame(topScrollInt); switchListener(topMouseIn, topMouseOut);
      }
  }

  // Stops scrolling when mouse leaves the canvas
  menuBar.canvas.addEventListener('mouseleave', cancelTopScrollInt);

  function cancelTopScrollInt(evt) {
    cancelAnimationFrame(topScrollInt); switchListener(topMouseIn, topMouseOut);
  }

  function switchListener(lisAdd, lisRemove) {
    menuBar.canvas.addEventListener('mousemove', lisAdd); menuBar.canvas.removeEventListener('mousemove', lisRemove);
  }

  function topScroll() {
    topScrollInt = requestAnimationFrame(topScroll);
    let scrollSpeed = 0; const speedNum = 5;

    if (topScrollDir === "left") {
      scrollSpeed = speedNum; // Sets the scrolling speed
      // Stops scrolling if the leftmost tile is on the screen
      if (menuBar.choiceArray[0].x-(sFactor) >= 0) {
        cancelAnimationFrame(topScrollInt); scrollSpeed = 0; switchListener(topMouseIn, topMouseOut);
      }
    } else if (topScrollDir === "right") {
      scrollSpeed = -speedNum; // sets the scrolling speed
      // Stops scrolling if the rightmost tile is on the screen
      if (menuBar.choiceArray[menuBar.choiceArray.length-1].x + (3*tileSize) + sFactor <= menuBar.choiceBufferX+menuBar.choiceBuffer.width) {
          cancelAnimationFrame(topScrollInt); scrollSpeed = 0; switchListener(topMouseIn, topMouseOut);
      }
    }

    menuBar.ctx.clearRect(0, 0, menuBar.canvas.width, menuBar.canvas.height); // Clears the canvas
    menuBar.choiceArray.forEach(tile => { tile.x += scrollSpeed; }); // Moves all the tiles
    menuBar._render(activeTile);
  }

  //---------------- Choosing tile

  // Choosing a tile by clicking it
  menuBar.canvas.addEventListener('click', chooseTile);

  function chooseTile(evt) {
      let mouseX = (evt.clientX - evt.target.getBoundingClientRect().left)*(evt.target.width/evt.target.getBoundingClientRect().width);
      let mouseY = (evt.clientY - evt.target.getBoundingClientRect().top)*(evt.target.height/evt.target.getBoundingClientRect().height);

      if (mouseX < menuBar.choiceBufferX+menuBar.choiceBuffer.width && mouseX > menuBar.choiceBufferX) {
          menuBar.choiceArray.forEach(tile => {
              if (mouseX >= menuBar.choiceBufferX+tile.x && mouseX <= menuBar.choiceBufferX+tile.x+tile.w && mouseY >= tile.y && mouseY <= tile.y+tile.h) {
                  if (menuBar.activeChoiceCat === 'enemy' && tile.value <= menuBar.enemies.length) { // The enemy is double the height of the tiles and power ups. This must be compensated for
                      //if (tile.value % 2 !== 0) { // Top tiles are odd numbers. These will correspond to the same enemy as is clicked
                          activeTile = tile.value;
                      //} else { activeTile = tile.value-1; } // Lower tiles are even numbers. Because these correspond to a different tile than the upper, we must subtract one from its value.
                  } else if (menuBar.activeChoiceCat === 'powerUp' && tile.value <= menuBar.powerUps.length) { // If power up or tile
                      activeTile = tile.value;
                  } else if (menuBar.activeChoiceCat === 'tile') {
                      activeTile = tile.value;
                  }
              }
          });
      } else if (mouseX > 0 && mouseX < menuBar.tileBuffer.width && mouseY > 0 && mouseY < menuBar.tileBuffer.height) {
          menuBar.activeChoiceCat = 'tile'; menuBar.choiceArray = menuBar.tiles; activeTile = 1;
      } else if (mouseX > 0 && mouseX < menuBar.powerUpBuffer.width && mouseY > menuBar.tileBuffer.height && mouseY < menuBar.canvas.height) {
          menuBar.activeChoiceCat = 'powerUp'; menuBar.choiceArray = menuBar.powerUps; activeTile = 1;
      } else if (mouseX > menuBar.tileBuffer.width && mouseX < menuBar.choiceBufferX && mouseY > 0 && mouseY < menuBar.tileBuffer.height) {
          menuBar.activeChoiceCat = 'enemy'; menuBar.choiceArray = menuBar.enemies; activeTile = 1;
      } else if (mouseX > menuBar.tileBuffer.width && mouseX < menuBar.choiceBufferX && mouseY > menuBar.tileBuffer.height && mouseY < menuBar.canvas.height) {
          activeTile = 0; // Eraser sets activeTile = 0
      }

      menuBar.ctx.clearRect(menuBar.choiceBufferX, 0, menuBar.choiceBuffer.width, menuBar.choiceBuffer.height); // Clears the canvas
      menuBar._render(activeTile);
  }

  //---------------- Clicking the save, option or quit button

  menuBar.canvas.addEventListener('click', saveOptionsQuit);

  // Saves the map as a JSON-file when the save button is clicked
  function saveOptionsQuit(evt) {
    let mouseX = (evt.clientX - evt.target.getBoundingClientRect().left)*(evt.target.width/evt.target.getBoundingClientRect().width);
    let mouseY = (evt.clientY - evt.target.getBoundingClientRect().top)*(evt.target.height/evt.target.getBoundingClientRect().height);

    if (mouseX > evt.target.width-menuBar.saveBuffer.width-menuBar.quitBuffer.width && mouseX < evt.target.width-menuBar.quitBuffer.width && // Save Map
        mouseY > 0 && mouseY < menuBar.saveBuffer.height) {
        removeListeners();
        document.onkeydown = null;
        document.onkeyup   = null;
        cancelAnimationFrame(looperInt);
        mapMaker.headline.txt = thisLang.mapCreator[0]; mapMaker.popUpBox.type = 'saveMap';
        popUpFunc(sFactor, tileSize, activeTile, menuBar, mapMaker, thisLang);
    } else if (mouseX > evt.target.width-menuBar.optionBuffer.width-menuBar.quitBuffer.width && mouseX < evt.target.width-menuBar.quitBuffer.width && // Options
        mouseY > menuBar.saveBuffer.height && mouseY < menuBar.canvas.height) {
        removeListeners();
        document.onkeydown = null;
        document.onkeyup   = null;
        cancelAnimationFrame(looperInt);
        mapMaker.headline.txt = thisLang.mapCreator[4]; mapMaker.popUpBox.type = 'options';
        popUpFunc(sFactor, tileSize, activeTile, menuBar, mapMaker, thisLang);
    } else if (mouseX > evt.target.width-menuBar.quitBuffer.width && mouseX < evt.target.width && // Quit to main menu
        mouseY > 0 && mouseY < menuBar.canvas.height) {
        removeListeners();
        document.onkeydown = null;
        document.onkeyup   = null;
        cancelAnimationFrame(looperInt);
        menuBar.ctx.clearRect(0, 0, menuBar.canvas.width, menuBar.canvas.height);
        mainMenu(sFactor, tileSize, mapMaker.canvas.width/sFactor, mapMaker.canvas.height/sFactor, thisLang);
    }
  }

  function removeListeners() {
    // Remove event listeners
    menuBar.canvas.removeEventListener('mousemove', topMouseIn);
    menuBar.canvas.removeEventListener('mousemove', topMouseOut);
    menuBar.canvas.removeEventListener('mouseleave', cancelTopScrollInt);
    menuBar.canvas.removeEventListener('click', chooseTile);
    menuBar.canvas.removeEventListener('click', saveOptionsQuit);
    mapMaker.canvas.removeEventListener('mousemove', markTile);
    mapMaker.canvas.removeEventListener('mouseleave', renderMap);
    mapMaker.canvas.removeEventListener('mousedown', placeTileMouseDown);
    mapMaker.canvas.removeEventListener('mouseup', mouseUpMapMaker);
  }

  //--------------------------------------- Map canvas

  //---------------- Mark tile

  mapMaker.canvas.addEventListener('mousemove', markTile);

  // Draw a white square around the tile that the cursor is currently over
  function markTile(evt) {
    let mouseX = (evt.clientX - evt.target.getBoundingClientRect().left)*(evt.target.width/evt.target.getBoundingClientRect().width);
    let mouseY = (evt.clientY - evt.target.getBoundingClientRect().top)*(evt.target.height/evt.target.getBoundingClientRect().height);

    mapMaker.map.forEach(col => { col.forEach(tile => {
        if (mouseX >= tile.x && mouseX <= tile.x+tileSize && mouseY >= tile.y && mouseY <= tile.y+tileSize) {
            mapMaker.ctx.clearRect(0, 0, mapMaker.canvas.width, mapMaker.canvas.height);
            mapMaker._renderMap(menuBar.tilesMap, menuBar.powerUpsMap, menuBar.enemiesMap, mapMaker.ctx);
            drawStrokeRect(mapMaker.ctx, tile.x, tile.y, tileSize, tileSize, 'white', 2);
        }
    }); });
  }

  // Stops showing the white square
  mapMaker.canvas.addEventListener('mouseleave', renderMap);
  function renderMap() { mapMaker._renderMap(menuBar.tilesMap, menuBar.powerUpsMap, menuBar.enemiesMap, mapMaker.ctx); }

  //---------------- Place tile

  // When the left click is pressed down, the placeTile function is run when the cursor moves
  mapMaker.canvas.addEventListener('mousedown', placeTileMouseDown);
  function placeTileMouseDown(evt) { placeTile(evt); mapMaker.canvas.onmousemove = placeTile; }

  // Places a tile on the map by changing the tiles value
  function placeTile(evt) {
    let mouseX = (evt.clientX - evt.target.getBoundingClientRect().left)*(evt.target.width/evt.target.getBoundingClientRect().width);
    let mouseY = (evt.clientY - evt.target.getBoundingClientRect().top)*(evt.target.height/evt.target.getBoundingClientRect().height);

    mapMaker.map.forEach((row, rowIdx, arr) => { row.forEach((tile, idx) => {
        if (mouseX >= tile.x && mouseX <= tile.x+tileSize && mouseY >= tile.y && mouseY <= tile.y+tileSize) {
            mapMaker.ctx.clearRect(0, 0, mapMaker.canvas.width, mapMaker.canvas.height);
            if      (menuBar.activeChoiceCat ===    'tile') { // Updates the tile's value and type
              tile.value = activeTile;
              if      (activeTile === 17 || activeTile === 18) { tile.type = 'ladder'; }
              else if ((activeTile >= 10 && activeTile <= 12) || (activeTile >= 22 && activeTile <= 24) || (activeTile >= 34 && activeTile <= 36)) {
                tile.type = 'finish';
              } else if (activeTile !== 0 && activeTile <= ((menuBar.tileSheet.width)/(tileSize/sFactor))*3) { tile.type = 'obst';   }
                else { tile.type = null; }
            } else if (menuBar.activeChoiceCat === 'powerUp') { tile.puValue = activeTile; } // Updates the tile's power up value
            else if (menuBar.activeChoiceCat === 'enemy' && activeTile !== 0) { // Updates the tile's enemy value
                if ((tile.value === 0 || tile.value > 3*menuBar.tileSheet.naturalWidth/16) && rowIdx !== arr.length-1) {
                    if ((arr[rowIdx+1][idx].value === 0 || arr[rowIdx+1][idx].value > 3*menuBar.tileSheet.naturalWidth/16)) {
                        if (arr[rowIdx+1][idx].enemy.value === 0) {
                            if (rowIdx === 0) {
                                tile.enemy.value = activeTile;
                                removeListeners();
                                mapMaker.canvas.onmousemove = null;
                                placeBorders(sFactor, tileSize, activeTile, menuBar, mapMaker, thisLang, { x: idx, y: rowIdx });
                            } else if (arr[rowIdx-1][idx].enemy.value === 0) {
                                tile.enemy.value = activeTile;
                                removeListeners();
                                mapMaker.canvas.onmousemove = null;
                                placeBorders(sFactor, tileSize, activeTile, menuBar, mapMaker, thisLang, { x: idx, y: rowIdx });
                            }
                        }
                    }
                }
            } else if (menuBar.activeChoiceCat === 'enemy' && activeTile === 0) {
                tile.enemy = {value: 0, lb: 0, rb: 0};
            }

            mapMaker._renderMap(menuBar.tilesMap, menuBar.powerUpsMap, menuBar.enemiesMap, mapMaker.ctx);
        }
    }); });
  }

  // When left click is released, the onmousemove is stopped.
  mapMaker.canvas.addEventListener('mouseup', mouseUpMapMaker);
  function mouseUpMapMaker() { mapMaker.canvas.onmousemove = null; }

  //---------------- Scroll map

  let leftPressed  = false;
  let rightPressed = false;
  let upPressed    = false;
  let downPressed  = false;

  //--- Starts scrolling when one of the keys a, w, s or d is pressed
  document.onkeydown = function(evt) {
    switch(evt.keyCode) {
      case 65: leftPressed  = true; break;
      case 68: rightPressed = true; break;
      case 87: upPressed    = true; break;
      case 83: downPressed  = true; break;
    }
  }

  document.onkeyup = function(evt) {
    switch(evt.keyCode) {
      case 65: leftPressed  = false; break;
      case 68: rightPressed = false; break;
      case 87: upPressed    = false; break;
      case 83: downPressed  = false; break;
    }
  }

  // Scrolling the map
  function mapScroll() {
    if (leftPressed || rightPressed || upPressed || downPressed) {
        mapMaker.ctx.clearRect(0, 0, mapMaker.canvas.width, mapMaker.canvas.height); // Clears the canvas

        if (leftPressed && mapMaker.map[0][0].x < 0) {
            mapMaker.map.forEach(col => { col.forEach(tile => { tile.x += 6; }); }); // Moves all the tiles

            if (mapMaker.map[0][0].x > 0) { // Correction if one has scrolled too far
                mapMaker.map.forEach(col => { col.forEach((tile, idx) => { tile.x = (idx*tileSize); }); });
            }
        } else if (rightPressed && mapMaker.map[0][mapMaker.map[0].length-1].x + tileSize > mapMaker.canvas.width) {
            mapMaker.map.forEach(col => { col.forEach(tile => { tile.x -= 6; }); }); // Moves all the tiles

            if (mapMaker.map[0][mapMaker.map[0].length-1].x + tileSize < mapMaker.canvas.width) { // Correction if one has scrolled too far
                mapMaker.map.forEach(col => { col.forEach((tile, idx) => { tile.x = (idx*tileSize)-((mapMaker.map[0].length)*tileSize)+mapMaker.canvas.width; }); });
            }
        }

        if (upPressed && mapMaker.map[0][0].y < 0) {
            mapMaker.map.forEach(col => { col.forEach(tile => { tile.y += 6; }); }); // Moves all the tiles

            if (mapMaker.map[0][0].y > 0) { // Correction if one has scrolled too far
                mapMaker.map.forEach((col, idx) => { col.forEach(tile => { tile.y = (idx*tileSize); }); });
            }
        } else if (downPressed && mapMaker.map[mapMaker.map.length-1][0].y + tileSize > mapMaker.canvas.height) {
            mapMaker.map.forEach(col => { col.forEach(tile => { tile.y -= 6; }); }); // Moves all the tiles

            if (mapMaker.map[mapMaker.map.length-1][0].y + tileSize < mapMaker.canvas.height) { // Correction if one has scrolled too far
                mapMaker.map.forEach((col, idx) => { col.forEach(tile => { tile.y = (idx*tileSize)-((mapMaker.map.length)*tileSize)+mapMaker.canvas.height; }); });
            }
        }

        mapMaker._renderMap(menuBar.tilesMap, menuBar.powerUpsMap, menuBar.enemiesMap, mapMaker.ctx);
    }
  }

  //----------------

  //--- A function that uses the requestAnimationFrame
  function looper() {
      looperInt = requestAnimationFrame(looper);
      time = new Date().getTime();
      mapScroll();

      //if (time - menuBar.saveTime > 100 && time - menuBar.saveTime < 150) { menuBar.saveSx = 0; menuBar._render(activeTile); }
  }

  //----------------

  looper();
}


//---------------------------------------------------------------------popUpFunc


function popUpFunc(sFactor, tileSize, activeTile, menuBar, mapMaker, thisLang) {
  drawFillRect(mapMaker.ctx, 0, 0, mapMaker.canvas.width, mapMaker.canvas.height, 'rgba(45, 47, 52, .7)'); // Background color
  drawFillRect(menuBar.ctx, 0, 0, menuBar.canvas.width, menuBar.canvas.height, 'rgba(45, 47, 52, .7)'); // Background color
  mapMaker._renderPopUp();

  mapMaker.canvas.addEventListener('mousemove', changeBtnColor);

  //--- When mouse is over the cancel or save button, the respective button's border color will change
  function changeBtnColor(evt) {
    let mouseX = (evt.clientX - evt.target.getBoundingClientRect().left)*(evt.target.width/evt.target.getBoundingClientRect().width);
    let mouseY = (evt.clientY - evt.target.getBoundingClientRect().top)*(evt.target.height/evt.target.getBoundingClientRect().height);

    // Over cancel button
    if (mouseX > mapMaker.csBtns.cx && mouseX < mapMaker.csBtns.cx+mapMaker.csBtns.w &&
        mouseY > mapMaker.csBtns.y  && mouseY < mapMaker.csBtns.y +mapMaker.csBtns.h) {
          mapMaker.csBtns.bcc = 'white';
          mapMaker.canvas.style.cursor = 'pointer'; // Pointer cursor
          mapMaker._renderPopUp();
    // Over save map button
    } else if (mouseX > mapMaker.csBtns.sx && mouseX < mapMaker.csBtns.sx+mapMaker.csBtns.w &&
               mouseY > mapMaker.csBtns.y  && mouseY < mapMaker.csBtns.y +mapMaker.csBtns.h) {
          mapMaker.csBtns.bcs = 'white';
          mapMaker.canvas.style.cursor = 'pointer'; // Pointer cursor
          mapMaker._renderPopUp();
    } else if (mapMaker.csBtns.bcc === 'white' || mapMaker.csBtns.bcs === "white") {
          mapMaker.csBtns.bcc = 'orange';
          mapMaker.csBtns.bcs = 'orange';
          mapMaker.canvas.style.cursor = 'default'; // Default cursor
          mapMaker._renderPopUp();
    }
  }

  //----- Click on arrows to change value

  mapMaker.canvas.addEventListener('click', clickArrow);

  function clickArrow(evt) {
    let mouseX = (evt.clientX - evt.target.getBoundingClientRect().left)*(evt.target.width/evt.target.getBoundingClientRect().width);
    let mouseY = (evt.clientY - evt.target.getBoundingClientRect().top)*(evt.target.height/evt.target.getBoundingClientRect().height);

    if (mouseY > mapMaker.opBoxes.cny && mouseY < mapMaker.opBoxes.cny+mapMaker.opBoxes.s) {
        if (mapMaker.temChunkNum > mapMaker.chunkMin && mouseX > mapMaker.opBoxes.lax && mouseX < mapMaker.opBoxes.lax+mapMaker.opBoxes.s) {
            mapMaker.temChunkNum--; mapMaker._renderPopUp(); // Decreases temporary chunk number by one
        } else if (mapMaker.temChunkNum < mapMaker.chunkMax && mouseX > mapMaker.opBoxes.rax && mouseX < mapMaker.opBoxes.rax+mapMaker.opBoxes.s) {
            mapMaker.temChunkNum++; mapMaker._renderPopUp(); // Increases temporary chunk number by one
        }
    } else if (mouseY > mapMaker.opBoxes.cly && mouseY < mapMaker.opBoxes.cly+mapMaker.opBoxes.s) {
        if (mapMaker.temColLength > mapMaker.colMin && mouseX > mapMaker.opBoxes.lax && mouseX < mapMaker.opBoxes.lax+mapMaker.opBoxes.s) {
            mapMaker.temColLength--; mapMaker._renderPopUp(); // Decreases temporary column length by one
        } else if (mapMaker.temColLength < mapMaker.colMax && mouseX > mapMaker.opBoxes.rax && mouseX < mapMaker.opBoxes.rax+mapMaker.opBoxes.s) {
            mapMaker.temColLength++; mapMaker._renderPopUp(); // Increases temporary column length by one
        }
    }
  }

  //------ Click on cancel or save

  mapMaker.canvas.addEventListener('click', clickBtn);

  //--- When the cancel button is clicked, map editing is resumed.
  //--- When the save map button is clicked, the map is saved as a .json file and map editing is resumed
  function clickBtn(evt) {
    let mouseX = (evt.clientX - evt.target.getBoundingClientRect().left)*(evt.target.width/evt.target.getBoundingClientRect().width);
    let mouseY = (evt.clientY - evt.target.getBoundingClientRect().top)*(evt.target.height/evt.target.getBoundingClientRect().height);

    // Clicks cancel button
    if (mouseX > mapMaker.csBtns.cx && mouseX < mapMaker.csBtns.cx+mapMaker.csBtns.w &&
        mouseY > mapMaker.csBtns.y  && mouseY < mapMaker.csBtns.y +mapMaker.csBtns.h) {
          mapMaker.temChunkNum  =  mapMaker.chunkNum; // Resets the temChunkNum
          mapMaker.temColLength = mapMaker.colLength; // Resets the temColLength

          mapMaker.canvas.removeEventListener('mousemove', changeBtnColor);
          mapMaker.canvas.removeEventListener('click', clickBtn);
          mapMaker.canvas.removeEventListener('click', clickArrow);

          main(sFactor, tileSize, activeTile, menuBar, mapMaker, thisLang);
    // Clicks save map button
    } else if (mouseX > mapMaker.csBtns.sx && mouseX < mapMaker.csBtns.sx+mapMaker.csBtns.w &&
               mouseY > mapMaker.csBtns.y  && mouseY < mapMaker.csBtns.y +mapMaker.csBtns.h) {

          if (mapMaker.popUpBox.type === 'saveMap' && mapMaker.nameInp.value !== "") {
              sendSaveData(mapMaker, menuBar); // Saves the map in a .json-file

              mapMaker.canvas.removeEventListener('mousemove', changeBtnColor);
              mapMaker.canvas.removeEventListener('click', clickBtn);
              mapMaker.canvas.removeEventListener('click', clickArrow);
              main(sFactor, tileSize, activeTile, menuBar, mapMaker, thisLang);
          } else if (mapMaker.popUpBox.type === 'options') {
              mapMaker.chunkNum  =  mapMaker.temChunkNum; // Updates the chunk number
              mapMaker.colLength = mapMaker.temColLength; // Updates the column length
              mapMaker._setGrid(); // Sets the grid anew - The map is emptied

              mapMaker.canvas.removeEventListener('mousemove', changeBtnColor);
              mapMaker.canvas.removeEventListener('click', clickBtn);
              mapMaker.canvas.removeEventListener('click', clickArrow);
              main(sFactor, tileSize, activeTile, menuBar, mapMaker, thisLang);
          }
    }
  }
}

//------------------------------------------------------------------sendSaveData

//--- Converts the map array into JSON and sends it to the server
function sendSaveData(mapMaker, menuBar) {
  // Converting the map into a JSON object made up of chunks
  let mapJSON = { map: { chunks: [] }, powerUps: [], enemies: [] };
  let tileVals = []; // Correctly formated tile value array

  // Fills tileVals with the value of each tile, discarding the x- and y-values
  for (let i = 0; i < mapMaker.colLength; i++) {
    tileVals.push([]);
      for (let j = 0; j < mapMaker.chunkNum*mapMaker.chunkLength; j++) {
          tileVals[i].push({ value: mapMaker.map[i][j].value, type: mapMaker.map[i][j].type });
      }
  }

  // Fills the mapJSON with chunks of map data.
  for (let i = 0;  i < mapMaker.chunkNum; i++) {
    mapJSON.map.chunks.push([]); // Array for each chunk
      for (let j = 0; j < tileVals.length; j++) {
        mapJSON.map.chunks[i].push([]); // Array for each column in the chunk
          // Goes through as many times as there are tiles in each row per chunk
          for (let k = 0; k < mapMaker.chunkLength; k++) {
              mapJSON.map.chunks[i][j].push(tileVals[j][k]); // Tile value for each tile in the column
          }
        tileVals[j].splice(0, mapMaker.chunkLength); // Removes the number of tiles that was looped through
      }
  }

  // Fills the mapJSON.powerUps array with the value of the power up, the chunk it is on, its tile number in the x-direction and y-direction
  mapMaker.map.forEach((row, rowIdx) => { row.forEach((tile, idx) => {
      if (tile.puValue !== 0) {
          let chunkNum = Math.floor(idx/mapMaker.chunkLength);
          mapJSON.powerUps.push({ value: tile.puValue, chunkNum: chunkNum, xTile: idx-(chunkNum*mapMaker.chunkLength), yTile: rowIdx });
      }
  }); });

  // Fills the mapJSON.enemies array with the value of the power up, the chunk it is on, its tile number in the x-direction and y-direction, left border and right border
  mapMaker.map.forEach((row, rowIdx) => { row.forEach((tile, idx) => {
      if (tile.enemy.value !== 0) {
          let chunkNum   = Math.floor(idx/mapMaker.chunkLength);
          let chunkNumLb = Math.floor(tile.enemy.lb/mapMaker.chunkLength);
          let chunkNumRb = Math.floor(tile.enemy.rb/mapMaker.chunkLength);
          mapJSON.enemies.push({ value: tile.enemy.value, chunkIdx: chunkNum, xTile: idx-(chunkNum*mapMaker.chunkLength), yTile: rowIdx,
                                 lb: { chunkIdx: chunkNumLb, tileIdx: tile.enemy.lb-(chunkNumLb*mapMaker.chunkLength)}, rb: { chunkIdx: chunkNumRb, tileIdx: tile.enemy.rb-(chunkNumRb*mapMaker.chunkLength)} });
      }
  }); });

  // Converts the mapJSON into JSON data
  mapJSON = JSON.stringify({ data: mapJSON, name: mapMaker.nameInp.value, mapImg: mapMaker._createMapImage(menuBar.tilesMap, menuBar.powerUpsMap, menuBar.enemiesMap) });

  // Sending post request containing the mapJSON to the server
  const xhr = new XMLHttpRequest();

  xhr.open("POST", "http://localhost:5000/map-data", true); // Post request to the url http://localhost:5000/
  xhr.setRequestHeader("Content-Type", "application/JSON;charset=UTF-8"); // JSON data will be sent
  xhr.send(mapJSON); // mapJSON is sent

  console.log('Map has been sent to server');

}

//------------------------------------------------------------------Placeborders

function placeBorders(sFactor, tileSize, activeTile, menuBar, mapMaker, thisLang, mapIdxs) {
    let borderLineIdx = 0;
    let blColorBlue   = "rgba(76, 142, 247, .5)"; let blColorRed = "rgba(178, 61, 57, .5)"; let blColorGreen = "rgba(101, 165, 58, .5)";

    document.onmousemove = moveBorderLine;
    document.onclick     = setBorder;

    // Visualizes the borders as the mouse is moved
    function moveBorderLine(evt) {
        let enemyTile = mapMaker.map[mapIdxs.y][mapIdxs.x]; // The tile the enemy character is on
        let mouseX = (evt.clientX - evt.target.getBoundingClientRect().left)*(evt.target.width/evt.target.getBoundingClientRect().width);
        let xTile;
        mapMaker.map.forEach(row => { row.forEach(tile => { // Finds the tile the cursor is over
          if (Math.floor(mouseX/tileSize) === Math.floor(tile.x/tileSize)) { xTile = tile.x; }
        })});

        mapMaker._renderMap(menuBar.tilesMap, menuBar.powerUpsMap, menuBar.enemiesMap, mapMaker.ctx); // Renders the map

        if (borderLineIdx === 0) { // Left border
            if (enemyTile.x >= xTile) { // Cursor is to the right for the enemy => Blue border
                drawFillRect(mapMaker.ctx, xTile, 0, tileSize, mapMaker.canvas.height, blColorBlue);
            } else {                  // Cursor is to the left for the enemy => Red border
                drawFillRect(mapMaker.ctx, xTile, 0, tileSize, mapMaker.canvas.height, blColorRed);
            }
        } else { // Right border
            drawFillRect(mapMaker.ctx, mapMaker.map[0][enemyTile.enemy.lb].x, 0, tileSize, mapMaker.canvas.height, blColorGreen); // Marking the set left border with green

            if (enemyTile.x <= xTile) { // Cursor is to the left for the enemy => Blue border
                drawFillRect(mapMaker.ctx, xTile, 0, tileSize, mapMaker.canvas.height, blColorBlue);
            } else {                  // Cursor is to the right for the enemy => Red border
                drawFillRect(mapMaker.ctx, xTile, 0, tileSize, mapMaker.canvas.height, blColorRed);
            }
        }
    }

    // Sets the border
    function setBorder(evt) {
        let enemyTile = mapMaker.map[mapIdxs.y][mapIdxs.x]; // The tile the enemy character is on
        let mouseX = (evt.clientX - evt.target.getBoundingClientRect().left)*(evt.target.width/evt.target.getBoundingClientRect().width);
        let xTile, xTileIdx;
        mapMaker.map.forEach(row => { row.forEach((tile, idx) => { // Finds the tile the cursor is over
          if (Math.floor(mouseX/tileSize) === Math.floor(tile.x/tileSize)) { xTile = tile.x; xTileIdx = idx; }
        })});

        if (borderLineIdx === 1 && enemyTile.x <= xTile) { // If the left border is set, and if the cursor is to the right for the enemy
            mapMaker.map[mapIdxs.y][mapIdxs.x].enemy.rb = mapIdxs.x+(xTileIdx-mapIdxs.x); // Saves the right border
            document.onmousemove = null; // Removes event listener for the mouse move
            document.onclick     = null; // Removes event listener for click
            main(sFactor, tileSize, activeTile, menuBar, mapMaker, thisLang);
        } else if (borderLineIdx === 0 && enemyTile.x >= xTile) { // If no border is set yet, and if the cursor is to left for the enemy
            mapMaker.map[mapIdxs.y][mapIdxs.x].enemy.lb = mapIdxs.x-(mapIdxs.x-xTileIdx); // Saves the left border
            borderLineIdx++; // Augments the index, so to allow for placing the right border
        }
    }

}
