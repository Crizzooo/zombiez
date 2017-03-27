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
    };

    //TODO: make it only visible to the current player
    //Load Hearts, Healthbar, Animations
    console.log('do we have sockets here', socket);


    this.loadAnimations();
    //reference for which frame the gun should be on
    this.currentGunLevel = 1;
      //This might not be relevant since the world size is bigger than map size
    //To allow for camera pan
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
        rateOfFire: 100,
        reloadSpeed: 2000,
        clip: 30
      }
    }, {x: 225, y: 225});

    if (socket.id === properties.socketId) {
      this.loadHearts();
      this.loadGunUi();
      this.loadControls();
    }

    if (socket.id !== properties.socketId) {
      this.loadHealthbar();
    }

    //how frequently a player can roll
    this.rateOfRoll = 10000;
    this.nextRoll = 0;
  }

  loadControls() {
    this.cursors = {};
    this.cursors.up = this.gameState.input.keyboard.addKey(Phaser.Keyboard.W);
    this.cursors.down = this.gameState.input.keyboard.addKey(Phaser.Keyboard.S);
    this.cursors.left = this.gameState.input.keyboard.addKey(Phaser.Keyboard.A);
    this.cursors.right = this.gameState.input.keyboard.addKey(Phaser.Keyboard.D);
    this.cursors.jump = this.gameState.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
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

    this.gunUiFrame.gunClip = this.game.add.text(50, 25, this.gun.clip + '/' + this.gun.ammo, style);
    this.gunUiFrame.gunClip.fixedToCamera = true;
  }

  loadGunIntoUi(gunName) {
    this.gunUiFrame.gunSprite = this.gameState.game.add.sprite(0, 25, gunName + 'SpriteSheet', 1);
  }

  clipUpdate(clip, ammo) {
    // let clipText = +this.gunUiFrame.gunClip.text.split('/')[0]

    //console.log('clip text is ', clipText--)
    // clipText--;

    this.gunUiFrame.gunClip.text = clip + '/' + ammo;
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

  loadGun(gunLevel){
    switch(gunLevel){
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

  checkIfWin(){
    if(this.hasWon){
      console.log("III WWIIIIIIINNNNNN!!!!!---------------------------->")
      return true;
    }
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
