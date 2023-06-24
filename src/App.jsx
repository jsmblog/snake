import { useEffect, useState } from 'react';
import soundPrincipal from '/sound-principal.mp3';
import useSound from 'use-sound';
import soundEating from '/sound-eating.mp3';
import arrow from '../src/img/arrow.png';
import soundExplosion from '/explosion.mp3';


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
const APPLE_DURATION = 2400;
const APPLE_INTERVAL = 40000;

const App = () => {
  const generateRandomApple = () => {
    const randomX = Math.floor(Math.random() * GRID_SIZE);
    const randomY = Math.floor(Math.random() * GRID_SIZE);
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    return { x: randomX, y: randomY, color: randomColor };
  };

  const [playEating] = useSound(soundEating, { volume: 10 });
  const [playPrincipal, { stop }] = useSound(soundPrincipal, { volume: 1, loop: true });
  const [bombs, setBombs] = useState([]);
  const [playExplosion] = useSound(soundExplosion, { volume: 1 });
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

  const generateRandomBomb = () => {
    const randomX = Math.floor(Math.random() * GRID_SIZE);
    const randomY = Math.floor(Math.random() * GRID_SIZE);
    return { x: randomX, y: randomY };
  };
  useEffect(() => {
    const bombInterval = setInterval(() => {
      const newBombs = [];
      for (let i = 0; i < 5; i++) {
        newBombs.push(generateRandomBomb());
      }
      setBombs(newBombs);
    }, 60000);
  
    return () => {
      clearInterval(bombInterval);
    };
  }, []);
    

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
          newHead.y >= GRID_SIZE ||
          bombs.some((bomb) => bomb.x === newHead.x && bomb.y === newHead.y)
        ) {
          clearInterval(moveSnake);
          setGameOver(true);
          playExplosion(); // Reproducir el efecto de sonido de explosión
          return newSnake; // Devolver la serpiente actual sin modificarla
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

  useEffect(() => {
    playPrincipal();

    return () => {
      stop();
    };
  }, [playPrincipal, stop]);

  const handleButtonClick = (newDirection) => {
    setDirection(newDirection);
  };
  
  useEffect(() => {
    const generateBombs = () => {
      const newBombs = [];
      for (let i = 0; i < 10; i++) {
        newBombs.push(generateRandomBomb());
      }
      setBombs(newBombs);
    };
  
    const bombInterval = setInterval(generateBombs, 30000);
    generateBombs(); // Generar bombas inmediatamente
  
    return () => {
      clearInterval(bombInterval);
    };
  }, []);
  

  return (
    <div className="game-container">
      <h1 className='titleGame'>Snake Game</h1>
      <div className='CardGame'>
        <div className="grid">
        {Array.from({ length: GRID_SIZE }).map((_, rowIndex) => (
  <div key={rowIndex} className="row">
    {Array.from({ length: GRID_SIZE }).map((_, colIndex) => {
      const isSnakeHead = snake[0].x === colIndex && snake[0].y === rowIndex;
      const isSnakeBody = snake.some(
        (segment, index) => index > 0 && segment.x === colIndex && segment.y === rowIndex
      );
      const isApple = apple.x === colIndex && apple.y === rowIndex;
      const isBomb = bombs.some((bomb) => bomb.x === colIndex && bomb.y === rowIndex);
      const appleColor = isApple ? apple.color : 'red';

      return (
        <div
          key={`${rowIndex}-${colIndex}`}
          className={`cell ${isSnakeHead ? 'snake-head' : ''} ${
            isSnakeBody ? 'snake-body' : ''
          } ${isApple ? 'apple' : ''} ${isBomb ? 'bomb' : ''}`}
          style={isApple ? { backgroundColor: appleColor } : null}
        />
      );
    })}
  </div>
))}

        </div>
      </div>
      <div className="direction-buttons">
        <button onClick={() => handleButtonClick('left')}> <span className='Arrows Arrows_left'><img width={40} src={arrow} alt="" /></span></button>
        <button onClick={() => handleButtonClick('up')}> <span className='Arrows Arrows_up '><img width={40} src={arrow} alt="" /></span></button>
        <button onClick={() => handleButtonClick('down')}> <span className='Arrows Arrows_down'><img width={40} src={arrow} alt="" /></span></button>
        <button onClick={() => handleButtonClick('right')}> <span className='Arrows Arrows_right'><img width={40} src={arrow} alt="" /></span></button>
      </div>
      {gameOver && (
        <div className="game-over">
          <p className='GameOver'>Game Over!</p>
          <p>Your Score: {score}</p>
          <button className='BtnPlayAgain' onClick={restartGame}>Play Again</button>
        </div>
      )}
      <div className="score">Score: <span className='CounterScore'> {score}</span></div>
    </div>
  );
};

export default App;
