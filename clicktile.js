//CONSTANTS
var tileSize = 43;
var tilePadding = 2;
var numTiles = 9;
var rowLength = numTiles + 1;

/*This "class" is unrelated to DragTileSpace since I will never use any polymorphism between them and there is very little code the same in them. DragTileSpace will ultimately be only used for numbers and will look and behave totally differently. The only real thing in common between the two
are the Tiles, whose looks are taken care of by CSS and whose behaviour is very different. The move methods don't even need to be the same as in this
version each Tile will only ever be in 2 places so no bounds checking is needed. The Tile objects are so simple in this that they will just be anonymous objects */

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
	this.bound = new Array(letters.length); //Tracks which tiles are bound
	for (var i = 0; i < letters.length; i++) {
		this.tiles[i] = $('<span class="tile">' + letters[i] + '</span>');
		this.freeTileCell.append(this.tiles[i]);
		this.tiles[i].css({"width": tileSize, "height": tileSize});
	}
	this.repositionFreeTiles();
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

	moveTile: function(tile, newLeft, newTop) {
		this.tiles[tile].css({"left": newLeft, "top": newTop});
	},

	animoveTile: function(tile, newLeft, newTop) {
		this.tiles[tile].animate({"left": newLeft, "top": newTop});
	},

	setHeight: function(newHeight) {
		this.jQuerySpace.css("height", newHeight);
	},

	bindTile: function(tile) { //Tiles in the current word are referred to as bound for historical reasons.
		this.word.push(tile);
		this.bound[tile] = true;
	},

	unbindTile: function(tile) {
		this.word.splice(this.word.indexOf(tile), 1);
		this.bound[tile] = false;
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
			this.animoveTile(this.word[i], newLeft, newTop);
		}
	},

	repositionFreeTiles: function(speed) {
		if (typeof speed === "undefined") {
			var speed = 200;
		}
		for (var i = 0; i < this.tiles.length; i++) {
			if (!this.bound[i]) {
					this.animoveTile(i, this.positions[i].left, this.positions[i].top);
			}
		}
	},

	getWord: function() {
		var letters = new Array(this.word.length);
		for (var i = 0; i < letters.length; i++) {
			letters[i] = this.tiles[this.word[i]].text();
		}
		return letters.join("");
	},

	setWord: function(word) {
		var letters = word.split("");
		//Unbind all tiles
		for (var i = this.word.length - 1; i >= 0; i--) { //iterate backwards since removing tiles from the start messes up the loop
			this.unbindTile(this.word[i]);
		}
		//Find which tile represents each letter and bind them
		for (var i = 0; i < letters.length; i++) {
			//iterate through tiles until the right letter is found.
			for (var j = 0; j < this.tiles.length; j++) {
				if (this.tiles[j].text() == letters[i] && !this.bound[j]) {
					//use this tile
					this.bindTile(j);
					break;
				}
			}
		}
		this.repositionBoundTiles();
		this.repositionFreeTiles();
	}
};

	
