// define ui variable
const puzzleEl = document.querySelector('#puzzle');
const guessEl = document.querySelector('#guesses');
const resetBtn = document.querySelector('#reset');
let game;

// Get the API data form the other server
const getAPI = (wordCount, callback) => {
	const request = new XMLHttpRequest();

	request.addEventListener('readystatechange', (e) => {
		if(e.target.status === 200 && e.target.readyState === 4) {
			const data = JSON.parse(e.target.responseText);
			callback(data.puzzle);
		} else if(e.target.readyState === 4){
			guessEl.textContent = ('An error has taken place!')
		}
	})

	request.open('GET', 'http://puzzle.mead.io/puzzle?wordCount=' + wordCount);
	request.send()
}

// create game
const Guess  = function(word, num) {
	this.words = word.toUpperCase().split('');
	this.life = num;
	this.answers = [];
	this.status = 'playing';
}
// render the puzzle word
Guess.prototype.getPuzzle = function(letter){

	const span = document.createElement('span')
	if(this.answers.includes(letter) || letter === ' ') {
		span.textContent = letter
	} else {
		span.textContent = '*'
	}
	return span

}
// make a guess to the puzzle
Guess.prototype.makeGuess = function(guess){
	guess = guess.toUpperCase();
	const diffLetter = !this.answers.includes(guess);
	const wrongAnswer = !this.words.includes(guess);

	if(this.status !== 'playing'){
		return undefined
	}

	if(diffLetter) {
		this.answers.push(guess);
	}

	if(diffLetter && wrongAnswer) {
		this.life--
	}
	this.getStatus()
}
 
// get the status of the game whether playing, finished or failed
Guess.prototype.getStatus = function(){
	// check if finished
	// let finished = true;
	// const x = this.words.filter((letter) => {
	// 	if(this.answers.includes(letter) || letter === ' ') {
	// 		return letter
	// 	}
	// })
	// if(x.length === this.words.length){
	// 	finished = true
	// } else {
	// 	finished = false;
	// }
	// console.log(finished)

	// better way to check if finished
	const finished = this.words.every((letter) => {
		if(this.answers.includes(letter) || letter === ' '){
			return letter
		}
	})

	if(this.life <= 0) {
		this.status = 'failed';
	} else if(finished) {
		this.status = 'finished'
	} else {
		this.status = 'playing'
	}
}

Guess.prototype.getMessageStatus = function(){
	if(this.status === 'failed'){
		return `Nice try! The word was "${this.words.join('')}"`
	} else if(this.status === 'finished'){
		return `Good work! You Guessed the word!`
	} else {
		const plural = this.life !== 1 ? 'es' : '';
		return `Guess${plural} Left: ${this.life}`
	}
}

window.addEventListener('keypress', (e) => {
	const guess = String.fromCharCode(e.charCode);
	game.makeGuess(guess);
	render()
})

const render = () => {
	puzzleEl.innerHTML = ''
	game.words.forEach((word) => {
		puzzleEl.appendChild(game.getPuzzle(word))
	})
	guessEl.textContent = game.getMessageStatus();
}


const startGame = () => {
	getAPI('2', (puzzle)=> {
		game = new Guess(puzzle, '6');
		render()
		console.log(puzzle)
	})
}
startGame();

resetBtn.addEventListener('click', startGame);