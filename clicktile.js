//CONSTANTS
var tileSize = 43;
var tilePadding = 2;
var numTiles = 9;
var rowLength = numTiles + 1;
var highestZ = 0;

var offsetX;
var offsetY;

var start;
var end;

//Begin ClickTileSpace dfinition

function ClickTileSpace(letters) {
	this.letters = letters
	this.word = []; //word is an array of tile ids
	var freeTileRow = $('<tr></tr>'); //Make the layout elements
	var boundTileRow = $('<tr></tr>');
	this.jQuerySpace = $('<table class="tilespace"></table>');
	this.jQuerySpace.append(freeTileRow);
	this.jQuerySpace.append(boundTileRow);
	this.freeTileCell = $('<td class="freetilecell"></td>');
	this.boundTileCell = $('<td class="boundtilecell"></td>');
	this.freeTileCell.css({"width": this.width, "height": this.height});
	this.boundTileCell.css("height", this.boundHeight);
	freeTileRow.append(this.freeTileCell);
	boundTileRow.append(this.boundTileCell);

	this.tiles = new Array(letters.length); //Make Tiles and put them in position
	for (var i = 0; i < letters.length; i++) {
		this.tiles[i] = new ClickTile(this, letters[i]);
		this.freeTileCell.append(this.tiles[i].jQueryTile);
		this.tiles[i].setDefaultPosition(this.positions[i]);
	}
	this.repositionFreeTiles(0);
}


ClickTileSpace.prototype = {

	width: 450,
	
	height: 200,

	boundHeight: tileSize,

	positions: [
		{"left": 200,"top": 3},
		{"left": 253,"top": 23},
		{"left": 319,"top": 31},
		{"left": 295,"top": 84},
		{"left": 95,"top": 89},
		{"left": 165,"top": 95},
		{"left": 74,"top": 38},
		{"left": 236,"top": 101},
		{"left": 128,"top": 19}
	], //These make something roughly circular in shape.

	setHeight: function(newHeight) {
		this.freeTileCell.css("height", newHeight);
		this.height = newHeight;
	},

	bindTile: function(tile) { //Tiles in the current word are referred to as bound for historical reasons.
		this.word.push(tile);
	},

	unbindTile: function(tile) {
		this.word.splice(this.word.indexOf(tile), 1);
	},

	repositionBoundTiles: function(speed) {
		if (typeof speed === "undefined") {
			var speed = 200;
		}
		var totalSize = tileSize + tilePadding;
		var rowLengthPixels = this.word.length * totalSize;
		var rowStart = (this.width - (totalSize * this.word.length)) / 2 >> 0;
		for (var i = 0; i < this.word.length; i++) {
			var newLeft = rowStart + i * totalSize;
			var newTop = this.height;
			this.word[i].move(newLeft, newTop, speed);
		}
	},

	repositionFreeTiles: function(speed) {
		for (var i = 0; i < this.tiles.length; i++) {
			if (this.tiles[i].free) {
				this.tiles[i].moveToDefaultPosition(speed);
			}
		}
	},
		
		

	getWord: function() {
		var letters = new Array(this.word.length);
		for (var i = 0; i < letters.length; i++) {
			letters[i] = this.word[i].letter;
		}
		return letters.join("");
	},

	setWord: function(word) {
		var letters = word.split("");
		//Unbind all tiles
		for (var i = this.word.length - 1; i >= 0; i--) { //iterate backwards since removing tiles from the start messes up the loop
			this.word[i].unbind();
		}
		//Find which tile represents each letter and bind them
		for (var i = 0; i < letters.length; i++) {
			//iterate through tiles until the right letter is found.
			for (var j = 0; j < this.tiles.length; j++) {
				if (this.tiles[j].letter == letters[i] && this.tiles[j].free) {
					//use this tile
					this.tiles[j].bind();
					break;
				}
			}
		}
		this.repositionBoundTiles();
		this.repositionFreeTiles();
	},


};

//End ClickTileSpace definition

//begin ClickTile definition

function ClickTile(space, letter) {
	this.space = space;
	this.letter = letter;
	this.free = true;
	this.jQueryTile = $('<span class="tile">' + letter.toUpperCase() + '</span>');
	this.jQueryTile.css({"width": tileSize, "height": tileSize});
	this.jQueryTile.bind("click", this.makeClickHandler());
	this.jQueryTile.bind("touchstart", this.makeTouchStartHandler());
	this.jQueryTile.bind("touchmove", this.makeTouchMoveHandler());
	this.jQueryTile.bind("touchend", this.makeTouchEndHandler());
	this.free = true;
}

ClickTile.prototype = {

	defaultPosition: {
		"left": 0,
		"right": 0
	},
	
	makeClickHandler: function() {
		var tile = this; //this will be bound to something else when the function is run
		var space = tile.space;
		var clickHandler = function(e) {
			tile.toggleBind();
			space.repositionBoundTiles(150);
			space.repositionFreeTiles(150);
		}
		return clickHandler;
	},

	bind: function() {
		this.free = false;
		this.space.bindTile(this); //These functions do not reposition bound tiles.
	},

	unbind: function() {
		this.free= true;
		this.space.unbindTile(this);
	},

	toggleBind: function() {
		if (this.free) {
			this.bind();
		} else {
			this.unbind();
		}
	},

	checkBounds: function(newLeft, newTop) {
		var square = this.jQueryTile;
		var box = this.space.jQuerySpace;
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
		return {"left": newLeft, "top": newTop};
	},

	move: function(newLeft, newTop) {
		this.jQueryTile.css(this.checkBounds(newLeft, newTop));
	},

	animove: function(newLeft, newTop, speed) {
		if (typeof speed === "undefined") {
			speed = 200;
		}
		this.jQueryTile.animate(this.checkBounds(newLeft, newTop), speed, "linear");
	},

	setDefaultPosition: function(position) { //Accepts a position object rather than two values
		this.defaultPosition = position;
	},

	moveToDefaultPosition: function(speed) {
		var animate = true;
		if (typeof speed === "undefined") {
			var speed = 200;
		} else if (speed == 0) {
			animate = false;
		}
		if (animate) {
			this.animove(this.defaultPosition.left, this.defaultPosition.top, speed);
		} else {
			this.move(this.defaultPosition.left, this.defaultPosition.top);
		}
	},

	makeTouchEndHandler: function() {
		var tile = this;
		var handleTouchEnd = function(e) {
			e.preventDefault();
			end = new Date().getTime();
			if (end - start < 100) {
				tile.jQueryTile.trigger("click"); //if the touch was short then pretend it was a click
			} else {
				tile.space.processFullMove(this);
			}
		}
		return handleTouchEnd;
	},

	makeTouchMoveHandler: function() {
		var tile = this;
		var handleTouchMove = function(e) {
			e.preventDefault();
			var touch = e.originalEvent.changedTouches[0];
			var newLeft = touch.clientX - offsetX;
			var newTop = touch.clientY - offsetY;
			tile.move(newLeft, newTop);
		};
		return handleTouchMove;
	},

	makeTouchStartHandler: function() {
		var tile = this;
		var handleTouchStart = function(e) {
			e.preventDefault();
			start = new Date().getTime();
			var touch = e.originalEvent.changedTouches[0];
			highestZ++; //Bring tile to front
			tile.jQueryTile.css("z-index", highestZ);
			offsetX = touch.clientX - (tile.jQueryTile.position().left);
			offsetY = touch.clientY - (tile.jQueryTile.position().top);
		};
		return handleTouchStart;
	}
}
	
