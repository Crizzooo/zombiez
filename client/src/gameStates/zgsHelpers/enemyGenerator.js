/**
 * Created by CharlieShi on 3/24/17.
 */

/**
 * Created by CharlieShi on 3/23/17.
 */

//Added enemyType for later use
export function enemyGeneratorInitial (gameState, numEnemies, enemyType) {
	let spawnLocations = [
		{x: 200, y: 200},
		{x: 400, y: 400},
		{x: 600, y: 600},
		{x: 250, y: 250},
		{x: 250, y: 250},
		{x: 500, y: 500},
		{x: 600, y: 600},
		{x: 700, y: 700},
		{x: 800, y: 800},
		{x: 900, y: 900}
	];

	//TODO: right animation for walking
	//This creates a new zombie prefab and adds it to the mapoverlay layer
	//And plays the default walk animation
	for (let i = 0; i < numEnemies; i++) {
		console.log('creating zombie', i)
		let newZom = gameState.createPrefab('zombie' + i,
			{
				type: 'enemies',
				properties: {
					group: 'enemies',
					initial: 9,
					texture: 'zombieSpriteSheet'
				}
			}, randomizeSpawn(spawnLocations)).animations.play('left');

		//gameState.lighting.mapSprite.addChild(newZom);
	}
}

export function enemyGenerator (gameState, enemyType) {
	gameState.groups.enemies.forEachDead((enemy)  => {

	})
}

function randomizeSpawn (spawnLocations) {
	let randomNum = Math.floor(Math.random() * spawnLocations.length);
	console.log('random num is', randomNum);

	return spawnLocations[randomNum];
}