/**
 * Created by CharlieShi on 3/17/17.
 */

export default class Prefab extends Phaser.Sprite {
	constructor(game, name, position, properties) {
		super(game.game, position.x, position.y, properties.texture, +properties.initial);

		this.gameState = game;
		this.name = name;

		//Add prefab to its group
		//Set smoothed to false for crisp pixel rendering
		//this.gameState.groups[properties.group].add(this);
    this.gameState.groups[properties.group].children.push(this);
		this.initial = +properties.initial;
		this.smoothed = false;

		//Add all as children of lighting sprite
		this.gameState.add.existing(this);

		//Push all prefabs to the mapSprite lighting overlay
		this.pushToOverlay = true;

		//Enable physics for each prefab, we enable it in other prefabs but this is a check
		this.game.physics.arcade.enable(this);

		this.gameState.prefabs[name] = this;
    console.log("FUCKING ANIMATIONS", this);
	}
}
