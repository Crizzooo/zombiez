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

		this.move = throttle(this.move, 300)

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

		// console.log(this.path.length, this.path)

		if (this.path.length > 0 && !this.path[0].isRunning) {
			console.log('WHY ISNT THIS RUNNING', this.path)
			this.path.shift();
		}

		if (this.path.length < 2) {
			//If there's no path start one
			if (!this.path.length) {
				console.log('ORIGINAL POSITION', this.position)
				this.gameState.pathfinding.findPath(this.position, this.currentTarget, this.addTweenToPath, this);
			}

			//If there's a current path, create another one to be chained to it
			//This path should start at the last path's end tween position
			if (this.path.length === 1) {
				let originPosition = this.position;
				console.log('PATH 1 ORIGIN', this.lastPathPosition, this.currentTarget);
				console.log('PATH 1', this.path)
				this.gameState.pathfinding.findPath(this.lastPathPosition, this.currentTarget, this.addTweenToPath, this);
			}
		}
	}

	addTweenToPath (path) {
		console.log('INSIDE PATH', path);
		let movingTween, pathLength
		movingTween = this.game.tweens.create(this);
		pathLength = path.length;

		movingTween.properties = [];

		// path = this.smoothPath(path);
		// path = path.splice(0, 1); //Needed if on child complete

		let randomDuration = Math.round((Math.random() * 450) + 350);

		if (pathLength <= 0) {
			this.attackPlayer(this.currentTarget)
		} else {
			let startX = this.position.x;
			let startY = this.position.y;

			path.forEach((position) => {
				movingTween.to({x: position.x, y: position.y}, randomDuration, Phaser.Easing.LINEAR);
				this.gameState.pathfinding.addTileTemp(position);

				let firstBezierPointX = (position.x + startX) / 2;
				let firstBezierPointY = (position.y + startY) / 2;

				// movingTween.to({
				// 	x: [startX, position.x],
				// 	y: [startY, position.y]
				// }, 1000, Phaser.Easing.Quadratic.Out).interpolation((v, k) => {
				// 	return Phaser.Math.bezierInterpolation(v, k)
				// });

				startX = position.x;
				startY = position.y;

				//Can delete one
				this.lastPathPosition = path[path.length - 1];
				movingTween.properties = path[path.length - 1];
			})

			if (!this.path.length) movingTween.start();
			if (this.path[0]) this.path[0].chain(movingTween);

			movingTween.onComplete.add(() => {
				this.path.shift();
			})

			this.path.push(movingTween);
		}
	}

	//Path smoothing Algorithms
	smoothPath (path) {
		if (path.length <= 1) {
			return path;
		}

		let checkPoint = 0;
		let currentPoint = 1;

		while (path[currentPoint + 1] !== null) {
			if (isPathWalkable(path[checkPoint], path[currentPoint + 1])) {
				path.splice(path[checkPoint], 1)
			}
		}
	}

	isPathWalkable (beginning, end) {



	}

	isTileWalkable (x, y) {
		let collisionGrid = this.gameState.pathfinding.worldGrid;

		if (collisionGrid[y][x] !== -1) {
			return false
		} else {
			return true
		}
	}

	//Target Acqusition Algos
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

	//OLD FUNCTIONS, DONT TOUCH
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
}