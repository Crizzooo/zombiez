/**
 * Created by CharlieShi on 3/24/17.
 */

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
			player.walkingDiagionally = true;
		} else if(cursors.down.isDown && cursors.left.isDown){
			player.direction = 'down';
			player.body.velocity.y = player.stats.movement * .7071;
			player.body.velocity.x = -player.stats.movement * .7071;
			player.animations.play('down');
			player.walkingDiagionally = true;
		} else if(cursors.up.isDown && cursors.left.isDown){
			player.direction = 'up';
			player.body.velocity.y = -player.stats.movement * .7071;
			player.body.velocity.x = -player.stats.movement * .7071;
			player.animations.play('up');
			player.walkingDiagionally = true;
		} else if(cursors.up.isDown && cursors.right.isDown){
			player.direction = 'up';
			player.body.velocity.y = -player.stats.movement * .7071;
			player.body.velocity.x = player.stats.movement * .7071;
			player.animations.play('up');
			player.walkingDiagionally = true;
		} else if (cursors.left.isDown && !player.rollright.isPlaying) {
			player.direction = 'left';
			player.animations.play('right');
			player.scale.setTo(-1, 1);
			player.body.velocity.x = -player.stats.movement;
			player.walkingDiagionally = false;
		} else if (cursors.right.isDown && !player.rollright.isPlaying) {
			player.direction = 'right';
			player.scale.setTo(1, 1);
			player.animations.play('right');
			player.body.velocity.x = player.stats.movement;
			player.walkingDiagionally = false;
		} else if (cursors.up.isDown && !player.rollup.isPlaying) {
			player.direction = 'up';
			player.body.velocity.y = -player.stats.movement;
			player.animations.play('up');
			player.walkingDiagionally = false;
		} else if (cursors.down.isDown && !player.rolldown.isPlaying) {
			player.direction = 'down';
			player.body.velocity.y = player.stats.movement;
			player.animations.play('down');
			player.walkingDiagionally = false;
		}
		if (player.body.velocity.x === 0 && player.body.velocity.y === 0) {
			player.direction = 'idle';
			player.animations.stop();
			player.frame = handlePlayerRotation(player).frame;
			player.walkingDiagionally = false;
		}

		if (player.canRoll){
			//Roll Up
			if(cursors.up.isDown && cursors.jump.isDown){
				startRoll(player, 'roll-up');

				//Roll Down
			} else if(cursors.down.isDown && cursors.jump.isDown){
				startRoll(player, 'roll-down');

				//Roll Right
			} else if(cursors.right.isDown && cursors.jump.isDown){
				startRoll(player, 'roll-right');

				//Roll Left
			} else if(cursors.left.isDown && cursors.jump.isDown){
				startRoll(player, 'roll-left');
			}
		}


	}
}

export function handlePlayerRotation(player) {
	let pointerX = player.pointerX;
	let pointerY = player.pointerY;


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

	//Gun rotation tween
 player.gun.rotation = context.game.physics.arcade.angleToPointer(player.gun);
}

function startRoll(player, direction) {
		player.direction = direction;
		let animation = direction;
		if (direction === 'roll-left'){
			//switch animation for roll-left direction to be roll-right / flipped scale
			animation = 'roll-right';
		}
		player.rolling = player.animations.play(animation);
		player.canRoll = false;
		switch (direction) {
			case 'roll-right':
				player.scale.setTo(1, 1);
				player.body.velocity.x = player.walkingDiagionally ?  player.stats.movement + 100 * .7071 :  player.stats.movement + 100;
				break;
			case 'roll-left':
				player.scale.setTo(-1, 1);
				player.body.velocity.x = player.walkingDiagionally ? -player.stats.movement - 100 * .7071 : -player.stats.movement - 100;
				break;
			case 'roll-up':
				player.body.velocity.y = player.walkingDiagionally ? -player.stats.movement - 100 * .7071 : -player.stats.movement - 100;
				break;
			case 'roll-down':
				player.body.velocity.y = player.walkingDiagionally ?  player.stats.movement + 100 * .7071 :  player.stats.movement + 100;
				break;
		}
		setTimeout( () => {
			player.canRoll = true;
		}, player.rateOfRoll);
}
