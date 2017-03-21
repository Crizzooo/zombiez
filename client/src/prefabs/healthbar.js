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

		this.hearts = [];
	}

	addHearts(heart) {
		this.hearts.push(heart);
	}
}
