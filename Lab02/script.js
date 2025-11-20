const boardElement = document.getElementById('board');
const movesElement = document.getElementById('moves');
const messageElement = document.getElementById('message');
const newGameButton = document.getElementById('new-game');

let tiles = [];      // масив з 0..15, де 0 — порожня клітинка
let movesCount = 0;

// Створюємо DOM-клітинки один раз
function createBoardCells() {
    boardElement.innerHTML = '';
    for (let i = 0; i < 16; i++) {
        const tileDiv = document.createElement('div');
        tileDiv.classList.add('tile');
        tileDiv.dataset.index = i; // позиція в сітці 0..15
        tileDiv.addEventListener('click', onTileClick);
        boardElement.appendChild(tileDiv);
    }
}

// Малюємо стан масиву tiles у DOM
function renderBoard() {
    const cells = boardElement.querySelectorAll('.tile');
    tiles.forEach((value, index) => {
        const cell = cells[index];
        if (value === 0) {
            cell.textContent = '';
            cell.classList.add('empty');
        } else {
            cell.textContent = value;
            cell.classList.remove('empty');
        }
    });

    movesElement.textContent = `Кроків: ${movesCount}`;
}

// Обробник кліку по клітинці
function onTileClick(e) {
    const index = parseInt(e.currentTarget.dataset.index, 10);
    const emptyIndex = tiles.indexOf(0);

    if (canMove(index, emptyIndex)) {
        // міняємо місцями значення
        [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
        movesCount++;
        renderBoard();
        messageElement.textContent = '';

        if (isSolved()) {
            messageElement.textContent = `Вітаємо, ви виграли за ${movesCount} кроків!`;
        }
    }
}

// Чи сусідня клітинка з порожньою
function canMove(tileIndex, emptyIndex) {
    const tileRow = Math.floor(tileIndex / 4);
    const tileCol = tileIndex % 4;
    const emptyRow = Math.floor(emptyIndex / 4);
    const emptyCol = emptyIndex % 4;

    const rowDiff = Math.abs(tileRow - emptyRow);
    const colDiff = Math.abs(tileCol - emptyCol);

    // можна рухати тільки вгору/вниз/вліво/вправо на одну клітинку
    return (rowDiff + colDiff === 1);
}

// Чи зібрана правильна послідовність
function isSolved() {
    for (let i = 0; i < 15; i++) {
        if (tiles[i] !== i + 1) return false;
    }
    return tiles[15] === 0;
}

// Створюємо випадкову, але розв’язну конфігурацію
function generateSolvableBoard() {
    let arr;
    do {
        arr = [];
        for (let i = 0; i < 16; i++) arr.push(i);
        // перемішуємо Фішером–Єйтсом
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    } while (!isSolvable(arr) || isAlreadySolved(arr));

    return arr;
}

function isAlreadySolved(arr) {
    for (let i = 0; i < 15; i++) {
        if (arr[i] !== i + 1) return false;
    }
    return arr[15] === 0;
}

// Перевірка розв’язності для 4x4
function isSolvable(arr) {
    let inversions = 0;
    for (let i = 0; i < 16; i++) {
        if (arr[i] === 0) continue;
        for (let j = i + 1; j < 16; j++) {
            if (arr[j] !== 0 && arr[i] > arr[j]) inversions++;
        }
    }

    const emptyIndex = arr.indexOf(0);
    const emptyRowFromBottom = 4 - Math.floor(emptyIndex / 4); // 1..4

    // Для парної ширини (4): розв’язно, якщо (інверсії + рядок_знизу) парне
    return ((inversions + emptyRowFromBottom) % 2 === 0);
}

// Запуск нової гри
function newGame() {
    tiles = generateSolvableBoard();
    movesCount = 0;
    messageElement.textContent = '';
    renderBoard();
}

// Ініціалізація
createBoardCells();
newGameButton.addEventListener('click', newGame);
newGame();