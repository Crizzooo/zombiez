/**
 * Created by CharlieShi on 3/24/17.
 */
import _ from 'lodash';

// function playSound (player, whatSound)  {
//   player.game.state.callbackContext[whatSound].play();
// }
//
// let throttledSound = _.throttle(playSound,50);

function logWASD (letter) {
  document.getElementById("createMessage").value += letter;
}

let tween;
export let handleInput = (player) => {


  if (player) {
    let cursors = player.cursors;
    const textInput = document.getElementById("createMessage");
    const gameDiv = document.getElementById("game");

    if(cursors.esc.justPressed()){
      document.getElementsByClassName("container")[0].style.visibility = "hidden";
      textInput.blur();
      gameDiv.focus();
      ZG.game.isInChat = false;
    }
    if (cursors.chat.isDown) {
      document.getElementsByClassName("container")[0].style.visibility = "visible";
      textInput.focus();
      gameDiv.blur();
      ZG.game.isInChat = true;
    }

    if (ZG.game.isInChat) {
      if (cursors.down.justPressed()) {
        logWASD('s');
      }
      if (cursors.up.justPressed()) {
        logWASD('w');
      }
      if (cursors.left.justPressed()) {
        logWASD('a');
      }
      if (cursors.right.justPressed()) {
        logWASD('d');
      }
      if (cursors.reload.justPressed()) {
        logWASD('r');
      }
      if (cursors.jump.justPressed()) {
        logWASD(' ');
      }
    }
    else{
      player.pointerX = player.game.input.mousePointer.worldX;
      player.pointerY = player.game.input.mousePointer.worldY;

      let cursors = player.cursors;

      if (player.rolling && player.rolling.isPlaying) {
        return;
      } else {
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
      }

      if (cursors.fire.isDown && !player.gun.isReloading) {
        //Shoot method will add the bullet obj to the hash map on store and then dispatch to server for 1s!
        player.gun.shoot(player);
      }

      if(player.gun.isReloading && !player.gun.isJammed){
          player.reloadBar.visible = true;
          // player.reloadTween.start();
          // player.reloadBar.animations.play('playReload');
          if(cursors.reload.justPressed() && (player.reloadBar.frame < 24 && player.reloadBar.frame > 20)){
            player.gameState['reloadSuccess'].play();
            player.gun.isReloading = false;
            player.gun.activeReloaded = true;
            player.gun.ammo = player.gun.clip;
            player.clipUpdate();
            player.reloadBar.frame = 22;
            player.reloadBar.tint = 0x00FF7F;
            player.reloadBar.alpha = 0;
            tween = player.game.add.tween(player.reloadBar).to( { alpha: 1 }, 250, Phaser.Easing.Linear.None, true, 0, 500, true);
            player.gun.damage += 10;
            player.reloadBar.animations.paused = true;
            let activeInterval = setTimeout(() => {
              player.reloadBar.tint = 0xffffff;
              player.gun.damage -= 10;
              tween.stop();
              player.reloadBar.alpha = 1;
              player.reloadingAnim.complete();
              clearInterval(activeInterval);
            }, 2500)
          } else if(cursors.reload.justPressed() && (player.reloadBar.frame >= 24 || player.reloadBar.frame <= 20)) {
            player.gameState['reloadFail'].play();
            player.reloadBar.animations.paused = true;
            player.reloadBar.tint = 0xFF0000;
            player.gun.isJammed = true;
            player.reloadBar.alpha = 0;
            tween = player.game.add.tween(player.reloadBar).to( { alpha: 1 }, 250, Phaser.Easing.Linear.None, true, 0, 500, true);
            let jamInterval = setTimeout(() => {
              tween.stop();
              player.reloadBar.alpha = 1;
              // player.reloadBar.animations.paused = false;
              player.reloadingAnim.complete();
              clearInterval(jamInterval); }, 3500)
        }
    } else if (cursors.reload.isDown && player.gun.ammo !== player.gun.clip && !player.gun.activeReloaded){
      player.gun.reloadGun();
    }

      //TODO: use onDown instead? Need to set a previous animation
      if (cursors.down.isDown && cursors.right.isDown) {
        player.direction = 'down';
        player.body.velocity.y = player.stats.movement * .7071;
        player.body.velocity.x = player.stats.movement * .7071;
        player.animations.play('down');
        player.walkingDiagionally = true;
      } else if (cursors.down.isDown && cursors.left.isDown) {
        player.direction = 'down';
        player.body.velocity.y = player.stats.movement * .7071;
        player.body.velocity.x = -player.stats.movement * .7071;
        player.animations.play('down');
        player.walkingDiagionally = true;
      } else if (cursors.up.isDown && cursors.left.isDown) {
        player.direction = 'up';
        player.body.velocity.y = -player.stats.movement * .7071;
        player.body.velocity.x = -player.stats.movement * .7071;
        player.animations.play('up');
        player.walkingDiagionally = true;
      } else if (cursors.up.isDown && cursors.right.isDown) {
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

      if (player.canRoll) {
        //Roll Up
        if (cursors.up.isDown && cursors.jump.isDown) {
          startRoll(player, 'roll-up');

          //Roll Down
        } else if (cursors.down.isDown && cursors.jump.isDown) {
          startRoll(player, 'roll-down');

          //Roll Right
        } else if (cursors.right.isDown && cursors.jump.isDown) {
          startRoll(player, 'roll-right');

          //Roll Left
        } else if (cursors.left.isDown && cursors.jump.isDown) {
          startRoll(player, 'roll-left');
        }
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

  // context.add.tween(player.reloadBar).to({
  //   x: player.x,
  //   y: player.top - 50
  // }, 10, Phaser.Easing.Linear.None, true);

	//Gun rotation tween
 player.gun.rotation = context.game.physics.arcade.angleToPointer(player.gun);
}

function startRoll(player, direction) {
  player.direction = direction;
  let animation = direction;
  if (direction === 'roll-left') {
    //switch animation for roll-left direction to be roll-right / flipped scale
    animation = 'roll-right';
  }
  player.rolling = player.animations.play(animation);
  player.canRoll = false;
  switch (direction) {
    case 'roll-right':
      player.scale.setTo(1, 1);
      player.body.velocity.x = player.walkingDiagionally ? player.stats.movement + 100 * .7071 : player.stats.movement + 100;
      break;
    case 'roll-left':
      player.scale.setTo(-1, 1);
      player.body.velocity.x = player.walkingDiagionally ? -player.stats.movement - 100 * .7071 : -player.stats.movement - 100;
      break;
    case 'roll-up':
      player.body.velocity.y = player.walkingDiagionally ? -player.stats.movement - 100 * .7071 : -player.stats.movement - 100;
      break;
    case 'roll-down':
      player.body.velocity.y = player.walkingDiagionally ? player.stats.movement + 100 * .7071 : player.stats.movement + 100;
      break;
  }
  setTimeout(() => {
    player.canRoll = true;
  }, player.rateOfRoll);
}
