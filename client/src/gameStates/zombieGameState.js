const R = require('ramda');
const throttle = require('lodash.throttle');


const init = (msg) => {
  //set constants for game
  PB.customParams.RUNNING_SPEED = 180;
  PB.customParams.JUMPING_SPEED = 100;

  //initiate physics
  PB.game.physics.arcade.gravity.y = GRAVITY;

  //cursor keys
  //PB.game.cursors created in boot state file
}

const preload = () => {
  //load assets that are specific for this mini game
}

const create = () => {
  //create game set up
  loadLevel();
}


const update = () => {
  //NOTE: Collision between SpriteA and SpriteB - callback takes in SpriteA and SpriteB
}


const loadLevel = () => {
  PB.gameBackground = PB.game.add.sprite(PB.game.world.centerX, PB.game.world.centerY, 'snowLandscape');
  PB.gameBackground.scale.setTo(0.9, 0.9);
  PB.gameBackground.anchor.setTo(0.5);


  //resize the world to fit the layer
  PB.game.world.resize(570, 550);

};
