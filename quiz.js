var categoryArray = [];
var questionsAsked = [];
var categoryMap = new Map();
var playerMap = new Map();
var players;
var categories;
var picture;
var category;
var question;
var answer = "Category not selected yet";
var questionData;
var playerCtr = 0;
var answeredWrong = 0;
var points = 1;
var numOfPlayers;
var containsPicture, containsQuote = false;
var sortedMap;

const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;
const COLOR_CODES = {
  info: {
    color: "green"
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD
  }
};

const TIME_LIMIT = 20;
var timePassed = 0;
var timeLeft = TIME_LIMIT;
var timerInterval = null;
var remainingPathColor = COLOR_CODES.info.color;

function startQuiz() {
	players = JSON.parse((localStorage.getItem("players")));
	numOfPlayers = players.length;
	var data = getQuestionData();
	questionData = JSON.parse(data);
	createPlayerMap();
	updateTable();
	players = shuffle(players);
	createCategoryMap();
	categoryArray = Array.from(categoryMap.keys());
	loadCategories();
	progress(600, 600, $('#progressBar'));
	createTimer(false);
}

function loadQuestion(containsPicture, containsQuote) {
	document.getElementById('categories').style.display = 'none';
	document.getElementById('question').style.display = 'block';
	document.getElementById('answered').style.display = 'none';
	document.getElementById("wrongButton").style.pointerEvents = 'auto';
	document.getElementById('categorySelected').innerHTML = category;
	document.getElementById('questionPlayer').innerHTML = players[playerCtr];
	document.getElementById('currentQuestion').innerHTML = question;
	if(containsPicture)
	{
		document.getElementById("image").src=picture;
		document.getElementById("image").style.display = "block";
	}
	else
	{
		document.getElementById("image").style.display = 'none';
	}
	if(containsQuote)
	{
		document.getElementById("quote").innerHTML=quote;
		document.getElementById("quote").style.display = 'block';
	}
	else{
		document.getElementById("quote").style.display = "none";
	}
	localStorage.setItem("answer",answer);
	document.getElementById('answer').innerHTML = answer;
	document.getElementById('currentPoints').innerHTML = points;
	clearInterval(timerInterval);
	createTimer(true);
}

function loadCategories() {
	console.log("Loading categories");
	points = 1;
	answeredWrong = 0;
	categories = getCategories();
	document.getElementById('categories').style.display = 'block';
	document.getElementById('question').style.display = 'none';
	document.getElementById("quote").style.display = 'none';
	document.getElementById("halfButton").style.pointerEvents = 'auto';
	document.getElementById("correctButton").style.pointerEvents = 'auto';
	document.getElementById("wrongButton").style.pointerEvents = 'auto';
	document.getElementById('answered').style.display = 'none';
	document.getElementById('categoryPlayer').innerHTML = players[playerCtr];
	document.getElementById('firstCategory').innerHTML = categories[0];
	document.getElementById('secondCategory').innerHTML = categories[1];
	document.getElementById('thirdCategory').innerHTML = categories[2];
	clearInterval(timerInterval);
	createTimer(false);
}

function getQuestion(optionSelected) {
	category = categories[optionSelected];
	var filterdQuestions = questionData.questions.filter(q => q.category === category);
	var x = 0, duplicate=0;
	containsPicture = false;
	containsQuote = false;
	var index = categoryArray.indexOf(category);
	do{
		x = Math.round(Math.random() * filterdQuestions.length);
		console.log("Question ID: " + filterdQuestions[x].id);
		duplicate++;
	} while(questionsAsked.includes(filterdQuestions[x].id));
	question = filterdQuestions[x].question;
	answer = filterdQuestions[x].answer;
	if((filterdQuestions[x].picture !== undefined) && (filterdQuestions[x].picture !== null)) 
	{
		picture = "images/" + filterdQuestions[x].picture;
		containsPicture = true;
		
	}
	if((filterdQuestions[x].quote !== undefined) && (filterdQuestions[x].quote !== null))
	{
		quote = '"' + filterdQuestions[x].quote + '"';
		containsQuote = true;
	}
	questionsAsked.push(filterdQuestions[x].id);
	if(duplicate > 2)
	{
		categoryArray.splice(index, 1);
	}
	categoryMap.set(filterdQuestions[x].category, categoryMap.get(filterdQuestions[x].category)-1);
	loadQuestion(containsPicture, containsQuote);
}

