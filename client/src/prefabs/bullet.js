import GunPrefab from './GunPrefab';
export default class Bullet extends GunPrefab {
    constructor(game, name, position, properties) {
        super(game, name, position, properties);
        this.game.physics.arcade.enable(this);
        this.tracking = false;
    }
}