document.addEventListener("DOMContentLoaded", () => {
  const gameBoardElement = document.getElementById("game-board");
  const scoreElement = document.getElementById("score");
  const highScoreElement = document.getElementById("highScore");
  const gameOverModal = document.getElementById("game-over-modal");
  const gameStartModal = document.getElementById("game-start-modal");
  const finalScoreElement = document.getElementById("final-score");
  const restartBtn = document.getElementById("restart-btn");
  const startBtn = document.getElementById("start-btn");

  const message = document.getElementById("game-message");

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
    stair,
    treasure,
    potion,
    level,
    nextLevel,
    levelLength,
    multiplier,
    messageTimeout;
  let currentDirection; // Used to prevent 180-degree turns
  let lvlProgress;
  let showStair;

  let moveBuffer = [];

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
    multiplier = 1;
    highScore = localStorage.getItem("snakeHighScore") || 0;
    scoreElement.textContent = score;
    highScoreElement.textContent = highScore;
    // initial State
    level = 1;
    lvlProgress = 0;
    levelLength = 5;
    nextLevel = levelLength;
    showStair = false;
    stair = {};
    potion = null;
    treasure = [];
    moveBuffer = [];
    // Game speed
    speed = initialSpeed;

    // Place first food
    placeFood();

    // Hide game over screens
    gameOverModal.classList.add("hidden");
    gameStartModal.classList.add("hidden");

    // Start game loop
    printMessage("Level 1");
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
    } while (verifyEmptySpace(treasurePosistion.x, treasurePosistion.y));
    // treasure = treasurePosistion;
    treasure.push(treasurePosistion);
  };

  const placeStair = () => {
    let stairPosition = { x: 0, y: 0 };
    do {
      stairPosition.x = Math.floor(Math.random() * width);
      stairPosition.y = Math.floor(Math.random() * height);
    } while (verifyEmptySpace(stairPosition.x, stairPosition.y));
    stair = stairPosition;
  };

  const placePotion = () => {
    let potionPosition = { x: 0, y: 0 };
    do {
      potionPosition.x = Math.floor(Math.random() * width);
      potionPosition.y = Math.floor(Math.random() * height);
    } while (verifyEmptySpace(potionPosition.x, potionPosition.y));
    potion = potionPosition;
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
        // const isTreasure = treasure?.x === x && treasure?.y === y;\
        const isTreasure = treasure.some((t) => t?.x === x && t?.y === y);
        const isPotion = potion?.x === x && potion?.y === y;

        if (isSnakeHead) {
          screen += '<span class="text-emerald-400">@</span>';
        } else if (isSnakeBody) {
          screen += '<span class="text-emerald-200">#</span>';
        } else if (isFood && !showStair) {
          screen += '<span class="text-orange-400">*</span>';
        } else if (isStair && showStair) {
          screen += ">";
        } else if (isTreasure) {
          screen += '<span class="text-yellow-300">$</span>';
        } else if (isPotion) {
          screen += '<span class="text-purple-500">!</span>';
        } else {
          screen += " ";
        }
      }
      screen += "|\n"; // Right wall
    }

    // Bottom wall
    screen += "+" + "-".repeat(width) + "+";
    gameBoardElement.innerHTML = screen;
  };

  const moveSnake = () => {
    direction = moveBuffer.shift() || direction;
    const head = {
      x: snake[0].x + direction?.x,
      y: snake[0].y + direction?.y,
    };
    snake.unshift(head);

    // Check for food collision
    if (checkItemCollision(food) && !showStair) {
      score += multiplier;
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
        placePotion();
      }

      // Increase speed slightly
      speed = Math.max(50, speed * 0.98);
      clearInterval(gameInterval);
      gameInterval = setInterval(gameLoop, speed);
    } else if (checkItemCollision(stair) && showStair) {
      // Check for stair collision -- Advance level.
      showStair = false;
      potion = null;
      treasure = [];
      level++;
      nextLevel += levelLength;
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
      printMessage(`Level ${level}`);
    } else if (checkTreasureCollision()) {
      score += multiplier;
      scoreElement.textContent = score;
      snake.pop();
    } else if (checkItemCollision(potion)) {
      const num = getRandomInt(1, 3);
      potion = null;
      switch (num) {
        case 1:
          multiplier += 1;
          speed = Math.max(50, speed * 0.98);
          printMessage(`Speed Potion: Multiplier x${multiplier}`);
          break;
        case 2:
          printMessage(`Shrinking Potion`);
          snake = snake.slice(0, snake.length - 5);
          break;
        case 3:
          printMessage(`Wealth Potion`);
          placeTreasure();
          placeTreasure();
          placeTreasure();
          break;
      }
    } else {
      snake.pop();
    }
  };

  const checkItemCollision = (item) => {
    const { x, y } = snake[0];
    return item?.x === x && item?.y === y;
  };

  const checkTreasureCollision = () => {
    let isCollision = false;
    treasure.forEach((item, index) => {
      if (checkItemCollision(item)) {
        treasure.splice(index, 1);
        isCollision = true;
      }
    });
    return isCollision;
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

  const printMessage = (msg) => {
    clearTimeout(messageTimeout);
    message.innerText = msg;
    messageTimeout = setTimeout(() => {
      message.innerText = "";
    }, 5000);
  };
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max) + 1;
    return Math.floor(Math.random() * (max - min)) + min;
  }

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
    let newDirection;
    switch (e.key) {
      case "ArrowUp":
        if (currentDirection !== "down") {
          newDirection = { x: 0, y: -1 };
          currentDirection = "up";
        }
        break;
      case "ArrowDown":
        if (currentDirection !== "up") {
          newDirection = { x: 0, y: 1 };
          currentDirection = "down";
        }
        break;
      case "ArrowLeft":
        if (currentDirection !== "right") {
          newDirection = { x: -1, y: 0 };
          currentDirection = "left";
        }
        break;
      case "ArrowRight":
        if (currentDirection !== "left") {
          newDirection = { x: 1, y: 0 };
          currentDirection = "right";
        }
        break;
    }

    moveBuffer.push(newDirection);
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
