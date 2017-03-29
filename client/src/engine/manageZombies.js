
import store from '../store.js';
import { updateLocalZombies } from '../reducers/zombies-reducer.js';
import R from 'ramda';

//initalize zombies
//TODO: when we add zombies, add the zombieId's to these hashes
export let localZombieSpriteStates = {};
export let remoteZombieSprites = {};
let localZombieCount;
var gameState;
export function initializeZombies(gameContext){
  gameState = gameContext;
  localZombieCount = 0;
}


//create localZombie
    //dispatch to add_zombie to local reducer
    //add to localZombieGroup
export function createLocalZombie(context, zombieStartX, zombieStartY){
  // console.log('what is context that createPrefab is called off?', context);
  let zombie = context.createPrefab('zombie',
    {
      type: 'enemies',
      properties: {
        group: 'localZombieSpriteGroup',
        initial: 9,
        texture: 'zombieSpriteSheet'
      }
    }, {x: zombieStartX, y: zombieStartY});

  //move to func?
  // zombie.moveTo = throttle(this.currentEnemy.moveTo, 1000);
  zombie.animations.play('left');
  // context.localZombieGroup.add(zombie);
  zombie.ownerId = socket.id;
  zombie.id = 'zombie' + socket.id + localZombieCount;
  localZombieCount++;

  localZombieSpriteStates[zombie.id] = {
    x: zombie.x,
    y: zombie.y,
    health: zombie.health,
    ownerId: zombie.ownerId,
    dir: '',
    frame: zombie.frame
  }
  // context.add.existing(zombie);
  // console.log('created local zombie: ', zombie);
  // console.log('LZSG after create: ', localZombieSpriteStates);

  //dispatch ADD ZOMBIE to local store
}

export function createRemoteZombie(zombieFromServer, clientId, zombieId) {
  // console.log('creating zombie out of this: ', zombieFromServer);
  let zombie = gameState.createPrefab('zombie',
    {
      type: 'enemies',
      properties: {
        group: 'remoteZombieSpriteGroup',
        initial: 9,
        texture: 'zombieSpriteSheet'
      }
    }, {x: zombieFromServer.x, y: zombieFromServer.y});

  zombie.animations.play('left');

  zombie.ownerId = zombieFromServer.ownerId;
  zombie.id = zombieId;

  remoteZombieSprites[clientId][zombieId] = zombie;
}

//create remoteZombie
    //add to remoteZombieGroup

    //add id from the creator socket id

    //create both Groups

export function updateLocalZombie(zombie, key){
  // console.log('ULZ received Zombie: ', zombie);
  let newPosition = zombie.acquireTarget();
  // zombie.moveTo(newPosition);
  zombie.position.x += 1;
  zombie.position.y -= 1;

  let newZombieState = {
    x: zombie.x,
    y: zombie.y,
    dir: zombie.dir,
    frame: zombie.frame,
    health: zombie.health
  }

  localZombieSpriteStates[zombie.id] = Object.assign({}, localZombieSpriteStates[zombie.id], newZombieState);
}

export function dispatchZombieUpdate(){
  // console.log('prev: ', prevState);
  store.dispatch(updateLocalZombies(localZombieSpriteStates));
  // console.log('after: ', store.getState());
}

export function updateRemoteZombies(){
  let remoteZombies = store.getState().zombies.remote;
  // console.log('going to update these: ', remoteZombies);
  //for each in remote Zombies, you have a key and the list of zombies
  R.forEachObjIndexed(handleRemoteZombieGroup, remoteZombies);
      //for each of those, handle remoteZombie
}

export function handleRemoteZombieGroup(zombies, clientId){
  // console.log('client Id: ', clientId);
  R.forEachObjIndexed(handleRemoteZombie, zombies);
}

export function handleRemoteZombie(zombie, zombieId){
  let clientId = zombie.ownerId;
  // console.log('looking in RPZ ', remoteZombieSprites);
  // console.log('for: ', clientId);
  // console.log('for zombieId: ', zombieId);
  let zombieToUpdate = remoteZombieSprites[clientId][zombieId];
  if (!zombieToUpdate){
    // console.log('no zombie to update, we shall create him!');
    console.log(remoteZombieSprites);
    let newZombie = gameState.remoteZombieSpriteGroup.getFirstExists(false);
    if (!newZombie){
      console.log('have to create a new zombie')
      createRemoteZombie(zombie, clientId, zombieId);
    } else {
      newZombie.x = zombie.x;
      newZombie.y = zombie.y;
      newZombie.health = zombie.health;
      newZombie.dir = zombie.dir;
      remoteZombieSprites[clientId][zombieId] = newZombie;
    }
  } else {
    // console.log('heres the zombie we update, ', zombieToUpdate);
    zombieToUpdate.x = zombie.x;
    zombieToUpdate.y = zombie.y;
    zombieToUpdate.health = zombie.health;
    zombieToUpdate.dir = zombie.dir;
    // zombieToUpdate.frame = zombie.frame;
  }
}
