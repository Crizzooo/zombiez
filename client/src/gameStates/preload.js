const init = () => {
    ZG.game.stage.backgroundColor = '#7c79fa';
}

const preload = () => {
    //load assets that are used across all games

    //Preload Bar
    ZG.game.preloadBar = ZG.game.add.sprite(ZG.game.world.centerX, ZG.game.world.centerY, 'preloadbar', 0);
    ZG.game.preloadBar.anchor.setTo(0.5);
    ZG.game.preloadBar.scale.setTo(5);

    //Other Sprites
    ZG.game.load.setPreloadSprite(ZG.game.preloadBar);


    //Atlases for Player Character
    ZG.game.load.atlasJSONHash('playerSpriteSheet', '../../assets/images/finalSheet.png', '../../assets/images/finalSheet.json');

    //load level releated assets
    // ZG.game.load.image('gameTiles', '../../assets/images/tiles_spritesheet.png');
    // ZG.game.load.tilemap('level1', '../../assets/levels/level1.json', null, Phaser.Tilemap.TILED_JSON);
}
const create = () => {
    //launch next game state;
    ZG.game.state.start('ZombieGameState', true, false);
}
const update = () => {

}


const PreloadState = {
    init,
    preload,
    create,
    update
};

export default PreloadState;
