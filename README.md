# Timepiece
Upload of an HTML5 Canvas platformer game made in 2018 and 2019.

# About the game
The game's story revolves around a group of friends who discover a mysterious watch. By accident, the watch sends them back in time, where each of them end up in different periods of history. In the game you play as 'Vincenzo'. He is sent back to the stone age, and he is the one who gets left with the watch. It is therefore his mission to find his friends by traveling through time. He can, however, not travel from anywhere. Time travel can only be done in certain geographical locations, and Vincenzo must therefore go through different levels in order to reach these locations. In each level he must fight enemies, can collect gems and pick up melee and long-range weapons.

Only the most basic features have been implemented. There is only one type of enemy, one type of melee weapon and one type of long-range weapon, and the character cannot die or buy anything with the gems.

In addition to playing, there is a map-creator (à la Mario Maker) that can be used to make custom maps, and the game comes in English, Norwegian and French (Except for in-game dialog which is only in English).

# About the development
I spent about half a year on the game before stopping. I learned a lot from developing this. It was my first time using object-oriented programming and modules. It was also one of my earlier encounters with Node.js, express and HTTP-requests. I have tried to comment most of the code. The game does have quite a few glitches and it may lag for big maps. Some time after a stopped developing the game, I discovered a way to get rid of the game's biggest flaw, namely that the map moves and not the character! I should have changed it up by letting the player move and just draw the tiles that are in the player's immediate vicinity. Sadly, I did not get around to do that.

All graphics in the game (sprites, backgrounds, animations, buttons) I have made myself.

I do not own any rights to the audio files!

# How to run the game
1. Download node.js on your computer (if not already done)

2. Clone the repository with the terminal comman 'git clone <insert respository https-address here>'

3. cd into the folder TimepieceV6 (same folder as the file 'package.json') with the command 'cd Timepiece/TimepieceV6'

4. run the command 'npm install'

5. run the command 'node app.js'

6. Open 'https://localhost:5000' in the browser

# Game controls
(These are also explained in the English in-game dialog)

A and D keys: Move sideways

W and S keys: Climp ladders

Spacebar: Jump

O key: Attack

O key in air: Aerial attack

1 key: Select long-range weapon

2 key: Select melee weapon

3 key: Select no weapon

Esc: Pause game

