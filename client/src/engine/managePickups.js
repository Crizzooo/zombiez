import {addPickupEvent, removePickupEvent} from '../reducers/players-reducer.js';
import store from '../store.js';
import {EVENT_LOOP_DELETE_TIME, PICKUP_RESPAWN_RATE} from './gameConstants.js';
import { createNewGameLogMessage } from '../engine/gameLogManager.js';



let healthPickupObj = {
  type: 'pickup',
  properties: {
    name: 'healthPickup',
    group: 'pickups',
    type: 'health'
  }
};

let speedPickupObj = {
  type: 'pickup',
  properties: {
    name: 'speedPickup',
    group: 'pickups',
    type: 'speed'
  }
};

let spawnLocations = [ [ 320, 78 ],
  [ 575, 275 ],
  [ 816, 78 ],
  [ 64, 640 ],
  [ 544, 514 ],
  [ 607, 514 ],
  [ 544, 573 ],
  [ 607, 573 ],
  [ 1056, 670 ],
  [ 481, 1056 ],
  [ 670, 1056 ] ];


let healthPickupSprites = {};

let speedPickupSprites = {};

let pickupEventHash = {};

let healthCount = 0;
let speedCount = 0;

//counter variable to generate id
let eventPickupCount = 0;

let gameState;

let occupiedLocationHash = {};
//init pickups function on load
export const initPickups = (receivedState) => {
  gameState = receivedState;
  gameState.powerupGroup = gameState.game.add.group();
  gameState.powerupGroup.enableBody = true;
  gameState.powerupGroup.physicsBodyType = Phaser.Physics.ARCADE;
  gameState.powerupGroup.name = 'powerupGroup';
  initHealth();
  initSpeed();
}

function initHealth(){
  createPowerupSprite('health', getRandomSpawnLocation());
  createPowerupSprite('health', getRandomSpawnLocation());
}

function initSpeed(){
  createPowerupSprite('speed', getRandomSpawnLocation());
  createPowerupSprite('speed', getRandomSpawnLocation());
}

export const playerCollidePowerup = (player, pickup, pickupId) => {
  //dispatch a destroy event to all players, it should
  createDestroyEvent(pickup.type, pickup.id);

  let item = pickup.type === 'health' ? 'health pack' : 'speed boost';
  createNewGameLogMessage(`${player.name} has picked up a ${item}!`);

  let pickupType = pickup.type;

  if(pickupType === 'health'){
    if(player.stats.health >= 70) player.stats.health = 100;
    else player.stats.health += 30;
    player.setHealth(player.stats.health);
  }  else if (pickupType === 'speed') {
    player.stats.movement += 100;
    let intervalId = setTimeout(()=>{player.stats.movement -= 100; clearInterval();}, 5000);
  }

  let intervalId = setTimeout(()=>{
    createCreateEvent(pickupType);
    clearInterval(intervalId);
  }, PICKUP_RESPAWN_RATE)
}

function createPowerupSprite(powerupType, spawnPos){
  let x = spawnLocations[spawnPos][0];
  let y = spawnLocations[spawnPos][1];
  let powerupSprite = gameState.game.add.sprite(x, y, powerupType+'Pickup');
  let id =  powerupType === 'health' ? 'healthPickup' + ++healthCount : 'speedPickup' + ++speedCount;
  gameState.game.physics.arcade.enable(powerupSprite);
  powerupSprite.enableBody = true;
  powerupSprite.body.immovable = true;
  powerupSprite.anchor.setTo(0.5);
  powerupSprite.type = powerupType;
  powerupSprite.id = id;
  powerupSprite.startingX = x;
  powerupSprite.startingY = y;
  powerupSprite.spawnPosition = spawnPos;
  gameState.powerupGroup.children.push(powerupSprite);
  gameState.game.add.existing(powerupSprite);

  occupiedLocationHash[powerupSprite.spawnPosition] = true;

  powerupSprite.existing = false;
  let existInterval = setTimeout( () => {
    powerupSprite.existing = true;
    clearInterval(existInterval);
  }, 100);


  if (powerupType === 'health') {
    healthPickupSprites[id] = powerupSprite;
  } else if (powerupType === 'speed') {
    powerupSprite.scale.setTo(0.5);
    speedPickupSprites[id] = powerupSprite;
  }
  return powerupSprite;
}

