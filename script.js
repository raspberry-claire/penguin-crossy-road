// Game constants
const BLOCK_SIZE = 40;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GAME_SPEED = 50; // milliseconds between updates
const EAGLE_SPAWN_TIME = 8000; // milliseconds before eagle appears

// Game states
const GAME_STATE = {
    PLAYING: 'playing',
    GAME_OVER: 'gameOver'
};

// Directions
const DIRECTION = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
    NONE: { x: 0, y: 0 }
};

class Penguin {
    constructor() {
        this.x = Math.floor(CANVAS_WIDTH / 2 / BLOCK_SIZE);
        this.y = Math.floor((CANVAS_HEIGHT - 2 * BLOCK_SIZE) / BLOCK_SIZE);
        this.nextX = this.x;
        this.nextY = this.y;
        this.direction = DIRECTION.NONE;
    }

    move(direction) {
        if (direction === DIRECTION.NONE) return;
        
        this.nextX = this.x + direction.x;
        this.nextY = this.y + direction.y;

        // Boundary checking
        if (this.nextX < 0) this.nextX = 0;
        if (this.nextX >= CANVAS_WIDTH / BLOCK_SIZE) this.nextX = (CANVAS_WIDTH / BLOCK_SIZE) - 1;
        if (this.nextY < 0) this.nextY = 0;
        if (this.nextY >= CANVAS_HEIGHT / BLOCK_SIZE) this.nextY = (CANVAS_HEIGHT / BLOCK_SIZE) - 1;
    }

    update() {
        this.x = this.nextX;
        this.y = this.nextY;
    }

    draw(ctx) {
        // Draw blocky penguin
        const px = this.x * BLOCK_SIZE;
        const py = this.y * BLOCK_SIZE;

        // Body (black)
        ctx.fillStyle = '#000000';
        ctx.fillRect(px + 5, py + 5, BLOCK_SIZE - 10, BLOCK_SIZE - 10);

        // Belly (white)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(px + 10, py + 12, BLOCK_SIZE - 20, BLOCK_SIZE - 20);

        // Eyes (white)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(px + 12, py + 10, 5, 5);
        ctx.fillRect(px + 23, py + 10, 5, 5);

        // Pupils (black)
        ctx.fillStyle = '#000000';
        ctx.fillRect(px + 13, py + 11, 3, 3);
        ctx.fillRect(px + 24, py + 11, 3, 3);

        // Beak (orange)
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(px + 16, py + 22, 8, 4);
    }
}

class Car {
    constructor(y, direction, speed = 2) {
        this.y = y;
        this.direction = direction; // 1 for right, -1 for left
        this.speed = speed;
        this.x = direction === 1 ? -2 : CANVAS_WIDTH / BLOCK_SIZE + 2;
        this.width = 2;
    }

    update() {
        this.x += this.direction * this.speed * 0.05;
    }

    draw(ctx) {
        const px = this.x * BLOCK_SIZE;
        const py = this.y * BLOCK_SIZE;

        // Car body (red)
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(px, py + 5, this.width * BLOCK_SIZE, BLOCK_SIZE - 10);

        // Windows (light blue)
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(px + 3, py + 10, 10, 8);
        ctx.fillRect(px + 15, py + 10, 10, 8);
    }

    isOffScreen() {
        return (this.direction === 1 && this.x > CANVAS_WIDTH / BLOCK_SIZE + 2) ||
               (this.direction === -1 && this.x < -2);
    }
}

class Train {
    constructor(y) {
        this.y = y;
        this.x = -5;
        this.speed = 0.08;
        this.width = 6;
        this.warningActive = false;
        this.warningStartTime = null;
    }

    update() {
        this.x += this.speed;
    }

