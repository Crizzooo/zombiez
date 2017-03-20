import Prefab from './Prefab';

export default class Gun extends Prefab {
    constructor(game, name, position, properties) {

        super(game, name, position, properties);
        this.game.physics.arcade.enable(this);
        this.body.collideWorldBounds = true;

    }

    shootGun(){

    }

    reload(){

    }

}