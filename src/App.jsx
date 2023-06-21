import { useEffect, useState, useRef } from 'react';
import soundPrincipal from '../public/sound-principal.mp3';
import useSound from 'use-sound';
import soundEating from '../public/sound-eating.mp3';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = 'up';
const COLORS = ['blue', 'green', 'purple', 'gold', 'yellow', 'red', 'violet', 'DarkTurquoise', 'pink', 'Coral', 'Plum', 'Lime', 'SeaGreen', 'Cyan', 'SteelBlue', 'MediumSlateBlue', 'Bisque', 'Wheat', 'DimGray'];
const SCORE_MULTIPLIERS = [2, 4, 6, 8, 10, 2, 4, 6, 8, 2, 4, 6, 8, 10, 2, 4, 6, 8, 10];
const SPEED_INCREMENT = 5;
const INITIAL_SPEED = 203;
const APPLE_DURATION = 2380;
const APPLE_INTERVAL = 40000;

const App = () => {
  const generateRandomApple = () => {
    const randomX = Math.floor(Math.random() * GRID_SIZE);
    const randomY = Math.floor(Math.random() * GRID_SIZE);
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    return { x: randomX, y: randomY, color: randomColor };
  };

  const [playEating] = useSound(soundEating, { volume: 10 });
  const audioRef = useRef(null);

  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [apple, setApple] = useState(generateRandomApple());
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [appleTimer, setAppleTimer] = useState(null);
  const [colorTimer, setColorTimer] = useState(null);

  const restartGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setApple(generateRandomApple());
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    clearInterval(appleTimer);
    clearInterval(colorTimer);
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.keyCode === 37 && direction !== 'right') {
        setDirection('left');
      } else if (event.keyCode === 38 && direction !== 'down') {
        setDirection('up');
      } else if (event.keyCode === 39 && direction !== 'left') {
        setDirection('right');
      } else if (event.keyCode === 40 && direction !== 'up') {
        setDirection('down');
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [direction]);

  useEffect(() => {
    const moveSnake = setInterval(() => {
      setSnake((prevSnake) => {
        const newSnake = [...prevSnake];
        const head = newSnake[0];
        let newHead;

        if (direction === 'up') {
          newHead = { x: head.x, y: (head.y - 1 + GRID_SIZE) % GRID_SIZE };
        } else if (direction === 'down') {
          newHead = { x: head.x, y: (head.y + 1) % GRID_SIZE };
        } else if (direction === 'left') {
          newHead = { x: (head.x - 1 + GRID_SIZE) % GRID_SIZE, y: head.y };
        } else if (direction === 'right') {
          newHead = { x: (head.x + 1) % GRID_SIZE, y: head.y };
        }

        newSnake.unshift(newHead);
        newSnake.pop();

        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          clearInterval(moveSnake);
          setGameOver(true);
          return newSnake; // Return the current snake without modifying it
        }

        if (newSnake.slice(1).some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          clearInterval(moveSnake);
          setGameOver(true);
        }

        return newSnake;
      });

    }, speed);

    return () => {
      clearInterval(moveSnake);
    };
  }, [direction, speed]);

  useEffect(() => {
    const checkCollision = () => {
      const head = snake[0];

      if (head.x === apple.x && head.y === apple.y) {
        setSnake((prevSnake) => {
          const newSnake = [...prevSnake];
          newSnake.push({});
          return newSnake;
        });

        const scoreMultiplier = SCORE_MULTIPLIERS[COLORS.indexOf(apple.color)];

        setScore((prevScore) => prevScore + scoreMultiplier);
        setApple(generateRandomApple());
        playEating();

        if (score % 20 === 0 && score !== 0) {
          setSpeed((prevSpeed) => Math.max(prevSpeed - SPEED_INCREMENT, 50));
        }
      }
    };

    const collisionInterval = setInterval(checkCollision, 100);

    return () => {
      clearInterval(collisionInterval);
    };
  }, [snake, apple, score]);

  useEffect(() => {
    const changeAppleColor = () => {
      setApple(generateRandomApple());
    };

    const appleInterval = setInterval(changeAppleColor, APPLE_INTERVAL);

    setColorTimer(appleInterval);

    return () => {
      clearInterval(appleInterval);
    };
  }, []);

  useEffect(() => {
    const resetAppleColor = () => {
      setApple(generateRandomApple());
    };

    const appleColorTimeout = setTimeout(resetAppleColor, APPLE_DURATION);

    setAppleTimer(appleColorTimeout);

    return () => {
      clearTimeout(appleColorTimeout);
    };
  }, [apple]);

  const handleButtonClick = (newDirection) => {
    setDirection(newDirection);
  };

  useEffect(() => {
    audioRef.current = new Audio(soundPrincipal);
    audioRef.current.volume = 1;
    audioRef.current.loop = true;
    audioRef.current.play();

    return () => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    };
  }, []);

  return (
    <div className="game-container">
      <h1>Snake Game</h1>
      <div className="grid">
        {Array.from({ length: GRID_SIZE }).map((_, rowIndex) => (
          <div key={rowIndex} className="row">
            {Array.from({ length: GRID_SIZE }).map((_, colIndex) => {
              const isSnakeHead = snake[0].x === colIndex && snake[0].y === rowIndex;
              const isSnakeBody = snake.some(
                (segment, index) =>
                  index > 0 && segment.x === colIndex && segment.y === rowIndex
              );
              const isApple = apple.x === colIndex && apple.y === rowIndex;
              const appleColor = isApple ? apple.color : 'red';

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`cell ${isSnakeHead ? 'snake-head' : ''} ${
                    isSnakeBody ? 'snake-body' : ''
                  } ${isApple ? 'apple' : ''}`}
                  style={isApple ? { backgroundColor: appleColor } : null}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="direction-buttons">
        <button onClick={() => handleButtonClick('up')}>↑</button>
        <button onClick={() => handleButtonClick('down')}>↓</button>
        <button onClick={() => handleButtonClick('left')}>←</button>
        <button onClick={() => handleButtonClick('right')}>→</button>
      </div>
      {gameOver && (
        <div className="game-over">
          <p>Game Over!</p>
          <p>Your Score: {score}</p>
          <button onClick={restartGame}>Play Again</button>
        </div>
      )}
      <div className="score">Score: {score}</div>
    </div>
  );
};

export default App;
