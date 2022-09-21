
//--- Draws a regular rectangle - no stroke
export function drawFillRect(context, x, y, w, h, c) {
  context.beginPath();
    context.fillStyle = c;
    context.fillRect(x, y, w, h);
 }

 //--- Draws a regular rectangle - no fill
 export function drawStrokeRect(context, x, y, w, h, c, lw) {
   context.beginPath();
     context.strokeStyle = c;
     context.lineWidth = lw;
     context.rect(x, y, w, h);
     context.stroke();
  }

  //--- Draws a regular rectangle - stroke and fill
  export function drawRect(context, x, y, w, h, c, sc, lw) {
    context.beginPath();
      context.fillStyle = c;
      context.strokeStyle = sc;
      context.lineWidth = lw;
      context.rect(x, y, w, h);
      context.stroke();
      context.fill();
   }

 //--- Draws an image where sx, sy, sw and sh what part of the image should be cut and used
 export function drawImg(context, img, sx, sy, sw, sh, x, y, w, h) {
   context.beginPath();
    context.imageSmoothingEnabled = false; // Stops the default anti-aliasing of drawn images
    context.drawImage(img, sx, sy, sw, sh, x, y, w, h);
 }

 //--- Draws text
 export function drawText(context, x, y, font, txt, c) {
   context.beginPath();
   context.fillStyle = c;
    context.font = font;
    context.fillText(txt, x, y);
 }

 //--- Draws text that is centered
 export function drawCenteredText(context, x, y, font, txt, c) {
   context.beginPath();
   context.fillStyle = c;
    context.font = font;
    context.fillText(txt, x-(context.measureText(txt).width/2), y);
 }
