import GunPrefab from './GunPrefab';
export default class Bullet extends GunPrefab {

    constructor(game, name, position, properties) {
        super(game, name, position, properties);
        this.body.immovable = true;
        this.game.physics.arcade.enable(this);
        this.tracking = false;
        this.anchor.setTo(0.5);
    }
}
