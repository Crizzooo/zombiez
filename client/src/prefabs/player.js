/**
 * Created by CharlieShi on 3/17/17.
 */

import Prefab from './Prefab';

export default class Player extends Prefab {
    constructor(game, name, position, properties) {

//    name = 'player'
// properties: {
//     group: 'players',
//       initial: 18,
//       spritemap: 'playerSpriteSheet'
//   }
// {x: 0, y: 0}

        super(game, name, position, properties);
        this.anchor.setTo(0.5);
        this.animations.add('right', [24, 8, 5, 20, 12, 13], 10, true);
        this.animations.add('left', [17, 10, 5, 19, 8, 9], 10, true);
        this.animations.add('up', [16, 0, 14, 6, 1], 10, true);
        this.animations.add('down', [23, 9, 21, 22, 7, 4], 10, true);

        this.game.physics.arcade.enable(this);
        //This might not be relevant since the world size is bigger than map size
        //To allow for camera pan
        this.body.collideWorldBounds = true;

        this.stats = {
            health: 100,
            movement: 10
        }

    }

    receiveDamage(damage) {

    }


}