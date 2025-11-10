// ticTacToe.js

const gameBoard = document.getElementById('ticTacToeBoard');
const cells = document.querySelectorAll('.cell');
const gameStatus = document.getElementById('ticTacToeStatus');
const restartBtn = document.getElementById('ticTacToeRestartBtn');
const modeSelect = document.getElementById('ticTacToeMode');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X'; // Player's mark
let computerPlayer = 'O'; // Computer's mark
let gameActive = true;
let currentMode = 'easy'; // Default mode

// Winning combinations
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Display messages
const messages = {
    playerTurn: () => `It's ${currentPlayer}'s turn`,
    computerTurn: () => `Computer's turn (O)`,
    win: () => `Player ${currentPlayer} has won!`,
    draw: () => `Game ended in a draw!`,
};

// --- Game Logic Functions ---

function handleCellPlayed(clickedCell, clickedCellIndex) {
    board[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
    clickedCell.classList.add(currentPlayer === 'X' ? 'player-x' : 'player-o');
}

function handleResultValidation() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        gameStatus.innerHTML = messages.win();
        gameActive = false;
        return true;
    }

    let roundDraw = !board.includes('');
    if (roundDraw) {
        gameStatus.innerHTML = messages.draw();
        gameActive = false;
        return true;
    }
    return false;
}

function handlePlayerChange() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    gameStatus.innerHTML = messages.playerTurn();
}

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    if (board[clickedCellIndex] !== '' || !gameActive || currentPlayer === computerPlayer) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    if (!handleResultValidation()) {
        handlePlayerChange();
        if (gameActive && currentPlayer === computerPlayer) {
            gameStatus.innerHTML = messages.computerTurn();
            setTimeout(computerMove, 700); // Simulate thinking time
        }
    }
}

function computerMove() {
    let move;
    if (currentMode === 'easy') {
        move = getRandomMove();
    } else if (currentMode === 'medium') {
        move = getMediumMove();
    } else if (currentMode === 'hard') {
        move = getHardMove();
    }

    const cellToPlay = cells[move];
    handleCellPlayed(cellToPlay, move);
    if (!handleResultValidation()) {
        handlePlayerChange();
    }
}

// --- AI Logic for Different Modes ---

function getAvailableMoves() {
    return board.map((val, index) => val === '' ? index : null).filter(val => val !== null);
}

function getRandomMove() {
    const availableMoves = getAvailableMoves();
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function getMediumMove() {
    // Check if computer can win
    for (const move of getAvailableMoves()) {
        board[move] = computerPlayer;
        if (handleResultValidation()) {
            board[move] = ''; // Reset for actual play
            return move;
        }
        board[move] = ''; // Reset
    }

    // Check if player can win on next move, block them
    for (const move of getAvailableMoves()) {
        board[move] = currentPlayer;
        if (handleResultValidation()) {
            board[move] = ''; // Reset for actual play
            return move;
        }
        board[move] = ''; // Reset
    }

    // Otherwise, take a random move (easy logic)
    return getRandomMove();
}

function getHardMove() {
    // Minimax algorithm (simplified for Tic Tac Toe)
    // This is a complex function. For simplicity, we'll use a slightly more advanced blocking/winning strategy
    // For a full minimax, the function would be much longer and recursive.

    // Check if computer can win
    for (const move of getAvailableMoves()) {
        board[move] = computerPlayer;
        if (checkWin(board, computerPlayer)) { // Use a helper checkWin for this
            board[move] = '';
            return move;
        }
        board[move] = '';
    }

    // Check if player can win on next move, block them
    for (const move of getAvailableMoves()) {
        board[move] = currentPlayer;
        if (checkWin(board, currentPlayer)) {
            board[move] = '';
            return move;
        }
        board[move] = '';
    }

    // Try to take center
    if (board[4] === '') return 4;

    // Try to take a corner
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(corner => board[corner] === '');
    if (availableCorners.length > 0) return availableCorners[0]; // Take first available corner

    // Otherwise, take any available side
    const sides = [1, 3, 5, 7];
    const availableSides = sides.filter(side => board[side] === '');
    if (availableSides.length > 0) return availableSides[0];

    return getRandomMove(); // Fallback
}

// Helper to check for a win without changing global game state
function checkWin(currentBoard, player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = currentBoard[winCondition[0]];
        let b = currentBoard[winCondition[1]];
        let c = currentBoard[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === player && b === player && c === player) {
            return true;
        }
    }
    return false;
}


function handleRestartGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X'; // Player always starts as X
    gameStatus.innerHTML = messages.playerTurn();
    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('player-x', 'player-o');
    });
    // If computer starts (O), and it's set to computer's turn, make a move
    if (currentPlayer === computerPlayer && gameActive) {
        setTimeout(computerMove, 500);
    }
}

function handleModeChange() {
    currentMode = modeSelect.value;
    handleRestartGame(); // Restart game with new mode
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Ensure gameBoard exists before attaching listeners
    if (gameBoard) {
        cells.forEach(cell => cell.addEventListener('click', handleCellClick));
        restartBtn.addEventListener('click', handleRestartGame);
        modeSelect.addEventListener('change', handleModeChange);

        gameStatus.innerHTML = messages.playerTurn(); // Initial status
    }
});