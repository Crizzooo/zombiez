
/**
 * GenZed
 * A top down multiplyer, battle arena shooter, king of hill with zombies
 * Created by: Charlie Shi, Christopher Rizzo, Ryan Skinner & Jacob Cohen
 */

import BootState from './gameStates/boot'
import PreloadState from './gameStates/preload'
import ZombieGameState from './gameStates/zombieGameState'

export default class GenZed extends Phaser.Game {
    constructor (widthParam, heightParam, rendererParam, parent) {
        const width = widthParam || '100%';
        const height = heightParam || '100%';
        const renderer = rendererParam || Phaser.CANVAS;

        super(width, height, Phaser.CANVAS, parent, null);

        //TODO: all game states go here
        this.state.add('BootState', new BootState());
        this.state.add('PreloadState', new PreloadState());
        this.state.add('ZombieGameState', new ZombieGameState());
    }

    startGame (key, clearWorld, clearCache, parameter) {
        //Parameters is players
        //Method is invoked in sockets.js
        this.state.start(key, clearWorld, clearCache, parameter)
    }
}
