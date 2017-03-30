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

function placePickupOnMap(pickupType, pickupObj, x, y){
  //create an id for the sprite
  let id =  pickupType === 'health' ? 'healthPickup' + ++healthCount : 'speedPickup' +
    ++speedCount;
  //create the sprite
  let pickupSprite = gameState.createPrefab(pickupType + 'Pickup', {
    type: 'pickup',
    properties: {
      name: id,
      group: 'pickups',
      type: pickupType
    }
  }, {x, y});

  //attach the id
  pickupSprite.id = id;
  pickupSprite.type = pickupType;

  //store in correct hashMap
  if (pickupType === 'health') {
    healthPickupSprites[id] = pickupSprite;
  } else if (pickupType == 'speed') {
    speedPickupSprites[id] = pickupSprite;
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
    y
  }

  store.dispatch(addPickupEvent(eventObj));
  if (type === '')

  setTimeout( () => {
    store.dispatch(removePickupEvent(eventId));
  }, EVENT_LOOP_DELETE_TIME * 1.5);
}

export const createDestroyEvent = (type, pickupSpriteId) => {
  let eventId = socket.id + eventPickupCount++;

  let eventObj = {
    event: 'destroy',
    type,
    pickupSpriteId,
    id: eventId
  }

  store.dispatch(addPickupEvent(eventObj));

  setTimeout( () => {
        store.dispatch(removePickupEvent(eventId));
  }, EVENT_LOOP_DELETE_TIME * 1.5);
}

//createHealth
function createHealth(x, y){
  placePickupOnMap('health', healthPickupObj, x, y);
}


//createSpeed
function createSpeed(){
  placePickupOnMap('speed', speedPickupObj, x, y);
}

//destroyHealth
function destroyHealth(pickupId){
  //find sprite in hash, destroy and remove it
}

//destroySpeed
function destroySpeed(pickupId){

}


//handle event
    //check event against event hash
      //handle it depending on pickup type
    //push to dispatch event




//sendEvent
  //assign id
  //dispatch