function getRandomSpawnLocation(){
  let randomPosition = Math.floor(Math.random() * spawnLocations.length);
  if (occupiedLocationHash[randomPosition] !== true){
    return randomPosition;
  } else {
    do{
    randomPosition = Math.floor(Math.random() * spawnLocations.length);
    }while(occupiedLocationHash[randomPosition] === true)
  }
  return randomPosition;
}
//handleCreateEvent
export const createCreateEvent = (type) => {
  let spawnPosition = getRandomSpawnLocation();
  let eventId = socket.id + eventPickupCount++;

  let eventObj = {
    event: 'create',
    type,
    spawnPosition,
    eventId
  }

  //tell others to create it
  currentPlayerSprite.playerPickupHash[eventId] = eventObj;

  //we create it
  if (type === 'health') {
    createNewGameLogMessage(`A new health pack has been placed!`);
    createHealth(spawnPosition);
  } else if (type === 'speed') {
    createNewGameLogMessage(`A new speed boost has been placed!`);
    createSpeed(spawnPosition);
  }

  let intervalId = setTimeout( () => {
    store.dispatch(removePickupEvent(eventId));
    clearInterval(intervalId);
  }, EVENT_LOOP_DELETE_TIME * 1.5);
}

export const createDestroyEvent = (type, pickupSpriteId) => {
  let eventId = socket.id + eventPickupCount++;

  let eventObj = {
    event: 'destroy',
    type,
    pickupSpriteId,
    eventId
  }

  //tell others to destroy the sprite
  currentPlayerSprite.playerPickupHash[eventId] = eventObj;

  if (type === 'speed'){
    //TODO: MSG  picked up health and speed pack
    destroySpeed(pickupSpriteId);
  } else if (type === 'health'){
    //TODO: MSG  picked up health and speed pack
    destroyHealth(pickupSpriteId);
  }


  //we destreoy it ourselves
  let intervalId = setTimeout( () => {
    store.dispatch(removePickupEvent(eventId));
    clearInterval(intervalId);
  }, EVENT_LOOP_DELETE_TIME * 1.5);
}

//createHealth
function createHealth(spawnPos){
  createPowerupSprite('health', spawnPos);
}


//createSpeed
function createSpeed(spawnPos){
  createPowerupSprite('speed', spawnPos);
}

//destroyHealth
function destroyHealth(pickupId){
  //find sprite in hash, destroy and remove it
  let pickUpToDestroy = healthPickupSprites[pickupId];
  if (pickUpToDestroy){
    occupiedLocationHash[pickUpToDestroy.spawnPosition] = false;
    pickUpToDestroy.destroy();
  }
  delete healthPickupSprites[pickupId];
}

//destroySpeed
function destroySpeed(pickupId){
  //find sprite in speed hash and remove it
  let pickUpToDestroy = speedPickupSprites[pickupId];
  if (pickUpToDestroy){
    occupiedLocationHash[pickUpToDestroy.spawnPosition] = false;
    pickUpToDestroy.destroy();
  }
  delete healthPickupSprites[pickupId];
}


//handle event
export const handlePickupEvent = (event, eventId) => {
  if(pickupEventHash[eventId] !== true){
    if (event.event == "create"){
      if (event.type === "health"){
        createHealth(event.spawnPosition)
        pickupEventHash[eventId] = true;
      } else {
        createSpeed(event.spawnPosition)
        pickupEventHash[eventId] = true;
      }
    } else if (event.event === "destroy"){
      if(event.type === 'health'){
        destroyHealth(event.pickupSpriteId);
        pickupEventHash[eventId] = true;
      } else {
        destroySpeed(event.pickupSpriteId);
        pickupEventHash[eventId] = true;
      }
    }

  } else {
    return;
  }
  //check event against event hash
  //handle it depending on pickup type
  //push to dispatch event
}
