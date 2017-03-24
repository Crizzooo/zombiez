import GunPrefab from './GunPrefab';
import Bullet from './bullet';

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

    this.bulletGroup = this.gunBullets;

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
        group: 'player',
        initial: 1,
        texture: 'pistolSpriteSheet'
      });
      bulletGroup.add(bullet);

      //Change bullet ui
	    player.clipUpdate();
    } else {
      bullet.reset(x, y);
    }
    bullet.rotation = this.game.physics.arcade.moveToXY(bullet, player.pointerX, player.pointerY, 600);
    this.ammo--;
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
	  console.log('zombie---------------->', zombie);
	  console.log('zombie', zombie.zombDeath);

    zombie.zombDeath.onComplete.add(() => zombie.kill(), this);
  }
}
