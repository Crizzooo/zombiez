/**
 * Created by CharlieShi on 3/17/17.
 */

import Prefab from './Prefab';
import HealthHeart from './healthbar';
import Heart from './healthHearts';

export default class Player extends Prefab {
    constructor(game, name, position, properties) {
      super(game, name, position, properties);

	    this.stats = {
		    health: 100,
		    movement: 100
	    }

	    this.anchor.setTo(0.5);
      this.animations.add('right', [24, 8, 5, 20, 12, 13], 10, true);
      this.animations.add('left', [17, 10, 5, 19, 8, 9], 10, true);
      this.animations.add('up', [16, 0, 14, 6, 1], 10, true);
      this.animations.add('down', [23, 9, 21, 22, 7, 4], 10, true);

      //This might not be relevant since the world size is bigger than map size
      //To allow for camera pan
      this.body.collideWorldBounds = true;
      this.game.physics.arcade.enable(this);


	    //Healthhearts, top left hearts
	    this.health = new HealthHeart(this.gameState, 'playerHealthHearts', {x: 0, y:0},
		    {
		    	group: 'ui'
		    }
	    );

	    for (let i = 0; i < 10; i++) {
		    this.health.addHearts(this.game.add.existing(new Heart(this.gameState, 'playerHeart' + i, {x: (32 * i), y: 0},
			    {
			      texture: 'playerHearts',
				    group: 'ui',
				    initial: 2
			    })
		    ))
	    }

	    this.game.add.existing(this.health);


      //Health text, to be replaced by healthbar
      const style = {
        font: "bold 16px Arial",
        fill: "#FFF",
        stroke: "#000",
        strokeThickness: 3
      };

      this.healthbar = this.game.add.text(
	      this.position.x - 10,
	      this.position.y - 10,
	      this.stats.health, style);
  }

  receiveDamage(damage) {
	  this.stats.health -= damage;
	  this.healthbar.text = this.stats.health;
	  this.tint = 0x0000ff;

	  setTimeout(() => {
	    this.tint = 0xffffff;
    }, 400)
  }


}