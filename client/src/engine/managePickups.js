import {addPickupEvent, removePickupEvent} from '../reducers/players-reducer.js';
import store from '../store.js';
import {EVENT_LOOP_DELETE_TIME} from './gameConstants.js';




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

let spawnLocations = [ [ 320, 64 ],
  [ 576, 256 ],
  [ 832, 64 ],
  [ 64, 640 ],
  [ 544, 512 ],
  [ 576, 512 ],
  [ 544, 544 ],
  [ 576, 544 ],
  [ 1024, 640 ],
  [ 448, 1056 ],
  [ 640, 1056 ] ];


let healthPickupSprites = {};

let speedPickupSprites = {};

let pickupEventHash = {};

let healthCount = 0;
let speedCount = 0;

//counter variable to generate id
let eventPickupCount = 0;

let gameState;
//init pickups function on load
export const initPickups = (receivedState) => {
  gameState = receivedState;
  initHealth();
  initSpeed();
}

function initHealth(){
  placePickupOnMap('health', healthPickupObj, 320, 64);
  placePickupOnMap('health', healthPickupObj, 640, 1056);
}

function initSpeed(){
  placePickupOnMap('speed', speedPickupObj, 64, 640);
  placePickupOnMap('speed', speedPickupObj, 576, 512);
}

function placePickupOnMap(pickupType, pickupObj, xPos, yPos){
  //create an id for the sprite
  let id =  pickupType === 'health' ? 'healthPickup' + ++healthCount : 'speedPickup' +
    ++speedCount;
  //create the sprite
  console.log('creating ', pickupType, ' at ', xPos, yPos)
  console.log('the id is: ', id);
  debugger;
  let pickupSprite = gameState.createPrefab(pickupType + 'Pickup', {
    type: 'pickup',
    properties: {
      name: id,
      group: 'pickups',
      type: pickupType
    }
  }, {x: xPos, y: yPos});

  console.log('created sprite: ', pickupSprite);

  //attach the id
  pickupSprite.id = id;
  pickupSprite.type = pickupType;

  //store in correct hashMap
  if (pickupType === 'health') {
    healthPickupSprites[id] = pickupSprite;
    console.log('after placing pickup', healthPickupSprites);
  } else if (pickupType === 'speed') {
    speedPickupSprites[id] = pickupSprite;
    console.log('after placing pickup', speedPickupSprites);
  }

}

//handleCreateEvent
export const createCreateEvent = (type) => {
  let spawnLocation = spawnLocations[Math.floor(Math.random() * 11)];
  let x = spawnLocation[0];
  let y = spawnLocation[1];

  let eventId = socket.id + eventPickupCount++;

  let eventObj = {
    event: 'create',
    type,
    x,
    y,
    eventId
  }

  //tell others to create it
  // store.dispatch(addPickupEvent(eventObj));
  currentPlayerSprite.playerPickupHash[eventId] = eventObj;
  console.log('currentPlayerSprite after create event: ', currentPlayerSprite);

  //we create it
  if (type === 'health') {
    // createHealth(x, y);
    createHealth(200, 200);
  } else if (type === 'speed') {
    // createSpeed(x, y);
    createSpeed(200, 200);
  }

  setTimeout( () => {
    console.log(store.getState().players.currentPlayer.playerPickupHash[eventId]);
    store.dispatch(removePickupEvent(eventId));
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
    destroySpeed(pickupSpriteId);
  } else if (type === 'health'){
    destroyHealth(pickupSpriteId);
  }


  //we destreoy it ourselves
  setTimeout( () => {
        store.dispatch(removePickupEvent(eventId));
  }, EVENT_LOOP_DELETE_TIME * 1.5);
}

//createHealth
function createHealth(x, y){
  console.log('entered create func for heart:', x, y);
  placePickupOnMap('health', healthPickupObj, x, y);
  console.log(gameState.groups);
}


//createSpeed
function createSpeed(x, y){
    console.log('entered create func for speed:', x, y);
  placePickupOnMap('speed', speedPickupObj, x, y);
  console.log(gameState.groups);
}

//destroyHealth
function destroyHealth(pickupId){
  //find sprite in hash, destroy and remove it
  console.log('entered destroy health for this id: ', pickupId);
  let pickUpToDestroy = healthPickupSprites[pickupId];
  if (pickUpToDestroy){
    pickUpToDestroy.destroy();
  }
  delete healthPickupSprites[pickupId];
}

//destroySpeed
function destroySpeed(pickupId){
  //find sprite in speed hash and remove it
  console.log('entered destroy speed for this id: ', pickupId);
  let pickUpToDestroy = speedPickupSprites[pickupId];
  if (pickUpToDestroy){
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
        createHealth(event.x, event.y)
        pickupEventHash[eventId] = true;
      } else {
        createSpeed(event.x, event.y)
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
