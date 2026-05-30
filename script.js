
console.log("SCRIPT LOADED OK");

/* =========================
   FIREBASE
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyAtpDbBKib75RlsxEEN_pJkWedXE7MIx3Y",
  authDomain: "mental-math-trainer-d5f31.firebaseapp.com",
  projectId: "mental-math-trainer-d5f31",
  storageBucket: "mental-math-trainer-d5f31.firebasestorage.app",
  messagingSenderId: "84169678219",
  appId: "1:84169678219:web:f53dc3f6f7b5a15783e38e"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* =========================
   GAME STATE
========================= */

let playerName = "";
let difficulty = "normal";

let score = 0;
let timeLeft = 60;
let gameRunning = false;

let num1 = 0;
let num2 = 0;
let answer = 0;

let countdown = null;
let selectedButton = null;

/* =========================
   SCREEN SYSTEM
========================= */

function showScreen(screen) {

  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "none";
  document.getElementById("gameOverScreen").style.display = "none";
  document.getElementById("leaderboardScreen").style.display = "none";

  document.getElementById(screen).style.display = "block";

  if (screen === "leaderboardScreen") {
    loadLeaderboard();
  }
}

function backToMenu() {
  showScreen("startScreen");
}

/* =========================
   DIFFICULTY
========================= */

function setDifficulty(level, button) {

  difficulty = level;

  if (selectedButton) {
    selectedButton.classList.remove("selected");
  }

  if (button) {
    button.classList.add("selected");
    selectedButton = button;
  }
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

/* =========================
   QUESTION
========================= */

function generateQuestion() {

  let range = getRange();

  num1 = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
  num2 = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];

  answer = num1 * num2;

  document.getElementById("question").innerText =
    num1 + " × " + num2;
}

/* =========================
   START GAME
========================= */

function startGame() {

  playerName = document.getElementById("playerName").value.trim();

  if (!playerName) {
    alert("Enter your name");
    return;
  }

  score = 0;
  timeLeft = 60;
  gameRunning = true;

  document.getElementById("score").innerText = "0";
  document.getElementById("timer").innerText = "60";
  document.getElementById("result").innerText = "";

  showScreen("gameScreen");

  generateQuestion();

  document.getElementById("answer").value = "";
  document.getElementById("answer").focus();

  countdown = setInterval(() => {

    timeLeft--;
    document.getElementById("timer").innerText = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }

  }, 1000);
}

/* =========================
   CHECK ANSWER
========================= */

function checkAnswer() {

  if (!gameRunning) return;

  let user = Number(document.getElementById("answer").value);

  if (user === answer) {
    score++;
    document.getElementById("result").innerText = "Correct";
  } else {
    document.getElementById("result").innerText = "Wrong";
  }

  document.getElementById("score").innerText = score;

  document.getElementById("answer").value = "";
  document.getElementById("answer").focus();

  generateQuestion();
}

/* =========================
   ENTER KEY
========================= */

function handleKey(event) {
  if (event.key === "Enter") {
    checkAnswer();
  }
}

/* =========================
   END GAME
========================= */

function endGame() {

  clearInterval(countdown);
  gameRunning = false;

  saveScore();

  document.getElementById("finalScore").innerText =
    playerName + " scored " + score + " (" + difficulty + ")";

  showScreen("gameOverScreen");
}

/* =========================
   FIREBASE SAVE
========================= */

async function saveScore() {

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
   LEADERBOARD
========================= */

async function loadLeaderboard() {

  document.getElementById("leaderboardTitle").innerText =
    difficulty.charAt(0).toUpperCase() + difficulty.slice(1) + " Leaderboard";

  const ref = db.collection("leaderboards")
    .doc(difficulty)
    .collection("players");

  const snapshot = await ref.get();

  let data = [];

  snapshot.forEach(doc => {
    data.push(doc.data());
  });

  data.sort((a, b) => b.score - a.score);

  let html = "";

  if (data.length === 0) {
    html = "No scores yet";
  } else {

    let top = data.slice(0, 5);

    for (let i = 0; i < top.length; i++) {
      html += (i + 1) + ". " + top[i].name + " - " + top[i].score + "<br>";
    }
  }

  document.getElementById("leaderboardList").innerHTML = html;
}
