
import {drawFillRect} from './../libs/drawLib.js';

export default class Projectile {
  constructor(x, y, w, h, dir, vx, sf, ts, canvas, map, player) {
    this.x  = x;
    this.y  = y;
    this.w  = w;
    this.h  = h;
    this.dir = dir;
    this.vx = vx;
    this.sf = sf;
    this.ts = ts;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.map = map;
  }

  _draw() {
    drawFillRect(this.ctx, this.x, this.y, this.w, this.h, 'rgb(97, 97, 97)'); // Draws a grey bullet of two pixels
  }

  _move() {
    switch (this.dir) {
      case 'left':  this.x -= this.vx; break;
      case 'right': this.x += this.vx; break;
    }
  }

  _collisionObst(projectiles, pjIdx) {
    this.map.forEach(chunk => { chunk.forEach(row => { row.forEach((tile, idx) => {
          if (tile.type === 'obst') { // Checks if the projectile hits an obstacle
            if (this.x+this.w >= tile.x && this.x <= tile.x+this.ts && this.y+this.h >= tile.y && this.y <= tile.y+this.ts) {
             projectiles.splice(pjIdx, 1); // Removes the projectile from the array when it hits an obstacle
            }
          }
    }); }); });
  }

  _collisionEnemy(projectiles, pjIdx, enemy, player) {
    if (this.x+this.w >= enemy.x && this.x <= enemy.x+enemy.w && this.y+this.h >= enemy.y && this.y <= enemy.y+enemy.h) { // Checks if the projectile hits an enemy
      projectiles.splice(pjIdx, 1); // Removes the projectile from the array when it hits an enemy
      enemy.hp -= player.weapons[2].dmg; // The enemy takes damage
    }
  }

} //
