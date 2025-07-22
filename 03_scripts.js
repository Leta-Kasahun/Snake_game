
// ===== SIDEBAR FUNCTIONALITY =====
const hamburgerMenu = document.getElementById('hamburgerMenu');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('closeSidebar');
const menuLevel = document.getElementById('menuLevel');

hamburgerMenu.addEventListener('click', function () {
    sidebar.classList.add('show');
});

closeSidebar.addEventListener('click', function () {
    sidebar.classList.remove('show');
});

// Close sidebar when clicking outside
document.addEventListener('click', function (event) {
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickOnHamburger = hamburgerMenu.contains(event.target);

    if (!isClickInsideSidebar && !isClickOnHamburger) {
        sidebar.classList.remove('show');
    }
});

// ===== GAME LOGIC =====
// Game elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const speedElement = document.getElementById('speed');
const lengthElement = document.getElementById('length');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const restartBtn = document.getElementById('restartBtn');

// Game configuration
const gridSize = 20;
const gridWidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;
const initialSpeed = 150;

// Game state
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let level = 1;
let gameRunning = false;
let gameLoop;
let obstacles = [];

// Initialize game
function initGame() {
    // Create snake
    snake = [
        { x: 7, y: 10 },
        { x: 6, y: 10 },
        { x: 5, y: 10 }
    ];

    // Place first food
    placeFood();

    // Reset game state
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    level = 1;
    obstacles = [];

    // Update UI
    updateUI();

    // Hide game over screen
    gameOverScreen.style.display = 'none';
}

// Place food at random position
function placeFood() {
    // Create random position
    food = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight)
    };

    // Make sure food doesn't appear on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            return placeFood();
        }
    }

    // Make sure food doesn't appear on obstacles
    for (let obstacle of obstacles) {
        if (obstacle.x === food.x && obstacle.y === food.y) {
            return placeFood();
        }
    }
}

// Add obstacles based on level
function addObstacles() {
    if (level < 3) return; // Only add obstacles from level 3

    // Clear existing obstacles
    obstacles = [];

    // Add obstacles based on level
    const obstacleCount = Math.min(level * 2, 15); // Max 15 obstacles

    for (let i = 0; i < obstacleCount; i++) {
        let obstacle;
        let validPosition = false;

        while (!validPosition) {
            obstacle = {
                x: Math.floor(Math.random() * gridWidth),
                y: Math.floor(Math.random() * gridHeight)
            };

            validPosition = true;

            // Check if obstacle is on snake
            for (let segment of snake) {
                if (segment.x === obstacle.x && segment.y === obstacle.y) {
                    validPosition = false;
                    break;
                }
            }

            // Check if obstacle is on food
            if (validPosition && food.x === obstacle.x && food.y === obstacle.y) {
                validPosition = false;
            }

            // Check if obstacle is too close to snake head
            if (validPosition) {
                const head = snake[0];
                const distance = Math.abs(head.x - obstacle.x) + Math.abs(head.y - obstacle.y);
                if (distance < 5) {
                    validPosition = false;
                }
            }
        }

        obstacles.push(obstacle);
    }
}

// Main game loop
function gameUpdate() {
    if (!gameRunning) return;

    // Update direction
    direction = nextDirection;

    // Calculate new head position
    const head = { ...snake[0] };

    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // Check collision with walls
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        gameOver();
        return;
    }

    // Check collision with self
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    // Check collision with obstacles
    for (let obstacle of obstacles) {
        if (head.x === obstacle.x && head.y === obstacle.y) {
            gameOver();
            return;
        }
    }

    // Add new head to snake
    snake.unshift(head);

    // Check if food is eaten
    if (head.x === food.x && head.y === food.y) {
        // Increase score
        score += 10 * level;

        // Place new food
        placeFood();

        // Increase level every 5 foods
        if (score > 0 && score % 50 === 0) {
            level++;
            addObstacles();
        }

        // Update UI
        updateUI();
    } else {
        // Remove tail if no food was eaten
        snake.pop();
    }

    // Draw everything
    draw();
}