function getCategories() {
	var categoryArraySize = categoryArray.length;
	var taken = new Array(categoryArraySize);
	var result = new Array(3);
	var i = 0;
	while(i<3){
        var x = Math.round(Math.random() * categoryArraySize);
		console.log("Selecting category: " + categoryArray[x]);
			if(!taken.includes(categoryArray[x]) && categoryMap.get(categoryArray[x]) !== 0)
			{
				console.log("Adding category: " + categoryArray[x]);
				result[i] = categoryArray[x];
				taken.push(categoryArray[x]);
				categoryMap.set(categoryMap.get(categoryArray[x]), categoryMap.get(categoryArray[x])+1);
				i++;
			}
    }
	return result;
	
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.round(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function correctAnswer() {
	document.getElementById('answer').style.color = 'green';
	document.getElementById('answered').style.display = 'block';
	document.getElementById("halfButton").style.pointerEvents = 'none';
	document.getElementById("correctButton").style.pointerEvents = 'none';
	document.getElementById("wrongButton").style.pointerEvents = 'none';
	awardPoints(players[playerCtr], points);
	points = 1;
	clearInterval(timerInterval);
}

function wrongAnswer() {
	answeredWrong++;
	incrementPlayerCtr();
	document.getElementById("wrongButton").style.pointerEvents = 'none';
	if(answeredWrong < numOfPlayers)
	{
		points++;
		loadQuestion(containsPicture, containsQuote);
		clearInterval(timerInterval);
		createTimer(true);
	}
	else{
		document.getElementById('answer').style.color = 'red';
		document.getElementById('answered').style.display = 'block';
		document.getElementById("halfButton").style.pointerEvents = 'none';
		document.getElementById("correctButton").style.pointerEvents = 'none';
		clearInterval(timerInterval);
	}
}

function halfAnswer() {
	answeredWrong++;
	var partialPoints = Math.ceil(points/2);
	awardPoints(players[playerCtr], partialPoints);
	incrementPlayerCtr();
	if(points !== 1)
	{
		points = points - partialPoints;
	}
	if(answeredWrong < numOfPlayers)
	{
		loadQuestion(containsPicture, containsQuote);
		clearInterval(timerInterval);
		createTimer(true);
	}
	else{
		document.getElementById('answer').style.color = 'red';
		document.getElementById('answered').style.display = 'block';
		document.getElementById("correctButton").style.pointerEvents = 'none';
		document.getElementById("wrongButton").style.pointerEvents = 'none';
		clearInterval(timerInterval);
	}
	document.getElementById("halfButton").style.pointerEvents = 'none';
}

function incrementPlayerCtr()
{
	if(playerCtr+1 < numOfPlayers)
	{
		playerCtr++;
	}else
	{
		playerCtr = 0; 
	}
}

function createCategoryMap()
{
	var data = getQuestionData();
	questionData = JSON.parse(data);
	var allQuestions = questionData.questions;
	var lookup = [];
	var x = 0;

	for (var i = 0; i < allQuestions.length; i++) { 
	  if (!(allQuestions[i].category in lookup)) {
			lookup.push(allQuestions[i].category);
			categoryMap.set(allQuestions[x].category, 1);
			x++;
	  }
	  else{
		  categoryMap.set(allQuestions[x].category, categoryMap.get(allQuestions[x].category)+1);
		  console.log("Adding another question for category: " + allQuestions[x].category + " value: " + categoryMap.get(allQuestions[x].category));
	  }
	}
}

function createPlayerMap()
{
	for(var i = 0; i < players.length; i++)
	{
		playerMap.set(players[i], 0);
	}
}

function awardPoints(player, points) {
	playerMap.set(player, playerMap.get(player)+points);
	$("#table td").remove(); 
	updateTable();
}

function updateTable() 
{
	sortedMap = new Map([...playerMap.entries()].sort((a, b) => b[1] - a[1]));
	var sortedArray = Array.from(sortedMap.keys());
	
	var tableRef = document.getElementById('table');
	for (var i = 0; i < playerMap.size; i++)
	{
		var newRow = tableRef.insertRow();
		var positionCell = newRow.insertCell(0);
		var playerCell = newRow.insertCell(1);
		var pointsCell = newRow.insertCell(2);
		var playerPoints = sortedMap.get(sortedArray[i]);
		var positionText  = document.createTextNode(i+1);
		var playerText  = document.createTextNode(sortedArray[i]);
		var pointsText  = document.createTextNode(sortedMap.get(sortedArray[i]));
		positionCell.appendChild(positionText);
		playerCell.appendChild(playerText);
		pointsCell.appendChild(pointsText);
	}
}

function progress(timeleft, timetotal, $element) {
    var progressBarWidth = timeleft * $element.width() / timetotal;
    $element.find('div').animate({ width: progressBarWidth }, 500).html(Math.floor(timeleft/60) + ":"+ timeleft%60);
    if(timeleft > 0) {
        setTimeout(function() {
            progress(timeleft - 1, timetotal, $element);
        }, 1000);
    }
	else {
		let sortedPlayers = Array.from( sortedMap.keys() );
		var sortedPoints = [];
		for (var i = 0; i < sortedPlayers.length; i++) {
			sortedPoints.push(sortedMap.get(sortedPlayers[i]));
		}
		localStorage.setItem("playerArr", JSON.stringify(sortedPlayers));
		localStorage.setItem("pointsArr", JSON.stringify(sortedPoints));
		location.replace("C:/Users/eportro/git/import-service-api/covid_quiz/home.html");
	}
}

function createTimer(start) {
	timePassed = 0;
	timeLeft = TIME_LIMIT;
	timerInterval = null;
	remainingPathColor = COLOR_CODES.info.color;

	document.getElementById("app").innerHTML = `
	<div class="base-timer">
	  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
		<g class="base-timer__circle">
		  <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
		  <path
			id="base-timer-path-remaining"
			stroke-dasharray="283"
			class="base-timer__path-remaining ${remainingPathColor}"
			d="
			  M 50, 50
			  m -45, 0
			  a 45,45 0 1,0 90,0
			  a 45,45 0 1,0 -90,0
			"
		  ></path>
		</g>
	  </svg>
	  <span id="base-timer-label" class="base-timer__label">${formatTime(
		timeLeft
	  )}</span>
	</div>
	`;
	if(start){
		startTimer();
	}
}

function onTimesUp() {
  clearInterval(timerInterval);
}

function startTimer() {
	clearInterval(timerInterval);
  timerInterval = setInterval(() => {
	if(timeLeft > 0){
    timePassed = timePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;
    document.getElementById("base-timer-label").innerHTML = formatTime(
      timeLeft
    );} else {
		clearInterval(timerInterval);
	}
    setCircleDasharray();
    setRemainingPathColor(timeLeft);

    if (timeLeft === 0) {
		timeLeft=20;
      onTimesUp();
    }
  }, 1000);
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  return `${minutes}:${seconds}`;
}

function setRemainingPathColor(timeLeft) {
  const { alert, warning, info } = COLOR_CODES;
  if (timeLeft <= alert.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(warning.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(alert.color);
  } else if (timeLeft <= warning.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(info.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(warning.color);
  }
}

function calculateTimeFraction() {
  const rawTimeFraction = timeLeft / TIME_LIMIT;
  return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
  const circleDasharray = `${(
    calculateTimeFraction() * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  document
    .getElementById("base-timer-path-remaining")
    .setAttribute("stroke-dasharray", circleDasharray);
}

function getQuestionData() {
	var data = '{ "questions": [{ "id": "1", "question": "What football club is nicknamed the Hornets?", "answer": "Watford", "category": "Football" }, { "id": "2", "question": "Which member of The Beatles narrated the first series of Thomas the Tank Engine on TV?", "answer": "Ringo Starr", "category": "TV Shows" }, { "id": "3", "question": "What was the first horror movie to receive a Best Picture nomination at the Academy Awards in 1973?", "answer": "The Exorcist", "category": "Horror Movies" }, { "id": "4", "question": "What is the birthname of Sir Elton John?", "answer": "Reginald Kenneth Dwight", "category": "Music" }, { "id": "5", "question": "What is the capital of Latvia?", "answer": "Riga", "category": "Countries of the World" }, { "id": "6", "question": "What is the name of the Hindu festival of lights?", "answer": "Diwali (or Deepavali)", "category": "Religion" }, { "id": "7", "question": "In what year was Angela Merkel first elected Chancellor of Germany?", "answer": "2005", "category": "Politics & Current Affairs" }, { "id": "8", "question": "What videogame series is a crossover of Disney and Final Fantasy?", "answer": "Kingdom Hearts", "category": "Videogames" }, { "id": "9", "question": "What is the most abundant gas in the Earth’s atmosphere?", "answer": "Nitrogen", "category": "Science" }, { "id": "10", "question": "How many Olympic gold medals has Mo Farah won?", "answer": " 4 (2 London, 2 Rio)", "category": "Sport" }, { "id": "11", "question": "How many balls are on a snooker table at the start of a frame, including the white?", "answer": "22", "category": "Sport" }, { "id": "12", "question": " In which English city does the World Snooker Championship take place?", "answer": "Sheffield", "category": "Sport" }, { "id": "13", "question": "Which actor plays Pennywise the Dancing Clown in the remake of Stephen King\'s \'It\' (2017) and \'It Chapter Two\' (2019)?", "answer": "Bill Skarsgård", "category": "Horror Movies" }, { "id": "14", "question": "John Kramer is the real identity of which Horror movie killer?", "answer": "Jigsaw", "category": "Horror Movies" }, { "id": "15", "question": "Which actor plays Jessica Day in \'New Girl\'?", "answer": "Zoey Deschanel", "category": "Sitcoms" }, { "id": "16", "question": "What is the name of the coffee shop in Friends?", "answer": "Central Perk", "category": "Sitcoms" }, { "id": "17", "question": "In an episode of which US sitcom did Colin Farrell play Billy Callahan, a man injured in a bar fight?", "answer": "Scrubs", "category": "Sitcoms" }, { "id": "18", "question": "Clint Barton is the real identiy of which superhero from the Marvel Cinematic Universe?", "answer": "Hawkeye", "category": "Superhero Movies" }, { "id": "19", "question": "What was the name of the strip club in \'The Sopranos\'?", "answer": "Bada Bing!", "category": "TV Shows" }, { "id": "20", "question": "What was the highest grossing DC movie before the release of \'Joker\' in 2019?", "answer": "The Dark Knight ($533.3 million)", "category": "Superhero Movies" }, { "id": "21", "question": "What is the name of the main progatonist in the \'Uncharted\' videogame series?", "answer": "Nathan Drake", "category": "Videogames" }, { "id": "22", "question": "Doctor Neo Cortex is the villain in which video game series?", "answer": "Crash Bandicoot ", "category": "Videogames" }, { "id": "23", "question": "The first Fifa game was released in Christmas of what year?", "answer": "1993", "category": "Videogames" }, { "id": "24", "question": "In what year was the first \'Call of Duty\' title released?", "answer": "2003", "category": "Videogames" }, { "id": "25", "question": "Which Premier League player holds the record for most goals in a calendar year?", "answer": "Harry Kane (39)", "category": "Football" }, { "id": "26", "question": "Who is the only substitute to score four goals in a Premier League match?", "answer": "Ole Gunnar Solskjaer (Nottingham Forest 1-8 Man Utd)", "category": "Football" }, { "id": "27", "question": "In which Italian city is the Juventus football club based?", "answer": "Turin", "category": "Football" }, { "id": "28", "question": "What stadium is the home ground for Dundalk football club?", "answer": "Oriel Park", "category": "Football" }, { "id": "29", "question": "Which African country does Wilifred Zaha currently play for, having changed his international football allegiance from England in 2016?", "answer": "Ivory Coast", "category": "Football" }, { "id": "30", "question": "Which nation has never won a World Cup but has reached the final 3 times?", "answer": "Netherlands", "category": "Football" }, { "id": "31", "question": "Who is the only player other than Cristiano Ronaldo and Lionel Messi to win a Ballon d\'Or since 2007?", "answer": "Luka Modric", "category": "Football" }, { "id": "32", "question": "Who was manager of Manchester City when they first won the Premier League?", "answer": "Roberto Mancini", "category": "Football" }, { "id": "33", "question": "How many Grand Slam winning seasons have Ireland had in the 6 nations?", "answer": "3 (1948, 2009, 2018)", "category": "Rugby" }, { "id": "34", "question": "What is the nickname of the Austrailian rugby union team?", "answer": "The Wallabies", "category": "Rugby" }, { "id": "35", "question": "In 2012 which country joined the Tri Nations for it to become the The Rugby Championship?", "answer": "Argentina", "category": "Rugby" }, { "id": "36", "question": "In what year did England win their first and only rugby World Cup?", "answer": "2003", "category": "Rugby" }, { "id": "37", "question": "Which nation has never won a rugby World Cup but has reached the final 3 times?", "answer": "France", "category": "Rugby" }, { "id": "38", "question": "Which rugby player has scored the most tries for Ireland from the current squad?", "answer": "Keith Earls (30)", "category": "Rugby" }, { "id": "39", "question": "Which former rugby player holds the record for most points scored with Ireland?", "answer": "Ronan O\'Gara (1083)", "category": "Rugby" }, { "id": "40", "question": "Who was the head coach of British and Irish Lions in 2017 and has been announced as head coach again in 2021?", "answer": "Warren Gatland", "category": "Rugby" }, { "id": "41", "question": "Irish international C.J.Stander plays rugby for which province?", "answer": "Munster", "category": "Rugby" }, { "id": "42", "question": "Irish international Bundee Aki plays rugby for which province?", "answer": "Connacht", "category": "Rugby" }, { "id": "43", "question": "Which Guinness PRO14 rugby team are based in Swansea?", "answer": "Ospreys", "category": "Rugby" }, { "id": "44", "question": "The Guinness PRO12 became the Guinness PRO14 in 2017 with the addition of two South African teams. Name one of them!", "answer": "Cheetahs or Southern Kings", "category": "Rugby" }, { "id": "45", "question": "What is the only Irish province to never win the Heiniken cup?", "answer": "Connacht", "category": "Rugby" }, { "id": "46", "question": "Who is the current head coach of Leinster?", "answer": "Leo Cullen", "category": "Rugby" }, { "id": "47", "question": "In what position did Irish captain, Rory Best traditionally play before retiring in 2019?", "answer": "Hooker", "category": "Rugby" }, { "id": "48", "question": "What is the name of this Tottenham footballer?", "answer": "Troy Parrott", "category": "Football", "picture": "football_48.jpg" }, { "id": "49", "question": "What is the name of this Irish rugby player?", "answer": "Tadhg Furlong", "category": "Rugby", "picture": "rugby_49.jpg" }, { "id": "50", "question": "What is the name of the hotel in the John Wick series which functions as a neutral territory for members of the criminal underworld?", "answer": "The Continental", "category": "Action Movies" }, { "id": "51", "question": "What is the name of the villain from \'Die Hard\' played by Alan Rickman?", "answer": "Hans Gruber", "category": "Action Movies" }, { "id": "52", "question": "What movie is this scene from?", "answer": "Superbad", "category": "Movies", "picture": "movie_52.jpg" }, { "id": "53", "question": "What movie is this scene from?", "answer": "I Am Legend", "category": "Movies", "picture": "movie_53.jpg" }, { "id": "54", "question": "What movie is this scene from?", "answer": "The Hangover", "category": "Movies", "picture": "movie_54.jpg" }, { "id": "55", "question": "The actor who played \'Chris Chambers\' in \'Stand by Me\' tragically passed away at the age of 23 in 1993. What Oscar winning actor is his younger brother?", "answer": "Joaquin Phoenix", "category": "Movies" }, { "id": "56", "question": "What movie is this scene from?", "answer": "1917", "category": "Movies", "picture": "movie_56.jpg" }, { "id": "57", "question": "What movie is this scene from?", "answer": "Crouching Tiger, Hidden Dragon", "category": "Movies", "picture": "movie_57.jpg" }, { "id": "58", "question": "What movie is this scene from?", "answer": "Goodfellas", "category": "Movies", "picture": "movie_58.jpg" }, { "id": "59", "question": "What movie is this scene from?", "answer": "Invictus", "category": "Movies", "picture": "movie_59.jpg" }, { "id": "60", "question": "What horror movie and actor is this?", "answer": "Get Out - Pharrell Williams", "category": "Horror Movies", "picture": "movie_60.jpg" }, { "id": "61", "question": "What movie is this scene from?", "answer": "Uncut Gems", "category": "Movies", "picture": "movie_61.jpg" }, { "id": "62", "question": "What movie is this scene from?", "answer": "Harry Potter and the Goblet of Fire", "category": "Movies", "picture": "movie_62.png" }, { "id": "63", "question": "What is the name of this actor/movie?", "answer": "Anthony Hopkins - The Silence of the Lambs", "category": "Movies", "picture": "movie_63.jpg" }, { "id": "64", "question": "What movie is this scene from?", "answer": "The Grudge", "category": "Horror Movies", "picture": "movie_64.jpg" }, { "id": "65", "question": "What movie is this scene from?", "answer": "The Ring", "category": "Horror Movies", "picture": "movie_65.jpg" }, { "id": "66", "question": "What movie is this scene from?", "answer": "The Conjuring", "category": "Horror Movies", "picture": "movie_66.jpg" }, { "id": "67", "question": "What movie is this scene from?", "answer": "The Babadook", "category": "Horror Movies", "picture": "movie_67.jpg" }, { "id": "68", "question": "What movie is this scene from?", "answer": "A Clockwork Orange", "category": "Movies", "picture": "movie_68.jpg" }, { "id": "69", "question": "What animated movie is this scene from?", "answer": "Spirited Away", "category": "Animated Movies", "picture": "animated_69.jpg" }, { "id": "70", "question": "Complete the name of this 1950\'s Rock and Roll band: \'Bill Haley & His ______\'", "answer": "Comets", "category": "50s & 60s Music" }, { "id": "71", "question": "Which artist recorded the 1958 song \'Johnny B. Goode\'?", "answer": "Chuck Berry", "category": "50s & 60s Music" }, { "id": "72", "question": "Which artist had hits with \'Don\'t Be Cruel\', \'Hearthbreak Hotel\' and \'Love Me Tender\'?", "answer": "Elvis Presley", "category": "50s & 60s Music" }, { "id": "73", "question": "Which artist who recently passed away in May 2020 had a 1956 hit single, \'Long Tall Sally\'?", "answer": "Little Richard (Richard Penniman)", "category": "50s & 60s Music" }, { "id": "74", "question": "What is the song/artist from this music video?", "answer": "Elvis Presley - Jailhouse Rock", "category": "50s & 60s Music", "picture": "music_73.jpg" }, { "id": "76", "question": "What song from 1964 are these lyrics from?", "answer": "The Animals - House Of The Rising Sun", "category": "50s & 60s Music", "quote": "My mother was a tailor<br/>She sewed my new blue jeans<br/>My father was a gamblin\' man<br/>Down in New Orleans" }, { "id": "77", "question": "Brothers Ray and Dave Davies were members of which English rock band?", "answer": "The Kinks", "category": "50s & 60s Music" }, { "id": "78", "question": "Which legendary British band released their final album in May 1970?", "answer": "The Beatles", "category": "70s Music" }, { "id": "79", "question": "Who was the founder and lead singer of \'Thin Lizzy\'?", "answer": "Phil Lynott", "category": "70s Music" }, { "id": "80", "question": "Sweden won the Eurovision song contest in 1979 with which pop group and song?", "answer": "Abba - Waterloo", "category": "70s Music" }, { "id": "81", "question": "Which song from Grease sold the most singles in the UK?", "answer": "You’re the One That I Want", "category": "70s Music" }, { "id": "81", "question": "Which 1977 movie soundtrack included a number of songs from the Bee Gees including \'Stayin Alive\' and \'How Deep Is Your Love\'", "answer": "Saturday Night Fever", "category": "70s Music" }, { "id": "82", "question": "Farrokh Bulsara is the bithname of which music icon?", "answer": "Freddie Mercury", "category": "70s Music" }, { "id": "83", "question": "Musician \'Sting\' was a songwriter and lead singer for which english rock band?", "answer": "The Police", "category": "70s Music" }, { "id": "84", "question": "What song from 1975 are these lyrics from?", "answer": "Queen - Bohemian Rhapsody", "category": "70s Music", "quote": "Mama, just killed a man<br/>Put a gun against his head<br/>Pulled my trigger, now he\'s dead<br/>Mama, life had just begun<br/>But now I\'ve gone and thrown it all away" }, { "id": "85", "question": "What is the song and music group from this music video?", "answer": "Village People - Y.M.C.A.", "category": "70s Music", "picture": "music_85.jpg" }, { "id": "86", "question": "Which artist had hits with \'Sir Duke\' and \'Superstition\'?", "answer": "Stevie Wonder ", "category": "70s Music" }, { "id": "87", "question": "What song from 1970 are these lyrics from?", "answer": "The Beatles - Let It Be", "category": "70s Music", "quote": "And in my hour of darkness<br/>She is standing right in front of me<br/>Speaking words of wisdom" }, { "id": "88", "question": "Calamari is a dish made from which sea animal?", "answer": "Squid", "category": "Food & Drink" }, { "id": "89", "question": "Aduki, borlotti and cannellini are types of what?", "answer": "Beans", "category": "Food & Drink" }, { "id": "90", "question": "What is the most expensive spice in the world by weight?", "answer": "Saffron", "category": "Food & Drink" }, { "id": "91", "question": "Aduki, borlotti and cannellini are types of what?", "answer": "Beans", "category": "Food & Drink" }, { "id": "92", "question": "Gluten is found in which cereal grain?", "answer": "Wheat", "category": "Food & Drink" }, { "id": "93", "question": "From which type of flower does a vanilla pod come?", "answer": "Orchid", "category": "Food & Drink" }, { "id": "94", "question": "Which nuts are used in marzipan?", "answer": "Almonds", "category": "Food & Drink" }, { "id": "95", "question": "In which country will you find wine-growing region the Yarra Valley?", "answer": "Australia", "category": "Food & Drink" }, { "id": "96", "question": "What is the name of this celebrity chef?", "answer": "Bobby Flay", "category": "Food & Drink", "picture": "food_96.jpg" }, { "id": "97", "question": "What is the name of this celebrity chef?", "answer": "Rachael Ray", "category": "Food & Drink", "picture": "food_97.jpg" }, { "id": "98", "question": "What is the name of this celebrity chef?", "answer": "Wolfgang Puck", "category": "Food & Drink", "picture": "food_98.jpg" }, { "id": "99", "question": "What is the name of this Irish chef?", "answer": "Neven Maguire", "category": "Food & Drink", "picture": "food_99.jpg" }, { "id": "100", "question": "What is the name of this Irish chef?", "answer": "Donal Skehan", "category": "Food & Drink", "picture": "food_100.jpg" }, { "id": "101", "question": "Who is currently the top ranked golf player in the world?", "answer": "Rory McIlroy", "category": "Golf" }, { "id": "102", "question": "Who won the Masters Tournament in 2019?", "answer": "Tiger Woods", "category": "Golf" }, { "id": "104", "question": "Which major has Rory McIlroy not won?", "answer": "The Masters", "category": "Golf" }, { "id": "105", "question": "Who is the European Ryder Cup captain for 2020?", "answer": "Padraig Harrington", "category": "Golf" }, { "id": "106", "question": "Which golfer has won the most major championships? ", "answer": "Jack Nicklaus (18)", "category": "Golf" }, { "id": "107", "question": "The 11th, 12th and 13th holes at Augusta National are collectively known by what nickname?", "answer": "Amen Corner", "category": "Golf" }, { "id": "108", "question": "Where in the US will the 2020 Ryder Cup be played (Course or State)?", "answer": "Whistling Straits, Haven, Wisconsin", "category": "Golf" }, { "id": "109", "question": "What golfer is this?", "answer": "Phil Mickelson", "category": "Golf", "picture": "golf_109.jpg" }, { "id": "110", "question": "What golfer is this?", "answer": "Sergio García", "category": "Golf", "picture": "golf_110.jpg" }, { "id": "111", "question": "What golfer is this?", "answer": "Rickie Fowler", "category": "Golf", "picture": "golf_111.jpg" }, { "id": "112", "question": "Which golf term is defined as a \'score of one over the designated par for a hole\'?", "answer": "Bogey", "category": "Golf" }, { "id": "113", "question": "Which golf term is defined as the \'area of grass surrounding the putting surface\'?", "answer": "Apron", "category": "Golf" }, { "id": "114", "question": "In which US city is the Torrey Pines Golf Club?", "answer": "San Diego, California", "category": "Golf" }, { "id": "115", "question": "Colin Montgomerie played amateur golf in which country?", "answer": "Scotland", "category": "Golf" }, { "id": "116", "question": "Roger Federer was born in which Swiss city?", "answer": "Basel", "category": "Tennis" }, { "id": "117", "question": "Roger Federer won the Wimbledon men\'s singles championship for 5 years in a row from 2003-2007. Who beat him in the 2008 final?", "answer": "Rafael Nadal", "category": "Tennis" }, { "id": "118", "question": "How many Wimbledon men\'s singles titles does Rodger Federer hold?", "answer": "8 (2003–2007, 2009, 2012, 2017)", "category": "Tennis" }, { "id": "119", "question": "Which Country has won the Davis Cup the most times?", "answer": "The United States (32)", "category": "Tennis" }, { "id": "120", "question": "What nationality is tennis player Kevin Anderson?", "answer": "South African", "category": "Tennis" }, { "id": "121", "question": "Who murdered Frank Underwood in \'House of Cards\'?", "answer": "Doug Stamper", "category": "TV Shows" }, { "id": "122", "question": "Two players met in three consecutive Wimbledon finals from 1988 through 1990? Name one of them!", "answer": "Boris Becker and Stefan Edberg", "category": "Tennis" }, { "id": "123", "question": "Former Russian tennis player, Maria Sharapova was given what nickname for grunting whenever she hit the ball?", "answer": "The Siberian Siren", "category": "Tennis" }, { "id": "124", "question": "What is the nickname of Tipperary hurler, John O\'Dwyer?", "answer": "Bubbles", "category": "GAA" }, { "id": "125", "question": "Which County GAA team are nicknamed \'The Royals\'", "answer": "Meath", "category": "GAA" }, { "id": "126", "question": "What song is traditionally associated with Tipperary GAA and is also the name of a mountain in Tipperary?", "answer": "Slievenamon", "category": "GAA" }, { "id": "127", "question": "How many All Ireland Football finals have Mayo lost since last winning it in 1951? (finals replayed count as one)", "answer": "9 (1989, 1996, 1997, 2004, 2006, 2012, 2013, 2016, 2017)", "category": "GAA" }, { "id": "128", "question": "There are two GAA stadiums in Ireland with the name \'Cusack Park\'. Name either of the towns!", "answer": "Mullingar and Ennis", "category": "GAA" }, { "id": "129", "question": "The last Leinster Football final without Dublin was in 2010 and was between which two counties?", "answer": "Louth and Meath", "category": "GAA" }, { "id": "130", "question": "In what year did Westmeath win the Leinster Senior Football Championship?", "answer": "2004", "category": "GAA" }, { "id": "131", "question": "Who is this hurler?", "answer": "Joe Canning", "category": "GAA" }, { "id": "131", "question": "Which Galway Senior Championship Hurling club does Joe Canning play for?", "answer": "Portumna", "category": "GAA" }, { "id": "132", "question": "Which Kerry Senior Championship Football club did former footballer Colm Cooper play for?", "answer": "Dr. Crokes", "category": "GAA" }, { "id": "133", "question": "Who or what is Croke Park named after?", "answer": "Archbishop Thomas Croke, first patron of the Gaelic Athletic Association", "category": "GAA" }, { "id": "134", "question": "Against which nation did Packie Bonner make the famous penalty save at Italia ‘90?", "answer": "Romania", "category": "Football" }, { "id": "135", "question": "In what year did Offaly beat Kerry in the All-Ireland Football Final to prevent them from winning 5 in a row?", "answer": "1982", "category": "GAA" }, { "id": "135", "question": "Which county other than Mayo have both red and green in their county colours?", "answer": "Carlow", "category": "GAA" }, { "id": "136", "question": "Who beat Dublin in 2019 to knock them out of the All-Ireland Senior Hurling Championship?", "answer": "Laois", "category": "GAA" }, { "id": "137", "question": "Which Tyrone legend returned to the field for the last ten minutes of their historic clash with Armagh in the 2003 football final, to help Tyrone win their first title?", "answer": "Peter Canavan", "category": "GAA" }, { "id": "138", "question": "Who is its legendary founder of Gaelic Games?", "answer": "Michael Cusack", "category": "GAA" }, { "id": "139", "question": "Who was the last non-Dublin footballer to win an All Star for Footballer of the Year?", "answer": "Andy Moran (2017)", "category": "GAA" }, { "id": "140", "question": "Who was the 2019 All Star Footballer of the Year?", "answer": "Stephen Cluxton", "category": "GAA" }, { "id": "141", "question": "Which hurler has won All Star for Hurler of the Year 3 times?", "answer": "Henry Shefflin (2002, 2006, 2012)", "category": "GAA" }, { "id": "142", "question": "How many Hurler of the Year All Stars have Kilkenny won?", "answer": "10 (2000, 2002, 2003, 2006, 2008, 2009, 2011, 2012, 2014, 2015)", "category": "GAA" }, { "id": "142", "question": "Which Donegal footballer was on the 2019 Gaelic Football All Star team?", "answer": "Michael Murphy", "category": "GAA" }, { "id": "143", "question": "How many Hurler of the Year All Stars have Kilkenny won?", "answer": "10 (2000, 2002, 2003, 2006, 2008, 2009, 2011, 2012, 2014, 2015)", "category": "GAA" }, { "id": "144", "question": "Which Donegal footballer was on the 2019 Gaelic Football All Star team?", "answer": "Michael Murphy", "category": "GAA" }, { "id": "145", "question": "Lee Chin plays hurling for which County?", "answer": "Wexford", "category": "GAA" }, { "id": "146", "question": "Who is this?", "answer": "David Clifford", "category": "GAA", "picture": "gaa_146.jpg" }, { "id": "147", "question": "Who is this?", "answer": "Davy Fitzgerald", "category": "GAA", "picture": "gaa_147.jpg" }, { "id": "148", "question": "Who is this?", "answer": "Ger Loughnane", "category": "GAA", "picture": "gaa_148.jpg" }, { "id": "149", "question": "Who is this?", "answer": "Cyril Farrell", "category": "GAA", "picture": "gaa_149.jpg" }, { "id": "150", "question": "Who is this?", "answer": "Seán Óg Ó hAilpín", "category": "GAA", "picture": "gaa_150.jpg" }, { "id": "151", "question": "Who is this?", "answer": "Ciarán McDonald", "category": "GAA", "picture": "gaa_151.jpg" }, { "id": "152", "question": "Who is this?", "answer": "Ciarán Whelan", "category": "GAA", "picture": "gaa_152.jpg" }, { "id": "153", "question": "Who is this?", "answer": "Chris Hughton", "category": "Football", "picture": "football_153.jpg" }, { "id": "154", "question": "Who is this?", "answer": "Clinton Morrison", "category": "Football", "picture": "football_154.jpg" }, { "id": "155", "question": "What nationality is Robert Lewandowski?", "answer": "Polish", "category": "Football" }, { "id": "156", "question": "Who has managed the following clubs?", "answer": "Rafael Benítez", "category": "Football", "quote": "Chelsea, Real Madrid, Napoli, Liverpool" }, { "id": "157", "question": "Who has managed the following clubs?", "answer": "Carlo Ancelotti", "category": "Football", "quote": "Bayern Munich, Everton, Chelsea, PSG" }, { "id": "158", "question": "Who has managed the following clubs?", "answer": "David Moyes", "category": "Football", "quote": "Man United, Everton, Real Sociedad, West Ham" }, { "id": "159", "question": "Who has managed the following clubs?", "answer": "Roy Hodgson", "category": "Football", "quote": "Liverpool, Crystal Palace, West Brom, Fulham" }, { "id": "160", "question": "Who has managed the following clubs?", "answer": "Sam Allardyce", "category": "Football", "quote": "Limerick, West Ham, Sunderland, Bolton Wanderers" }, { "id": "161", "question": "Who has managed the following clubs?", "answer": "José Mourinho", "category": "Football", "quote": "Tottenham, Chelsea, Barcelona, Benfica, Inter Milan" }, { "id": "162", "question": "In \'Father Ted\' which comedian played the Referee for the \'All-Priests five-a-side Over-75s Indoor Challenge Football Match\'?", "answer": "Jason Byrne", "category": "Sitcoms" }, { "id": "161", "question": "What 00s sitcom starred Alec Baldwin as \'Jack Donaghy\'?", "answer": "30 Rock", "category": "Sitcoms" }, { "id": "162", "question": "Who is this?", "answer": "Jonny Wilkinson", "category": "Rugby", "picture": "rugby_162.jpg" }, { "id": "163", "question": "Who is this?", "answer": "Dan Carter", "category": "Rugby", "picture": "rugby_163.jpg" }, { "id": "164", "question": "Who is this?", "answer": "Nigel Owens", "category": "Rugby", "picture": "rugby_164.jpg" }, { "id": "165", "question": "Paul Mescal who plays the character of Connell Waldron in \'Normal People\' played under 21\'s gaelic football for which county?", "answer": "Kildare", "category": "Irish TV" }, { "id": "166", "question": "Which TV show is this?", "answer": "Lost", "category": "TV Shows", "picture": "tv_166.jpg" }, { "id": "167", "question": "What is the name of this character and TV show?", "answer": "Theodore \'T-Bag\' Bagwell - Prison Break", "category": "TV Shows", "picture": "tv_167.jpg" }, { "id": "168", "question": "What is the name of this character and TV show?", "answer": "Elmo Creed - Love/Hate", "category": "Irish TV", "picture": "tv_168.jpg" }, { "id": "169", "question": "What is the name of this character and TV show?", "answer": "Don Draper - Mad Men", "category": "TV Shows", "picture": "tv_169.jpg" }, { "id": "170", "question": "What is the name of this character and TV show?", "answer": "Gustavo Fring - Breaking Bad", "category": "TV Shows", "picture": "tv_170.jpg" }, { "id": "171", "question": "What TV Show is this?", "answer": "Breaking Bad", "category": "TV Shows", "picture": "tv_171.jpg" }, { "id": "172", "question": "What TV show is this?", "answer": "Westworld", "category": "TV Shows", "picture": "tv_172.png" }, { "id": "173", "question": "What is the name of the street in Desperate Housewives?", "answer": "Wisteria Lane", "category": "TV Shows" }, { "id": "174", "question": "In which US city is Greys Anatomy set?", "answer": "Seattle", "category": "TV Shows" }, { "id": "175", "question": "Complete the title of this Disney TV show: </br>\'The Suite Life of ____ & ____\'", "answer": "Zach & Cody", "category": "Sitcoms" }, { "id": "175", "question": "Which actor plays Alfie Solomons in \'Peaky Blinders\'?", "answer": "Tom Hardy", "category": "TV Shows" }, { "id": "176", "question": "Name the TV show from the below description!", "answer": "Sons of Anarchy", "category": "TV Shows", "quote": "Jax Teller, a man in his early 30s, struggles to find a balance in his life between being a new dad and his involvement in a motorcycle gang." }, { "id": "177", "question": "Name the TV show from the below description!", "answer": "Mr. Robot", "category": "TV Shows", "quote": "Elliot, a young programmer who works as a cyber-security engineer by day and as a vigilante hacker by night. Elliot finds himself at a crossroads when the mysterious leader of an underground hacker group recruits him to destroy the firm he is paid to protect." }, { "id": "178", "question": "Name the TV show from the below description!", "answer": "Succession", "category": "TV Shows", "quote": "The Logan family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their father steps down from the company." }, { "id": "179", "question": "What TV show is this?", "answer": "The Handmaid\'s Tale", "category": "TV Shows", "picture": "tv_179.jpeg" }, { "id": "180", "question": "What actor currently plays \'The Doctor\' in Doctor Who?", "answer": "Jodie Whittaker", "category": "TV Shows" }, { "id": "181", "question": "Who directed the original \'Tobey Maguire\' Spider-Man trilogy?", "answer": "Sam Raimi ", "category": "Superhero Movies" }, { "id": "181", "question": "Which superhero movie and character is this?", "answer": "Logan - Caliban", "category": "Superhero Movies", "picture": "superhero_181" }, { "id": "182", "question": "Which actor made a cameo appearance in Deadpool 2 as the Vanisher, a muntant with the power of invisibility?", "answer": "Brad Pitt", "category": "Superhero Movies" }, { "id": "183", "question": "What is the name of the fictional African country that is the home to Black Panther?", "answer": "Wakanda", "category": "Superhero Movies" }, { "id": "184", "question": "Which American rapper did the soundtrack for Black Panther?", "answer": "Kendrick Lamar", "category": "Superhero Movies" }, { "id": "186", "question": "What superhero movie is this?", "answer": "Ant-Man", "category": "Superhero Movies", "picture": "superhero_186.jpg" }, { "id": "187", "question": "What superhero movie is this?", "answer": "Guardians of the Galaxy Vol. 2", "category": "Superhero Movies", "picture": "superhero_187.jpg" }, { "id": "188", "question": "What superhero movie is this?", "answer": "Guardians of the Galaxy Vol. 2", "category": "Superhero Movies", "picture": "superhero_187.jpg" }, { "id": "189", "question": "What actor and superhero movies is this?", "answer": "Jeff Goldblum - Thor: Ragnarok", "category": "Superhero Movies", "picture": "superhero_188.jpg" }, { "id": "190", "question": "What is the name of this Marvel villain?", "answer": "Whiplash", "category": "Superhero Movies", "picture": "superhero_190.png" }, { "id": "191", "question": "Which movie starred all of the below actors?", "answer": "Inception", "category": "Movies", "quote": "Ellen Page, Tom Hardy, Leonardo DiCaprio, Cillian Murphy, Joseph Gordon-Levitt" }, { "id": "192", "question": "What is the name of this Marvel villain?", "answer": "Erik Killmonger", "category": "Superhero Movies", "picture": "superhero_192.jpg" }, { "id": "193", "question": "Name the TV show from the below description!", "answer": "Ozark", "category": "TV Shows", "quote": "The Byrdes and their teenage kids, Charlotte and Jonah, are, for all intents and purposes, an ordinary family with ordinary lives. Except for the job of Marty, a Chicago financial advisor who also serves as the top money launderer for the second largest drug cartel in Mexico." }, { "id": "194", "question": "Which Christian denomination have been in Ireland since the 1600s and founded the town of Mountmellick, Co. Laois?", "answer": "Quakers (Religious Society of Friends)", "category": "Religion" }, { "id": "195", "question": "What comic book movie is this scene from?", "answer": "Suicide Squad", "category": "Superhero Movies", "picture": "superhero_195.jpg" }, { "id": "196", "question": "What animated movie is this?", "answer": "Moana", "category": "Animated Movies", "picture": "animated_196.jpg" }, { "id": "197", "question": "What is this movie and the voice actor for this character?", "answer": "Spider-Man: Into the Spider-Verse - Nicolas Cage", "category": "Animated Movies", "picture": "animated_197.jpg" }, { "id": "198", "question": "What animated movie is this?", "answer": "The Secret of Kells", "category": "Animated Movies", "picture": "animated_198.jpg" }, { "id": "199", "question": "What is this movie and the voice actor for this character?", "answer": "The Incredibles - Samuel L. Jackson", "category": "Animated Movies", "picture": "animated_199.jpg" }, { "id": "200", "question": "In which Marvel movie did Stan Lee make his last cameo appearance?", "answer": "Avengers: Endgame", "category": "Superhero Movies" }, { "id": "201", "question": "Who was the last president of the United States to serve only one term in office? (excluding Donald Trump)", "answer": "George H. W. Bush (1988 - 1992)", "category": "Politics & Current Affairs" }, { "id": "202", "question": "Who is this?", "answer": "Emmanuel Macron - President of France", "category": "Politics & Current Affairs", "picture": "polictics_202.jpg" }, { "id": "203", "question": "Who is currently the Irish Minister for Justice and Equality?", "answer": "Charlie Flanagan", "category": "Politics & Current Affairs" }, { "id": "204", "question": "Who is the only Irish presidential candidate to run in the last two elections, other than Michael D. Higgins?", "answer": "Seán Gallagher", "category": "Politics & Current Affairs" }, { "id": "205", "question": "Which Irish Broadcaster was formerly Minister for Agriculture, Food and Forestry for Fine Gael when the party came to power in 1994?", "answer": "Ivan Yates", "category": "Politics & Current Affairs" }, { "id": "206", "question": "Name the TV show from the below description!", "answer": "Mindhunter", "category": "TV Shows", "quote": "Catching a criminal often requires the authorities to get inside the villain\'s mind to figure out how he thinks. That\'s the job of FBI agents Holden Ford and Bill Tench. They attempt to understand and catch serial killers by studying their damaged psyches." }, { "id": "207", "question": "Who is the current leader of the British Labour Party?", "answer": "Keir Starmer", "category": "Politics & Current Affairs" }, { "id": "208", "question": "Who is the political leader of Irish Solidarity party, People Before Profit?", "answer": "Richard Boyd Barrett", "category": "Politics & Current Affairs" }, { "id": "208", "question": "Name 4 of the 6 founding members of the European Union!", "answer": "Belgium, France, West Germany, Italy, Luxembourg, Netherlands", "category": "Politics & Current Affairs" }, { "id": "209", "question": "Who is this?", "answer": "Mary Robinson", "category": "Politics & Current Affairs", "picture": "politics_209.jpg" }, { "id": "210", "question": "Who is this?", "answer": "Alan Shatter (former Fine Gael Minister)", "category": "Politics & Current Affairs", "picture": "politics_210.jpg" }, { "id": "211", "question": "What Horror movie is this?", "answer": "Us", "category": "Horror Movies", "picture": "movie_211.jpg" }, { "id": "212", "question": "\'Michael Myers\' is a serial killer in which horror movie series?", "answer": "Halloween", "category": "Horror Movies" }, { "id": "213", "question": "In \'The Texas Chainsaw Massacre\' Leatherface wears a mask made of what?", "answer": "Human Skin", "category": "Horror Movies" }, { "id": "214", "question": "What is the highest grossing horror movie of all time?", "answer": "It (2017) ($327.5 million)", "category": "Horror Movies" }, { "id": "215", "question": "The line \'Be afraid. Be very afraid.\' is from which 1986 horror movie?", "answer": "The Fly", "category": "Horror Movies" }, { "id": "216", "question": "The line \'Here\'s Johnny!\' is from which 1980 horror movie?", "answer": "The Shining", "category": "Horror Movies" }, { "id": "217", "question": "Who played Quarterback for the New England Patriots American football team from 2000 to 2019?", "answer": "Tom Brady", "category": "American Sport" }, { "id": "218", "question": "The New England Patriots are based in which US city?", "answer": "Boston", "category": "American Sport" }, { "id": "219", "question": "In American Football, how many points are awarded for a touchdown?", "answer": "6 points", "category": "American Sport" }, { "id": "219", "question": "How many NBA championships did Michael Jordan win with the Chicago Bulls?", "answer": "6 (1991, 1992, 1993, 1996, 1997, 1998)", "category": "American Sport" }, { "id": "220", "question": "Which American basketball team does LeBron James play for?", "answer": "Los Angeles Lakers", "category": "American Sport" }, { "id": "221", "question": "Who is this former professional basketball player?", "answer": "Shaquille O\'Neal", "category": "American Sport", "picture": "american_221.jpg" }, { "id": "222", "question": "Which NBA basketball team has won the most NBA championships?", "answer": "Boston Celtics (17)", "category": "American Sport" }, { "id": "223", "question": "In NBA basketball, what distance is the 3 point arc from the centre of the basket?", "answer": "23 feet 9 inches (7.24 m)", "category": "American Sport" }, { "id": "224", "question": "How many innings are there in a Baseball game?", "answer": "9", "category": "American Sport" }, { "id": "224", "question": "Which motor company is the largest manufacturer of motorcycles in the world?", "answer": "Honda", "category": "Cars & Automobiles" }, { "id": "225", "question": "The \'Washington Nationals\' are a team in which American sport?", "answer": "Baseball", "category": "American Sport" }, { "id": "225", "question": "The \'New York Yankees\' baseball team are from which of the New York City boroughs?", "answer": "The Bronx", "category": "American Sport" }, { "id": "226", "question": "What is the name of the cup in the American National Hockey League?", "answer": "Stanley Cup", "category": "American Sport" }, { "id": "225", "question": "What was the name of the tribunal of inquiry into certain planning matters and payments which resulted in Bertie Ahern\'s resignation in 2008?", "answer": "Mahon Tribunal", "category": "Politics & Current Affairs" }, { "id": "226", "question": "The \'Chicago Blackhawks\' are a team in which American sport?", "answer": "Ice Hockey", "category": "American Sport" }, { "id": "226", "question": "In which city is the largest hockey arena in the world?", "answer": "Montreal - The Bell Centre", "category": "American Sport" }, { "id": "227", "question": "Hockey is played on an ice surface known as what?", "answer": "Rink", "category": "American Sport" }, { "id": "228", "question": "What material is an ice hockey puck made from?", "answer": "Vulcanized Rubber", "category": "American Sport" }, { "id": "229", "question": "What was the name of the Irish racehorse which was stolen from Aga Khan\'s stud farm in 1983?", "answer": "Shergar", "category": "Sport" }, { "id": "230", "question": "Who won the 2020 PDC World Darts Championship?", "answer": "Peter Wright", "category": "Sport" }, { "id": "229", "question": "what movie starred all of the below actors?", "answer": "Intermission", "category": "Movies", "quote": "Colin Farrell, Deirdre O\'Kane, Cillian Murphy, Colm Meaney" }, { "id": "230", "question": "Who won the 2020 PDC World Darts Championship?", "answer": "Peter Wright", "category": "Sport" }, { "id": "231", "question": "What car logo is this?", "answer": "Opel", "category": "Cars & Automobiles", "picture": "car_231.jpg" }, { "id": "232", "question": "What car logo is this?", "answer": "Peugeot", "category": "Cars & Automobiles", "picture": "car_232.jpg" }, { "id": "233", "question": "What car logo is this?", "answer": "Mazda", "category": "Cars & Automobiles", "picture": "car_233.jpg" }, { "id": "234", "question": "What was Ireland\'s best-selling car in 2019?", "answer": "Toyota Corolla", "category": "Cars & Automobiles" }, { "id": "234", "question": "What movie starred all of the below actors?", "answer": "The Departed", "category": "Movies", "quote": "Jack Nicholson, Matt Damon, Leonardo DiCaprio, Mark Wahlberg, Alec Baldwin" }, { "id": "234", "question": "Massey Ferguson tractors are traditionally what colour?", "answer": "Red", "category": "Cars & Automobiles" }, { "id": "235", "question": "Which make of tractor is known for it\'s colours, green and yellow?", "answer": "John Deere", "category": "Cars & Automobiles" }, { "id": "235", "question": "Name the part of the car that helps get the power from the engine to the wheels to turn them?", "answer": "Driveshaft", "category": "Cars & Automobiles" }, { "id": "236", "question": "Which important car accessory did Mary Anderson invent in 1903?", "answer": "Windscreen Wipers", "category": "Cars & Automobiles" }, { "id": "237", "question": "Name the part of the car\'s engine that moves within the cylinder?", "answer": "Piston", "category": "Cars & Automobiles" }, { "id": "238", "question": "What is stored in the radiator of a car?", "answer": "Coolant", "category": "Cars & Automobiles" }, { "id": "239", "question": "The \'Almera\' and \'Primera\' are former models by which car manufacturer?", "answer": "Nissan", "category": "Cars & Automobiles" }, { "id": "240", "question": "The \'Punto\' and \'Panda\' are models by which car manufacturer?", "answer": "Fiat", "category": "Cars & Automobiles" }, { "id": "241", "question": "Charles Taze Russell is the founder of which Christian denomination?", "answer": "Jehovah\'s Witnesses", "category": "Religion" }, { "id": "242", "question": "In the Muslim tradition, believers have a religious obligation to make a pilgrimage to Islam’s holiest city at least once during their lifetime, if they are able. Which city is that?", "answer": "Mecca, Saudi Arabia", "category": "Religion" }, { "id": "242", "question": "In the Muslim tradition, believers have a religious obligation to make a pilgrimage to Islam’s holiest city at least once during their lifetime, if they are able. Which city is that?", "answer": "Mecca, Saudi Arabia", "category": "Religion" }, { "id": "243", "question": "Which Bible figure of the Old Testament did God tell to sacrifice his son?", "answer": "Abraham", "category": "Religion" }, { "id": "244", "question": "In which religion are men generally required to wear a turban, in public and to carry a ceremonial sword or small dagger called a Kirpan?", "answer": "Sikhism", "category": "Religion" }, { "id": "245", "question": "What Islamic holiday known as the \'Festival of Breaking the Fast\' marks the end of Ramadan and the beginning of Shawwal?", "answer": "Eid al-Fitr", "category": "Religion" }, { "id": "246", "question": "Which Hindu God is this?", "answer": "Vishnu, The Preserver", "category": "Religion", "picture": "religion_246.jpg" }, { "id": "247", "question": "Which Hindu God is this?", "answer": "Ganesha", "category": "Religion", "picture": "religion_247.jpg" }, { "id": "248", "question": "Which world religion is represented by this symbol?", "answer": "Buddhism - Wheel of Life", "category": "Religion", "picture": "religion_248.png" }, { "id": "249", "question": "Lumbini which is considered the birthplace of Buddhism is in what Country?", "answer": "Nepal", "category": "Religion" }, { "id": "250", "question": "Friday is considered the Sabbath day in Judaism. What is it referred to as?", "answer": "Shabbat", "category": "Religion" }, { "id": "251", "question": "Name the action movie from this description!", "answer": "Bad Boys", "category": "Action Movies", "quote": "Marcus, a family man, and Mike, a ladies\' man, are partners in the Miami police. Things get complicated when they assume each other\'s identity while investigating a drug deal." }, { "id": "252", "question": "Name the movie from this description!", "answer": "Good Will Hunting", "category": "Action Movies", "quote": "A 20-year-old South Boston janitor is an unrecognized genius who, as part of a deferred prosecution agreement after assaulting a police officer, becomes a client of a therapist and studies advanced mathematics with a renowned professor." }, { "id": "253", "question": "Name the action movie from this description!", "answer": "Mission: Impossible", "category": "Action Movies", "quote": "Ethan Hunt, an American special agent, struggles to prove his innocence and catch the real culprit when he is falsely accused of murdering his entire team." }, { "id": "254", "question": "Name the action movie from this description!", "answer": "The Terminator", "category": "Action Movies", "quote": "A cyborg assassin is sent back in time to kill Sarah, a waitress, in a bid to stop her son who will wage a long war against his enemy in the future unless the course of history is altered." }, { "id": "255", "question": "Name the action movie from this description!", "answer": "Little Miss Sunshine", "category": "Action Movies", "quote": "Following the death of his wife, Los Angeles police detective Martin Riggs becomes reckless and suicidal. When he is reassigned and partnered with Roger Murtaugh, Riggs immediately clashes with the older officer." }, { "id": "256", "question": "Name the action movie from this description!", "answer": "Lethal Weapon", "category": "Movies", "quote": "A family decide to travel across the country when their daughter wants to participate in a beauty pageant, unaware of what the journey has in store for them." }, { "id": "257", "question": "What action movie is this?", "answer": "The Raid 2", "category": "Action Movies", "picture": "action_257.jpg" }, { "id": "258", "question": "What action movie is this quote from?", "answer": "Taken", "category": "Action Movies", "quote": "If you are looking for ransom, I can tell you I don\'t have money. But what I do have are a very particular set of skills, skills I have acquired over a very long career, skills that make me a nightmare for people like you. If you let my daughter go now, that\'ll be the end of it." }, { "id": "259", "question": "What action movie is this?", "answer": "Kingsman", "category": "Action Movies", "picture": "action_259.png" }, { "id": "260", "question": "What animated movie is this?", "answer": "Monsters, Inc.", "category": "Animated Movies", "picture": "animated_260.png" }, { "id": "261", "question": "Which Nothern Irish singer and songwriter had the 1967 hit single, \'Brown Eyed Girl\'", "answer": "Van Morrison", "category": "50s & 60s Music" }, { "id": "262", "question": "Which 1950s music icon was tradgically killed in a plane crash at the age of 22?", "answer": "Buddy Holly", "category": "50s & 60s Music" }, { "id": "263", "question": "Which artist had hits with \'Everyday\' and \'Peggy Sue\'?", "answer": "Buddy Holly", "category": "50s & 60s Music" }, { "id": "264", "question": "The American sitcom \'Frasier\' was a spinoff of what 80s TV series?", "answer": "Cheers", "category": "Sitcoms" }, { "id": "265", "question": "What is the name of this character and TV show?", "answer": "Dwight Schrute - The Office", "category": "Sitcoms", "picture": "tv_265.jpg" }, { "id": "266", "question": "What is the name of this character and TV show?", "answer": "Ron Swanson - Parks and Recreation", "category": "Sitcoms", "picture": "tv_266.jpg" }, { "id": "267", "question": "In \'Modern Family\' what is the name of the adopted daughter of Cameron and Mitchell?", "answer": "Lily Tucker-Pritchett", "category": "Sitcoms" }, { "id": "268", "question": "What 90\'s TV series is this?", "answer": "Freaks and Geeks", "category": "Sitcoms", "picture": "tv_268.png" }, { "id": "269", "question": "What is the name of this character and TV show?", "answer": "Screech - Saved by the Bell", "category": "Sitcoms", "picture": "tv_269.jpg" }, { "id": "270", "question": "What is the name of the bar in \'It\'s Always Sunny in Philadelphia\'?", "answer": "Paddy\'s Pub", "category": "Sitcoms" }, { "id": "271", "question": "\'Na\' is the symbol for which chemical element?", "answer": "Sodium", "category": "Science" }, { "id": "272", "question": "What two chemical elements are combined to make Brass?", "answer": "Copper and Zinc", "category": "Science" }, { "id": "273", "question": "What alloy is produced by combining Copper and Tin?", "answer": "Bronze", "category": "Science" }, { "id": "274", "question": "What two chemical elements are combined to make Steel?", "answer": "Iron and Carbon", "category": "Science" }, { "id": "275", "question": "What chemical compound is represented by \'H2O2\'?", "answer": "Hydrogen Peroxide (H2O2 = Hydrogen2 + Oxygen2)", "category": "Science" }, { "id": "276", "question": "What chemical compound is represented by \'NaCl\'?", "answer": "Salt (NaCl = Sodium + Chlorine)", "category": "Science" }, { "id": "277", "question": "Which is the largest internal organ in the human body?", "answer": "Liver", "category": "Science" }, { "id": "278", "question": "Which part of the body is affected by Gorham’s Disease?", "answer": "Bones/Skeleton", "category": "Science" }, { "id": "276", "question": "Of what is \'Phonology\' the study?", "answer": "Sounds", "category": "Science" }, { "id": "277", "question": "The MMR vaccine protects against which three diseases?", "answer": "Measles, Mumps and Rubella (German measles)", "category": "Science" }, { "id": "278", "question": "\'Hg\' is the symbol for which chemical element?", "answer": "Mercury", "category": "Science" }, { "id": "279", "question": "In which part of the human body would you find the atlas bone?", "answer": "Spine/Back", "category": "Science" }, { "id": "280", "question": "Which two planets in our solar system have no natural moon orbiting them?", "answer": "Venus and Mercury", "category": "Science" }, { "id": "281", "question": "What is the Olympus Mons?", "answer": "A volcano in the Tharsis Montes region on Mars which is the largest known volcano in the Solar System", "category": "Science" }, { "id": "282", "question": "\'Cynophobia\' is a fear of what?", "answer": "Dogs", "category": "Science" }, { "id": "283", "question": "\'Ophidiophobia\' is a fear of what?", "answer": "Snakes", "category": "Science" }, { "id": "284", "question": "\'Emophobia\' a fear of what?", "answer": "Blood", "category": "Science" }, { "id": "285", "question": "At what temperature are Celsius and Fahrenheit equal?", "answer": "-40", "category": "Science" }, { "id": "286", "question": "What name is given for the number of protons found in the nucleus of an atom?", "answer": "Atomic number", "category": "Science" }, { "id": "287", "question": "What name is given for the number of protons found in the nucleus of an atom?", "answer": "Atomic number", "category": "Science" }, { "id": "288", "question": "What is a material that will not carry an electrical charge called?", "answer": "Insulator", "category": "Science" }, { "id": "289", "question": "What was the name of the first supersonic passenger airliner?", "answer": "Concorde", "category": "Science" }, { "id": "290", "question": "What is equal to mass times acceleration?", "answer": "Force", "category": "Science" }, { "id": "291", "question": "Where on the human body would you find the papillae?", "answer": "The tongue", "category": "Science" }, { "id": "292", "question": "Which former Olympian has won the most Olympic medals in history?", "answer": "Michael Phelps (28)", "category": "Sport" }, { "id": "293", "question": "Name the boxer who played \'Pretty\' Ricky Conlon in the 2016 movie, Creed?", "answer": "Tony Bellew", "category": "Sport" }, { "id": "294", "question": "What movie starred all of the below actors?", "answer": "Knives Out", "category": "Movies", "quote": "Chris Evans, Daniel Craig, Jamie Lee Curtis, Michael Shannon, Christopher Plummer" }, { "id": "294", "question": "Name the only two Counties to do \'The Double\', winning both the All-Ireland Senior Football and Hurling Championships in the same year?", "answer": "Cork (1890, 1990) and Tipperary (1895, 1900)", "category": "Sport" }, { "id": "294", "question": "Who are the only Premier League team to have gone a full season unbeaten?", "answer": "Arsenal", "category": "Sport" }, { "id": "295", "question": "In which sport was Michelle Smith suspended in 1999 over drug allegations?", "answer": "Swimming", "category": "Sport" }, { "id": "296", "question": "What is Limerick\'s main rugby venue?", "answer": "Thomond Park", "category": "Sport" }, { "id": "297", "question": "What videogame is this?", "answer": "Portal", "category": "Videogames", "picture": "videogame_297.jpg" }, { "id": "298", "question": "What videogame series is this?", "answer": "Gears of War", "category": "Videogames", "picture": "videogame_298.jpg" }, { "id": "299", "question": "What videogame and character is this?", "answer": "Claptrap - Borderlands", "category": "Videogames", "picture": "videogame_299.jpg" }, { "id": "300", "question": "What fighting videogame series is this?", "answer": "Mortal Kombat", "category": "Videogames", "picture": "videogame_300.jpg" }, { "id": "301", "question": "What is the largest landlocked country in the world?", "answer": "Kazakhstan", "category": "Countries of the World" }, { "id": "302", "question": "What country has the largest muslim population?", "answer": "Indonesia", "category": "Countries of the World" }, { "id": "303", "question": "What European country is divided into departments?", "answer": "France", "category": "Countries of the World" }, { "id": "304", "question": "What country is this?", "answer": "Austria", "category": "Countries of the World", "picture": "country_304.jpg" }, { "id": "305", "question": "What country is this?", "answer": "Thailand", "category": "Countries of the World", "picture": "country_305.jpg" }, { "id": "306", "question": "What country is this?", "answer": "Colombia", "category": "Countries of the World", "picture": "country_306.png" }, { "id": "307", "question": "Which US state is this?", "answer": "Illinois", "category": "Countries of the World", "picture": "country_307.png" }, { "id": "308", "question": "What country is this?", "answer": "Iran", "category": "Countries of the World", "picture": "country_308.jpg" }, { "id": "309", "question": "What is the only country in the world which borders Denmark?", "answer": "Germany", "category": "Countries of the World" }, { "id": "310", "question": "What is the capital of Switzerland?", "answer": "Bern", "category": "Countries of the World" }, { "id": "311", "question": "What is the capital of Chile?", "answer": "Santiago", "category": "Countries of the World" }, { "id": "312", "question": "What is the largest island in the world?", "answer": "Greenland", "category": "Countries of the World" }, { "id": "313", "question": "What three countries make up Scandinavia?", "answer": "Norway, Sweden ad Denmark (not Finland)", "category": "Countries of the World" }, { "id": "314", "question": "Name one of the two double landlocked countries in the world! A country is double landlocked when it is surrounded only by landlocked countries.", "answer": "Liechtenstein or Uzbekistan", "category": "Countries of the World" }, { "id": "315", "question": "What country is this?", "answer": "Algeria", "category": "Countries of the World", "picture": "country_315.jpg" }, { "id": "316", "question": "What is the song and artist from this music video?", "answer": "A-ha - Take On Me", "category": "80s Music", "picture": "music_316.png" }, { "id": "317", "question": "Which artist had songs, \'Livin\' on a Prayer\' and \'You Give Love a Bad Name\'?", "answer": "Bon Jovi", "category": "80s Music" }, { "id": "318", "question": "What song from 1983 are these lyrics from?", "answer": "Eurythmics - Sweet Dreams", "category": "80s Music", "quote": "Some of them want to use you</br>Some of them want to get used by you</br>Some of them want to abuse you</br>Some of them want to be abused" }, { "id": "319", "question": "What year was Live Aid?", "answer": "1985", "category": "80s Music" }, { "id": "320", "question": "Which popular AC/DC album and song was the first to feature new vocalist Brian Johnson?", "answer": "Back in Black", "category": "80s Music" }, { "id": "321", "question": "In which iconic music video do Queen parody Coronation Street?", "answer": "I Want to Break Free", "category": "80s Music" }, { "id": "322", "question": "What is the name of this English rock band?", "answer": "Pink Floyd", "category": "80s Music", "picture": "music_322.jpg" }, { "id": "323", "question": "What song from are these lyrics from?", "answer": "Journey - Don\'t Stop Believin\'", "category": "80s Music", "quote": "Working hard to get my fill</br>Everybody wants a thrill</br>Payin\' anything to roll the dice</br>Just one more time" }, { "id": "324", "question": "Which music artist had hits with \'Earth Song\' and \'P.Y.T\' in 1982?", "answer": "Michael Jackson", "category": "80s Music" }, { "id": "324", "question": "Which 80s band name is french for \'Fashion News\' or \'Fashion Update\'?", "answer": "Depeche Mode", "category": "80s Music" }, { "id": "325", "question": "What is the song/artist from this music video?", "answer": "Toto – Africa", "category": "80s Music", "picture": "music_325.png" }, { "id": "326", "question": "Which 80s music video has become an internet phenomenon, referred to as \'Rickrolling\'?", "answer": "Rick Astley - Never Gonna Give You Up", "category": "80s Music" }, { "id": "327", "question": "Which famous actor was in the title of a Bananarama song in 1984?", "answer": "Robert De Niro (Robert De Niro\'s Waiting)", "category": "80s Music" }, { "id": "328", "question": "Complete the title of this 1980s band: \'Frankie Goes To _________\'", "answer": "Hollywood", "category": "80s Music" }, { "id": "329", "question": "Which U2 album became the fastest-selling album in British history at the time, once released in 1987?", "answer": "The Joshua Tree", "category": "80s Music" }, { "id": "330", "question": "In 1985, Michael Barratt filmed a famous Christmas No.1 video in Sweden. What was the song?", "answer": "Shakin\' Stevens - Merry Christmas Everyone", "category": "80s Music" }, { "id": "331", "question": "What is the band and name of this famous music album?", "answer": "Nirvana - Nevermind", "category": "90s Music" }, { "id": "331", "question": "Which of the Spice Girls left the group in 1998?", "answer": "Geri Halliwell (Ginger Spice)", "category": "90s Music" }, { "id": "332", "question": "The Europop music group Aqua are from which country?", "answer": "Denmark", "category": "90s Music" }, { "id": "333", "question": "Which singer caused controversy in 1990 after stating they would not perform if the United States national anthem was played before one of their concerts?", "answer": "Sinéad O\'Connor", "category": "90s Music" }, { "id": "334", "question": "What is the name of this electronic music duo?", "answer": "Daft Punk", "category": "90s Music", "picture": "music_334.jpg" }, { "id": "335", "question": "What is the name of this electronic music duo?", "answer": "Daft Punk", "category": "90s Music", "picture": "music_334.jpg" }, { "id": "335", "question": "Which 90s girl group consited of members: \'T-Boyz\', \'Left-Eye\' and \'Chilli\'?", "answer": "TLC", "category": "90s Music" }, { "id": "336", "question": "In which US city/state were the Backstreet Boys formed?", "answer": "Orlando, Florida", "category": "90s Music" }, { "id": "336", "question": "In which US city/state were the Backstreet Boys formed?", "answer": "Orlando, Florida", "category": "Music" }, { "id": "337", "question": "Mark Wahlberg\'s brother Donnie was in which famous boy band?", "answer": "New Kids on the Block", "category": "Music" }, { "id": "338", "question": "What is the artist/song with the below lyrics?", "answer": "MC Hammer - U Can’t Touch This", "category": "90s Music", "quote": "Fresh new kicks, and pants</br>You gotta like that, now you know you wanna dance</br>So move outta yo seat</br>And get a fly girl and catch this beat" }, { "id": "339", "question": "Which hip hop artist released their solo debut album, \'Big Willie Style\' in 1997?", "answer": "Will Smith", "category": "90s Music" }, { "id": "340", "question": "\'Definitely, Maybe\' was the title of the debut studio album by which English rock band?", "answer": "Oasis", "category": "90s Music" }, { "id": "341", "question": "Whitney Houston’s rendition of \'I Will Always Love You\' shot into the charts in 1992 after it was featured in which Hollywood film?", "answer": "The Bodyguard", "category": "90s Music" }, { "id": "342", "question": "Complete the title of this Radiohead song: \'Fake Plastic ______\'", "answer": "Trees", "category": "90s Music" }, { "id": "343", "question": "Natalie Imbruglia who had a hit with \'Torn\' in 1997, started out as an actor in which Soap?", "answer": "Neighbours", "category": "90s Music" }, { "id": "344", "question": "Who released a single in 1999 called \'Genie In A Bottle\'?", "answer": "Christina Aguilera", "category": "90s Music" }, { "id": "345", "question": "Which singer spent 16 weeks at the top of the UK charts with (Everything I Do) I Do It for You?", "answer": "Bryan Adams", "category": "90s Music" }, { "id": "346", "question": "Name 3 of the 5 members of Boyzone!", "answer": "Keith Duffy, Stephen Gately, Mikey Graham, Ronan Keating, and Shane Lynch", "category": "Music" }, { "id": "347", "question": "Name 3 of the 5 members of Westlife!", "answer": "Shane Filan, Mark Feehily, Kian Egan, Nicky Byrne and Brian McFadden", "category": "Music" }, { "id": "348", "question": "What is the music group and song from this music video?", "answer": "Beastie Boys - Sabotage", "category": "90s Music", "picture": "music_348.png" }, { "id": "349", "question": "What Rock band is this?", "answer": "Red Hot Chili Peppers", "category": "90s Music", "picture": "music_349.jpg" }, { "id": "349", "question": "What was Britany Spears\' debut single released in 1998?", "answer": "..Baby One More Time", "category": "90s Music" }, { "id": "350", "question": "What is the alter-ego of Eminem used in the title of one of his songs from 2000?", "answer": "Slim Shady", "category": "Music" }, { "id": "351", "question": "What music artist is this?", "answer": "Post Malone", "category": "Music", "picture": "music_351.jpg" }, { "id": "352", "question": "Which song/artist won \'Record of the Year\' and \'Song of the Year\' at the 2020 Grammy Awards?", "answer": "Billie Eilish Bad Guy", "category": "Music" }, { "id": "353", "question": "In 2002, Johnny Cash covered \'Hurt\' which was one of the final hits released before his death. Which band recorded the original version?", "answer": "Nine Inch Nails", "category": "Music" }, { "id": "354", "question": "Adam Levine is the lead vocalist in which pop band?", "answer": "Maroon 5", "category": "Music" }, { "id": "355", "question": "What music artist is this?", "answer": "Charlie Puth", "category": "Music", "picture": "music_355.jpg" }, { "id": "356", "question": "Who is this tennis player?", "answer": "Pete Sampras", "category": "Tennis", "picture": "tennis_116.jpg" }, { "id": "357", "question": "Who is this tennis player?", "answer": "Jamie Murray", "category": "Tennis", "picture": "tennis_117.jpg" }, { "id": "358", "question": "Who is this tennis player?", "answer": "Venus Williams", "category": "Tennis", "picture": "tennis_118.jpg" }, { "id": "359", "question": "Which tennis player beat Bobby Riggs in the \'Battle of the Sexes\' in 1973?", "answer": "Billie Jean King", "category": "Tennis" }, { "id": "360", "question": "When the tennis score is 40-40, what is it otherwise called?", "answer": "Deuce", "category": "Tennis" }, { "id": "361", "question": "What music video is the all time most viewed and most liked video on Youtube?", "answer": " Despacito - Luis Fonsi featuring Daddy Yankee", "category": "Music" }, { "id": "362", "question": "Which music video is the second most disliked video on Youtube with 11.37 million dislikes? The current most disliked video is YouTube Rewind 2018: Everyone Controls Rewind.", "answer": "Baby – Justin Bieber featuring Ludacris", "category": "Music" }, { "id": "363", "question": "What rapper plays \'Tej Parker\' in the \'Fast & Furious\' movies?", "answer": "Ludacris (Christopher Bridges)", "category": "Music" }, { "id": "364", "question": "The songs \'Dust Til Dawn\' and \'A Whole New World\' were recorded by which member of One Direction?", "answer": "Zayn Malik", "category": "Music" }, { "id": "365", "question": "What type of Electric Guitar was Jimi Hendrix known for playing?", "answer": "Fender Stratocaster", "category": "Music" }, { "id": "366", "question": "What is the name of this musical duo who won \'You\'re a Star\' and represented Ireland in the 2005 Eurovision?", "answer": "Donna and Joseph McCaul", "category": "Irish TV", "picture": "tv_366.jpg" }, { "id": "367", "question": "Who was the presenter of \'Winning Streak\' from 1990-2001?", "answer": "Mike Murphy", "category": "Irish TV" }, { "id": "368", "question": "Who presented the Irish version of \'Who Wants to Be a Millionaire?\' when it ran from 2000-2002?", "answer": "Gay Byrne", "category": "Irish TV" }, { "id": "369", "question": "Ciaran Morrison and Mick O\'Hara are the puppeteers behind Podge and Rodge. What other Irish TV duo have they portrayed?", "answer": "Zig and Zag", "category": "Irish TV" }, { "id": "370", "question": "Jennifer Zamparelli (Maguire) first appeared on television in which British reality TV show?", "answer": "The Apprentice", "category": "Irish TV" }, { "id": "371", "question": "Who is this RTE News presenter?", "answer": "Aengus Mac Grianna", "category": "Irish TV", "picture": "tv_371.jpg" }, { "id": "372", "question": "In what year was the breakfast show \'Ireland AM\' first broadcast?", "answer": "1999", "category": "Irish TV" }, { "id": "373", "question": "Name 2 of the 4 presenters of long-running children\'s television strand \'The Den\'!", "answer": "Ian Dempsey, Ray D\'Arcy, Damien McCaul, Francis Boylan", "category": "Irish TV" }, { "id": "374", "question": "Simon Delaney, Keith McErlean and Don Wycherley all acted in which Irish Comedy series?", "answer": "Bachelors Walk", "category": "Irish TV" }, { "id": "375", "question": "Who is this Irish actor from \'Raw\' and \'Pure Mule\'?", "answer": "Charlene McKenna", "category": "Irish TV", "picture": "tv_375.jpg" }, { "id": "376", "question": "Who is this Irish actor from \'Raw\' and \'Pure Mule\'?", "answer": "Charlene McKenna", "category": "Irish TV", "picture": "tv_376.jpg" }, { "id": "376", "question": "Which actor has starred in all of the below movies?", "answer": "Emma Stone", "category": "Movies", "quote": "Superbad, La La Land, The Favourite, Birdman" }, { "id": "377", "question": "What movie is this scene from?", "answer": "Life of Pi", "category": "Movies", "picture": "movie_377.jpg" }, { "id": "378", "question": "Which actor has starred in all of the below movies?", "answer": "Jake Gyllenhaal", "category": "Movies", "quote": "Brokeback Mountain, Prisoners, Spider-Man: Far From Home, Donnie Darko" }, { "id": "379", "question": "Which actor has starred in all of the below movies?", "answer": "Scarlett Johansson", "category": "Movies", "quote": "Her, Captain America: The Winter Soldier, Jojo Rabbit, Marriage Story" }, { "id": "380", "question": "Which actor has starred in all of the below movies?", "answer": "Brendan Gleeson", "category": "Movies", "quote": "Bravehart, 28 Days Later, Paddington 2, In Bruges" } ] }'
	return data;
}
