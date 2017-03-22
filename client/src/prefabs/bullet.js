import Prefab from './Prefab';

export default class Bullet extends Prefab {
    constructor(game, name, position, properties) {
        super(game, name, position, properties);
        this.game.physics.arcade.enable(this);
        this.body.collideWorldBounds = true;
        this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
        this.anchor.setTo(0.5);
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
        this.exists = false;
        // this.reset(x + 10, y + 10);
        this.tracking = false;
        this.scaleSpeed = 0;
        console.log("THIS IS FIRE", this.fire)
    }

    fire(x, y, angle, speed, gx, gy){
        gx = gx || 0;
        gy = gy || 0;
        console.log("X AND Y" ,x, y)
        this.scale.set(1);
        this.reset(x + 10, y + 10);
        console.log("PLAYER XY", x, y);
        console.log("BULLET XY", this);
        this.game.physics.arcade.moveToPointer(this, speed);
        // this.game.physics.arcade.velocityFromAngle(0, speed, this.body.velocity);

        // this.angle = angle;

        // this.body.gravity.set(gx, gy);
    }
}