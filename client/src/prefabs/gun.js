import GunPrefab from './GunPrefab';
import Bullet from './bullet';

export default class Gun extends GunPrefab {
  constructor(game, name, position, properties, bulletPrefab) {
    super(game, name, position, properties);
    this.game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.anchor.setTo(0.5);
    this.pivot.x = -10;
    console.log("BUULLET", bulletPrefab);
  }

  initializeWeapon(game) {
    // this.group = new Phaser.Group(game.game, game.world, 'Single Bullet', false, true, Phaser.Physics.ARCADE);
    this.gunBullets = game.game.add.group();
    this.gunBullets.enableBody = true;
    this.gunBullets.nextFire = 0;
    this.gunBullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.gunBullets.setAll('outOfBoundsKill', true);
    this.gunBullets.setAll('checkWorldBounds', true);

    this.gunBullets.bulletSpeed = 600;

    this.bulletGroup = this.gunBullets;

    this.game = game;
  }

  shoot(player, group) {
    let bulletGroup;
    if (!group) {
      bulletGroup = player.gun.bulletGroup;
    } else {
      bulletGroup = group;
    }
    // if (this.game.time.time < this.nextFire) { return; }
    console.log('player firing: ', player);
    let bullet = bulletGroup.getFirstExists(false);
    let x = player.x;
    let y = player.y;
    if(!bullet){
      bullet = new Bullet(this.game, 'bullet', {x : this.x , y: this.y}, {
        group: 'player',
        initial: 1,
        texture: 'gunSpriteSheet'
      });
      bulletGroup.add(bullet);
    } else {
      bullet.reset(x, y);
    }
    //TODO: we will not be able to use moveToPointer for remote Players
    //TODO: either we change this or we implement a separate function for firing for remote players
    //TODO: bullet.rotation = this.game.physics.arcade.moveToXY(displayObj, x, y, speed, maxTime)
    // speed = 600
    bullet.rotation = this.game.physics.arcade.moveToXY(bullet, player.pointerX, player.pointerY, 600);
  }

  hitWall(bullet, layer){
    bullet.kill();
  }

  hitZombie(zombie, bullet){
    // let zombDeath = zombie.animations.add('dead', [1, 2, 3, 4, 5, 6, 7, 8, 0], 9, false);
    console.log("ZOMBZ", zombie);
	  zombie.hit = true;
	  bullet.kill();
		zombie.animations.stop();
	  zombie.animations.play('dead')
		//let animationRef = zombie.animations.play('dead').animationReference.isPlaying;
    zombie.zombDeath.onComplete.add(() => zombie.kill(), this);
  }
  
}