    draw(ctx) {
        const px = this.x * BLOCK_SIZE;
        const py = this.y * BLOCK_SIZE;

        // Train cars (dark gray)
        ctx.fillStyle = '#333333';
        for (let i = 0; i < this.width; i++) {
            ctx.fillRect(px + i * BLOCK_SIZE, py + 5, BLOCK_SIZE - 2, BLOCK_SIZE - 10);
            
            // Windows (yellow)
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(px + i * BLOCK_SIZE + 5, py + 10, 8, 8);
            ctx.fillRect(px + i * BLOCK_SIZE + 20, py + 10, 8, 8);
            ctx.fillStyle = '#333333';
        }
    }

    isOffScreen() {
        return this.x > CANVAS_WIDTH / BLOCK_SIZE + 5;
    }
}

class IceChunk {
    constructor(y, direction, speed = 1.5) {
        this.y = y;
        this.direction = direction; // 1 for right, -1 for left
        this.speed = speed;
        this.x = direction === 1 ? -1 : CANVAS_WIDTH / BLOCK_SIZE + 1;
        this.width = 1.5;
    }

    update() {
        this.x += this.direction * this.speed * 0.05;
    }

    draw(ctx) {
        const px = this.x * BLOCK_SIZE;
        const py = this.y * BLOCK_SIZE;

        // Ice chunk (light blue)
        ctx.fillStyle = '#B0E0E6';
        ctx.fillRect(px, py + 5, this.width * BLOCK_SIZE, BLOCK_SIZE - 10);

        // Frost effect
        ctx.strokeStyle = '#E0FFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 2, py + 7, this.width * BLOCK_SIZE - 4, BLOCK_SIZE - 14);
    }

    isOffScreen() {
        return (this.direction === 1 && this.x > CANVAS_WIDTH / BLOCK_SIZE + 1) ||
               (this.direction === -1 && this.x < -1);
    }
}

class Seal {
    constructor(y, direction, speed = 0.8) {
        this.y = y;
        this.direction = direction;
        this.speed = speed;
        this.x = direction === 1 ? -1 : CANVAS_WIDTH / BLOCK_SIZE + 1;
    }

    update() {
        this.x += this.direction * this.speed * 0.05;
    }

    draw(ctx) {
        const px = this.x * BLOCK_SIZE;
        const py = this.y * BLOCK_SIZE;

        // Seal body (gray)
        ctx.fillStyle = '#808080';
        ctx.beginPath();
        ctx.ellipse(px + BLOCK_SIZE / 2, py + BLOCK_SIZE / 2, BLOCK_SIZE / 2.5, BLOCK_SIZE / 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head (darker gray)
        ctx.fillStyle = '#606060';
        ctx.beginPath();
        ctx.ellipse(px + BLOCK_SIZE / 2.5, py + BLOCK_SIZE / 3, BLOCK_SIZE / 4, BLOCK_SIZE / 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (white)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(px + BLOCK_SIZE / 4, py + BLOCK_SIZE / 4, 4, 4);
        ctx.fillRect(px + BLOCK_SIZE / 2 + 2, py + BLOCK_SIZE / 4, 4, 4);

        // Pupils
        ctx.fillStyle = '#000000';
        ctx.fillRect(px + BLOCK_SIZE / 4 + 1, py + BLOCK_SIZE / 4 + 1, 2, 2);
        ctx.fillRect(px + BLOCK_SIZE / 2 + 3, py + BLOCK_SIZE / 4 + 1, 2, 2);
    }

    isOffScreen() {
        return (this.direction === 1 && this.x > CANVAS_WIDTH / BLOCK_SIZE + 1) ||
               (this.direction === -1 && this.x < -1);
    }
}

class Obstacle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'rock' or 'tree'
    }

