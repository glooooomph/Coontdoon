//CONSTANTS
var tileSize = 43;
var tilePadding = 2;
var numTiles = 9;
var rowLength = numTiles + 1;


var activeTile;
var offsetX;
var offsetY;
var mouseDown = false;

var highestZ = 1;
var tiles = 0;

//BEGIN TILE DEFINITION ALSO TODO: find better way of grouping together functions and prototypes.

function DragTile(letter, container) { //container is a TileSpace
	this.container = container;
	this.free = true;
	this.letter = letter;
	this.jQueryTile = $('<span class="tile">' + letter.toUpperCase() + '</span>');
	this.jQueryTile.bind("touchmove", DragTile.makeHandleTouchMove(this));
	this.jQueryTile.bind("touchstart", DragTile.makeHandleTouchStart(this));
	this.jQueryTile.bind("touchend", DragTile.makeHandleTouchEnd(this));
	this.jQueryTile.bind("touchcancel", DragTile.makeHandleTouchEnd(this));
	this.jQueryTile.css({"width": tileSize, "height": tileSize});
}

DragTile.makeHandleTouchEnd = function(tile) {
	var handleTouchEnd = function(e) {
		tile.container.processFullMove(tile);
	}
	return handleTouchEnd;
}


DragTile.makeHandleTouchMove = function(tile) { //Makes a touch handler with the DragTile object hard coded in.
	var handleTouchMove = function(e) {
		e.preventDefault();
		var touch = e.originalEvent.changedTouches[0];
		var newLeft = $(window).scrollLeft() + touch.clientX - offsetX;
		var newTop = $(window).scrollTop() + touch.clientY - offsetY;
		tile.move(newLeft, newTop);
	};
	return handleTouchMove;
}

DragTile.makeHandleTouchStart = function(tile) {
	var handleTouchStart = function(e) {
		var touch = e.originalEvent.changedTouches[0];
		activeTile = tile.jQueryTile;
		highestZ++;
		activeTile.css("z-index", highestZ);
		offsetX = touch.clientX - ($(window).scrollLeft() + activeTile.position().left);
		offsetY = touch.clientY - ($(window).scrollTop() + activeTile.position().top);
	};
	return handleTouchStart;
}

DragTile.prototype = {
	move: function(newLeft, newTop) {
		square = this.jQueryTile;
		box = this.container.jQueryTileSpace;
		var maxTop = box.height() - tileSize;
		var maxLeft = box.width() - tileSize;
		if (newLeft < 0) {
			newLeft = 0;
		}
		if (newLeft > maxLeft) {
			newLeft = maxLeft;
		}
		if (newTop < 0) {
			newTop = 0;
		}
		if (newTop > maxTop) {
			newTop = maxTop;
		}
		square.css({"left": newLeft, "top": newTop});
	},

	animove: function(newLeft, newTop, speed) {
		if (typeof speed === "undefined") {
			speed = 200;
		}
		square = this.jQueryTile;
		box = this.container.jQueryTileSpace;
		var maxTop = box.height() - tileSize;
		var maxLeft = box.width() - tileSize;
		if (newLeft < 0) {
			newLeft = 0;
		}
		if (newLeft > maxLeft) {
			newLeft = maxLeft;
		}
		if (newTop < 0) {
			newTop = 0;
		}
		if (newTop > maxTop) {
			newTop = maxTop;
		}
		square.animate({"left": newLeft, "top": newTop}, speed, "linear");
	},

	space: null
}

//END TILE DEFINITION

//BEGIN TILESPACE DEFINITION

function TileSpace() {
	this.jQueryTileSpace = $('<table class="tilespace"></table>');
	var jQueryFreeTileRow = $('<tr class="freetilerow"></tr>');
	var jQueryBoundTileRow = $('<tr class="boundtilerow"></tr>');
	this.jQueryFreeTileCell = $('<td class="freetilecell"></td>');
	this.jQueryBoundTileCell = $('<td class="boundtilecell"></td>');
	this.jQueryFreeTileCell.css("width", this.width);
	this.jQueryFreeTileCell.css("height", this.height);
	this.jQueryBoundTileCell.css("height", this.boundHeight);
	//Attach everything together.
	this.jQueryTileSpace.append(jQueryFreeTileRow);
	this.jQueryTileSpace.append(jQueryBoundTileRow);
	jQueryFreeTileRow.append(this.jQueryFreeTileCell);
	jQueryBoundTileRow.append(this.jQueryBoundTileCell);

	this.freeTiles = []; //Free tiles are all over the place. Bound tiles are in the answer row.
	this.boundTiles = [];
}

