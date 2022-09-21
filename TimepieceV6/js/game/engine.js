/* Connects the other objects: display, game */

// Importing modules
import {loadImages, loadAudios, loadJSON} from './../libs/loaders.js';

export default class Engine {
  constructor(setValues, render, keyPressed, talkKeyPressed) {
    this.animationFrameRequest = undefined;
    this.initTime;
    this.keyPressed = keyPressed;
    this.talkKeyPressed = talkKeyPressed;
    this.setValues = setValues;
    this.render = render;
    this.mode = 'talk';
  }

  _removeTalkListeners() {
    document.removeEventListener('keydown', this.talkKeyPressed);
    document.removeEventListener('keyup', this.talkKeyPressed);
  }

  _addTalkListeners() {
    document.addEventListener("keydown", this.talkKeyPressed); // If a key on the keyboard is pressed
    document.addEventListener("keyup", this.talkKeyPressed); // If a key on the keyboard is released
  }

  _removePlayListeners() {
    document.removeEventListener('keydown', this.keyPressed);
    document.removeEventListener('keyup', this.keyPressed);
  }

  _addPlayListeners() {
    document.addEventListener("keydown", this.keyPressed); // If a key on the keyboard is pressed
    document.addEventListener("keyup", this.keyPressed); // If a key on the keyboard is released
  }

  _load(mapName) {
      const map = loadJSON(`./json/maps/${mapName}`).then(file => { // Loads a JSON-file of the map
                      this.setValues(file);

                      this.initTime = new Date().getTime(); // Gets the time as the game starts
                      this._start();
                  });
  }

  _start() {
    if (this.mode === 'talk') { this._addTalkListeners(); }
    else if (this.mode === 'play') { this._addPlayListeners(); }

    this.render();
  }

  _stop() {
    cancelAnimationFrame(this.animationFrameRequest);
    this._removePlayListeners(); this._removeTalkListeners();
  }
}
