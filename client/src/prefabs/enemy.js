import Prefab from './Prefab';
import _ from 'lodash';
import throttle from 'lodash.throttle';

export default class Enemy extends Prefab {
	constructor (game, name, position, properties) {
		super (game, name, position, properties);

		this.animations.add('left', [9, 10, 11, 12, 9, 13, 14], 9, true);
		this.animations.add('dead', [1, 2, 3, 4, 5, 6, 7, 8, 0], 9, false);

		this.stats = {
			health: 10,
			movement: 10,
			attack: 5
		};

		this.currentTarget = null;
		this.path = []
		this.lastPathPosition = {};

		this.playSound = _.throttle(this.playSound,5000);
		this.moveTo = throttle(this.moveTo, 1000)
		this.acquireTarget = throttle(this.acquireTarget, 1000)

	}

	playSound (game, whatSound, volume)  {
		game[whatSound].play('',0,volume,false);
	}

	attackPlayer (player) {
		// this.playSound(this.game.state.callbackContext, 'zombieHit', 1);
		// player.receiveDamage(this.stats.attack);
	}

	move () {
		//If path has 2 length, don't run this function
		//Find current target
		this.currentTarget = this.acquireTarget(this.gameState.groups.player);

		if (this.path[0] && !this.path[0].isRunning) {
			console.log('WHY ISNT THIS RUNNING')
			this.path.shift();
		}

		if (this.path.length < 2) {
			//If there's no path start one
			if (!this.path.length) {
				this.gameState.pathfinding.findPath(this.position, this.currentTarget, this.addTweenToPath, this);
			}

			//If there's a current path, create another one to be chained to it
			//This path should start at the last path's end tween position
			if (this.path.length === 1) {
				//let originPosition = (this.path[0].properties[0] || this.path[0].properties)

				let originPosition = this.position;
				console.log('PATH 1 ORIGIN', this.lastPathPosition);
				console.log('PATH 1', this.path)
				this.gameState.pathfinding.findPath(this.lastPathPosition, this.currentTarget, this.addTweenToPath, this);
			}
		}
	}

	addTweenToPath (path) {
		console.log('inside path', path);
		let movingTween, pathLength
		movingTween = this.game.tweens.create(this);
		pathLength = path.length;

		movingTween.properties = [];

		if (pathLength <= 0) {
			this.attackPlayer(this.currentTarget)
		} else {
			path.forEach( (position) => {
				movingTween.to({x: position.x, y: position.y}, 350, Phaser.Easing.LINEAR);
				//this.gameState.pathfinding.addTileTemp(position);
			});

			//Can delete one
			this.lastPathPosition = path[path.length - 1];
			movingTween.properties = path[path.length - 1];
		}

		if (!this.path.length) movingTween.start();

		if (this.path[0]) this.path[0].chain(movingTween);

		movingTween.onComplete.add(() => {
			this.path.shift();
		})

		this.path.push(movingTween);
	}

	moveTo (position) {
		//putting sound in here for now, with dropoff
		//sound continues one time after zombie dies...

		const distX = this.position.x - this.game.state.callbackContext.currentPlayerSprite.x;
		const distY = this.position.y - this.game.state.callbackContext.currentPlayerSprite.y;
		const distance = Math.sqrt(Math.pow(distX,2)+Math.pow(distY,2));
		const perc = 1 - ((distance-30)/150) - 0.2;
		if (perc > 1) thisplaySound(this.game.state.callbackContext,'zombieSound',0.8);
		else if(perc <= 0);
		else this.playSound(this.game.state.callbackContext,'zombieSound',perc);
	}

	followPath (path) {
		console.log('inside path', path);
		let movingTween, pathLength
		movingTween = this.game.tweens.create(this);
		pathLength = path.length;

		movingTween.properties = [];

		//If path is 0, attack the current target
		if (pathLength <= 0) {
			this.attackPlayer(this.currentTarget)
		} else {
			console.log(movingTween)
			path.forEach( (position) => {
				movingTween.to({x: position.x, y: position.y}, 350, Phaser.Easing.LINEAR);
				movingTween.properties.unshift(position);
			});

			movingTween.start();
			console.log('starting tween', movingTween);
		}
	}

	acquireTarget (playersAry) {
		//TODO: add aggro distance
		//TODO: should add the attack player function here, if playerDistance < X
		let newTarget = playersAry.getFirstAlive()
		let distance = 0;

		playersAry.forEachAlive((player) => {
			let playerDistance = Math.pow((player.x - this.x), 2) + Math.pow((player.y - this.y), 2);

			if (distance <= playerDistance) {
				distance = playerDistance;
				newTarget = player;
			}
		});

		this.currentTarget = newTarget;
		return newTarget
	}
}