    draw(ctx) {
        const px = this.x * BLOCK_SIZE;
        const py = this.y * BLOCK_SIZE;

        if (this.type === 'rock') {
            // Rock (gray with snow)
            ctx.fillStyle = '#A9A9A9';
            ctx.fillRect(px + 8, py + 10, BLOCK_SIZE - 16, BLOCK_SIZE - 20);
            
            // Snow on top
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(px + 8, py + 8, BLOCK_SIZE - 16, 4);
        } else if (this.type === 'tree') {
            // Tree trunk (brown)
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(px + 14, py + 20, BLOCK_SIZE - 28, BLOCK_SIZE - 20);

            // Tree (green with snow)
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.moveTo(px + BLOCK_SIZE / 2, py + 5);
            ctx.lineTo(px + 8, py + 20);
            ctx.lineTo(px + BLOCK_SIZE - 8, py + 20);
            ctx.closePath();
            ctx.fill();

            // Snow on tree
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.moveTo(px + BLOCK_SIZE / 2, py + 7);
            ctx.lineTo(px + 12, py + 18);
            ctx.lineTo(px + BLOCK_SIZE - 12, py + 18);
            ctx.closePath();
            ctx.fill();
        }
    }
}

class Eagle {
    constructor() {
        this.x = CANVAS_WIDTH / 2;
        this.y = -50;
        this.speed = 2;
        this.width = 60;
        this.height = 40;
        this.diving = false;
        this.diveTarget = null;
    }

