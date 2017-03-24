/**
 * Created by CharlieShi on 3/17/17.
 */

import Prefab from './Prefab';
import HealthHeart from './healthbar';
import Heart from './healthHearts';

export default class Player extends Prefab {
  constructor(game, name, position, properties) {
    super(game, name, position, properties);

    this.anchor.setTo(0.5);

    this.stats = {
      totalHealth: 100,
      health: 100,
      movement: 100
    }

    //TODO: make it only visible to the current player
    //Load Hearts, Healthbar, Animations
    this.loadHearts();
    this.loadHealthbar();
    this.loadAnimations();

    this.animations.add('idle', [18], 10, true)

    //This might not be relevant since the world size is bigger than map size
    //To allow for camera pan
    this.body.collideWorldBounds = true;
    this.body.immovable = true;
    this.game.physics.arcade.enable(this);

    //Setup player's gun
    this.gun = this.gameState.createPrefab('gun', {
      type: 'guns',
      properties: {
        group: 'guns',
        initial: 0,
        texture: 'gunSpriteSheet',
        rateOfFire: 100,
        reloadSpeed: 2000,
        clip: 30
      }
    }, {x: 225, y: 225});

    this.game.add.existing(this.gun);
    //how frequently a player can roll
    this.rateOfRoll = 10000;
    this.nextRoll = 0;
  }

  loadAnimations() {
    this.animations.add('right', [44, 8, 5, 31, 12, 13], 10, true);
    this.animations.add('left', [17, 10, 5, 19, 8, 9], 10, true);
    this.animations.add('up', [16, 0, 14, 6, 1], 10, true);
    this.animations.add('down', [43, 9, 34, 38, 7, 4], 10, true);
    this.rollup = this.animations.add('roll-up', [37, 33, 42, 32, 22, 23, 21], 10, false);
    this.rolldown = this.animations.add('roll-down', [39, 35, 41, 26, 27, 25], 10, false);
    this.rollright = this.animations.add('roll-right', [19, 20, 18, 45, 46, 29], 10, false);

  }

  loadHealthbar() {
    //Health text, to be replaced by healthbar
    const style = {
      font: "bold 16px Arial",
      fill: "#FFF",
      stroke: "#000",
      strokeThickness: 3
    };

    this.healthbar = this.game.add.text(
      this.position.x - 10,
      this.position.y - 10,
      this.stats.health, style);
  }

  loadHearts() {
    //Health hearts, top left hearts
    this.health = new HealthHeart(this.gameState, 'playerHealthHearts', {x: 0, y: 0},
      {
        group: 'ui'
      }
    );

    for (let i = 0; i < 10; i++) {
      this.health.addHearts(this.game.add.existing(new Heart(this.gameState, 'playerHeart' + i, {x: (32 * i), y: 0},
        {
          texture: 'playerHearts',
          group: 'ui',
          initial: 2
        })
      ))
    }

    this.game.add.existing(this.health);
  }

  receiveDamage(damage) {
    //Change healthbar
    this.stats.health -= damage;
    this.healthbar.text = this.stats.health;

    //Set tint to show damage
    this.tint = 0x0000ff;
    setTimeout(() => {
      this.tint = 0xffffff;
    }, 400)

    //Change Health hearts
    this.health.newHealth(this.stats.health);

  }


}
