console.log("SCRIPT LOADED OK");
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const firebaseConfig = {
  apiKey: "AIzaSyAtpDbBKib75RlsxEEN_pJkWedXE7MIx3Y",
  authDomain: "mental-math-trainer-d5f31.firebaseapp.com",
  projectId: "mental-math-trainer-d5f31",
  storageBucket: "mental-math-trainer-d5f31.firebasestorage.app",
  messagingSenderId: "84169678219",
  appId: "1:84169678219:web:f53dc3f6f7b5a15783e38e"
};

////////////////////////////////////////////////////
// 🔥 FIREBASE CONFIG ABOVE THIS LINE 🔥
////////////////////////////////////////////////////

const db = firebase.firestore();

/* =========================
   STATE
========================= */

let playerName = "";
let difficulty = "normal";
let gameRunning = false;

let score = 0;
let timeLeft = 60;
let selectedButton = null;
let countdown = null;

let num1 = 0;
let num2 = 0;
let correctAnswer = 0;

/* =========================
   SCREEN CONTROL
========================= */

function showScreen(screen) {

  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "none";
  document.getElementById("gameOverScreen").style.display = "none";
  document.getElementById("leaderboardScreen").style.display = "none";

  document.getElementById(screen).style.display = "block";

  if (screen === "leaderboardScreen") {
    renderLeaderboard();
  }
}

function backToMenu() {
  showScreen("startScreen");
}

/* =========================
   DIFFICULTY
========================= */

function setDifficulty(level, button) {

  if (gameRunning) return;

  difficulty = level;

  if (selectedButton) {
    selectedButton.classList.remove("selected");
  }

  button.classList.add("selected");
  selectedButton = button;
}

/* =========================
   RANGE SYSTEM
========================= */

function getRange() {

  if (difficulty === "easy") return [1, 10];
  if (difficulty === "normal") return [1, 20];
  if (difficulty === "hard") return [2, 50];
  if (difficulty === "extreme") return [10, 99];
  if (difficulty === "insane") return [100, 999];

  return [1, 20];
}

function getNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* =========================
   QUESTION
========================= */

function generateQuestion() {

  let range = getRange();

  num1 = getNumber(range[0], range[1]);
  num2 = getNumber(range[0], range[1]);

  correctAnswer = num1 * num2;

  document.getElementById("question").innerText =
    "What is " + num1 + " x " + num2 + "?";
}

/* =========================
   START GAME
========================= */

function startGame() {

  playerName = document.getElementById("playerName").value.trim();

  if (playerName === "") {
    alert("Enter a name");
    return;
  }

  score = 0;
  timeLeft = 60;
  gameRunning = true;

  showScreen("gameScreen");

  document.getElementById("score").innerText = "Score: 0";
  document.getElementById("timer").innerText = "Time: 60";
  document.getElementById("result").innerText = "";

  generateQuestion();

  let input = document.getElementById("answer");
  input.value = "";
  input.focus();

  countdown = setInterval(() => {

    timeLeft--;
    document.getElementById("timer").innerText = "Time: " + timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }

  }, 1000);
}

/* =========================
   END GAME
========================= */

function endGame() {

  clearInterval(countdown);
  gameRunning = false;

  saveScoreToFirebase();

  document.getElementById("finalScore").innerText =
    playerName + " scored " + score + " on " + difficulty;

  showScreen("gameOverScreen");
}

/* =========================
   ANSWER CHECK
========================= */

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

  let input = document.getElementById("answer");
  input.value = "";
  input.focus();

  generateQuestion();
}

/* =========================
   ENTER KEY SUPPORT
========================= */

function handleKeyPress(event) {
  if (event.key === "Enter") {
    checkAnswer();
  }
}

/* =========================
   FIREBASE SAVE
========================= */

async function saveScoreToFirebase() {

  const ref = db.collection("leaderboards")
    .doc(difficulty)
    .collection("players")
    .doc(playerName);

  const doc = await ref.get();

  if (!doc.exists || score > doc.data().score) {
    await ref.set({
      name: playerName,
      score: score
    });
  }
}

/* =========================
   FIREBASE LEADERBOARD
========================= */

async function renderLeaderboard() {

  document.getElementById("leaderboardTitle").innerText =
    difficulty.charAt(0).toUpperCase() + difficulty.slice(1) + " Mode Leaderboard";

  const ref = db.collection("leaderboards")
    .doc(difficulty)
    .collection("players");

  const snapshot = await ref.get();

  let entries = [];

  snapshot.forEach(doc => {
    entries.push(doc.data());
  });

  entries.sort((a, b) => b.score - a.score);

  let html = "";

  if (entries.length === 0) {
    html = "No scores yet.";
  } else {

    let top5 = entries.slice(0, 5);

    for (let i = 0; i < top5.length; i++) {
      html +=
        (i + 1) + ". " +
        top5[i].name +
        " - " +
        top5[i].score +
        "<br>";
    }
  }

  document.getElementById("leaderboardList").innerHTML = html;
}
