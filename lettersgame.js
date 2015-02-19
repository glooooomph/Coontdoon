$(document).ready(init);
var space;
var letters;
var answer;

function init(e) {
	initializeWords();
	initializeSpace();
	var answerForm = $('<form></form>');
	var answerButton = $('<input style="font-size: 24pt" type="submit" value="Submit!"></input>');
	$("#buttonspace").append(answerForm);
	answerButton.val(answer.length);
	answerForm.append(answerButton);
	answerForm.submit(submitAnswer);
}

function initializeSpace() {
	letters = getLetters(4);
	answer = longestWord(letters);
	space = new ClickTileSpace(letters);
	$("#tilespacespace").append(space.jQuerySpace);
	space.setHeight(150);
	space.repositionFreeTiles(0);

}

function submitAnswer(e) {
	e.preventDefault();
	var givenAnswer = space.getWord();
	//var bestAnswer = longestWord(letters);
	if (answer.length > givenAnswer.length || !isWord(givenAnswer)) {
		space.setWord(answer);
	} else {
		space.jQuerySpace.detach();
		initializeSpace();
	}
}
