document.addEventListener("DOMContentLoaded", () => {
  const gameBoardElement = document.getElementById("game-board");
  const scoreElement = document.getElementById("score");
  const highScoreElement = document.getElementById("highScore");
  const gameOverModal = document.getElementById("game-over-modal");
  const gameStartModal = document.getElementById("game-start-modal");
  const finalScoreElement = document.getElementById("final-score");
  const restartBtn = document.getElementById("restart-btn");
  const startBtn = document.getElementById("start-btn");

  // On-screen controls
  const upBtn = document.getElementById("up-btn");
  const downBtn = document.getElementById("down-btn");
  const leftBtn = document.getElementById("left-btn");
  const rightBtn = document.getElementById("right-btn");

  // Game settings
  const width = 20;
  const height = 15;
  const initialSpeed = 200; // ms per update

  // Game state
  let snake,
    food,
    direction,
    score,
    highScore,
    gameInterval,
    speed,
    debounce,
    stair,
    treasure,
    nextLevel;
  let currentDirection; // Used to prevent 180-degree turns
  let lvlProgress;
  let showStair;

  const init = () => {
    // Initial snake position

    snake = [
      { x: 5, y: 7 },
      { x: 4, y: 7 },
      { x: 3, y: 7 },
    ];
    // Initial direction
    direction = { x: 1, y: 0 };
    currentDirection = "right";
    // Score
    score = 0;
    highScore = localStorage.getItem("snakeHighScore") || 0;
    scoreElement.textContent = score;
    highScoreElement.textContent = highScore;
    // initial State
    lvlProgress = 0;
    nextLevel = 1;
    showStair = false;
    stair = {};
    // Game speed
    speed = initialSpeed;

    // Place first food
    placeFood();

    // Hide game over screen
    gameOverModal.classList.add("hidden");
    gameStartModal.classList.add("hidden");

    // Start game loop
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, speed);
  };

  const verifyEmptySpace = (x, y) => {
    return (
      snake.some((segment) => segment.x === x && segment.y === y) ||
      (food?.x === x && food?.y === y) ||
      (treasure?.x === x && treasure?.y === y)
    );
  };

  const placeFood = () => {
    let foodPosition = { x: 0, y: 0 };
    do {
      foodPosition.x = Math.floor(Math.random() * width);
      foodPosition.y = Math.floor(Math.random() * height);
    } while (verifyEmptySpace(foodPosition.x, foodPosition.y));

    food = foodPosition;
  };

  const placeTreasure = () => {
    let treasurePosistion = { x: 0, y: 0 };
    do {
      treasurePosistion.x = Math.floor(Math.random() * width);
      treasurePosistion.y = Math.floor(Math.random() * height);
    } while (verifyEmptySpace(treasurePosistion.x, treasurePosistion.ys));
    treasure = treasurePosistion;
  };

  const placeStair = () => {
    let stairPosition = { x: 0, y: 0 };
    do {
      stairPosition.x = Math.floor(Math.random() * width);
      stairPosition.y = Math.floor(Math.random() * height);
    } while (verifyEmptySpace(stairPosition.x, stairPosition.y));
    stair = stairPosition;
  };

  const render = () => {
    let screen = "";
    // Top wall
    screen += "+" + "-".repeat(width) + "+\n";

    for (let y = 0; y < height; y++) {
      screen += "|"; // Left wall
      for (let x = 0; x < width; x++) {
        const isSnakeHead = snake[0].x === x && snake[0].y === y;
        const isSnakeBody = snake
          .slice(1)
          .some((segment) => segment.x === x && segment.y === y);
        const isFood = food.x === x && food.y === y;
        const isStair = stair.x === x && stair.y === y;
        const isTreasure = treasure?.x === x && treasure?.y === y;

        if (isSnakeHead) {
          screen += "@";
        } else if (isSnakeBody) {
          screen += "#";
        } else if (isFood && !showStair) {
          screen += "*";
        } else if (isStair && showStair) {
          screen += ">";
        } else if (isTreasure) {
          screen += "$";
        } else {
          screen += " ";
        }
      }
      screen += "|\n"; // Right wall
    }

    // Bottom wall
    screen += "+" + "-".repeat(width) + "+";
    gameBoardElement.textContent = screen;
  };

  const moveSnake = () => {
    const head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y,
    };
    debounce = false;
    snake.unshift(head);

    // Check for food collision
    if (checkItemCollision(food) && !showStair) {
      score++;
      scoreElement.textContent = score;
      // Progress level progress
      lvlProgress += 1;
      if (lvlProgress < nextLevel) {
        placeFood();
      } else {
        // End of level -- show stair, treasure, and powerups.
        showStair = true;
        placeStair();
        placeTreasure();
      }

      // Increase speed slightly
      speed = Math.max(50, speed * 0.98);
      clearInterval(gameInterval);
      gameInterval = setInterval(gameLoop, speed);
    } else if (checkItemCollision(stair) && showStair) {
      // Check for stair collision -- Adance level.
      showStair = false;
      nextLevel += 1;
      snake = snake.map((segment, index) => {
        if (index < 3) {
          return { x: 5 - index, y: 7 };
        } else {
          return { x: 3, y: 7 };
        }
      });
      direction = { x: 1, y: 0 };
      currentDirection = "right";

      placeFood();
    } else if (checkItemCollision(treasure)) {
      score++;
      scoreElement.textContent = score;
      treasure = null;
    } else {
      snake.pop();
    }
  };

  const checkItemCollision = (item) => {
    const { x, y } = snake[0];
    return item?.x === x && item?.y === y;
  };

  const checkCollision = () => {
    const head = snake[0];

    // Wall collision
    if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height) {
      return true;
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        return true;
      }
    }
    return false;
  };

  const gameOver = () => {
    clearInterval(gameInterval);
    finalScoreElement.textContent = score;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("snakeHighScore", highScore);
      highScoreElement.textContent = highScore;
    }
    gameOverModal.classList.remove("hidden");
  };

  const gameLoop = () => {
    moveSnake();
    if (checkCollision()) {
      gameOver();
      return;
    }
    render();
  };

  const handleKeyPress = (e) => {
    switch (e.key) {
      case "ArrowUp":
        if (currentDirection !== "down" && !debounce) {
          direction = { x: 0, y: -1 };
          currentDirection = "up";
        }
        break;
      case "ArrowDown":
        if (currentDirection !== "up" && !debounce) {
          direction = { x: 0, y: 1 };
          currentDirection = "down";
        }
        break;
      case "ArrowLeft":
        if (currentDirection !== "right" && !debounce) {
          direction = { x: -1, y: 0 };
          currentDirection = "left";
        }
        break;
      case "ArrowRight":
        if (currentDirection !== "left" && !debounce) {
          direction = { x: 1, y: 0 };
          currentDirection = "right";
        }
        break;
    }
    debounce = true;
  };

  // Event Listeners
  document.addEventListener("keydown", handleKeyPress);
  restartBtn.addEventListener("click", init);
  startBtn.addEventListener("click", init);

  // On-screen button listeners
  upBtn.addEventListener("click", () => {
    if (currentDirection !== "down") {
      direction = { x: 0, y: -1 };
      currentDirection = "up";
    }
  });
  downBtn.addEventListener("click", () => {
    if (currentDirection !== "up") {
      direction = { x: 0, y: 1 };
      currentDirection = "down";
    }
  });
  leftBtn.addEventListener("click", () => {
    if (currentDirection !== "right") {
      direction = { x: -1, y: 0 };
      currentDirection = "left";
    }
  });
  rightBtn.addEventListener("click", () => {
    if (currentDirection !== "left") {
      direction = { x: 1, y: 0 };
      currentDirection = "right";
    }
  });

  // Initial game start
  //   init();
});
