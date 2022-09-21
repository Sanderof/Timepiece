import {drawFillRect, drawImg, drawCenteredText} from './../libs/drawLib.js';
import mainMenu   from './../mainMenu/mainMenu.js';
import {gameMain} from './main.js';

export function gameMenu(engine, keyPressed, canvas, ctx, canvasBar, ctxBar, sf, ts, images, audioFiles, thisLang, player, enemies, mapName) {
    engine._stop(keyPressed); // cancelFrameRequest
    const menuTime = new Date().getTime();

    // Shades the screen
    drawFillRect(ctx, 0, 0, canvas.width, canvas.height, 'rgba(0, 0, 0, .5)');
    drawFillRect(ctxBar, 0, 0, canvasBar.width, canvasBar.height, 'rgba(0, 0, 0, .5)');

    // Head line
    drawCenteredText(ctx, canvas.width/2, canvas.width/10, `${28*sf}px VT323`, thisLang.game.menu[0], '#ffffff');

    // Buttons
    const btnStats = {};
    btnStats.img       = images[7];
    btnStats.width     = btnStats.img.width;
    btnStats.height    = btnStats.img.height/2;
    btnStats.x         = (canvas.width/2)-((btnStats.width*sf)/2);
    btnStats.space     = (canvas.height/20)*3;
    btnStats.y1        = (canvas.height/20)*5;
    btnStats.y2        = btnStats.y1+btnStats.height+btnStats.space;
    btnStats.y3        = btnStats.y2+btnStats.height+btnStats.space;
    btnStats.fontSize  = 15*sf;
    btnStats.font      = `${btnStats.fontSize}px VT323`;

    drawBtn(ctx, btnStats, sf, thisLang.game.menu[1], 0, btnStats.y1);
    drawBtn(ctx, btnStats, sf, thisLang.game.menu[2], 0, btnStats.y2);
    drawBtn(ctx, btnStats, sf, thisLang.game.menu[3], 0, btnStats.y3);

    // Button events

    canvas.addEventListener('click', btnClick);

    function btnClick(evt) {
      const mouseX = (evt.clientX-evt.target.getBoundingClientRect().left)*(evt.target.width/evt.target.getBoundingClientRect().width);
      const mouseY = (evt.clientY-evt.target.getBoundingClientRect().top)*(evt.target.height/evt.target.getBoundingClientRect().height);

      if (mouseX >= btnStats.x && mouseX <= btnStats.x+btnStats.width*sf) {
        if        (mouseY >= btnStats.y1 && mouseY <= btnStats.y1+btnStats.height*sf) { // Resume
          canvas.removeEventListener('click', btnClick); canvas.removeEventListener('mousemove', btnHover);
          player.attackT += (new Date().getTime())-menuTime; engine.initTime += (new Date().getTime())-menuTime; // Correct timers
          enemies.forEach(enemy => { enemy.attackT += (new Date().getTime())-menuTime; });
          engine._start();
        } else if (mouseY >= btnStats.y2 && mouseY <= btnStats.y2+btnStats.height*sf) { // Restart
          canvas.removeEventListener('click', btnClick); canvas.removeEventListener('mousemove', btnHover);
          gameMain(sf, ts, thisLang, mapName, images, audioFiles);
        } else if (mouseY >= btnStats.y3 && mouseY <= btnStats.y3+btnStats.height*sf) { // Quit
          canvas.removeEventListener('click', btnClick); canvas.removeEventListener('mousemove', btnHover);
          ctxBar.clearRect(0, 0, canvasBar.width, canvasBar.height); // Clears upper canvas
          mainMenu(sf, ts, canvas.width/sf, canvas.height/sf, thisLang);
        }
      }
    }

    canvas.addEventListener('mousemove', btnHover);

    function btnHover(evt) {
      const mouseX = (evt.clientX-evt.target.getBoundingClientRect().left)*(evt.target.width/evt.target.getBoundingClientRect().width);
      const mouseY = (evt.clientY-evt.target.getBoundingClientRect().top)*(evt.target.height/evt.target.getBoundingClientRect().height);

      if        (mouseX >= btnStats.x && mouseX <= btnStats.x+btnStats.width*sf && mouseY >= btnStats.y1 && mouseY <= btnStats.y1+btnStats.height*sf) {
        drawBtn(ctx, btnStats, sf, thisLang.game.menu[1], btnStats.height, btnStats.y1);
        drawBtn(ctx, btnStats, sf, thisLang.game.menu[2],               0, btnStats.y2);
        drawBtn(ctx, btnStats, sf, thisLang.game.menu[3],               0, btnStats.y3);
        canvas.style.cursor = 'pointer';
      } else if (mouseX >= btnStats.x && mouseX <= btnStats.x+btnStats.width*sf && mouseY >= btnStats.y2 && mouseY <= btnStats.y2+btnStats.height*sf) {
        drawBtn(ctx, btnStats, sf, thisLang.game.menu[1],               0, btnStats.y1);
        drawBtn(ctx, btnStats, sf, thisLang.game.menu[2], btnStats.height, btnStats.y2);
        drawBtn(ctx, btnStats, sf, thisLang.game.menu[3],               0, btnStats.y3);
        canvas.style.cursor = 'pointer';
      } else if (mouseX >= btnStats.x && mouseX <= btnStats.x+btnStats.width*sf && mouseY >= btnStats.y3 && mouseY <= btnStats.y3+btnStats.height*sf) {
        drawBtn(ctx, btnStats, sf, thisLang.game.menu[1],               0, btnStats.y1);
        drawBtn(ctx, btnStats, sf, thisLang.game.menu[2],               0, btnStats.y2);
        drawBtn(ctx, btnStats, sf, thisLang.game.menu[3], btnStats.height, btnStats.y3);
        canvas.style.cursor = 'pointer';
      } else {
        drawBtn(ctx, btnStats, sf, thisLang.game.menu[1], 0, btnStats.y1);
        drawBtn(ctx, btnStats, sf, thisLang.game.menu[2], 0, btnStats.y2);
        drawBtn(ctx, btnStats, sf, thisLang.game.menu[3], 0, btnStats.y3);
        canvas.style.cursor = 'default';
      }
    }
}

function drawBtn(ctx, btnStats, sf, txt, sh, y) {
  drawImg(ctx, btnStats.img, 0, sh, btnStats.width, btnStats.height, btnStats.x, y, btnStats.width*sf, (btnStats.height)*sf);
  drawCenteredText(ctx, canvas.width/2, y+((btnStats.height*sf)/2)+(btnStats.fontSize/4), btnStats.font, txt, '#ffffff');
}