TileSpace.prototype = {
	width: 450,
	
	height: 200,

	boundHeight: tileSize,

	defaultPositions: null,

	getWord: function() {
		text = "";
		for (var i = 0; i < this.boundTiles.length; i++) {
			text = text.concat(this.boundTiles[i].letter);
		}
		return text;
	},

	setWord: function(word) {
		for (var i = 0; i < this.boundTiles.length; i++) {
			this.boundTiles[i].free = true;
			this.freeTiles.push(this.boundTiles[i]);
		}
		this.boundTiles = new Array(); //Unbind all tiles.
		letters = word.split("");
		for (var i = 0; i < letters.length; i++) {
			var tile; //find DragTile with right letter
			for (var j = 0; j < this.freeTiles.length; j++) {
				if (this.freeTiles[j].letter == letters[i]) {
					tile = j;
					break;
				}
			}
			this.boundTiles.push(this.freeTiles[tile]);
			this.freeTiles[tile].free = false;
			this.freeTiles.splice(tile, 1);
		}
		this.repositionFreeTiles(400);
		this.repositionBoundTiles(400);
	},

	addTile: function(letter) {
		tile = new DragTile(letter, this);
		this.jQueryFreeTileCell.append(tile.jQueryTile, this);
		this.freeTiles.push(tile);
	},

	processFullMove: function(tile) { //Should be called when the users finger comes off a tile. tile is a DragTile object.
		if (parseInt(tile.jQueryTile.css("top")) > this.height - tileSize) {
			var left = parseInt(tile.jQueryTile.css("left"));
			var totalSize = tileSize + tilePadding;
			var rowLengthPixels = this.boundTiles.length * totalSize;
			var rowStart = (this.width - (totalSize * this.boundTiles.length)) / 2 >> 0; //>> 0 gives integer division. This shouldn't be necessary
			var rowEnd = rowLengthPixels - rowStart;
			var position;
			if (rowLengthPixels > 0) {
				position = Math.floor(1 + (left - rowStart) / totalSize) //Integer division. Fucking Javascript.
				if (position < 0) {
					position = 0;
				} else if (position > this.boundTiles.length) {
					position = this.boundTiles.length;
				}
			} else {
				position = 0;
			}
			if (tile.free) {
				tile.free = false;
				this.freeTiles.splice(this.freeTiles.indexOf(tile), 1);
				this.boundTiles.splice(position, 0, tile);
			} else {
				oldPosition = this.boundTiles.indexOf(tile);
				this.boundTiles.splice(position, 0, tile);
				if (position < oldPosition) {
					oldPosition++; //Adjust oldPosition in the case a new tile has been inserted.
				}
				this.boundTiles.splice(oldPosition, 1);
			}
		} else if (!tile.free) {
			tile.free = true;
			this.boundTiles.splice(this.boundTiles.indexOf(tile), 1);
			this.freeTiles.push(tile);
		}
		this.repositionBoundTiles();
	},

	repositionBoundTiles: function(speed) {
		if (typeof speed === "undefined") {
			speed = 200;
		}
		var totalSize = tileSize + tilePadding;
		var rowLengthPixels = this.boundTiles.length * totalSize;
		var rowStart = (this.width - (totalSize * this.boundTiles.length)) / 2 >> 0;
		for (var i = 0; i < this.boundTiles.length; i++) {
			var newLeft = rowStart + i * totalSize;
			var newTop = this.height;
			this.boundTiles[i].animove(newLeft, newTop, speed);
		}
	},

	addTiles: function(letters) {
		for (var i = 0; i < letters.length; i++) {
			this.addTile(letters[i]);
		}
	},

	setHeight: function(newHeight) {
		this.height = newHeight;
		this.jQueryFreeTileCell.css("height", newHeight);
	},

	repositionFreeTiles: function(speed) {
		if (typeof speed === "undefined") {
			speed = 200;
		}
		for (var i = 0; i < this.freeTiles.length; i++) {
			this.freeTiles[i].animove(this.defaultPositions[i].left, this.defaultPositions[i].top, speed);
		}
	},

	moveTiles: function(newPositions) {
		this.defaultPositions = newPositions;
		this.repositionFreeTiles();
	}
}

//END TILESPACE DEFINITION
