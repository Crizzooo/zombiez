/**
 * Created by CharlieShi on 3/17/17.
 */

import Prefab from './Prefab';

export default class Player extends Prefab {
  constructor (game, name, position, properties) {
    super (game, name, position, properties)

    let spriteKey = index % 2 === 0 ? 'playerSpriteSheet' : 'playerSpriteSheet';




    playerSprite.animations.add('right', [24, 8, 5, 20, 12, 13], 10, true);
    playerSprite.animations.add('left', [17, 10, 5, 19, 8, 9], 10, true);
    playerSprite.animations.add('up', [16, 0, 14, 6, 1], 10, true);
    playerSprite.animations.add('down', [23, 9, 21, 22, 7, 4], 10, true);


  }

  receiveDamage (damage) {

  }


}