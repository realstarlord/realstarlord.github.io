const gridSize = 5;
let balance = 1000; // Starting balance set to 1,000 coins
let payoutMultiplier = 1.0;
let mines = [];
let revealedCells = 0;
let gameOver = false;

// Function to periodically give coins to the player
function giveCoins() {
  balance += 1000; // Give 1,000 coins
  document.getElementById('balance').innerText = balance; // Update balance display
}

// Call giveCoins every 30 seconds
setInterval(giveCoins, 30000); // 30000 milliseconds = 30 seconds

function generateMines(count) {
  mines = [];
  while (mines.length < count) {
    const randomPos = Math.floor(Math.random() * gridSize * gridSize);
    if (!mines.includes(randomPos)) mines.push(randomPos);
  }
}

function createGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  revealedCells = 0;
  payoutMultiplier = 1.0;
  gameOver = false;
  document.getElementById('payout').innerText = payoutMultiplier.toFixed(2);
  document.getElementById('message').innerText = '';
  document.getElementById('cashOutButton').disabled = false;

  const minesCount = parseInt(document.getElementById('minesCount').value);
  generateMines(minesCount);

  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell', 'unrevealed-gem'); // Add class for unrevealed gems
    cell.dataset.index = i;
    cell.addEventListener('click', () => revealCell(cell, i), { once: true });
    grid.appendChild(cell);
  }
}

function revealCell(cell, index) {
  if (gameOver) return;

  const diamondImage = '<img src="assets/diamond.png" alt="Gem">';
  const bombImage = '<img src="assets/bomb.png" alt="Bomb">';

  if (mines.includes(index)) {
    cell.classList.add('bomb');
    cell.innerHTML = bombImage;
    endGame(false);
  } else {
    cell.classList.add('revealed', 'gem');
    cell.innerHTML = diamondImage;
    cell.querySelector('img').style.opacity = '0'; // Start with opacity 0
    setTimeout(() => {
      cell.querySelector('img').style.opacity = '1'; // Fade in the image
    }, 10);
    revealedCells++;
    increasePayout();

    if (revealedCells === gridSize * gridSize - mines.length) {
      endGame(true);
    }
  }
}

function increasePayout() {
  const minesCount = parseInt(document.getElementById('minesCount').value);

  // Increase payout based on the number of mines
  if (minesCount === 1) {
    payoutMultiplier += 0.25; // Standard increase for 1 mine
  } else if (minesCount === 10) {
    payoutMultiplier += 0.5; // Higher increase for 10 mines
  } else {
    payoutMultiplier += 0.25; // Default for other cases
  }

  document.getElementById('payout').innerText = payoutMultiplier.toFixed(2);
}

function updateBalance(amount) {
  balance += amount;
  document.getElementById('balance').innerText = balance;
}

function endGame(won) {
  gameOver = true;
  document.getElementById('cashOutButton').disabled = true;
  document.getElementById('message').innerText = won ? 'You won!' : 'Game Over!';
  if (!won) revealAllBombs();
}

function revealAllBombs() {
  document.querySelectorAll('.cell').forEach((cell, index) => {
    if (mines.includes(index) && !cell.classList.contains('bomb')) {
      cell.classList.add('bomb');
      cell.innerHTML = '<img src="assets/bomb.png" alt="Bomb">';
    } else if (!cell.classList.contains('revealed')) {
      cell.classList.add('revealed', 'unrevealed-gem'); // Darken unrevealed diamonds
      cell.style.opacity = '0.5'; // Darken unrevealed diamonds
    }
  });
}

function cashOut() {
  if (gameOver) return;
  const winnings = Math.round(payoutMultiplier * parseInt(document.getElementById('betAmount').value || 0));
  updateBalance(winnings);
  document.getElementById('message').innerText = `Cashed out for ${winnings} coins!`;
  endGame(true);
}

function startGame() {
  const betAmount = parseInt(document.getElementById('betAmount').value || 0);
  if (betAmount <= 0) {
    document.getElementById('message').innerText = 'Please enter a valid bet amount!';
    return;
  }
  if (betAmount > balance) {
    document.getElementById('message').innerText = 'Not enough balance!';
    return;
  }
  updateBalance(-betAmount);
  createGrid();
}

// Button functionality for betting adjustments
document.getElementById('set1Mine').addEventListener('click', () => {
  document.getElementById('minesCount').value = 1; // Set mines to 1
});
document.getElementById('set2Mines').addEventListener('click', () => {
  document.getElementById('minesCount').value = 2; // Set mines to 2
});

document.getElementById('doubleButton').addEventListener('click', () => {
  const betAmountInput = document.getElementById('betAmount');
  betAmountInput.value = Math.floor((parseInt(betAmountInput.value) || 0) * 2); // Double the bet amount
});

document.getElementById('halfButton').addEventListener('click', () => {
  const betAmountInput = document.getElementById('betAmount');
  betAmountInput.value = Math.floor((parseInt(betAmountInput.value) || 0) / 2); // Halve the bet amount
});

// Initial event listeners
document.getElementById('startGameButton').addEventListener('click', startGame);
document.getElementById('cashOutButton').addEventListener('click', cashOut);
