// ---------- Configuration ----------
const HUMAN = "X";
const CPU = "O";
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],   // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8],   // columns
  [0, 4, 8], [2, 4, 6],              // diagonals
];
const KEY_TO_CELL = { "1": 0, "2": 1, "3": 2, "4": 3, "5": 4, "6": 5, "7": 6, "8": 7, "9": 8 };
const CPU_DELAY_MS = 450;
const HISTORY_LIMIT = 12;
const STORAGE_KEY = "ttt-stats-v1";

const OUTCOME_TEXT = {
  win:  "You win this round! 🎉",
  lose: "The computer wins. Better luck next time.",
  draw: "A draw. Nobody wins this one.",
};
const OUTCOME_LETTER = { win: "Win", lose: "Loss", draw: "Draw" };

// ---------- State ----------
// phase: "playing" (your turn), "thinking" (computer's turn), "over" (round finished)
const state = {
  player: 0,
  computer: 0,
  draws: 0,
  streak: 0,
  bestStreak: 0,
  history: [],               // newest first: { outcome }
  board: Array(9).fill(null),
  phase: "playing",
  winLine: null,             // not saved; only used for highlighting
};
let pendingTimers = [];

// ---------- DOM references ----------
const $ = (id) => document.getElementById(id);
const dom = {
  playerScore:   $("playerScore"),
  computerScore: $("computerScore"),
  drawScore:     $("drawScore"),
  streakScore:   $("streakScore"),
  streakBox:     $("streakBox"),
  status:        $("status"),
  board:         $("board"),
  nextBtn:       $("nextBtn"),
  cancelBtn:     $("cancelBtn"),
  resetScore:    $("resetScoreBtn"),
  history:       $("history"),
  cells:         [],
};

// Create the 9 cells once
for (let i = 0; i < 9; i++) {
  const cell = document.createElement("button");
  cell.className = "cell";
  cell.type = "button";
  cell.dataset.index = i;
  cell.setAttribute("aria-label", `Cell ${i + 1}, empty`);
  cell.addEventListener("click", () => playerMove(i));
  dom.board.appendChild(cell);
  dom.cells.push(cell);
}

// ---------- Game logic ----------
function findWinner(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { mark: board[a], line };
    }
  }
  return null;
}

function isFull(board) {
  return board.every((cell) => cell !== null);
}

function emptyIndices(board) {
  return board.reduce((acc, cell, i) => (cell === null ? [...acc, i] : acc), []);
}

// Minimax: scores a position from the computer's point of view.
// Quicker wins and slower losses score better, so the computer plays sensibly.
function minimax(board, isCpuTurn, depth) {
  const win = findWinner(board);
  if (win) return win.mark === CPU ? 10 - depth : depth - 10;
  if (isFull(board)) return 0;

  let best = isCpuTurn ? -Infinity : Infinity;
  for (const i of emptyIndices(board)) {
    board[i] = isCpuTurn ? CPU : HUMAN;
    const score = minimax(board, !isCpuTurn, depth + 1);
    board[i] = null;
    best = isCpuTurn ? Math.max(best, score) : Math.min(best, score);
  }
  return best;
}