    update(penguinX, penguinY) {
        if (!this.diving) {
            this.y += this.speed;
        } else {
            // Dive towards penguin
            if (this.diveTarget) {
                const targetX = this.diveTarget.x * BLOCK_SIZE + BLOCK_SIZE / 2;
                const targetY = this.diveTarget.y * BLOCK_SIZE + BLOCK_SIZE / 2;
                
                const dx = targetX - this.x;
                const dy = targetY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 5) {
                    this.x += (dx / distance) * this.speed * 2;
                    this.y += (dy / distance) * this.speed * 2;
                }
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Eagle body (brown)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-10, -5, 20, 15);

        // Head (darker brown)
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.ellipse(8, -3, 8, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye (yellow)
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(12, -5, 4, 4);

        // Beak (orange)
        ctx.fillStyle = '#FF8C00';
        ctx.fillRect(16, -3, 5, 3);

        // Wings (brown)
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.ellipse(-15, 2, 15, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(15, 2, 15, 8, 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    isCollidingWith(penguin) {
        const eagleLeft = this.x - this.width / 2;
        const eagleRight = this.x + this.width / 2;
        const eagleTop = this.y;
        const eagleBottom = this.y + this.height;

        const penguinLeft = penguin.x * BLOCK_SIZE;
        const penguinRight = (penguin.x + 1) * BLOCK_SIZE;
        const penguinTop = penguin.y * BLOCK_SIZE;
        const penguinBottom = (penguin.y + 1) * BLOCK_SIZE;

        return !(eagleRight < penguinLeft || eagleLeft > penguinRight ||
                 eagleBottom < penguinTop || eagleTop > penguinBottom);
    }
}

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        this.penguin = new Penguin();
        this.cars = [];
        this.trains = [];
        this.iceChunks = [];
        this.seals = [];
        this.obstacles = [];
        this.eagle = null;

        this.score = 0;
        this.maxScore = 0;
        this.gameState = GAME_STATE.PLAYING;
        this.gameStartTime = Date.now();
        this.eagleSpawned = false;

        this.nextDirection = DIRECTION.NONE;
        this.pendingForwardMove = false;

        this.spawnDistance = 0;
        this.cameraY = 0;

        this.setupControls();
        this.initializeGame();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (this.gameState !== GAME_STATE.PLAYING) return;

            switch (e.key) {
                case 'ArrowUp':
                    this.penguin.move(DIRECTION.UP);
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    this.penguin.move(DIRECTION.DOWN);
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    this.penguin.move(DIRECTION.LEFT);
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    this.penguin.move(DIRECTION.RIGHT);
                    e.preventDefault();
                    break;
                case ' ':
                    this.penguin.move(DIRECTION.UP);
                    e.preventDefault();
                    break;
            }
        });

        // Mobile touch controls
        let touchStartX = 0;
        let touchStartY = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            if (this.gameState !== GAME_STATE.PLAYING) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.canvas.addEventListener('touchend', (e) => {
            if (this.gameState !== GAME_STATE.PLAYING) return;
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            const threshold = 30;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > threshold) {
                    this.penguin.move(DIRECTION.RIGHT);
                } else if (diffX < -threshold) {
                    this.penguin.move(DIRECTION.LEFT);
                }
            } else {
                if (diffY > threshold) {
                    this.penguin.move(DIRECTION.DOWN);
                } else if (diffY < -threshold) {
                    this.penguin.move(DIRECTION.UP);
                }
            }
        });

        // Tap for forward movement
        this.canvas.addEventListener('click', (e) => {
            if (this.gameState !== GAME_STATE.PLAYING) return;
            this.penguin.move(DIRECTION.UP);
        });
    }

    initializeGame() {
        // Generate initial terrain
        for (let y = 0; y < Math.ceil(CANVAS_HEIGHT / BLOCK_SIZE); y++) {
            this.generateRow(y);
        }
    }

    generateRow(y) {
        const rand = Math.random();

        if (rand < 0.2) {
            // Road with cars
            const direction = Math.random() > 0.5 ? 1 : -1;
            const speed = 1 + Math.random() * 1.5;
            const carCount = 2 + Math.floor(Math.random() * 2);
            for (let i = 0; i < carCount; i++) {
                const car = new Car(y, direction, speed);
                car.x = i * 3 * direction;
                this.cars.push(car);
            }
        } else if (rand < 0.35) {
            // River with ice chunks
            const direction = Math.random() > 0.5 ? 1 : -1;
            const speed = 1 + Math.random();
            const iceCount = 2 + Math.floor(Math.random() * 2);
            for (let i = 0; i < iceCount; i++) {
                const ice = new IceChunk(y, direction, speed);
                ice.x = i * 3 * direction;
                this.iceChunks.push(ice);
            }

            // Occasionally add seals
            if (Math.random() < 0.4) {
                const seal = new Seal(y, direction, speed * 0.5);
                seal.x = Math.random() * (CANVAS_WIDTH / BLOCK_SIZE);
                this.seals.push(seal);
            }
        } else if (rand < 0.45) {
            // Train tracks with train
            if (Math.random() < 0.3) {
                this.trains.push(new Train(y));
            }
        } else if (rand < 0.65) {
            // Natural obstacles
            for (let x = 0; x < CANVAS_WIDTH / BLOCK_SIZE; x++) {
                if (Math.random() < 0.15) {
                    const type = Math.random() > 0.5 ? 'rock' : 'tree';
                    this.obstacles.push(new Obstacle(x, y, type));
                }
            }
        }
        // Else: safe terrain
    }

    update() {
        if (this.gameState !== GAME_STATE.PLAYING) return;

        // Update penguin
        this.penguin.update();

        // Update score based on forward movement
        const newScore = Math.max(0, Math.floor(CANVAS_HEIGHT / 2 / BLOCK_SIZE - this.penguin.y));
        if (newScore > this.score) {
            this.score = newScore;
            if (this.score > this.maxScore) {
                this.maxScore = this.score;
            }
        }

        // Update camera
        this.cameraY = Math.max(0, this.penguin.y - 4);

        // Spawn eagle if time exceeded
        if (!this.eagleSpawned && Date.now() - this.gameStartTime > EAGLE_SPAWN_TIME) {
            this.eagleSpawned = true;
            this.eagle = new Eagle();
            this.eagle.diveTarget = { x: this.penguin.x, y: this.penguin.y };
        }

        // Update cars
        this.cars.forEach(car => car.update());
        this.cars = this.cars.filter(car => !car.isOffScreen());

        // Update trains
        this.trains.forEach(train => train.update());
        this.trains = this.trains.filter(train => !train.isOffScreen());

        // Update ice chunks
        this.iceChunks.forEach(ice => ice.update());
        this.iceChunks = this.iceChunks.filter(ice => !ice.isOffScreen());

        // Update seals
        this.seals.forEach(seal => seal.update());
        this.seals = this.seals.filter(seal => !seal.isOffScreen());

        // Update eagle
        if (this.eagle) {
            this.eagle.update(this.penguin.x, this.penguin.y);
            if (this.eagle.isCollidingWith(this.penguin)) {
                this.endGame();
            }
        }

        // Generate new rows as penguin moves
        if (this.penguin.y < 5) {
            for (let i = 0; i < 5; i++) {
                this.generateRow(-5 + i);
            }
        }

        // Collision detection
        this.checkCollisions();

        // Update UI
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.maxScore;
    }

    checkCollisions() {
        const px = this.penguin.x;
        const py = this.penguin.y;

        // Check car collisions
        for (let car of this.cars) {
            const carX = car.x;
            if (py === car.y && px >= Math.floor(carX) && px < Math.floor(carX) + car.width) {
                this.endGame();
                return;
            }
        }

        // Check train collisions
        for (let train of this.trains) {
            const trainX = train.x;
            if (py === train.y && px >= Math.floor(trainX) && px < Math.floor(trainX) + train.width) {
                this.endGame();
                return;
            }
        }

        // Check if in water (river without ice)
        let onIce = false;
        for (let ice of this.iceChunks) {
            if (py === ice.y && px >= Math.floor(ice.x) && px < Math.floor(ice.x) + ice.width) {
                onIce = true;
                break;
            }
        }

        // Check for river without ice
        const isRiver = this.iceChunks.some(ice => ice.y === py) || this.seals.some(seal => seal.y === py);
        if (isRiver && !onIce) {
            this.endGame();
            return;
        }

        // Check seal collisions
        for (let seal of this.seals) {
            if (py === seal.y && Math.abs(px - seal.x) < 1.5) {
                this.endGame();
                return;
            }
        }

        // Check natural obstacle collisions
        for (let obstacle of this.obstacles) {
            if (px === obstacle.x && py === obstacle.y) {
                this.endGame();
                return;
            }
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw ground/snow
        this.ctx.fillStyle = '#E8F4F8';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        this.ctx.save();

        // Draw game elements
        this.penguin.draw(this.ctx);

        this.cars.forEach(car => car.draw(this.ctx));
        this.trains.forEach(train => train.draw(this.ctx));
        this.iceChunks.forEach(ice => ice.draw(this.ctx));
        this.seals.forEach(seal => seal.draw(this.ctx));
        this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));

        if (this.eagle) {
            this.eagle.draw(this.ctx);
        }

        // Draw danger warning if eagle is near
        if (this.eagle && this.eagle.y < CANVAS_HEIGHT - 100) {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
            this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            this.ctx.fillStyle = '#FF0000';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('⚠️ EAGLE INCOMING! ⚠️', CANVAS_WIDTH / 2, 30);
        }

        this.ctx.restore();
    }

    endGame() {
        this.gameState = GAME_STATE.GAME_OVER;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverHighScore').textContent = this.maxScore;
        document.getElementById('gameOverScreen').classList.add('show');
    }

    restart() {
        this.penguin = new Penguin();
        this.cars = [];
        this.trains = [];
        this.iceChunks = [];
        this.seals = [];
        this.obstacles = [];
        this.eagle = null;

        this.score = 0;
        this.gameState = GAME_STATE.PLAYING;
        this.gameStartTime = Date.now();
        this.eagleSpawned = false;

        this.spawnDistance = 0;
        this.cameraY = 0;

        document.getElementById('gameOverScreen').classList.remove('show');

        this.initializeGame();
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game
let game;
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas);
    game.gameLoop();

    document.getElementById('restartBtn').addEventListener('click', () => {
        game.restart();
    });
});
