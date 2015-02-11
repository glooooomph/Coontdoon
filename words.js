var index;
var alphabet;
var vowels;
var consonants;
var letterFrequencies = [15, 2, 3, 6, 21, 2, 3, 2, 13, 1, 1, 5, 4, 8, 13, 4, 1, 9, 9, 9, 5, 1, 1, 1, 1, 1];

function initializeWords() {
	index = new Array(26); //Not going to future proof for when q is removed from the alphabet.
	alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
	vowels = "aeiou".split("");
	consonants = "bcdfghjklmnpqrstvwxyz".split("");
}

function shuffle(array) { //Copied from StackOverflow
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function randomInt(limit) {
	var r = Math.floor(Math.random() * limit);
	return r;
}

function getLetters(numVowels) {
	var numConsonants = 9 - numVowels;
	function fillBag(from) {
		bag = [];
		for (var i = 0; i < from.length; i++) {
			var letter = from[i];
			var index = alphabet.indexOf(letter);
			var frequency = letterFrequencies[index];
			var t = new Array(frequency);
			for (var j = 0; j < frequency; j++) { //javascript's Array.prototype.fill is too new.
				t[j] = letter;
			}
			bag = bag.concat(t);
		}
		return bag;
	}
	var vowelBag = shuffle(fillBag(vowels));
	var consonantBag = shuffle(fillBag(consonants));
	var vowelSelection = vowelBag.slice(0, numVowels);
	var consonantSelection = consonantBag.slice(0, numConsonants);
	return shuffle(vowelSelection.concat(consonantSelection));
}

function longestWord(letters) {
	var compareLength = function(a, b) {
		return a.length > b.length;
	};
	return filterMax(words, makeCanBeMadeFrom(letters), compareLength);
}

function makeCanBeMadeFrom(letters) { //Returns Array.filter ready function. letters should be an array of characters.
	var canBeMadeFrom = function(word) {
		var newLetters = letters.slice(0); //copy letters
		for (var i = 0; i < word.length; i++) {
			var letter = word.charAt(i);
			var position = newLetters.indexOf(letter);
			if (position == -1) {
				return false;
			} else {
				newLetters.splice(position, 1);
			}
		}
		return true;
	};
	return canBeMadeFrom;
}

function isWord(word) {
	return words.indexOf(word) != -1;
}

function filterMax(a, predicate, bigger) {
	var reduction = function (previous, current, index) {

		if (bigger(current, previous) && predicate(current)) {
			return current;
		} else {
			return previous;
		}
	}
	return a.reduce(reduction);
}