// Picks the best move; equally good moves are chosen at random so games vary.
function chooseCpuMove(board) {
  let bestScore = -Infinity;
  let bestMoves = [];
  for (const i of emptyIndices(board)) {
    board[i] = CPU;
    const score = minimax(board, false, 1);
    board[i] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [i];
    } else if (score === bestScore) {
      bestMoves.push(i);
    }
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function playerMove(index) {
  if (state.phase !== "playing" || state.board[index] !== null) return;

  state.board[index] = HUMAN;
  const win = findWinner(state.board);

  if (win) {
    finishRound("win", win.line);
  } else if (isFull(state.board)) {
    finishRound("draw", null);
  } else {
    state.phase = "thinking";
    setStatus("The computer is thinking…", "thinking");
    render();
    schedule(computerMove, CPU_DELAY_MS);
  }
  render();
}

function computerMove() {
  if (state.phase !== "thinking") return;

  const index = chooseCpuMove(state.board);
  state.board[index] = CPU;
  const win = findWinner(state.board);

  if (win) {
    finishRound("lose", win.line);
  } else if (isFull(state.board)) {
    finishRound("draw", null);
  } else {
    state.phase = "playing";
    setStatus("Your turn. Pick a square.");
  }
  render();
}

function finishRound(outcome, winLine) {
  state.phase = "over";
  state.winLine = winLine;

  if (outcome === "win") {
    state.player++;
    state.streak++;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
  } else if (outcome === "lose") {
    state.computer++;
    state.streak = 0;
  } else {
    state.draws++;   // a draw does not break the streak
  }

  state.history.unshift({ outcome });
  state.history = state.history.slice(0, HISTORY_LIMIT);

  setStatus(OUTCOME_TEXT[outcome], outcome);
  saveStats();
}

function nextRound() {
  if (state.phase !== "over") return;
  clearBoard();
  setStatus("New round. Your turn, pick a square.");
  render();
}

function cancelRound() {
  if (state.phase === "over") return;
  clearPendingTimers();
  clearBoard();
  setStatus("Round cancelled. Your turn, pick a square.");
  render();
}

function resetScore() {
  clearPendingTimers();
  Object.assign(state, {
    player: 0, computer: 0, draws: 0,
    streak: 0, bestStreak: 0,
    history: [], phase: "playing", winLine: null,
  });
  clearBoard();
  setStatus("Scores reset. Your turn, pick a square.");
  saveStats();
  render();
}

function clearBoard() {
  state.board = Array(9).fill(null);
  state.phase = "playing";
  state.winLine = null;
}

// ---------- Timing helpers ----------
function schedule(fn, delay) {
  pendingTimers.push(setTimeout(fn, delay));
}
function clearPendingTimers() {
  pendingTimers.forEach(clearTimeout);
  pendingTimers = [];
}

// ---------- Rendering ----------
function setStatus(text, className = "") {
  dom.status.textContent = text;
  dom.status.className = `status ${className}`.trim();
}

function render() {
  renderBoard();
  renderScore();
  renderHistory();
  dom.nextBtn.disabled = state.phase !== "over";
  dom.cancelBtn.disabled = state.phase === "over";
}

function renderBoard() {
  const won = new Set(state.winLine || []);

  dom.cells.forEach((cell, i) => {
    const mark = state.board[i];
    cell.replaceChildren();

    if (mark) {
      const span = document.createElement("span");
      span.className = `mark ${mark.toLowerCase()}`;
      span.textContent = mark;
      cell.appendChild(span);
      cell.setAttribute("aria-label", `Cell ${i + 1}, ${mark}`);
    } else {
      cell.setAttribute("aria-label", `Cell ${i + 1}, empty`);
    }

    cell.classList.toggle("won", won.has(i));
    cell.disabled = state.phase !== "playing" || mark !== null;
  });
}

function renderScore() {
  dom.playerScore.textContent = state.player;
  dom.computerScore.textContent = state.computer;
  dom.drawScore.textContent = state.draws;
  dom.streakScore.textContent = state.streak;
  dom.streakBox.title = `Current win streak (best: ${state.bestStreak})`;
}

function renderHistory() {
  dom.history.replaceChildren();

  if (state.history.length === 0) {
    const empty = document.createElement("span");
    empty.className = "empty";
    empty.textContent = "No rounds played yet.";
    dom.history.appendChild(empty);
    return;
  }

  // Oldest first, so the most recent round is on the right
  [...state.history].reverse().forEach((round) => {
    const stamp = document.createElement("span");
    stamp.className = `stamp ${round.outcome}`;
    stamp.textContent = OUTCOME_LETTER[round.outcome];
    dom.history.appendChild(stamp);
  });
}

// ---------- Persistence ----------
function saveStats() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      player: state.player,
      computer: state.computer,
      draws: state.draws,
      streak: state.streak,
      bestStreak: state.bestStreak,
      history: state.history,
    }));
  } catch (err) {
    // Storage can be unavailable; the game still works.
  }
}

function loadStats() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return;
    state.player = Number(saved.player) || 0;
    state.computer = Number(saved.computer) || 0;
    state.draws = Number(saved.draws) || 0;
    state.streak = Number(saved.streak) || 0;
    state.bestStreak = Number(saved.bestStreak) || 0;
    state.history = Array.isArray(saved.history) ? saved.history.slice(0, HISTORY_LIMIT) : [];
  } catch (err) {
    // Corrupt or unavailable storage: start fresh.
  }
}

// ---------- Events ----------
dom.nextBtn.addEventListener("click", nextRound);
dom.cancelBtn.addEventListener("click", cancelRound);
dom.resetScore.addEventListener("click", resetScore);

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  if (e.key in KEY_TO_CELL) {
    e.preventDefault();
    playerMove(KEY_TO_CELL[e.key]);
  } else if (e.key === "Enter" && state.phase === "over") {
    e.preventDefault();
    nextRound();
  } else if (e.key === "Escape") {
    cancelRound();
  }
});

// ---------- Init ----------
loadStats();
setStatus("Your turn. Pick a square.");
render();