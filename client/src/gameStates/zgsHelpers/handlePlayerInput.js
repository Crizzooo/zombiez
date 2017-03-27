/**
 * Created by CharlieShi on 3/24/17.
 */
import _ from 'lodash';

// function playSound (player, whatSound)  {
//   player.game.state.callbackContext[whatSound].play();
// }
//
// let throttledSound = _.throttle(playSound,50);

export function handleInput(player) {


	if (player) {


		player.pointerX = player.game.input.activePointer.worldX;
		player.pointerY = player.game.input.activePointer.worldY;

		let cursors = player.cursors;

		//if player is rolling, return
		//roll up, roll down, roll-right, roll-left
		if (player.rolling && player.rolling.isPlaying){
			return;
		} else {
			player.body.velocity.x = 0;
			player.body.velocity.y = 0;
		}

		if (cursors.fire.isDown) {
			//Shoot method will add the bullet obj to the hash map on store and then dispatch to server for 1s!
			player.gun.shoot(player);
		}

		//TODO: use onDown instead? Need to set a previous animation
		if (cursors.down.isDown && cursors.right.isDown){
			player.direction = 'down';
			player.body.velocity.y = player.stats.movement * .7071;
			player.body.velocity.x = player.stats.movement * .7071;
			player.animations.play('down');
		} else if(cursors.down.isDown && cursors.left.isDown){
			player.direction = 'down';
			player.body.velocity.y = player.stats.movement * .7071;
			player.body.velocity.x = -player.stats.movement * .7071;
			player.animations.play('down');
		} else if(cursors.up.isDown && cursors.left.isDown){
			player.direction = 'up';
			player.body.velocity.y = -player.stats.movement * .7071;
			player.body.velocity.x = -player.stats.movement * .7071;
			player.animations.play('up');
		} else if(cursors.up.isDown && cursors.right.isDown){
			player.direction = 'up';
			player.body.velocity.y = -player.stats.movement * .7071;
			player.body.velocity.x = player.stats.movement * .7071;
			player.animations.play('up');
		} else if(cursors.up.isDown && cursors.jump.isDown){
			//check roll time
			player.direction = 'roll-up';
			player.rolling = player.animations.play('roll-up');
			player.body.velocity.y = -player.stats.movement - 100;
		} else if(cursors.down.isDown && cursors.jump.isDown){
			//check roll time
			player.direction = 'roll-up';
			player.body.velocity.y = player.stats.movement + 100;
			player.rolling = player.animations.play('roll-down');
		} else if(cursors.right.isDown && cursors.jump.isDown){
			//check roll time
			player.direction = 'roll-right';
			player.scale.setTo(1, 1);
			player.rolling = player.animations.play('roll-right');
			player.body.velocity.x = player.stats.movement + 100;
		} else if(cursors.left.isDown && cursors.jump.isDown){
			//check roll time
			player.direction = 'roll-left';
			player.scale.setTo(-1, 1);
			player.rolling = player.animations.play('roll-right');
			player.body.velocity.x = -player.stats.movement - 100;
		} else if (cursors.left.isDown && !player.rollright.isPlaying) {
			player.direction = 'left';
			player.animations.play('right');
			player.scale.setTo(-1, 1);
			player.body.velocity.x = -player.stats.movement;
		} else if (cursors.right.isDown && !player.rollright.isPlaying) {
			player.direction = 'right';
			player.scale.setTo(1, 1);
			player.animations.play('right');
			player.body.velocity.x = player.stats.movement;
		} else if (cursors.up.isDown && !player.rollup.isPlaying) {
			player.direction = 'up';
			player.body.velocity.y = -player.stats.movement;
			player.animations.play('up');
		} else if (cursors.down.isDown && !player.rolldown.isPlaying) {
			player.direction = 'down';
			player.body.velocity.y = player.stats.movement;
			player.animations.play('down');
		}
		if (player.body.velocity.x === 0 && player.body.velocity.y === 0) {
			player.direction = 'idle';
			player.animations.stop();
			player.frame = handlePlayerRotation(player).frame;
		}
	}
}

export function handlePlayerRotation(player) {
	let pointerX = player.game.input.activePointer.worldX;
	let pointerY = player.game.input.activePointer.worldY;


	let playerX = player.x;
	let playerY = player.y;
	let frame;
	let animation;
	let gunScale;

	player.scale.setTo(1, 1);
	if ((pointerY > playerY) && (pointerX < playerX)) {
		//bottom-left
		if(player.body.velocity.x === 0 && player.body.velocity.y === 0) frame = 17;
		player.gun.scale.setTo(1, -1);
	}
	if ((pointerY > playerY) && (pointerX > playerX)) {
		//bottom-right
		if(player.body.velocity.x === 0 && player.body.velocity.y === 0) frame = 28;
		animation = 'down';
		// if(cursors.up.isDown && cursors.right.isDown) {
		//   animation = "right";
		// } else if(cursors.down.isDown && this.game.cursors.right.isDown){
		//   animation = "right";
		// } else if(this.game.cursors.left.isDown && this.game.cursors.down.isDown){
		//   animation = "right";
		// }
		player.gun.scale.setTo(1, 1);
	}
	if ((pointerY < playerY) && (pointerX > playerX)) {
		//top-right
		if(player.body.velocity.x === 0 && player.body.velocity.y === 0) frame = 14;
		animation = 'up';
		player.gun.scale.setTo(1, 1);
	}
	if ((pointerY < playerY) && (pointerX < playerX)) {
		//top-left
		if(player.body.velocity.x === 0 && player.body.velocity.y === 0) frame = 14;
		animation = 'up';
		player.gun.scale.setTo(1, -1);
	}
	return {
		frame,
		animation
	}
}

export function tweenCurrentPlayerAssets(player, context) {
	//gun follow does not work as a child of the player sprite.. had to tween gun to players x, y position
	context.add.tween(player.gun).to({
		x: player.x,
		y: player.y
	}, 10, Phaser.Easing.Linear.None, true);

	//Add tween for health
	// context.add.tween(player.healthbar).to({
	// 	x: player.x - 10,
	// 	y: player.y - 30
	// }, 10, Phaser.Easing.Linear.None, true);

	//Gun rotation tween
	player.gun.rotation = context.game.physics.arcade.angleToPointer(player.gun);
}

function startRoll(player, direction) {

}
