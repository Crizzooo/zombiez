import {addPickupEvent, removePickupEvent} from '../reducers/players-reducer.js';
import store from '../store.js';
import {EVENT_LOOP_DELETE_TIME, PICKUP_RESPAWN_RATE} from './gameConstants.js';




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
  console.log('player: ', player);
  console.log('pickup: ', pickup);
  console.log('pickup-type: ', pickup.type);
  console.log('pickupId: ', pickup.id);

  createDestroyEvent(pickup.type, pickup.id);

  let pickupType = pickup.type;

  if(pickupType === 'health'){
    if(player.stats.health >= 70) player.stats.health = 100;
    else player.stats.health += 30;
    player.setHealth(player.stats.health);
  }  else if (pickupType === 'speed') {
    player.stats.movement += 100;
    console.log('PICKED UP SPEEED BOOOST', player)
    let intervalId = setTimeout(()=>{player.stats.movement -= 100; clearInterval();}, 5000);
  }

  let intervalId = setTimeout(()=>{
    createCreateEvent(pickupType);
    clearInterval(intervalId);
  }, PICKUP_RESPAWN_RATE)
}

function createPowerupSprite(powerupType, spawnPos){
  console.log('in create power up sprite')
  console.log('looking at spwnLocations with this spawnPos: ', spawnPos);
  let x = spawnLocations[spawnPos][0];
  let y = spawnLocations[spawnPos][1];
  console.log('trying to create at these x and y now: ', x, y);
  let powerupSprite = gameState.game.add.sprite(x, y, powerupType+'Pickup');
  let id =  powerupType === 'health' ? 'healthPickup' + ++healthCount : 'speedPickup' + ++speedCount;
  gameState.game.physics.arcade.enable(powerupSprite);
  console.log('powerupSprite? ', powerupSprite);
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
  // console.log('powerup Sprite: ', powerupSprite);
  console.log('powerup sprite:x', powerupSprite.x);
  console.log('powerup sprite:y', powerupSprite.y);

  console.log('adding powerupSprite to the occupied location hash', powerupSprite);
  console.log('Hash pre-add: ', occupiedLocationHash);
  occupiedLocationHash[powerupSprite.spawnPosition] = true;
  console.log('Hash post-add: ', occupiedLocationHash);

  if (powerupType === 'health') {
    healthPickupSprites[id] = powerupSprite;
    console.log('after placing pickup', healthPickupSprites);
  } else if (powerupType === 'speed') {
    powerupSprite.scale.setTo(0.5);
    speedPickupSprites[id] = powerupSprite;
    console.log('after placing pickup', speedPickupSprites);
  }
  console.log('gamestate group: ', gameState.powerupGroup);
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
  console.log('random spawn position chosen: ', randomPosition);
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
  // store.dispatch(addPickupEvent(eventObj));
  currentPlayerSprite.playerPickupHash[eventId] = eventObj;
  console.log('currentPlayerSprite after create event: ', currentPlayerSprite);
  console.log('creating with this spawnPosition: ', spawnPosition)

  //we create it
  if (type === 'health') {
    // createHealth(x, y);
    //TODO: a speed pack has been placed on the map
    console.log('calling create health');
    createHealth(spawnPosition);
  } else if (type === 'speed') {
    // createSpeed(x, y);
    console.log('calling create speed');
    //TODO: a speed pack has been placed on the map
    createSpeed(spawnPosition);
  }

  let intervalId = setTimeout( () => {
    console.log(store.getState().players.currentPlayer.playerPickupHash[eventId]);
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
  // store.dispatch(addPickupEvent(eventObj));
  console.log('currentPlayerSprite: ', currentPlayerSprite);
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
  console.log('creating pickup at spawn pos: ', spawnPos, gameState.powerupGroup);
  createPowerupSprite('health', spawnPos);
}


//createSpeed
function createSpeed(spawnPos){
  console.log('creating pickup at spawn pos: ', spawnPos, gameState.powerupGroup);
  createPowerupSprite('speed', spawnPos);
}

//destroyHealth
function destroyHealth(pickupId){
  //find sprite in hash, destroy and remove it
  console.log('entered destroy health for this id: ', pickupId);
  let pickUpToDestroy = healthPickupSprites[pickupId];
  console.log('pickuptoDestroy: ', pickUpToDestroy);
  console.log('currnet locations pre destroy: ', occupiedLocationHash);
  if (pickUpToDestroy){
    occupiedLocationHash[pickUpToDestroy.spawnPosition] = false;
    pickUpToDestroy.destroy();
  }
  console.log('current locations post destroy: ', occupiedLocationHash);
  delete healthPickupSprites[pickupId];
}

//destroySpeed
function destroySpeed(pickupId){
  //find sprite in speed hash and remove it
  console.log('entered destroy speed for this id: ', pickupId);
  let pickUpToDestroy = speedPickupSprites[pickupId];
  console.log('pickupToDestroy from pickup hashes: ', pickUpToDestroy);
  console.log('pickuptodestroy.spawnPos: ', pickUpToDestroy);
  console.log('currnet locations pre destroy: ', occupiedLocationHash);
  console.log('current locations post destroy: ', occupiedLocationHash);
  if (pickUpToDestroy){
    occupiedLocationHash[pickUpToDestroy.spawnPosition] = false;
    pickUpToDestroy.destroy();
  }
  delete healthPickupSprites[pickupId];
}


//handle event
export const handlePickupEvent = (event, eventId) => {
  // console.log('received a pickup event');
  // console.log('event: ', event);
  // console.log('eventId: ', eventId);
  // console.log('pickupo hash map: ', pickupEventHash);
  if(pickupEventHash[eventId] !== true){
    console.log('got in to handlePickup event: ', event);
    console.log('event.event', event.event);
    if (event.event == "create"){
      console.log('received create event')
      if (event.type === "health"){
        console.log('received new create event');
        createHealth(event.spawnPosition)
        pickupEventHash[eventId] = true;
      } else {
        createSpeed(event.spawnPosition)
        pickupEventHash[eventId] = true;
      }
    } else if (event.event === "destroy"){
      console.log('received destroy event');
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
