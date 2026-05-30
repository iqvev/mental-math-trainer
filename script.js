
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
   STATE
========================= */

let playerName = "";
let difficulty = "normal";
let selectedBtn = null;

let num1 = 0;
let num2 = 0;
let correct = 0;

let score = 0;
let timeLeft = 60;
let running = false;

let timer;

/* =========================
   SCREENS
========================= */

function showScreen(name) {

  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "none";
  document.getElementById("endScreen").style.display = "none";
  document.getElementById("leaderboardScreen").style.display = "none";

  document.getElementById(name).style.display = "block";

  if (name === "leaderboardScreen") {
    loadLeaderboard();
  }
}

function backToMenu() {
  showScreen("startScreen");
}

/* =========================
   DIFFICULTY
========================= */

function setDifficulty(level, btn) {

  difficulty = level;

  if (selectedBtn) {
    selectedBtn.classList.remove("selected");
  }

  if (btn) {
    btn.classList.add("selected");
    selectedBtn = btn;
  }
}

/* =========================
   RANGE
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

function newQuestion() {

  let r = getRange();

  num1 = Math.floor(Math.random() * (r[1] - r[0] + 1)) + r[0];
  num2 = Math.floor(Math.random() * (r[1] - r[0] + 1)) + r[0];

  correct = num1 * num2;

  document.getElementById("question").innerText =
    num1 + " × " + num2;
}

/* =========================
   START GAME
========================= */

function startGame() {

  playerName = document.getElementById("playerName").value.trim();

  if (!playerName) {
    alert("Enter name");
    return;
  }

  score = 0;
  timeLeft = 60;
  running = true;

  document.getElementById("score").innerText = "Score: 0";
  document.getElementById("timer").innerText = "Time: 60";
  document.getElementById("result").innerText = "";

  showScreen("gameScreen");

  newQuestion();

  document.getElementById("answer").value = "";
  document.getElementById("answer").focus();

  timer = setInterval(() => {

    timeLeft--;
    document.getElementById("timer").innerText = "Time: " + timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }

  }, 1000);
}

/* =========================
   ANSWER
========================= */

function checkAnswer() {

  if (!running) return;

  let val = Number(document.getElementById("answer").value);

  if (val === correct) {
    score++;
    document.getElementById("result").innerText = "Correct";
  } else {
    document.getElementById("result").innerText = "Wrong";
  }

  document.getElementById("score").innerText = "Score: " + score;

  document.getElementById("answer").value = "";
  document.getElementById("answer").focus();

  newQuestion();
}

/* =========================
   ENTER KEY
========================= */

function handleKey(e) {
  if (e.key === "Enter") {
    checkAnswer();
  }
}

/* =========================
   END GAME
========================= */

function endGame() {

  clearInterval(timer);
  running = false;

  saveScore();

  document.getElementById("finalScore").innerText =
    playerName + " scored " + score + " (" + difficulty + ")";

  showScreen("endScreen");
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
    difficulty.toUpperCase() + " LEADERBOARD";

  const ref = db.collection("leaderboards")
    .doc(difficulty)
    .collection("players");

  const snap = await ref.get();

  let list = [];

  snap.forEach(d => list.push(d.data()));

  list.sort((a, b) => b.score - a.score);

  let html = "";

  if (list.length === 0) {
    html = "No scores yet";
  } else {

    let top = list.slice(0, 5);

    for (let i = 0; i < top.length; i++) {
      html += (i + 1) + ". " + top[i].name + " - " + top[i].score + "<br>";
    }
  }

  document.getElementById("leaderboardList").innerHTML = html;
}

/* =========================
   LEADERBOARD BUTTON
========================= */

function showLeaderboard() {
  showScreen("leaderboardScreen");
}
