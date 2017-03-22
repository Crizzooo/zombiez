import Prefab from './Prefab';
import Bullet from './bullet';
export default class Gun extends Prefab {
    constructor(game, name, position, properties, bulletPrefab) {
        super(game, name, position, properties);
        this.game.physics.arcade.enable(this);
        this.body.collideWorldBounds = true;
        this.anchor.setTo(0.5);
        this.pivot.x = -10;
        this.group;
        console.log("BUULLET", bulletPrefab);
    }

    initializeWeapon(game, player){
        this.group = new Phaser.Group(game.game, game.world, 'Single Bullet', false, true, Phaser.Physics.ARCADE);
        this.group.nextFire = 0;
        this.group.bulletSpeed = 600;
        this.group.fireRate = 100;
        // this.group.physicsBodyType = Phaser.Physics.ARCADE;
        // this.group.setAll('checkWorldBounds', true);
        // this.group.setAll('outOfBoundsKill', true);

        for (var i = 0; i < 64; i++) {
            this.group.add(new Bullet(game, 'bullet', {x: 0, y:0}, {
                group: 'bullets',
                initial: 1,
                texture: 'gunSpriteSheet'
            }), true, player);
        }
        console.log("THIS IS THE GUN GRoup WITH THE BULLETS", this.group.children);

        // return this;
    }

    shoot(player) {

        if (this.game.time.time < this.nextFire) { return; }

        let x = player.world.x;
        let y = player.world.y;

        this.group.getFirstExists(false).fire(x, y, 0, this.group.bulletSpeed, 0, 0);

        this.nextFire = this.game.time.time + this.fireRate;

    }
}