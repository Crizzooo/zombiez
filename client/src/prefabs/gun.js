import GunPrefab from './GunPrefab';
import Bullet from './bullet';
import {playerFired} from '../reducers/players-reducer.js';
import store from '../store.js';

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
  }

  initializeWeapon(game) {
    // this.group = new Phaser.Group(game.game, game.world, 'Single Bullet', false, true, Phaser.Physics.ARCADE);
    this.gunBullets = game.game.add.group();
    this.gunBullets.enableBody = true;
    // this.gunBullets.nextFire = 10000;
    this.gunBullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.gunBullets.setAll('outOfBoundsKill', true);
    this.gunBullets.setAll('checkWorldBounds', true);

    this.gunBullets.name = 'currentPlayerBulletGroup';

    this.gunBullets.bulletSpeed = 600;


    this.game = game;
  }

  shoot(player, group) {
    //NOTE: shoot gets called with currentPlayerSprite.gun.gunBullets OR game.remoteBulletGroup, if shoot is being called due to a server 'remoteFire' emit
    let bulletGroup = group;

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
      bullet = new Bullet(this.game, 'bullet', {x : this.x , y: this.y}, {
        //NOTE: we can reimplement 'group' here if needed
        initial: 1,
        texture: 'pistolSpriteSheet'
      });
      bulletGroup.add(bullet);
    } else {
      bullet.reset(x, y);
    }
    bullet.rotation = this.game.physics.arcade.moveToXY(bullet, player.pointerX, player.pointerY, this.gunBullets.bulletSpeed);
    bullet.shooterSocketId = player.socketId;
    this.ammo--;
    if (player.socketId === socket.id){
      console.log('player socketId: ', player.socketId);
      console.log('my socket id: ', socket.id);
      console.log('current player fired a gun, so we will update our state with the fire obj');
      console.log('shooting with :', player.pointerX, player.pointerY);
			store.dispatch(playerFired(player.pointerX, player.pointerY, socket.id));
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
