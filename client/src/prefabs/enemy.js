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

    attackPlayer (player) {
	    player.receiveDamage(10);
    }

    receiveDamage (damage) {

    }

    moveTo (position) {
    	this.gameState.pathfinding.findPath(this.position, position, this.followPath, this);
    }

    followPath (path) {
    	let movingTween, pathLength

	    movingTween = this.game.tweens.create(this);
    	pathLength = path.length;

    	//If path is 0, attack the player
	    //TODO: currently hardcoded player
    	if (pathLength <= 0) {
    		this.attackPlayer(this.gameState.groups.player.children[0])
	    } else {
		    path.forEach( (position) => {
			    movingTween.to({x: position.x, y: position.y}, 250);
		    })

		    movingTween.start();
	    }


    }

    acquireTarget () {
    	//Loop through player group and find closest player
      //console.log("find player", this.gameState.groups.player.children[0].position);

	    return this.gameState.groups.player.children[0].position
    }
}

