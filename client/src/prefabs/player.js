import Prefab from './Prefab';
import HealthHeart from './healthbar';
import Heart from './healthHearts';

const {PLAYER_HEALTH, PLAYER_DAMAGE_TINT, TIME_BETWEEN_ROLLS} = require('../engine/gameConstants.js');

export default class Player extends Prefab {

  constructor(game, name, position, properties) {
    super(game, name, position, properties);

    this.anchor.setTo(0.5);

    this.stats = {
      totalHealth: 100,
      health: 100,
      movement: 100
    };

    //TODO: make it only visible to the current player
    //Load Hearts, Healthbar, Animations
    this.socketId = properties.socketId;


    this.loadAnimations();
    //reference for which frame the gun should be on
    this.currentGunLevel = 1;
    //This might not be relevant since the world size is bigger than map size
    //To allow for camera pan
    this.body.enable = true;
    this.body.collideWorldBounds = true;
    this.body.immovable = true;
    this.game.physics.arcade.enable(this);
    //flag for telling whether or not the player has won
    this.hasWon = false;
    //Setup player's gun
    //Load starting gun pistol

    this.gun = this.gameState.createPrefab('gun', {
      type: 'guns',
      properties: {
        group: 'guns',
        name: 'pistol',
        initial: 8,
        texture: 'pistolSpriteSheet',
        rateOfFire: 350,
        reloadSpeed: 2000,
        clip: 10
      }
    }, {x: 225, y: 225});


    if (socket.id === properties.socketId) {
      this.loadHearts();
      this.loadGunUi();
      this.loadControls();
      this.loadMedalUi();
      this.loadReloadBar();
    }

    if (socket.id !== properties.socketId) {
      this.loadHealthbar();
    }

    //used to store currently playing animations
    this.rolling = null

    // used to slow roll speed when diagonal
    this.walkingDiagionally = false;

    //how frequently a player can roll
    this.rateOfRoll = TIME_BETWEEN_ROLLS;
    this.canRoll = true;
  }

  loadControls () {
	  this.cursors = {};
	  this.cursors.up = this.gameState.input.keyboard.addKey(Phaser.Keyboard.W);
	  this.cursors.down = this.gameState.input.keyboard.addKey(Phaser.Keyboard.S);
	  this.cursors.left = this.gameState.input.keyboard.addKey(Phaser.Keyboard.A);
	  this.cursors.right = this.gameState.input.keyboard.addKey(Phaser.Keyboard.D);
	  this.cursors.jump = this.gameState.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	  this.cursors.chat = this.gameState.input.keyboard.addKey(Phaser.Keyboard.TAB);
    this.cursors.reload = this.gameState.input.keyboard.addKey(Phaser.Keyboard.R);
    this.cursors.esc = this.gameState.input.keyboard.addKey(Phaser.Keyboard.ESC);
	  this.cursors.fire = this.gameState.input.activePointer;
  }

  loadAnimations() {
    this.animations.add('right', [44, 8, 5, 31, 12, 13], 10, true);
    this.animations.add('left', [17, 10, 5, 19, 8, 9], 10, true);
    this.animations.add('up', [16, 0, 14, 6, 1], 10, true);
    this.animations.add('down', [43, 9, 34, 38, 7, 4], 10, true);
    this.animations.add('idle', [18], 10, true);

    this.rollup = this.animations.add('roll-up', [37, 33, 42, 32, 22, 23, 21], 10, false);
    this.rolldown = this.animations.add('roll-down', [39, 35, 41, 26, 27, 25], 10, false);
    this.rollright = this.animations.add('roll-right', [19, 20, 18, 45, 46, 29], 10, false);

  }

