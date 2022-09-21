
import {loadAudios, loadImages, loadJSON} from './../libs/loaders.js';
import {drawRect, drawStrokeRect, drawImg, drawText, drawCenteredText} from './../libs/drawLib.js';
import {gameMain} from './../game/main.js';
import mapCreator from './../mapCreator/mapCreator.js';

export default function mainMenu(sf, ts, canvasWidth, canvasHeight, prevLang) {
  const bgiProps = { arrStart: null, imgCount: 8, timeR: null, interval: null, frameTime: 250, activeBtn: null } // Properties for the background animation

  const audioSrcs = ["Resources/collectGem.mp3"];
  const imageSrcs = ["Resources/tileSheet.png", "Resources/playerSheetJohnny.png", "Resources/powerUpSheet.png", "Resources/enemyStoneAgeSheet.png",
                     "Resources/healthBar.png", "Resources/icons.png", "Resources/platforms.png", "Resources/menuButton.png", "Resources/menuArrows.png", "Resources/powerUps.png", "Resources/enemies.png"];
  bgiProps.arrStart = imageSrcs.length; // Saves the index of the first background image
  for (let i = 0; i < bgiProps.imgCount; i++) { imageSrcs.push(`Resources/menuBGI/menuBGI-${i}.png`); } // Background images

  //--- XML Http Request

  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function() { // Establishes request listener
    if (xhr.readyState === 4) {         // Code 4 signals that the request is done
      const resources = { mapNames: JSON.parse(xhr.response).maps, imgNames: JSON.parse(xhr.response).images };

      const primeLoads = [loadAudios(audioSrcs), loadImages(imageSrcs), loadJSON(["../../json/language"])];
      resources.imgNames.forEach(imgName => { primeLoads.push(loadJSON([`../../Resources/mapImages/${imgName}`])); });

      Promise.all(primeLoads).then(loads => {
          Object.assign(resources, {audios: loads[0], images: loads[1], languages: loads[2], mapImgData: loads.slice(3, 3+resources.imgNames.length)});

          let thisLang;
          if (prevLang === null) { thisLang = resources.languages[0]; } // Sets the active language by default to english
          else { thisLang = prevLang; }  // If a language is already set, this language is kept as the active one

          // Volume is set for all audio files
          resources.audios.forEach((file, idx, array) => { array[idx].volume = 0.1; });

          const canvas = document.getElementById('canvas');
          const ctx    = canvas.getContext('2d');
          canvas.width = canvasWidth * sf; canvas.height = canvasHeight * sf;

          //--- Buttons

          let btnStats = {};
          btnStats.img      = resources.images[7];
          btnStats.width    = btnStats.img.width;
          btnStats.height   = btnStats.img.height/2;
          btnStats.x        = (canvas.width/2)-((btnStats.width*sf)/2);
          btnStats.backY    = canvas.height-((btnStats.img.height/1.3)*sf);
          btnStats.y        = (canvas.height/20)*5;
          btnStats.space    = (canvas.height/20)*3;
          btnStats.fontSize = 15*sf;
          btnStats.font     = `${btnStats.fontSize}px VT323`;

          let drawBackBtn = function(sh, lang) {
            drawImg(ctx, btnStats.img, 0, sh, btnStats.width, btnStats.height, btnStats.x, btnStats.backY, btnStats.width*sf, (btnStats.height)*sf);
            drawCenteredText(ctx, canvas.width/2, btnStats.backY+((btnStats.height*sf)/2)+(btnStats.fontSize/4), btnStats.font, lang.mainMenu[6], '#ffffff');
          }

          bgiProps.timeS = new Date().getTime();


          //---------------------------------------------------------mainScreen


          let mainScreen = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            //----- Button design

            function drawBtns(sh1, sh2, sh3) {
              //- Start game button
              drawImg(ctx, btnStats.img, 0, sh1, btnStats.width, btnStats.height, btnStats.x, btnStats.y, btnStats.width*sf, (btnStats.height)*sf);
              drawCenteredText(ctx, canvas.width/2, btnStats.y+((btnStats.height*sf)/2)+(btnStats.fontSize/4), btnStats.font, thisLang.mainMenu[1], '#ffffff');

              //- Map creator button
              drawImg(ctx, btnStats.img, 0, sh2, btnStats.width, btnStats.height, btnStats.x, btnStats.y+btnStats.space, btnStats.width*sf, (btnStats.height)*sf);
              drawCenteredText(ctx, canvas.width/2, btnStats.y+btnStats.space+((btnStats.height*sf)/2)+(btnStats.fontSize/4), btnStats.font, thisLang.mainMenu[2], '#ffffff');

              //- Language button
              drawImg(ctx, btnStats.img, 0, sh3, btnStats.width, btnStats.height, btnStats.x, btnStats.y+(btnStats.space*2), btnStats.width*sf, (btnStats.height)*sf);
              drawCenteredText(ctx, canvas.width/2, btnStats.y+(btnStats.space*2)+((btnStats.height*sf)/2)+(btnStats.fontSize/4), btnStats.font, thisLang.mainMenu[3], '#ffffff');
            }

            //----- Drawing loop

            function drawingLoop() {
              bgiProps.interval = requestAnimationFrame(drawingLoop);
              bgiProps.timeR = new Date().getTime();

              // Background image
              for (let i = 0; i < bgiProps.imgCount; i++) {
                if (bgiProps.timeR-bgiProps.timeS >= bgiProps.frameTime*i && bgiProps.timeR-bgiProps.timeS < (bgiProps.frameTime*i)+bgiProps.frameTime) {
                  drawImg(ctx, resources.images[bgiProps.arrStart+i], 0, 0, resources.images[bgiProps.arrStart+i].width, resources.images[bgiProps.arrStart+i].height, 0, 0, canvas.width, canvas.height);
                }
              }
              if (bgiProps.timeR-bgiProps.timeS >= bgiProps.frameTime*bgiProps.imgCount) {
                bgiProps.timeS = new Date().getTime();
              }

              // Head line
              drawCenteredText(ctx, canvas.width/2, canvas.width/10, `${28*sf}px VT323`, thisLang.mainMenu[0], '#ffffff');

              // Buttons
              if      (bgiProps.activeBtn === 1) { drawBtns(btnStats.height, 0, 0); }
              else if (bgiProps.activeBtn === 2) { drawBtns(0, btnStats.height, 0); }
              else if (bgiProps.activeBtn === 3) { drawBtns(0, 0, btnStats.height); }
              else                               { drawBtns(0, 0, 0); }
            }

            drawingLoop();
            drawBtns(0, 0, 0);

            //----- Button events

            //--- Click
            canvas.addEventListener('click', clickBtn);

            function clickBtn(evt) {
              const mouseX = (evt.clientX-evt.target.getBoundingClientRect().left)*(evt.target.width/evt.target.getBoundingClientRect().width);
              const mouseY = (evt.clientY-evt.target.getBoundingClientRect().top)*(evt.target.height/evt.target.getBoundingClientRect().height);
              if (mouseX >= btnStats.x && mouseX <= btnStats.x+(btnStats.width*sf)) {
                if (resources.mapNames.length > 0 && mouseY >= btnStats.y && mouseY <= btnStats.y+(btnStats.height*sf)) { // Start game button
                  cancelEvents(clickBtn, hoverBtn, bgiProps.interval); mapScreen(sf, ts, canvas, ctx, resources, thisLang, btnStats, drawBackBtn, bgiProps);
                } else if (mouseY >= btnStats.y+btnStats.space && mouseY <= btnStats.y+btnStats.space+(btnStats.height*sf)) { // Map creator button
                  cancelEvents(clickBtn, hoverBtn, bgiProps.interval); mapCreator(sf, ts, resources.images, thisLang);
                } else if (mouseY >= btnStats.y+(btnStats.space*2) && mouseY <= btnStats.y+(btnStats.space*2)+(btnStats.height*sf)) { // Language button
                  cancelEvents(clickBtn, hoverBtn, bgiProps.interval); languageScreen(sf, ts, canvas, ctx, resources, thisLang, btnStats, drawBackBtn, bgiProps);
                }
              }
            }

            //--- Mouse move
            canvas.addEventListener('mousemove', hoverBtn);

            //- Changes the bars behind the words slightly
            function hoverBtn(evt) {
              const mouseX = (evt.clientX-evt.target.getBoundingClientRect().left)*(evt.target.width/evt.target.getBoundingClientRect().width);
              const mouseY = (evt.clientY-evt.target.getBoundingClientRect().top)*(evt.target.height/evt.target.getBoundingClientRect().height);
              if (mouseX >= btnStats.x && mouseX <= btnStats.x+(btnStats.width*sf)) {
                if (mouseY >= btnStats.y && mouseY <= btnStats.y+(btnStats.height*sf)) { bgiProps.activeBtn = 1; canvas.style.cursor = 'pointer'; } // Start game button
                else if (mouseY >= btnStats.y+btnStats.space && mouseY <= btnStats.y+btnStats.space+(btnStats.height*sf)) { bgiProps.activeBtn = 2; canvas.style.cursor = 'pointer'; } // Map creator button
                else if (mouseY >= btnStats.y+(btnStats.space*2) && mouseY <= btnStats.y+(btnStats.space*2)+(btnStats.height*sf)) { bgiProps.activeBtn = 3; canvas.style.cursor = 'pointer'; } // Language button
                else { bgiProps.activeBtn = null; canvas.style.cursor = 'default'; }
              } else { bgiProps.activeBtn = null; canvas.style.cursor = 'default'; }
            }

          }

          mainScreen();

          //----------------------------------------------------------mapScreen


          let mapScreen = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            //----- Drawing loop

            const imgStats = {};
              imgStats.idx       = 0;
              imgStats.img       = new Image();
              imgStats.img.src   = resources.mapImgData[imgStats.idx];
              imgStats.width     = canvas.width/2;
              imgStats.height    = canvas.height/2;
              imgStats.x         = (canvas.width/2)-(canvas.width/4);
              imgStats.y         = (canvas.height/2)-6*sf-(canvas.height/4);
              imgStats.fontSize  = 16*sf;
              imgStats.font      = `${imgStats.fontSize}px VT323`;
              imgStats.txtX      = canvas.width/2;
              imgStats.txtY      = imgStats.y+imgStats.height+imgStats.fontSize-2*sf;
              imgStats.txt       = resources.mapNames[imgStats.idx];
              imgStats.color     = '#5c5554';
            const arrowStats = {};
              arrowStats.img     = resources.images[8];
              arrowStats.width   =  16*sf;
              arrowStats.height  = 32*sf;
              arrowStats.xl      = imgStats.x-arrowStats.width-15*sf;
              arrowStats.y      = imgStats.y+(imgStats.height/2)-(arrowStats.height/2);
              arrowStats.xr      = imgStats.x+imgStats.width+15*sf;
              arrowStats.hover   = null;


            function drawingLoop() {
              bgiProps.timeR = new Date().getTime();

              // Background image animation
              for (let i = 0; i < bgiProps.imgCount; i++) {
                if (bgiProps.timeR-bgiProps.timeS >= bgiProps.frameTime*i && bgiProps.timeR-bgiProps.timeS < (bgiProps.frameTime*i)+bgiProps.frameTime) {
                  drawImg(ctx, resources.images[bgiProps.arrStart+i], 0, 0, resources.images[bgiProps.arrStart+i].width, resources.images[bgiProps.arrStart+i].height, 0, 0, canvas.width, canvas.height);
                }
              }
              if (bgiProps.timeR-bgiProps.timeS >= bgiProps.frameTime*bgiProps.imgCount) { // Restarts image loop
                bgiProps.timeS = new Date().getTime();
              }

              // Head line
              drawCenteredText(ctx, canvas.width/2, canvas.width/10, `${28*sf}px VT323`, thisLang.mainMenu[4], '#ffffff');

              // Map - images and names
              drawImg(ctx, imgStats.img, 0, 0, imgStats.img.width, imgStats.img.height, imgStats.x, imgStats.y, imgStats.width, imgStats.height); // Map image
              drawStrokeRect(ctx, imgStats.x, imgStats.y, imgStats.width, imgStats.height, imgStats.color, 6); // Frame

              drawCenteredText(ctx, imgStats.txtX, imgStats.txtY, imgStats.font, imgStats.txt, '#ffffff');

              // Arrows
              if (arrowStats.hover === 'left') {
                drawImg(ctx, arrowStats.img, arrowStats.img.width/2, 0, arrowStats.img.width/4, arrowStats.img.height, arrowStats.xl, arrowStats.y, arrowStats.width, arrowStats.height); // Left arrow
                drawImg(ctx, arrowStats.img, arrowStats.img.width/4, 0, arrowStats.img.width/4, arrowStats.img.height, arrowStats.xr, arrowStats.y, arrowStats.width, arrowStats.height); // Right arrow
              } else if (arrowStats.hover === 'right') {
                drawImg(ctx, arrowStats.img, 0, 0, arrowStats.img.width/4, arrowStats.img.height, arrowStats.xl, arrowStats.y, arrowStats.width, arrowStats.height); // Left arrow
                drawImg(ctx, arrowStats.img, (arrowStats.img.width/4)*3, 0, arrowStats.img.width/4, arrowStats.img.height, arrowStats.xr, arrowStats.y, arrowStats.width, arrowStats.height); // Right arrow
              } else {
                drawImg(ctx, arrowStats.img, 0, 0, arrowStats.img.width/4, arrowStats.img.height, arrowStats.xl, arrowStats.y, arrowStats.width, arrowStats.height); // Left arrow
                drawImg(ctx, arrowStats.img, arrowStats.img.width/4, 0, arrowStats.img.width/4, arrowStats.img.height, arrowStats.xr, arrowStats.y, arrowStats.width, arrowStats.height); // Right arrow
              }

              // Back to main menu button
              if (bgiProps.activeBtn === -1) { drawBackBtn(btnStats.height, thisLang); }
              else { drawBackBtn(0, thisLang); }

              bgiProps.interval = requestAnimationFrame(drawingLoop);
            }

            drawingLoop();

            //----- Button events

            canvas.addEventListener('click', clickBtn);

            function clickBtn(evt) {
              const mouseX = (evt.clientX-evt.target.getBoundingClientRect().left)*(evt.target.width/evt.target.getBoundingClientRect().width);
              const mouseY = (evt.clientY-evt.target.getBoundingClientRect().top)*(evt.target.height/evt.target.getBoundingClientRect().height);

              if (imgStats.idx > 0 && mouseX >= arrowStats.xl && mouseX <= arrowStats.xl+arrowStats.width && mouseY >= arrowStats.y && mouseY <= arrowStats.y+arrowStats.height) { // Left arrow
                imgStats.idx--; imgStats.img.src = resources.mapImgData[imgStats.idx]; imgStats.txt = resources.mapNames[imgStats.idx]; // Changes image and map name
              } else if (imgStats.idx < resources.mapImgData.length-1 && mouseX >= arrowStats.xr && mouseX <= arrowStats.xr+arrowStats.width && mouseY >= arrowStats.y && mouseY <= arrowStats.y+arrowStats.height) { // Right arrow
                imgStats.idx++; imgStats.img.src = resources.mapImgData[imgStats.idx]; imgStats.txt = resources.mapNames[imgStats.idx]; // Changes image and map name
              } else if (mouseX >= btnStats.x && mouseX <= btnStats.x+(btnStats.width*sf) && mouseY >= btnStats.backY && mouseY <= btnStats.backY+(btnStats.height)*sf) { // Back to main menu
                cancelEvents(clickBtn, hoverBtn, bgiProps.interval); mainScreen(sf, ts, canvas, ctx, resources, thisLang, btnStats, drawBackBtn, bgiProps);
              } else if (mouseX >= imgStats.x && mouseX <= imgStats.x+imgStats.width && mouseY >= imgStats.y && mouseY <= imgStats.y+imgStats.height) {
                cancelEvents(clickBtn, hoverBtn, bgiProps.interval); gameMain(sf, ts, thisLang, resources.mapNames[imgStats.idx], resources.images, resources.audios); canvas.style.cursor = 'default';
              }
            }

            //--- Mouse move
            canvas.addEventListener('mousemove', hoverBtn);

            //- Changes the bars behind the words slightly
            function hoverBtn(evt) {
              const mouseX = (evt.clientX-evt.target.getBoundingClientRect().left)*(evt.target.width/evt.target.getBoundingClientRect().width);
              const mouseY = (evt.clientY-evt.target.getBoundingClientRect().top)*(evt.target.height/evt.target.getBoundingClientRect().height);

              if (mouseX >= arrowStats.xl && mouseX <= arrowStats.xl+arrowStats.width && mouseY >= arrowStats.y && mouseY <= arrowStats.y+arrowStats.height) {
                arrowStats.hover = 'left'; canvas.style.cursor = 'pointer';
              } else if (mouseX >= arrowStats.xr && mouseX <= arrowStats.xr+arrowStats.width && mouseY >= arrowStats.y && mouseY <= arrowStats.y+arrowStats.height) {
                arrowStats.hover = 'right'; canvas.style.cursor = 'pointer';
              } else if (mouseX >= btnStats.x && mouseX <= btnStats.x+(btnStats.width*sf) && mouseY >= btnStats.backY && mouseY <= btnStats.backY+(btnStats.height*sf)) {
                bgiProps.activeBtn = -1; canvas.style.cursor = 'pointer';
              } else if (mouseX >= imgStats.x && mouseX <= imgStats.x+imgStats.width && mouseY >= imgStats.y && mouseY <= imgStats.y+imgStats.height) {
                imgStats.color = 'rgb(120, 105, 105)'; canvas.style.cursor = 'pointer';
              } else {
                imgStats.color = '#5c5554'; arrowStats.hover = null; bgiProps.activeBtn = null; canvas.style.cursor = 'default';
              }
            }

          }


          //-----------------------------------------------------languageScreen


          let languageScreen = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            //----- Button design

            function drawBtns(lang, idx, sh) {
              drawImg(ctx, btnStats.img, 0, sh, btnStats.width, btnStats.height, btnStats.x, (btnStats.y+(btnStats.space)*idx), btnStats.width*sf, (btnStats.height)*sf);
              drawCenteredText(ctx, canvas.width/2, (btnStats.y+(btnStats.space)*idx)+((btnStats.height*sf)/2)+(btnStats.fontSize/4), btnStats.font, lang.name, '#ffffff');
            }

            //----- Drawing loop

            function drawingLoop() {
              bgiProps.timeR = new Date().getTime();

              // Background image
              for (let i = 0; i < bgiProps.imgCount; i++) {
                if (bgiProps.timeR-bgiProps.timeS >= bgiProps.frameTime*i && bgiProps.timeR-bgiProps.timeS < (bgiProps.frameTime*i)+bgiProps.frameTime) {
                  drawImg(ctx, resources.images[bgiProps.arrStart+i], 0, 0, resources.images[bgiProps.arrStart+i].width, resources.images[bgiProps.arrStart+i].height, 0, 0, canvas.width, canvas.height);
                }
              }
              if (bgiProps.timeR-bgiProps.timeS >= bgiProps.frameTime*bgiProps.imgCount) {
                bgiProps.timeS = new Date().getTime();
              }

              // Head line
              drawCenteredText(ctx, canvas.width/2, canvas.width/10, `${28*sf}px VT323`, thisLang.mainMenu[5], '#ffffff');

              // Language buttons
              resources.languages.forEach((lang, idx) => {
                if (bgiProps.activeBtn === idx) { drawBtns(lang, idx, btnStats.height); }
                else { drawBtns(lang, idx, 0); }
              });
              // Back to main menu button
              if (bgiProps.activeBtn === -1) { drawBackBtn(btnStats.height, thisLang); }
              else { drawBackBtn(0, thisLang); }

              bgiProps.interval = requestAnimationFrame(drawingLoop);
            }

            drawingLoop();

            //----- Button events

            //- Click
            canvas.addEventListener('click', clickBtn);

            function clickBtn(evt) {
              const mouseX = (evt.clientX-evt.target.getBoundingClientRect().left)*(evt.target.width/evt.target.getBoundingClientRect().width);
              const mouseY = (evt.clientY-evt.target.getBoundingClientRect().top)*(evt.target.height/evt.target.getBoundingClientRect().height);

              if (mouseX >= btnStats.x && mouseX <= btnStats.x+(btnStats.width*sf)) {
                if (mouseY >= btnStats.backY && mouseY <= btnStats.backY+(btnStats.height)*sf) { // Back button
                  cancelEvents(clickBtn, hoverBtn, bgiProps.interval); mainScreen(sf, ts, canvas, ctx, resources, thisLang, btnStats, drawBackBtn, bgiProps);
                } else {
                  resources.languages.forEach((lang, idx, array) => { // Language buttons
                    if (mouseY >= (btnStats.y+(btnStats.space)*idx) && mouseY <= (btnStats.y+(btnStats.space)*idx+(btnStats.height)*sf)) {
                      thisLang = array[idx]; cancelEvents(clickBtn, hoverBtn, bgiProps.interval);
                      languageScreen(sf, ts, canvas, ctx, resources, thisLang, btnStats, drawBackBtn, bgiProps);
                    }
                  });
                }
              }
            }

            //--- Mouse move
            canvas.addEventListener('mousemove', hoverBtn);

            //- Changes the bars behind the words slightly
            function hoverBtn(evt) {
              const mouseX = (evt.clientX-evt.target.getBoundingClientRect().left)*(evt.target.width/evt.target.getBoundingClientRect().width);
              const mouseY = (evt.clientY-evt.target.getBoundingClientRect().top)*(evt.target.height/evt.target.getBoundingClientRect().height);
              if (mouseX >= btnStats.x && mouseX <= btnStats.x+(btnStats.width*sf)) {
                canvas.style.cursor = 'default';
                if (mouseY >= btnStats.backY && mouseY <= btnStats.backY+(btnStats.height)*sf) {
                  bgiProps.activeBtn = -1; canvas.style.cursor = 'pointer';
                } else {
                  bgiProps.activeBtn = null; // Nullifies the activeBtn variable
                  resources.languages.forEach((lang, idx) => {
                    drawBtns(lang, idx, 0);
                    if (mouseY >= (btnStats.y+(btnStats.space)*idx) && mouseY <= (btnStats.y+(btnStats.space)*idx)+(btnStats.height)*sf) {
                      bgiProps.activeBtn = idx; canvas.style.cursor = 'pointer';
                    }
                  });
                }
              } else { bgiProps.activeBtn = null; canvas.style.cursor = 'default'; }
            }

          }

          //-------------------------------------------------------cancelEvents

          let cancelEvents = function(clickBtn, hoverBtn, interval) {
            canvas.removeEventListener('click', clickBtn); canvas.removeEventListener('mousemove', hoverBtn);
            cancelAnimationFrame(interval);
          }

      });
    }
  }

  xhr.open('GET', 'http://localhost:5000/map-names', true); // Prepares request and spesifies request type and url
  xhr.send(''); // Sends request to server

  }
