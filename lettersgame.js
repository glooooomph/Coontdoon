$(document).ready(init);
var space;
var letters;
var answer;

function init(e) {
	initializeWords();
	space = new TileSpace();
	$("#tilespacespace").append(space.jQueryTileSpace);
	letters = getLetters(4);
	space.setHeight(150);
	space.addTiles(letters);
	var positions = [
		{"left": 200,"top": 3},
		{"left": 253,"top": 23},
		{"left": 319,"top": 31},
		{"left": 295,"top": 84},
		{"left": 95,"top": 89},
		{"left": 165,"top": 95},
		{"left": 74,"top": 38},
		{"left": 236,"top": 101},
		{"left": 128,"top": 19}
	];
	space.moveTiles(positions);
	answer = longestWord(letters);
	var answerForm = $('<form></form>');
	var answerButton = $('<input style="font-size: 24pt" type="submit" value="Submit!"></input>');
	$("#buttonspace").append(answerForm);
	answerButton.val(answer.length);
	answerForm.append(answerButton);
	answerForm.submit(submitAnswer);
}

function submitAnswer(e) {
	e.preventDefault();
	var givenAnswer = space.getWord();
	//var bestAnswer = longestWord(letters);
	if (answer.length > givenAnswer.length || !isWord(givenAnswer)) {
		space.setWord(answer);
	} else {
		//alert("you win!!!");
		window.location.reload();
	}
}
