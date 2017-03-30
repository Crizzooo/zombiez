import addPickupEvent from '../reducers/players-reducer.js';


//counter variable to generate id
let eventPickupCount = 0;

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


let healthPickupSprites = {

}

let speedPickupSprites = {

}

let pickupEventHash = {

}

let healthCount = 0;
let speedCount = 0;


let gameState;
//init pickups function on load
export const initPickups = (receivedState) => {
  gameState = receivedState;
  initHealth();
  initSpeed();

}

function initHealth(){
  //TODO: change starting locations
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

  //store in correct hashMap
  if (pickupType === 'health') {
    healthPickupSprites[id] = pickupSprite;
  } else if (pickupType == 'speed') {
    speedPickupSprites[id] = pickupSprite;
  }
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
