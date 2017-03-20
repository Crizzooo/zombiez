/**
 * Created by CharlieShi on 3/17/17.
 */

export default class Prefab extends Phaser.Sprite {
	constructor(game, name, position, properties) {
		super(game.game, position.x, position.y, properties.texture, +properties.initial);

		this.gameState = game;
		this.name = name;

		//Add prefab to its group
		//this.gameState.groups[properties.group].add(this);
		this.gameState.groups[properties.group].children.push(this);
		this.initial = +properties.initial;

		//Enable physics for each prefab
		this.game.physics.arcade.enable(this);

		this.gameState.prefabs[name] = this;
	}
}



// export default class Prefab extends Phaser.Sprite {
// 	constructor(game, name, position, properties) {
// 		super(game.game, position.x, position.y, properties.texture, +properties.initial);
//
// 		this.gameState = game;
// 		this.name = name;
//
//
// 		//Add prefab to its group
// 		//Adding to groups regularly not working
// 		//this.gameState.groups.[properties.group].add(this);
// 		//this.gameState.groups.[properties.group].add(this);
// 		// this.gameState.groups.player.add(this);
// 		let temp = this.gameState.groups.[properties.group]
//
// 		player.children.push(this);
// 		this.initial = +properties.initial;
// 		this.anchor.setTo(0.5);
//
// 		console.log('groups', this.gameState.groups)
//
// 		//Enable physics for each prefab
// 		this.game.physics.arcade.enable(this);
//
//
// 		this.gameState.prefabs[name] = this;
// 	}
// }