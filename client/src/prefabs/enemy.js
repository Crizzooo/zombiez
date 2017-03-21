import Prefab from './Prefab';

export default class Enemy extends Prefab {
    constructor (game, name, position, properties) {
      super (game, name, position, properties);



      this.animations.add('left', [9, 10, 11, 12, 9, 13, 14], 9, true);
      //this.animations.add('right', [], 10, true);
	    this.animations.add('dead', [1, 2, 3, 4, 5, 6, 7, 8, 0], 9, true);

	    this.position = position;
      //this.currentTarget = {};

      this.stats = {
        health: 10,
        movement: 10
      }

    }

    receiveDamage (damage) {

    }

    moveTo (position) {
    	this.gameState.pathfinding.findPath(this.position, position, this.followPath, this);
    }

    followPath (path) {
    	//console.log('inside path', path);

    	let movingTween
	    movingTween = this.game.tweens.create(this);

    	path.forEach( (position) => {
    		movingTween.to({x: position.x, y: position.y}, 500);
	    })

	    movingTween.start();
    }

    acquireTarget () {
    	//Loop through player group and find closest player
	    //TODO: currently this just returns the first player
      //console.log("find player", this.gameState.groups.player.children[0].position);

	    return this.gameState.groups.player.children[0].position
    }
}

