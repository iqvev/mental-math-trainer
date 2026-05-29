
let num1 = 0;
let num2 = 0;
let correctAnswer = 0;

let score = 0;
let timeLeft = 60;
let gameRunning = false;

let difficulty = "normal";
let selectedButton = null;
let countdown = null;

let bestScores = {
  easy: 0,
  normal: 0,
  hard: 0,
  extreme: 0,
  insane: 0
};

loadScores();
showScreen("startScreen");

function showScreen(screen) {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "none";
  document.getElementById("gameOverScreen").style.display = "none";

  document.getElementById(screen).style.display = "block";
}

function setDifficulty(level, button) {

  if (gameRunning) return;

  difficulty = level;

  if (selectedButton) {
    selectedButton.classList.remove("selected");
  }

  button.classList.add("selected");
  selectedButton = button;

  updateBestUI();
}

function getRange() {
  if (difficulty === "easy") return [1, 10];
  if (difficulty === "normal") return [1, 20];
  if (difficulty === "hard") return [2, 50];
  if (difficulty === "extreme") return [10, 99];
  if (difficulty === "insane") return [100, 999];
}

function getNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {

  let range = getRange();

  num1 = getNumber(range[0], range[1]);
  num2 = getNumber(range[0], range[1]);

  correctAnswer = num1 * num2;

  document.getElementById("question").innerText =
    "What is " + num1 + " x " + num2 + "?";
}

function startGame() {

  if (countdown) clearInterval(countdown);

  score = 0;
  timeLeft = 60;
  gameRunning = true;

  showScreen("gameScreen");

  document.getElementById("score").innerText = "Score: 0";
  document.getElementById("timer").innerText = "Time: 60";
  document.getElementById("result").innerText = "";

  generateQuestion();

  document.getElementById("answer").value = "";
  document.getElementById("answer").focus();

  countdown = setInterval(() => {

    timeLeft--;
    document.getElementById("timer").innerText = "Time: " + timeLeft;

    if (timeLeft <= 0) {

      clearInterval(countdown);
      gameRunning = false;

      saveBestScore();
      updateBestUI();

      document.getElementById("finalScore").innerText =
        "Score: " + score;

      showScreen("gameOverScreen");
    }

  }, 1000);
}

function checkAnswer() {

  if (!gameRunning) return;

  let userAnswer = Number(document.getElementById("answer").value);

  if (userAnswer === correctAnswer) {
    score++;
    document.getElementById("result").innerText = "Correct!";
  } else {
    document.getElementById("result").innerText =
      "Wrong! Answer was " + correctAnswer;
  }

  document.getElementById("score").innerText = "Score: " + score;

  document.getElementById("answer").value = "";
  document.getElementById("answer").focus();

  generateQuestion();
}

function handleKeyPress(event) {
  if (event.key === "Enter") {
    checkAnswer();
  }
}

function backToMenu() {
  showScreen("startScreen");
}

function saveBestScore() {
  if (score > bestScores[difficulty]) {
    bestScores[difficulty] = score;
    localStorage.setItem("bestScores", JSON.stringify(bestScores));
  }
}

function loadScores() {
  let saved = localStorage.getItem("bestScores");
  if (saved) bestScores = JSON.parse(saved);
}

function updateBestUI() {
  document.getElementById("bestScore").innerText =
    "Best: " + bestScores[difficulty];
}