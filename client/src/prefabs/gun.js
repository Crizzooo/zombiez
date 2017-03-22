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
    this.whatever = game;
  }

  shoot(player) {

    // if (this.game.time.time < this.nextFire) { return; }
    let bullet = this.gunBullets.getFirstExists(false);
    let x = player.world.x;
    let y = player.world.y;
    if(!bullet){
      bullet = new Bullet(this.whatever, 'bullet', {x : this.x , y: this.y}, {
        group: 'player',
        initial: 1,
        texture: 'gunSpriteSheet'
      });
      this.gunBullets.add(bullet);
    } else {
      bullet.reset(x, y);
    }
    bullet.rotation = this.game.physics.arcade.moveToPointer(bullet, 600);
  }

  hitWall(bullet, layer){
    bullet.kill();
  }

  hitZombie(zombie, bullet){
	  console.log("ZOMBZ", zombie);
	  zombie.hit = true;
		zombie.animations.stop();
	  zombie.animations.play('dead')
		//let animationRef = zombie.animations.play('dead').animationReference.isPlaying;

	  zombie.animations.currentAnim.onComplete.add( () => {
		  zombie.kill();
	  })

	  bullet.kill();
	  //setTimeout(zombie.kill, 500);
  }
}