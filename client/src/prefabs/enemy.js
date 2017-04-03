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

		this.current = 0;
		this.currentTarget = null;
		this.path = []
		this.lastPathPosition = {};

		this.playSound = _.throttle(this.playSound,5000);
		this.moveTo = throttle(this.moveTo, 700)
		this.acquireTarget = throttle(this.acquireTarget, 700)

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
		let movingTween, pathLength
		movingTween = this.game.tweens.create(this);
		pathLength = path.length;

		movingTween.properties = [];

		console.log('OLD PATH IS', path);
		path = this.smoothPath(path);
		console.log('NEW PATH IS', path);

		// path = path.splice(0, 1); //Needed if on child complete

		let randomDuration = Math.round((Math.random() * 150) + 350);

		if (pathLength <= 0) {
			this.attackPlayer(this.currentTarget)
		} else {
			let startX = this.position.x;
			let startY = this.position.y;

			path.forEach((position) => {
				movingTween.to({x: position.x, y: position.y}, randomDuration, Phaser.Easing.Linear);
				// this.gameState.pathfinding.addTileTemp(position);

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

	randomEase() {
		let rand = Math.floor(Math.random() * 18);

		let tweenList = [
			Phaser.Easing.Back.In,               // 0
			Phaser.Easing.Back.Out,              // 1
			Phaser.Easing.Back.InOut,            // 2
			Phaser.Easing.Bounce.In,             // 3
			Phaser.Easing.Bounce.Out,            // 4
			Phaser.Easing.Bounce.InOut,          // 5
			Phaser.Easing.Circular.In,           // 6
			Phaser.Easing.Circular.Out,          // 7
			Phaser.Easing.Circular.InOut,        // 8
			Phaser.Easing.Cubic.In,              // 9
			Phaser.Easing.Cubic.Out,             // 10
			Phaser.Easing.Cubic.InOut,           // 11
			Phaser.Easing.Elastic.In,            // 12
			Phaser.Easing.Elastic.Out,           // 13
			Phaser.Easing.Elastic.InOut,         // 14
			Phaser.Easing.Exponential.In,        // 15
			Phaser.Easing.Exponential.Out,       // 16
			Phaser.Easing.Exponential.InOut,     // 17
			Phaser.Easing.Linear.In,             // 18
		];

		console.log('TWEEN LIST', tweenList[rand]);

		return tweenList[rand];
	}

	//Path smoothing Algorithms
	smoothPath (path) {
		if (path.length <= 1) {
			return path;
		}

		let checkPoint = 0;
		let currentPoint = 1;

		while (path[currentPoint + 1] !== undefined) {
			// console.log('SMOOTH PATH', checkPoint, path[checkPoint]);

			let tileCheckpoint = this.gameState.pathfinding.getCoordFromPoint(path[checkPoint]);
			let tileCurrentPoint = this.gameState.pathfinding.getCoordFromPoint(path[currentPoint + 1]);

			if (!this.isPathWalkable(tileCheckpoint, tileCurrentPoint)) {
				path.splice(path[checkPoint], 1)
			}

			currentPoint = currentPoint + 1
			checkPoint = currentPoint
		}

		return path;
	}

	isPathWalkable (beginning, end) {
		let dx = Math.abs(end.row - beginning.row);
		let dy = Math.abs(end.column - beginning.column);
		let x = beginning.row;
		let y = beginning.column;

		let n = 1 + dx + dy;

		let xInc = (end.row > beginning.row) ? 1 : -1;
		let yInc = (end.column > beginning.column) ? 1 : -1;

		//Might not need to scale it;
		let error = dx - dy;
		// dx *= 2;
		// dy *= 2;

		for (; n > 0; n--) {
			if (!this.isTileWalkable(x, y)) return false;

			if (error > 0) {
				x += xInc;
				error -= dy;
			} else {
				y += yInc;
				error += dx;
			}
		}

		return true;
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
	moveTo () {
		//putting sound in here for now, with dropoff
		//sound continues one time after zombie dies...

		const distX = this.position.x - this.game.state.callbackContext.currentPlayerSprite.x;
		const distY = this.position.y - this.game.state.callbackContext.currentPlayerSprite.y;
		const distance = Math.sqrt(Math.pow(distX,2)+Math.pow(distY,2));
		const perc = 1 - ((distance-30)/150) - 0.2;
		if (perc > 1) thisplaySound(this.game.state.callbackContext,'zombieSound',0.8);
		else if(perc <= 0);
		else this.playSound(this.game.state.callbackContext,'zombieSound',perc);

		this.gameState.pathfinding.findPath(this.position, this.currentTarget, this.followPath, this);
	}

	followPath (path) {
		console.log('inside path', path);
		let movingTween, pathLength
		movingTween = this.game.tweens.create(this);
		pathLength = path.length;


		// console.log('OLD PATH IS', path);
		// path = this.smoothPath(path);
		// console.log('NEW PATH IS', path);

		//If path is 0, attack the current target
		if (pathLength <= 0) {
			// this.attackPlayer(this.currentTarget)
		} else {
			console.log(movingTween)
			path.forEach( (position) => {
				// movingTween.to({x: position.x, y: position.y}, 300, Phaser.Easing.Quartic.In);
				movingTween.to({x: position.x, y: position.y}, 400, Phaser.Easing.LINEAR);
				// movingTween.properties.unshift(position);
			});

			if (this.path.length) this.path[0].stop();
			movingTween.start();
			this.path.unshift(movingTween);
			// console.log('starting tween', movingTween);
		}
	}
}