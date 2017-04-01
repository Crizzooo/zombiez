/**
 * Created by CharlieShi on 3/20/17.
 */

import EasyStar from './EasyStar'

export default class Pathfinding extends Phaser.Plugin {
    constructor (game, parent) {
      super (game, parent);
      this.easyStar = new EasyStar.js();
    }

  init (worldGrid, acceptableTiles, tileDimensions) {
    this.gridDimensions = {row: worldGrid.length, column: worldGrid[0].length};
    this.worldGrid = worldGrid;

    this.easyStar.setGrid(this.worldGrid);
    this.easyStar.setAcceptableTiles(acceptableTiles);

    this.tileDimensions = tileDimensions;
  }

  findPath (origin, target, callback, context) {
    let originCoord, targetCoord;
    originCoord = this.getCoordFromPoint(origin);
    targetCoord = this.getCoordFromPoint(target);

    if (!this.outsideGrid(originCoord) && !this.outsideGrid(targetCoord)) {
      this.easyStar.findPath(originCoord.column, originCoord.row, targetCoord.column, targetCoord.row, this.callCallbackFunction.bind(this, callback, context));
      this.easyStar.calculate();
      return true;
    } else {
      return false;
    }
  }

  callCallbackFunction (callback, context, path) {
    let pathPositions;
    pathPositions = [];
    if (path) {
      path.forEach(function (pathCoord) {
        pathPositions.push(this.getPointFromCoord({row: pathCoord.y, column: pathCoord.x}));
      }, this);
      callback.call(context, pathPositions);
    }
  }

  outsideGrid (coord) {
    return coord.row < 0 || coord.row > this.gridDimensions.row - 1 || coord.column < 0 || coord.column > this.gridDimensions.column - 1;
  }

	addTile(origin) {
		let originCoord = this.getCoordFromPoint(origin);
		this.worldGrid[originCoord.row, originCoord.column] = 1;
	}

	addTileTemp(origin) {
		let originCoord = this.getPointFromCoord(origin);
		this.worldGrid[originCoord.x, originCoord.y] = 1;

		console.log('ORIGIN COORD COLLISION', originCoord);

		setTimeout( () => {
			this.worldGrid[originCoord.x, originCoord.y] = -1
		}, 1000);
	}


  removeTile (coord) {
    this.worldGrid[coord.row][coord.column] = -1;
    this.easyStar.setGrid(this.worldGrid);
  }

  getCoordFromPoint (point) {
    let row, column;
    row = Math.floor(point.y / this.tileDimensions.y);
    column = Math.floor(point.x / this.tileDimensions.x);
    return {row: row, column: column};
  }

  getPointFromCoord (coord) {
    let x, y;
    x = (coord.column * this.tileDimensions.x) + (this.tileDimensions.x / 2);
    y = (coord.row * this.tileDimensions.y) + (this.tileDimensions.y / 2);
    return new Phaser.Point(x, y);
  }
}