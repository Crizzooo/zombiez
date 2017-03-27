import Prefab from './Prefab';
import _ from 'lodash';

export default class Enemy extends Prefab {
  constructor (game, name, position, properties) {
    super (game, name, position, properties);

    this.animations.add('left', [9, 10, 11, 12, 9, 13, 14], 9, true);
    this.animations.add('dead', [1, 2, 3, 4, 5, 6, 7, 8, 0], 9, false);

    this.stats = {
      health: 10,
      movement: 10,
      attack: 5
    }

    this.hit = false;
    this.playSound = _.throttle(this.playSound,5000);

  }

  playSound (game, whatSound, volume)  {
    game[whatSound].play('',0,volume,false);
  }

  attackPlayer (player) {
    socket.emit('playerReceiveDamage', {
      socketId: socket.id,
      newDamage: this.stats.attack
    });
    this.playSound(this.game.state.callbackContext, 'zombieHit', 1);
    player.receiveDamage(this.stats.attack);
  }

  receiveDamage (damage) {

  }

  moveTo (position) {


    //putting sound in here for now, with dropoff
    //sound continues one time after zombie dies...

    const distX = this.position.x - this.game.state.callbackContext.currentPlayerSprite.x;
    const distY = this.position.y - this.game.state.callbackContext.currentPlayerSprite.y;
    const distance = Math.sqrt(Math.pow(distX,2)+Math.pow(distY,2));
    const perc = 1 - ((distance-30)/150) - 0.2;
    console.log('perc',perc);

    if (perc > 1) thisplaySound(this.game.state.callbackContext,'zombieSound',0.8);
    else if(perc <= 0);
    else this.playSound(this.game.state.callbackContext,'zombieSound',perc);




    if (this.hit === false) {
      //console.log('not hit')
      this.gameState.pathfinding.findPath(this.position, position, this.followPath, this);
    }
  }

  followPath (path) {
    // console.log('inside path', path);
    let movingTween, pathLength
    movingTween = this.game.tweens.create(this);
    pathLength = path.length;
    //If path is 0, attack the player
    //TODO: currently hardcoded player
    if (pathLength <= 0) {
      this.attackPlayer(this.gameState.groups.player.children[0])
      } else {
        path.forEach( (position) => {
          movingTween.to({x: position.x, y: position.y}, 250);
        })
        movingTween.start();
      }
  }

  acquireTarget () {
    //Loop through player group and find closest player
    //console.log("find player", this.gameState.groups.player.children[0].position);

    return this.gameState.groups.player.children[0].position
  }
}
