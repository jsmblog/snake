import { useEffect, useRef, useState } from 'react';
import soundPrincipal from '/sound-principal.mp3';
import useSound from 'use-sound';
import soundEating from '/sound-eating.mp3';
import soundExplosion from '/explosion.mp3';
import GameOverCard from './Components/GameOverCard';
import HealthBar from './Components/HealthBar';
import DirectionBtn from './Components/DirectionBtn';
import Score from './Components/Score';
import arrow from '../src/img/arrow.png';


const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 }, // position snake
  { x: 10, y: 12 },
];

const INITIAL_DIRECTION = 'up'; // snake up 
const COLORS = ['blue', 'green', 'purple', 'gold', 'yellow', 'FireBrick', 'violet', 'DarkTurquoise', 'pink', 'Coral', 'Plum', 'brown', 'SeaGreen', 'peru', 'SteelBlue', 'MediumSlateBlue', 'Bisque', 'Wheat', 'DimGray', 'red', 'Chartreuse', 'Aqua'];
const SCORE_MULTIPLIERS = [2, 4, 6, 8, 10, 2, 4, 6, 8, 2, 4, 6, 8, 10, 2, 4, 6, 8, 10 , 1 , 1 , 1]; // value score
const SPEED_INCREMENT = 5;
const INITIAL_SPEED = 200;
const APPLE_DURATION = 2900;
const APPLE_INTERVAL = 40000;



const App = () => {
  const generateRandomApple = () => {
    const randomX = Math.floor(Math.random() * GRID_SIZE);
    const randomY = Math.floor(Math.random() * GRID_SIZE);
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    return { x: randomX, y: randomY, color: randomColor };
  };

  const [health, setHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [playEating] = useSound(soundEating, { volume: 10 });
  const [playExplosion] = useSound(soundExplosion, { volume: 1 });
  const [isAlive, setIsAlive] = useState(true)
  const [gameOver, setGameOver] = useState(false);
  const [playPrincipal, { stop }] = useSound(soundPrincipal, { volume: 1, loop: true });
  const [bombs, setBombs] = useState([]);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [apple, setApple] = useState(generateRandomApple());
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
    setIsAlive(true);
    setHealth(100) // Agrega esta línea para marcar la serpiente como viva nuevamente
  };
  
  

  useEffect(() => {
    // function to handle movement by keys (arrows)
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

  const moveSnake = useRef(null);
  useEffect(() => {
    const moveSnake = setInterval(() => {
      setSnake((prevSnake) => {
        const newSnake = [...prevSnake];
        const head = newSnake[0];
        let newHead;
        if (!isAlive) {
          clearInterval(moveSnake);
          return newSnake;
        }

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
        // collisions
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE ||
          bombs.some((bomb) => bomb.x === newHead.x && bomb.y === newHead.y) ||
          newSnake.slice(1).some(
            (segment) => segment.x === newHead.x && segment.y === newHead.y
          )
        ) {
          clearInterval(moveSnake);
          setGameOver(true);
          playExplosion();
          return newSnake;
        }
        if (newSnake.slice(1).some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          clearInterval(moveSnake);
          setGameOver(true);
        }
        if (!isAlive) {
          clearInterval(moveSnake);
          return newSnake;
        }
        return newSnake;
      });

    }, speed);

    return () => {
      clearInterval(moveSnake);
    };
  }, [direction, speed ,  isAlive]);

  // animation card game over
  const animationGameOver = (gameOver) ? "slide-in-right" : ""
  

  useEffect(() => {
    const checkCollision = () => {
      const head = snake[0];
      const handleColorCollision = (color) => {
        if (color === 'red') {
          // reduce speed to mid 7 seconds
          setSpeed((prevSpeed) => prevSpeed * 3); 
          setTimeout(() => {
            setSpeed(INITIAL_SPEED);
          }, 7000);
        } else if (color === 'Chartreuse') {
          // double speed 7 seconds
          setSpeed((prevSpeed) => prevSpeed / 1.5); // here controls the amount speed , value for default (1.5)
          setTimeout(() => {
            setSpeed(INITIAL_SPEED);
          }, 7000);
        }else if (color === 'Aqua') {
          const segmentsToCut = 4; // segments into which the snake is cut , value for default (4) 
          if (snake.length > segmentsToCut) {
            const segmentsToRemove = snake.slice(-segmentsToCut);
        
            // Verify segments aviable of snake 
            const shouldCut = segmentsToRemove.every((segment) => snake.includes(segment));
        
            if (shouldCut) {
              // reduce segments of snake 
              setSnake((prevSnake) => prevSnake.slice(0, prevSnake.length - segmentsToCut));
            }
          }
        }     
      };
  
      if (head.x === apple.x && head.y === apple.y) {
        setSnake((prevSnake) => {
          const newSnake = [...prevSnake];
          newSnake.push({});
          return newSnake;
        });
  
        const scoreMultiplier = SCORE_MULTIPLIERS[COLORS.indexOf(apple.color)];
        const healthIncrease = 5.3; // time of increment health bar
        setHealth((prevHealth) => Math.min(prevHealth + healthIncrease, 100));
        setInterval((prevTimer) => prevTimer + 10);
  
        setScore((prevScore) => prevScore + scoreMultiplier);
        setApple(generateRandomApple());
        playEating();
  
        if (score % 10 === 0 && score !== 0) { // pick up speed after eating (10) apples
          setSpeed((prevSpeed) => Math.max(prevSpeed - SPEED_INCREMENT, 50));
        }
        if (apple.color === 'red' || apple.color === 'Chartreuse' || apple.color === 'Aqua') {
          handleColorCollision(apple.color);
        }
      }
    };
  
    if (health <= 0) { // controls health
      clearInterval(moveSnake);
      setGameOver(true);
      setIsAlive(false); // snake died
    }
    checkCollision()
  }, [snake, apple, score, playEating]);
  
  // effect for health bar state  
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setHealth((prevHealth) => prevHealth - 1); // here time is subtracted (-1)
    }, 1000);
    document.querySelector('.health-bar-inner').style.width = `${health}%`;
    return () => {
      clearInterval(timerInterval);
    };
  }, []);
  
  // effect for generates bombs intervals//

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
      for (let i = 0; i < 20; i++) {
        newBombs.push(generateRandomBomb()); // here for manipulate amount of bombs Default(20)
      }
      setBombs(newBombs);
    };
  
    const bombInterval = setInterval(generateBombs, 20000);
    generateBombs(); // Generate bombs 
  
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
          className={`cell  ${isSnakeHead ? 'snake-head' : ''} ${
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
      <DirectionBtn handleButtonClick={handleButtonClick} arrow={arrow} />
      {gameOver &&  (
        <GameOverCard restartGame={restartGame} score={score} animationGameOver={animationGameOver} />
      )}
      <Score score={score} />
      <HealthBar health={health} />
    </div>
  );
};

export default App;
