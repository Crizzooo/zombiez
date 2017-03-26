/**
 * Created by CharlieShi on 3/24/17.
 */

import { handlePlayerRotation } from './handlePlayerInput'

//TODO: refactor
export default function handleRemoteAnimation(player) {
	if (player) {
		//player.pointerX = player.game.input.activePointer.worldX;
		//player.pointerY = player.game.input.activePointer.worldY;

		player.body.velocity.x = 0;
		player.body.velocity.y = 0;

		//TODO: use onDown instead? Need to set a previous animation
		if (player.direction === 'down') {
			player.body.velocity.y = player.stats.movement;
			player.body.velocity.x = player.stats.movement;
			player.animations.play('down');
		} else if(player.direction === 'up'){
			player.body.velocity.y = -player.stats.movement;
			player.body.velocity.x = -player.stats.movement;
			player.animations.play('up');
		} else if(player.direction === 'roll-up'){
			player.animations.play('roll-up');
			player.body.velocity.y = -player.stats.movement - 100;
		} else if(player.direction === 'roll-down'){
			player.body.velocity.y = player.stats.movement + 100;
			player.animations.play('roll-down');
		} else if(player.direction === 'roll-right'){
			player.scale.setTo(1, 1);
			player.animations.play('roll-right');
			player.body.velocity.x = player.stats.movement + 100;
		} else if(player.direction === 'roll-left'){
			player.scale.setTo(-1, 1);
			player.animations.play('roll-right');
			player.body.velocity.x = -player.stats.movement - 100;
		} else if (player.direction === 'left') {
			player.animations.play('right');
			player.scale.setTo(-1, 1);
			player.body.velocity.x = -player.stats.movement;
		} else if (player.direction === 'right') {
			player.scale.setTo(1, 1);
			player.animations.play('right');
			player.body.velocity.x = player.stats.movement;
		} else if (player.direction === 'up') {
			player.body.velocity.y = -player.stats.movement;
			player.animations.play('up');
		} else if (player.direction === 'down') {
			player.body.velocity.y = player.stats.movement;
			player.animations.play('down');
		} else if (player.direction === 'idle') {
			player.animations.stop();
			player.frame = handlePlayerRotation(player).frame;
		}
	}
}

export function tweenRemoteAssets(player, context) {
	//Remote Player Tweens
	//TODO: refactor for 4 players
	context.add.tween(player.healthbar).to({
		x: player.x - 10,
		y: player.y - 30
	}, 10, Phaser.Easing.Linear.None, true);

	context.add.tween(player.gun).to({
		x: player.x,
		y: player.y
	}, 10, Phaser.Easing.Linear.None, true);

	//console.log('player remote tween', player)
	//TODO: send rotation angle of player to server, server sends it back and we use it to tween
	player.gun.rotation = player.gunRotation;
}
