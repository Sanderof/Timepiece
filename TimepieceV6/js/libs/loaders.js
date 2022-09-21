
/* Contains loader-functions that can load images, audio and JSON */

//--- Loads one image
export function loadImage(url) {
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener('load', () => {
            resolve(image);
        });
        image.src = url;
    });
}

//--- Loads multiple images
export function loadImages(urlArray) {
    return new Promise(resolve => {
        const images = [];
        urlArray.forEach((url, idx) => {
            images.push(new Image());
            images[idx].addEventListener('load', () => {
                resolve(images);
            });
            images[idx].src = url;
        });
        console.log("Images loaded");
    });
}

//--- Loads one audio file
export function loadAudio(url) {
    return new Promise(resolve => {
        const audio = new Audio();
        audio.addEventListener('load', () => {
            resolve(audio);
        });
        audio.src = url;
    });
}

//--- Loads multiple images
export function loadAudios(urlArray) {
    return new Promise(resolve => {
        const audios = [];
        urlArray.forEach((url, idx) => {
            audios.push(new Audio());
            audios[idx].addEventListener('loadeddata', () => {
                resolve(audios);
            });
            audios[idx].src = url;
        });
        console.log("Audio files loaded");
    });
}

//--- Loads JSON
export function loadJSON(fileName) {
  return fetch(`.${fileName}.json`) // Fetches the JSON file through a promise
         .then(file => { return file.json(); }); // Converts JSON into javascript code
}
