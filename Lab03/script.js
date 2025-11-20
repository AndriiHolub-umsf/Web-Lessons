const ROWS = 9;
const COLS = 9;
const MINES = 10;

let board = [];
let mineCount = MINES;
let cellsOpened = 0;
let gameOver = false;
let firstClick = true;

let timerId = null;
let timeElapsed = 0;

const boardEl = document.getElementById('board');
const minesCountEl = document.getElementById('mines-count');
const timeCountEl = document.getElementById('time-count');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');

resetBtn.addEventListener('click', initGame);

function initGame() {
    board = [];
    mineCount = MINES;
    cellsOpened = 0;
    gameOver = false;
    firstClick = true;

    stopTimer();
    timeElapsed = 0;
    timeCountEl.textContent = '0';
    minesCountEl.textContent = mineCount;
    statusEl.textContent = 'Клікніть по клітинці, щоб почати гру';

    boardEl.innerHTML = '';
    boardEl.style.pointerEvents = 'auto';

    // створюємо структуру поля
    for (let r = 0; r < ROWS; r++) {
        const row = [];
        for (let c = 0; c < COLS; c++) {
            row.push({
                row: r,
                col: c,
                isMine: false,
                isOpen: false,
                isFlagged: false,
                neighborMines: 0,
                element: null
            });
        }
        board.push(row);
    }

    // створюємо DOM клітинок
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cellEl = document.createElement('div');
            cellEl.className = 'cell hidden';
            cellEl.dataset.row = r.toString();
            cellEl.dataset.col = c.toString();

            cellEl.addEventListener('click', onCellLeftClick);
            cellEl.addEventListener('contextmenu', onCellRightClick);

            board[r][c].element = cellEl;
            boardEl.appendChild(cellEl);
        }
    }
}

/**
 * Розставляємо міни так, щоб перший клік не потрапив на міну
 */
function placeMines(excludeRow, excludeCol) {
    let placed = 0;
    while (placed < MINES) {
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);

        if (board[r][c].isMine) continue;
        if (r === excludeRow && c === excludeCol) continue;

        board[r][c].isMine = true;
        placed++;
    }

    // рахуємо кількість мін навколо кожної клітинки
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c].isMine) continue;
            board[r][c].neighborMines = countNeighborMines(r, c);
        }
    }
}

function countNeighborMines(row, col) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                if (board[nr][nc].isMine) count++;
            }
        }
    }
    return count;
}

function onCellLeftClick(e) {
    if (gameOver) return;

    const cellEl = e.currentTarget;
    const row = parseInt(cellEl.dataset.row, 10);
    const col = parseInt(cellEl.dataset.col, 10);
    const cell = board[row][col];

    if (firstClick) {
        placeMines(row, col);
        startTimer();
        statusEl.textContent = 'Успіхів!';
        firstClick = false;
    }

    if (cell.isFlagged || cell.isOpen) return;

    if (cell.isMine) {
        revealMine(cell);
        gameOver = true;
        boardEl.style.pointerEvents = 'none';
        stopTimer();
        showAllMines();
        statusEl.textContent = 'Бум! Ви програли.';
        return;
    }

    openCell(row, col);
    checkWin();
}

function onCellRightClick(e) {
    e.preventDefault();
    if (gameOver || firstClick) return;

    const cellEl = e.currentTarget;
    const row = parseInt(cellEl.dataset.row, 10);
    const col = parseInt(cellEl.dataset.col, 10);
    const cell = board[row][col];

    if (cell.isOpen) return;

    if (cell.isFlagged) {
        cell.isFlagged = false;
        cellEl.classList.remove('flag');
        cellEl.textContent = '';
        mineCount++;
    } else {
        cell.isFlagged = true;
        cellEl.classList.add('flag');
        cellEl.textContent = '🚩';
        mineCount--;
    }
    minesCountEl.textContent = mineCount;
}

function openCell(row, col) {
    const cell = board[row][col];
    const cellEl = cell.element;

    if (cell.isOpen || cell.isFlagged) return;

    cell.isOpen = true;
    cellsOpened++;

    cellEl.classList.remove('hidden');
    cellEl.classList.add('open');

    if (cell.neighborMines > 0) {
        cellEl.textContent = cell.neighborMines;
        cellEl.classList.add('number-' + cell.neighborMines);
    } else {
        // якщо навколо немає мін — відкриваємо сусідів (flood fill)
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = row + dr;
                const nc = col + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                    if (!board[nr][nc].isOpen && !board[nr][nc].isMine) {
                        openCell(nr, nc);
                    }
                }
            }
        }
    }
}

function revealMine(cell) {
    const el = cell.element;
    el.classList.remove('hidden');
    el.classList.add('open', 'mine');
    el.textContent = '💣';
}

function showAllMines() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = board[r][c];
            if (cell.isMine && !cell.isOpen) {
                revealMine(cell);
            }
        }
    }
}

function checkWin() {
    const totalCells = ROWS * COLS;
    const cellsWithoutMines = totalCells - MINES;

    if (cellsOpened === cellsWithoutMines && !gameOver) {
        gameOver = true;
        stopTimer();
        boardEl.style.pointerEvents = 'none';
        statusEl.textContent = 'Вітаємо! Ви розмінували поле.';
    }
}

function startTimer() {
    stopTimer();
    timerId = setInterval(() => {
        timeElapsed++;
        timeCountEl.textContent = timeElapsed;
    }, 1000);
}

function stopTimer() {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
}


initGame();