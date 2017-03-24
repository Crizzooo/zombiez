/**
 * Created by CharlieShi on 3/24/17.
 */

export default function handleRemoteAnimation(player) {
	if (player) {
		player.body.velocity.x = 0;
		player.body.velocity.y = 0;

		if (player.direction === 'idle') {
			player.animations.stop();
			//this.handlePlayerRotation(player);
		}

		if (player.direction === 'left') {
			player.animations.play('right');
			player.scale.setTo(-1, 1);
			player.body.velocity.x = -player.stats.movement;
			//this.handlePlayerRotation(player);

			//Tween for bounce
			switch (player.body.sprite._frame.name) {
				case 'lookingRightRightLegUp.png':
					player.body.velocity.y -= 80;
					break;
				case 'RightComingDown1.png':
					player.body.velocity.y += 80;
					break;
				case 'movingRight4.png':
					player.body.velocity.y += 50;
					break;
				case 'playerSprites_266 copy.png':
					player.body.velocity.y -= 50
			}
		}

		if (player.direction === 'right') {
			player.direction = 'right';
			player.scale.setTo(1, 1);
			player.animations.play('right');
			player.body.velocity.x = player.stats.movement;
			//this.handlePlayerRotation(player);

			//Tween for bounce
			switch (player.body.sprite._frame.name) {
				case 'lookingRightRightLegUp.png':
					player.body.velocity.y -= 80;
					break;
				case 'RightComingDown1.png':
					player.body.velocity.y += 80;
					break;
				case 'movingRight4.png':
					player.body.velocity.y += 50;
					break;
				case 'playerSprites_266 copy.png':
					player.body.velocity.y -= 50
			}
		}

		if (player.direction === 'up') {
			player.direction = 'up';
			player.body.velocity.y = -player.stats.movement;
			player.animations.play('up');
			//this.handlePlayerRotation(player);
		}

		if (player.direction === 'down') {
			player.direction = 'down';
			player.body.velocity.y = player.stats.movement;
			player.animations.play('down');
			//this.handlePlayerRotation(player);
		}

	}
}

export function tweenRemoteAssets(player) {
	//Remote Player Tweens
	//TODO: refactor for 4 players
	this.add.tween(player.healthbar).to({
		x: player.x - 10,
		y: player.y - 30
	}, 10, Phaser.Easing.Linear.None, true);

	this.add.tween(player.gun).to({
		x: player.x,
		y: player.y
	}, 10, Phaser.Easing.Linear.None, true);

	//TODO: send rotation angle of player to server, server sends it back and we use it to tween
	player.gun.rotation = player.gunRotation;
}
