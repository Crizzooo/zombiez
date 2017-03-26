import GunPrefab from './GunPrefab';
import Bullet from './bullet';
import {playerFired} from '../reducers/players-reducer.js';
import store from '../store.js';


let bulletCount = 0;
let gameObj;
export default class Gun extends GunPrefab {
  constructor(game, name, position, properties) {
    super(game, name, position, properties);
    this.game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.anchor.setTo(0.5);
    //how much time in miliseconds do you want the player to wait
    this.rateOfFire = properties.rateOfFire;
    this.ammo = properties.clip;
    this.clip = properties.clip;
    this.reloadSpeed = properties.reloadSpeed;
    this.nextFire = 0;
    this.isReloading = false;
    this.pivot.x = -10;
    gameObj = this.game;
  }

  //TODO: move bullet speed to the gun, and have shoot method go off of player.gun.bulletSpeed
  shoot(player) {
    //NOTE: shoot gets called with currentPlayerSprite.gun.gunBullets OR game.remoteBulletGroup, if shoot is being called due to a server 'remoteFire' emit
    let bulletGroup = player.bulletGroup;

    if (this.ammo === 0 || this.game.time.time < this.nextFire) {
      if(this.isReloading) {
        return null;
      } else if (this.ammo === 0 && !this.isReloading){
      this.isReloading = true;
      this.reloadGun();
      }
      return;
    }
    let bullet = bulletGroup.getFirstExists(false);
    this.nextFire = this.game.time.time + this.rateOfFire;
    let x = player.x;
    let y = player.y;
    if(!bullet){
      console.log('game and cahce: ', this.game);
      bullet = new Bullet(this.game, 'bullet', {x : this.x , y: this.y}, {
        //NOTE: we can reimplement 'group' here if needed
        initial: 1,
        texture: 'pistolSpriteSheet'
      });
      bulletGroup.add(bullet);
    } else {
      bullet.reset(x, y);
    }
    bullet.rotation = this.game.physics.arcade.moveToXY(bullet, player.pointerX, player.pointerY, bulletGroup.bulletSpeed);
    bullet.shooterSocketId = player.socketId;
    this.ammo--;
    let bulletId;
    if (player.socketId === socket.id){
      bulletId = socket.id + bulletCount;
      console.log('current player fired a gun: ');
      console.dir(player);
      console.log('bullet.game? :', this.game.currentPlayerSprite);
      this.game.currentPlayerSprite.bulletHash[bulletId] = {
        toX:      player.pointerX,
        toY:      player.pointerY,
        socketId: socket.id,
        bulletId: bulletId
      }
      console.log('cps after adding bullet: ');
      console.dir(this.game.currentPlayerSprite.bulletHash);
      bulletCount++;

      setTimeout( () => {
        console.log('bullet hash pre delete for socket id', bulletId);
        console.log('this: ', this);
        console.dir(this.game.currentPlayerSprite.bulletHash);
        console.log('deleted?', delete this.game.currentPlayerSprite.bulletHash[bulletId]);
        console.log('after: ');
        console.dir(this.game.currentPlayerSprite.bulletHash);
      }, 1000)
			// store.dispatch(playerFired(player.pointerX, player.pointerY, socket.id, bulletId));
      //Change bullet ui for current player
      player.clipUpdate();
    } else {
      console.log('remote player just fired!');
    }
  }


  reloadGun(){
    setTimeout(() => {
      this.ammo = 30;
      this.isReloading = false;
    }, this.reloadSpeed)
  }

  hitZombie(zombie, bullet){
    console.log("ZOMBZ", zombie);
	  zombie.hit = true;
	  bullet.kill();
		zombie.animations.stop();
	  zombie.animations.play('dead')
    zombie.zombDeath.onComplete.add(() => zombie.kill(), this);
  }
}
