/**
 * Created by CharlieShi on 3/24/17.
 */

/**
 * Created by CharlieShi on 3/23/17.
 */

export function enemyGeneratorInitial (gameState, numEnemies, enemyType) {
	let spawnLocations = [
		{x: 200, y: 200},
		{x: 400, y: 400},
		{x: 600, y: 600},
		{x: 250, y: 250}
	];

	for (let i = 0; i < numEnemies; i++) {
		gameState.createPrefab('zombie' + i,
			{
				type: 'enemies',
				properties: {
					group: 'enemies',
					initial: 9,
					texture: 'zombieSpriteSheet'
				}
			}, randomizeSpawn(spawnLocations));
	}
}

export function enemyGenerator (gameState, enemyType) {

}

function randomizeSpawn (spawnLocations) {
	let randomNum = Math.floor(Math.random() * spawnLocations.length) + 1;

	return spawnLocations[randomNum];
}