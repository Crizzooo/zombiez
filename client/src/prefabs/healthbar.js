/**
 * Created by CharlieShi on 3/21/17.
 */

export default class HealthBar extends Phaser.Sprite {
	constructor(game, name, position, properties) {
		super(game.game, position.x, position.y, properties.texture, +properties.initial)

		this.gameState = game;
		this.name = name;

		console.log('in healthbar', this.gameState.groups.ui)

		//Add prefab to its group
		//this.gameState.groups[properties.group].add(this);
		this.gameState.groups[properties.group].children.push(this);
		this.initial = +properties.initial;

		this.currentHeart = 9;
		this.hearts = [];
	}

	addHearts(heart) {
		this.hearts.push(heart);
	}

	newHealth(health) {
		let numHearts = Math.floor((health / 10)  % 10);
		let halfHeart = health % 10 >= 5 ? true : false;

		for (let i = this.currentHeart; i >= numHearts; i--) {
			if (i > numHearts) {
				this.hearts[i].changeHeart('empty');
			} else {
				(halfHeart ? this.hearts[i].changeHeart('half') : this.hearts[i].changeHeart('empty'))
			}
		}

	}



}
