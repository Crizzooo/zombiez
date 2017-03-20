/**
 * Created by CharlieShi on 3/20/17.
 */

import EasyStar from './EasyStar'

export default class Pathfinding extends Phaser.Plugin {
    constructor (game, parent) {
      super (game, parent);
      this.easyStar = new EasyStar();
    }

  init (worldGrid, acceptableTiles, tileDimensions) {
    let grid_row, grid_column, grid_indices;
    this.gridDimensions = {row: worldGrid.length, column: worldGrid[0].length};
    this.worldGrid = worldGrid;

    this.easy_star.setGrid(this.worldGrid);
    this.easy_star.setAcceptableTiles(acceptableTiles);

    this.tileDimensions = tileDimensions;
  }

  find_path (origin, target, callback, context) {
    let origin_coord, target_coord;
    origin_coord = this.get_coord_from_point(origin);
    target_coord = this.get_coord_from_point(target);

    if (!this.outsideGrid(origin_coord) && !this.outsideGrid(target_coord)) {
      this.easy_star.findPath(origin_coord.column, origin_coord.row, target_coord.column, target_coord.row, this.call_callback_function.bind(this, callback, context));
      this.easy_star.calculate();
      return true;
    } else {
      return false;
    }
  }

  call_callback_function (callback, context, path) {
    let path_positions;
    path_positions = [];
    if (path) {
      path.forEach(function (path_coord) {
        path_positions.push(this.get_point_from_coord({row: path_coord.y, column: path_coord.x}));
      }, this);
      callback.call(context, path_positions);
    }
  }

  outsideGrid (coord) {
    return coord.row < 0 || coord.row > this.gridDimensions.row - 1 || coord.column < 0 || coord.column > this.gridDimensions.column - 1;
  }

  removeTile (coord) {
    this.worldGrid[coord.row][coord.column] = -1;
    this.easy_star.setGrid(this.worldGrid);
  }

  get_coord_from_point (point) {
    let row, column;
    row = Math.floor(point.y / this.tileDimensions.y);
    column = Math.floor(point.x / this.tileDimensions.x);
    return {row: row, column: column};
  }

  get_point_from_coord (coord) {
    let x, y;
    x = (coord.column * this.tileDimensions.x) + (this.tileDimensions.x / 2);
    y = (coord.row * this.tileDimensions.y) + (this.tileDimensions.y / 2);
    return new Phaser.Point(x, y);
  }
}