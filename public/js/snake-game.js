document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    const gridWidth = canvas.width / gridSize;
    const gridHeight = canvas.height / gridSize;
    
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let gameRunning = false;
    let gameLoop;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gamePaused = false;
    
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    
    highScoreElement.textContent = highScore;
    
    function initGame() {
        snake = [
            {x: 5, y: 10},
            {x: 4, y: 10},
            {x: 3, y: 10}
        ];
        generateFood();
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        scoreElement.textContent = score;
        draw();
    }
    
    function generateFood() {
        let foodX, foodY;
        let foodOnSnake;
        
        do {
            foodOnSnake = false;
            foodX = Math.floor(Math.random() * gridWidth);
            foodY = Math.floor(Math.random() * gridHeight);
            
            for (let segment of snake) {
                if (segment.x === foodX && segment.y === foodY) {
                    foodOnSnake = true;
                    break;
                }
            }
        } while (foodOnSnake);
        
        food = {x: foodX, y: foodY};
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        snake.forEach((segment, index) => {
            if (index === 0) {
                ctx.fillStyle = '#2E8B57';
            } else {
                ctx.fillStyle = '#3CB371';
            }
            
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
            
            if (index === 0) {
                ctx.fillStyle = 'white';
                if (direction === 'right' || direction === 'left') {
                    const eyeY = segment.y * gridSize + gridSize / 3;
                    const eyeSize = gridSize / 5;
                    ctx.fillRect(segment.x * gridSize + (direction === 'right' ? gridSize / 2 : gridSize / 4), 
                                eyeY, eyeSize, eyeSize);
                    ctx.fillRect(segment.x * gridSize + (direction === 'right' ? gridSize * 3/4 : gridSize / 2), 
                                eyeY, eyeSize, eyeSize);
                } else {
                    const eyeX = segment.x * gridSize + gridSize / 3;
                    const eyeSize = gridSize / 5;
                    ctx.fillRect(eyeX, segment.y * gridSize + (direction === 'down' ? gridSize / 2 : gridSize / 4), 
                                eyeSize, eyeSize);
                    ctx.fillRect(eyeX + gridSize / 3, segment.y * gridSize + (direction === 'down' ? gridSize / 2 : gridSize / 4), 
                                eyeSize, eyeSize);
                }
            }
        });
        
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        const centerX = food.x * gridSize + gridSize / 2;
        const centerY = food.y * gridSize + gridSize / 2;
        const radius = gridSize / 2 - 1;
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(centerX - radius / 3, centerY - radius / 3, radius / 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    function update() {
        direction = nextDirection;
        const head = {x: snake[0].x, y: snake[0].y};
        
        switch (direction) {
            case 'up': head.y -= 1; break;
            case 'down': head.y += 1; break;
            case 'left': head.x -= 1; break;
            case 'right': head.x += 1; break;
        }
        
        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
            gameOver();
            return;
        }
        
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === head.x && snake[i].y === head.y) {
                gameOver();
                return;
            }
        }
        
        snake.unshift(head);
        
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreElement.textContent = score;
            
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            generateFood();
        } else {
            snake.pop();
        }
        
        draw();
    }
    
    function gameOver() {
        clearInterval(gameLoop);
        gameRunning = false;
        startBtn.textContent = '重新开始';
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2 - 30);
        
        ctx.font = '20px Arial';
        ctx.fillText(`最终得分: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
    }
    
    function startGame() {
        if (!gameRunning) {
            initGame();
            gameRunning = true;
            gamePaused = false;
            startBtn.textContent = '重新开始';
            pauseBtn.textContent = '暂停';
            gameLoop = setInterval(update, 150);
        } else {
            clearInterval(gameLoop);
            initGame();
            gameLoop = setInterval(update, 150);
        }
    }
    
    function togglePause() {
        if (!gameRunning) return;
        
        if (gamePaused) {
            gameLoop = setInterval(update, 150);
            gamePaused = false;
            pauseBtn.textContent = '暂停';
        } else {
            clearInterval(gameLoop);
            gamePaused = true;
            pauseBtn.textContent = '继续';
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.font = '30px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText('游戏暂停', canvas.width / 2, canvas.height / 2);
        }
    }
    
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    
    document.addEventListener('keydown', (e) => {
        if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
        
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
            case ' ':
                if (gameRunning) togglePause();
                else startGame();
                break;
        }
    });
    
    upBtn.addEventListener('click', () => {
        if (direction !== 'down') nextDirection = 'up';
    });
    
    downBtn.addEventListener('click', () => {
        if (direction !== 'up') nextDirection = 'down';
    });
    
    leftBtn.addEventListener('click', () => {
        if (direction !== 'right') nextDirection = 'left';
    });
    
    rightBtn.addEventListener('click', () => {
        if (direction !== 'left') nextDirection = 'right';
    });
    
    initGame();
});