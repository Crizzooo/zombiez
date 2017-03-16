Zombiez was initiated with code from @Crizzooo's platformerbattle



## Table of Contents

- [Folder Structure](#folder-structure)

## Folder Structure

The basic structure is that players join lobbies, which results in teh creation of player objects that hold a score and name.

When there is at least 1 player, the Play Game! button can be clicked, and the Phaser game is initiated with an array of the player objects.

Every 'tick', updates are sent to the server and then dispatched back out. We will need to think about netcode strategies to hold all our game instances in sync for players.

Our Project looks like the below diagram:
```
my-app/
  README.md
  node_modules/
  package.json

  client/         
    components/     <-- React components
    containers/     <-- containers to hold props for react        
                        components
    gameStates/      <-- Holds all game states for Phaser
                        will need a preload, a boot, and a game at the minimum
    prefabs/        <-- This is where we create 'classes' for
                        enemies/objects we will use in our phaser game and initiate with sprites!
    reducers/       <-- This is where we will create client
                        reducers to validate and determine game states from the server

  assets/           <-- All Game assets go in here
    index.html      <-- loads our needed scripts and initiates
                      global namespace variables
    favicon.ico

  server/
    index.js        <--- We will probably need to implement server
                         reducers in here
  phaser.min.js
```

For the project to build, **these files must exist with exact filenames**:

* `public/index.html` is the page template;
* `src/index.js` is the JavaScript Webpack entry point.


You may create subdirectories inside `src`. For faster rebuilds, only files inside `src` are processed by Webpack.<br>
You need to **put any JS and CSS files inside `src`**, or Webpack won’t see them.