  loadGunUi() {
    //TODO: Should base entire ui off gunFrame in order to center sprites
    this.gunUiFrame = this.gameState.game.add.sprite(0, 25, 'gunUiFrame', 8);
    this.gameState.game.add.existing(this.gunUiFrame);
    this.gunUiFrame.fixedToCamera = true;
    this.gunUiFrame.alpha = 0.5;
    this.gunUiFrame.gunSprite = this.gameState.game.add.sprite(90, 70, 'pistolSpriteSheet', this.gun.frame);
    this.gameState.game.add.existing(this.gunUiFrame.gunSprite);
    this.gunUiFrame.gunSprite.scale.setTo(3, 3);
    this.gunUiFrame.gunSprite.smoothed = false;
    this.gunUiFrame.gunSprite.fixedToCamera = true;

    const style = {
      font: "bold 30px Arial",
      fill: "#FFF",
      stroke: "#000",
      strokeThickness: 3
    };

    this.gunUiFrame.gunClip = this.game.add.text(50, 25, this.gun.ammo + '/' + this.gun.clip, style);
    this.gunUiFrame.gunClip.fixedToCamera = true;
  }

  loadReloadBar(){
    console.log('this', this);
    console.log('game ', this.game);
    let canvas = document.getElementsByTagName("canvas")[0];
    this.reloadBar = this.gameState.game.add.sprite( (canvas.width/2), (canvas.height/2) - 25, 'reloadBarSpriteSheet', 0);
    this.reloadBar.anchor.setTo(0.5);
    this.gameState.game.add.existing(this.reloadBar);
    this.reloadBar.visible = false;
    this.reloadBar.fixedToCamera = true;
    this.reloadBar.animations.add('playReload', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29], 15, false);
  }

  loadMedalUi(){
    let canvas = document.getElementsByTagName("canvas")[0];
    this.medal = this.gameState.game.add.sprite((canvas.width/2), 0, 'medalSpriteSheet', 3);
    this.gameState.game.add.existing(this.medal);
    this.medal.fixedToCamera = true;
  }

  loadGunIntoUi(gunName) {
    this.gunUiFrame.gunSprite = this.gameState.game.add.sprite(0, 25, gunName + 'SpriteSheet', 1);
  }

  clipUpdate() {
    this.gunUiFrame.gunClip.text = this.gun.ammo + '/' + this.gun.clip;
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

    //TODO: bullets collide with health?
    //Add to existing
    //this.gameState.add.existing(this.healthbar);
  }

  upgradeGun() {
    this.currentGunLevel++;
    console.log("INSIDE OF LOAD GUN!!", this);
    switch (this.currentGunLevel) {
      case 1:
        this.gun.frame = 8;
        this.gunUiFrame.gunSprite.frame = 8;
        break;
      case 2:
        this.gun.frame = 6;
        this.gunUiFrame.gunSprite.frame = 6;
        break;
      case 3:
        this.gun.frame = 1;
        this.gunUiFrame.gunSprite.frame = 1;
        break;
      case 4:
        this.hasWon = true;
        break;
    }
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
  }

  resetHealth() {
    this.stats.health += 100;
    if (socket.id !== this.socketId) {
      this.healthbar.text = this.stats.health;
    } else {
      this.health.hearts.forEach((heartSprite) => {
        heartSprite.changeHeart("full");
      })
    }
  }

  checkForRankUp(remotePlayers){
    //sort by gun level
    let arr = [{id: socket.id, num: this.currentGunLevel}];
    for(let key in remotePlayers){
      arr.push({id: key, num: remotePlayers[key].currentGunLevel})
    }
    let sortedArr = arr.sort((obj, obj2) => {
      return obj2.num - obj.num;
    });
    sortedArr.forEach((obj, i) => {
      if(obj.id === socket.id) {
        this.medal.frame = i;
      }
      //else possibly dispatch and update all other medals?
    })
  }

  receiveDamage(damage) {
    //Change healthbar
    console.log('this receiving dmg: ', this, damage);
    this.stats.health -= damage;

    if (socket.id !== this.socketId){
      console.log('updating remote player health');
      this.healthbar.text = this.stats.health;
    } else {
      console.log('cp updating health on dmg event');
      this.health.newHealth(this.stats.health);
    }
    //this.healthbar.text = this.stats.health;

    //Set tint to show damage
    //TODO: change to a red tint
    if (this.stats.health !== 0) {
      this.tint = PLAYER_DAMAGE_TINT;
      setTimeout(() => {
        this.tint = 0xffffff;
        //Change Health hearts <----- WHY CHARLIE, WHY IN A setTimeout?! I FOUND THIS AFTER 4 HOURS
        // this.health.newHealth(this.stats.health);
      }, 250)
    }
  }
}
