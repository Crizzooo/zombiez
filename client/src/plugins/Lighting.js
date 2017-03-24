/**
 * Created by CharlieShi on 3/24/17.
 */

export default class Lighting extends Phaser.Plugin {
	constructor (gameState) {
		super(gameState.game);

		this.gameState = gameState

		//Lighting Variables
		this.lightAngle = Math.PI/2;
		this.numberOfRays = 300;
		this.rayLength = 300;

		this.gameState.lighting = {};

		//Lighting layers
		this.gameState.lighting.wallsBitmap =  this.gameState.game.make.bitmapData(3200, 3200);
		this.gameState.lighting.wallsBitmap.draw('mapBitmap');
		this.gameState.lighting.wallsBitmap.update();
		this.gameState.game.add.sprite(0, 0, this.gameState.wallsBitmap);

		//Lighting mask and overlay
		this.gameState.lighting.maskGraphics = this.gameState.game.add.graphics(0, 0);
		this.gameState.lighting.blackness = this.gameState.game.add.sprite(0,0,'blackTile');
		this.gameState.lighting.mapSprite = this.gameState.game.add.sprite(0,0,'mapOverlay');
		this.gameState.lighting.mapSprite.blendMode = PIXI.blendModes.SCREEN
		this.gameState.lighting.blackness.alpha = 0.7;
	  this.gameState.lighting.blackness.scale.setTo(100,100);

		console.log('this is lighting constructor', this.gameState)
	}

	update () {
		//Get angle of mouse
		let mouseAngle = Math.atan2(
			this.gameState.currentPlayerSprite.y - this.gameState.game.input.activePointer.worldY,
			this.gameState.currentPlayerSprite.x - this.gameState.game.input.activePointer.worldX);

		//Fill in mask that'll become our cone
		this.gameState.lighting.maskGraphics.clear();
		this.gameState.lighting.maskGraphics.lineStyle(2, 0xffffff, 1);
		this.gameState.lighting.maskGraphics.beginFill(0xffff00, 0.5);

		//Move cone to where the player is
		this.gameState.lighting.maskGraphics.moveTo(this.gameState.currentPlayerSprite.x, this.gameState.currentPlayerSprite.y);

		//Generate raycast
		for(let i = 0; i < this.numberOfRays; i++) {
			let rayAngle = mouseAngle-(this.lightAngle / 2) + (this.lightAngle / this.numberOfRays) * i;

			let lastX = this.gameState.currentPlayerSprite.x;
			let lastY = this.gameState.currentPlayerSprite.y;

			//Determine where ray "lands"
			for(let j = 1; j <= this.rayLength; j += 1) {
				let landingX = Math.ceil(this.gameState.currentPlayerSprite.x - (2 * j) * Math.cos(rayAngle));
				let landingY = Math.ceil(this.gameState.currentPlayerSprite.y - (2 * j) * Math.sin(rayAngle));

				if(this.gameState.lighting.wallsBitmap.getPixel32(landingX, landingY) === 0){
					lastX = landingX;
					lastY = landingY;
				}
				else{
					this.gameState.lighting.maskGraphics.lineTo(lastX,lastY);
					break;
				}
			}
			this.gameState.lighting.maskGraphics.lineTo(lastX,lastY);
		}

		//Fill in the new mask
		this.gameState.lighting.maskGraphics.lineTo(this.gameState.currentPlayerSprite.x, this.gameState.currentPlayerSprite.y);
		this.gameState.lighting.maskGraphics.endFill();
		this.gameState.lighting.mapSprite.mask = this.gameState.lighting.maskGraphics;
	}

}