// Draw game elements
function draw() {
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 20, 40, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 255, 157, 0.1)';
    ctx.lineWidth = 0.5;

    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        // Gradient from head to tail
        const colorValue = Math.max(50, 255 - (i * 10));
        ctx.fillStyle = `rgb(0, ${colorValue}, ${Math.max(100, 255 - i * 5)})`;
        ctx.fillRect(
            snake[i].x * gridSize,
            snake[i].y * gridSize,
            gridSize,
            gridSize
        );

        // Draw border
        ctx.strokeStyle = 'rgba(0, 255, 157, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            snake[i].x * gridSize,
            snake[i].y * gridSize,
            gridSize,
            gridSize
        );

        // Draw eyes on head
        if (i === 0) {
            ctx.fillStyle = '#000';
            const eyeSize = gridSize / 5;

            // Position eyes based on direction
            let leftEyeX, leftEyeY, rightEyeX, rightEyeY;

            switch (direction) {
                case 'right':
                    leftEyeX = snake[i].x * gridSize + gridSize - eyeSize * 2;
                    leftEyeY = snake[i].y * gridSize + eyeSize * 2;
                    rightEyeX = snake[i].x * gridSize + gridSize - eyeSize * 2;
                    rightEyeY = snake[i].y * gridSize + gridSize - eyeSize * 3;
                    break;
                case 'left':
                    leftEyeX = snake[i].x * gridSize + eyeSize;
                    leftEyeY = snake[i].y * gridSize + eyeSize * 2;
                    rightEyeX = snake[i].x * gridSize + eyeSize;
                    rightEyeY = snake[i].y * gridSize + gridSize - eyeSize * 3;
                    break;
                case 'up':
                    leftEyeX = snake[i].x * gridSize + eyeSize * 2;
                    leftEyeY = snake[i].y * gridSize + eyeSize;
                    rightEyeX = snake[i].x * gridSize + gridSize - eyeSize * 3;
                    rightEyeY = snake[i].y * gridSize + eyeSize;
                    break;
                case 'down':
                    leftEyeX = snake[i].x * gridSize + eyeSize * 2;
                    leftEyeY = snake[i].y * gridSize + gridSize - eyeSize;
                    rightEyeX = snake[i].x * gridSize + gridSize - eyeSize * 3;
                    rightEyeY = snake[i].y * gridSize + gridSize - eyeSize;
                    break;
            }

            ctx.beginPath();
            ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Draw food
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Draw shine on food
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2 - gridSize / 6,
        food.y * gridSize + gridSize / 2 - gridSize / 6,
        gridSize / 6,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Draw obstacles
    ctx.fillStyle = 'rgba(255, 94, 98, 0.7)';
    for (let obstacle of obstacles) {
        ctx.fillRect(
            obstacle.x * gridSize,
            obstacle.y * gridSize,
            gridSize,
            gridSize
        );

        // Draw border
        ctx.strokeStyle = 'rgba(255, 30, 40, 0.9)';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            obstacle.x * gridSize,
            obstacle.y * gridSize,
            gridSize,
            gridSize
        );

        // Draw hazard symbol
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(obstacle.x * gridSize + gridSize / 4, obstacle.y * gridSize + gridSize / 4);
        ctx.lineTo(obstacle.x * gridSize + gridSize * 3 / 4, obstacle.y * gridSize + gridSize * 3 / 4);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(obstacle.x * gridSize + gridSize * 3 / 4, obstacle.y * gridSize + gridSize / 4);
        ctx.lineTo(obstacle.x * gridSize + gridSize / 4, obstacle.y * gridSize + gridSize * 3 / 4);
        ctx.stroke();
    }
}

// Update UI elements
function updateUI() {
    scoreElement.textContent = score;
    levelElement.textContent = level;
    menuLevel.textContent = level; // Update hamburger level indicator
    lengthElement.textContent = snake.length;

    // Calculate speed based on level
    const speedValue = Math.max(50, initialSpeed - (level * 10));
    speedElement.textContent = (initialSpeed / speedValue).toFixed(1) + 'x';

    // Update game loop speed
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = setInterval(gameUpdate, speedValue);
    }
}

// Game over
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    finalScoreElement.textContent = score;
    gameOverScreen.style.display = 'flex';
}

// Keyboard input
function handleKeydown(e) {
    if (!gameRunning) return;

    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
}

// Mobile controls
function setupMobileControls() {
    document.querySelector('.mobile-btn.up').addEventListener('click', () => {
        if (gameRunning && direction !== 'down') nextDirection = 'up';
    });

    document.querySelector('.mobile-btn.down').addEventListener('click', () => {
        if (gameRunning && direction !== 'up') nextDirection = 'down';
    });

    document.querySelector('.mobile-btn.left').addEventListener('click', () => {
        if (gameRunning && direction !== 'right') nextDirection = 'left';
    });

    document.querySelector('.mobile-btn.right').addEventListener('click', () => {
        if (gameRunning && direction !== 'left') nextDirection = 'right';
    });
}

// Event listeners
startBtn.addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        if (!gameLoop) {
            gameLoop = setInterval(gameUpdate, initialSpeed);
            updateUI();
        }
        startBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
    }
});

pauseBtn.addEventListener('click', () => {
    if (gameRunning) {
        gameRunning = false;
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
    } else {
        gameRunning = true;
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    }
});

resetBtn.addEventListener('click', () => {
    clearInterval(gameLoop);
    gameLoop = null;
    gameRunning = false;
    initGame();
    draw();
    startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
    pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
});

restartBtn.addEventListener('click', () => {
    resetBtn.click();
    startBtn.click();
});

// Initialize game
window.addEventListener('load', () => {
    initGame();
    draw();
    document.addEventListener('keydown', handleKeydown);
    setupMobileControls();
});
