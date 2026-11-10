# ❌ ⭕ Tic Tac Toe

A clean, paper-notebook style Tic Tac Toe game that runs entirely in your browser. You play X against an unbeatable computer opponent, build a win streak, and track your history, with no installs and no internet connection required.

<img width="1892" height="960" alt="image" src="https://github.com/user-attachments/assets/dcc65285-87e4-4ebf-905a-dde9589ba777" />


---

## 📑 Table of Contents

- [Features](#-features)
- [How to Play](#-how-to-play)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [How It Works](#-how-it-works)
- [Customization](#-customization)
- [Accessibility](#-accessibility)
- [Built With](#-built-with)
- [License](#-license)

---

## ✨ Features

| | Feature | Description |
| :-: | ------- | ----------- |
| 🧠 | **Unbeatable computer** | The computer uses the minimax algorithm, so it always blocks your winning moves and takes its own wins when they're available. |
| 🎲 | **Varied play** | When several moves are equally strong, the computer picks one at random, so games don't repeat. |
| 💬 | **Clear results** | Every round shows a message explaining the outcome. |
| 📊 | **Scoreboard** | Tracks your wins, the computer's wins, draws, and your current win streak. |
| 🔥 | **Best streak** | Hover over the streak counter to see your personal best. |
| ✨ | **Winning line highlight** | The three winning squares are shaded green. |
| 🗒️ | **Round history** | The last 12 rounds appear as Win, Loss, or Draw stamps. |
| 💾 | **Saved progress** | Scores and history survive a page refresh. |
| ⌨️ | **Keyboard controls** | Play entirely from the keyboard. |
| ↩️ | **Cancel or reset** | Cancel a round in progress, or reset all scores at any time. |
| 📱 | **Responsive design** | Works on desktops, tablets, and phones. |
| ♿ | **Accessible** | Focus rings, screen-reader announcements, and reduced-motion support. |

---

## 🎮 How to Play

1. You are **X**, and the computer is **O**.
2. Click an empty square, or press a number key from **1** to **9**. The squares are numbered left to right, top to bottom:

   | | | |
   | :-: | :-: | :-: |
   | 1 | 2 | 3 |
   | 4 | 5 | 6 |
   | 7 | 8 | 9 |

3. The computer thinks for a moment, then places its **O**.
4. The round ends when someone gets three in a row, or the board is full.
5. Press **Enter** or click **Next round** to start a new round.

### Rules

- Three of your marks in a row, column, or diagonal wins the round.
- Filling the board without a line is a **draw**. Draws don't break your win streak.
- A win adds to your streak. A loss resets it to zero.

### Keyboard Shortcuts

| Key | Action |
| :-: | ------ |
| `1` – `9` | Place your mark in that square |
| `Enter` | Start the next round |
| `Esc` | Cancel the current round |

---

## 📁 Project Structure

```
tic-tac-toe/
├── index.html    # Page structure
├── styles.css    # Visual design
├── script.js     # Game logic, computer opponent, and saved stats
└── README.md     # Project documentation
```

---

## 🚀 Getting Started

No build step or dependencies are needed.

### Option 1: Open directly

Double-click `index.html` to open it in your browser.

### Option 2: Run a local server

From the `tic-tac-toe` folder, start a simple server:

```bash
python -m http.server 5500
```

On Windows you can use `py -m http.server 5500`.

Then open [http://localhost:5500](http://localhost:5500) in your browser.

> **Note:** Keep `index.html`, `styles.css`, and `script.js` in the same folder. The HTML loads the other two files by relative path, and the stylesheet name must match exactly.

---

## 🧠 How It Works

- **State.** A single `state` object holds the scores, streak, history, the board, and the current phase: `playing`, `thinking`, or `over`.
- **Computer opponent.** `chooseCpuMove` runs minimax over every empty square. It scores quick wins higher than slow ones, then picks randomly among the best moves.
- **Round flow.** Your move is placed, and the game checks for a win or a full board. If the round continues, the computer moves after a short delay. When the round ends, the outcome updates the scores, history, and status line.
- **Safe cancellation.** Pending computer-move timers are tracked, so cancelling or resetting mid-round stops cleanly without changing the scores.
- **Persistence.** After every round, stats are saved to `localStorage` under the key `ttt-stats-v1`. If storage is unavailable, such as in private browsing, the game still works and simply doesn't remember your scores.

---

## 🎨 Customization

The paper look is controlled by CSS variables at the top of `styles.css`:

```css
:root {
  --paper: #faf6ee;   /* page background */
  --card: #fffdf8;    /* board card */
  --ink: #2d2a26;     /* board lines and text */
  --x: #d1495b;       /* your mark colour */
  --o: #2e86ab;       /* computer mark colour */
  --win: #3c8d5a;     /* win colour */
  --lose: #b5553b;    /* loss colour */
  --draw: #b8860b;    /* draw colour */
}
```

Other settings you can change in `script.js`:

| Setting | Default | What it does |
| ------- | ------- | ------------ |
| `CPU_DELAY_MS` | `450` | Milliseconds before the computer moves |
| `HISTORY_LIMIT` | `12` | Number of rounds kept in the history |
| `STORAGE_KEY` | `"ttt-stats-v1"` | Key used to save stats in the browser |

---

## ♿ Accessibility

- Every square is a real `<button>` with a label such as *"Cell 5, X"*, so it works with the keyboard and screen readers.
- The status line uses `aria-live="polite"`, so results are announced as they happen.
- Visible focus rings appear on interactive elements.
- Animations turn off automatically for users who have enabled *reduce motion* in their operating system.

---

## 🛠️ Built With

- **HTML5** for structure
- **CSS3** with custom properties, grid layout, and keyframe animations
- **Vanilla JavaScript**, with no frameworks or libraries

---

## 📄 License

This project is free to use, modify, and share.

Good luck beating the computer. It's harder than it looks! 🏆
