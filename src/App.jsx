import { useEffect, useRef, useState } from 'react';
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
const COLORS = ['blue', 'green', 'purple', 'gold', 'yellow', 'FireBrick', 'violet', 'DarkTurquoise', 'pink', 'Coral', 'Plum', 'brown', 'SeaGreen', 'peru', 'SteelBlue', 'MediumSlateBlue', 'Bisque', 'Wheat', 'DimGray', 'red', 'Chartreuse', 'Aqua'];
const SCORE_MULTIPLIERS = [2, 4, 6, 8, 10, 2, 4, 6, 8, 2, 4, 6, 8, 10, 2, 4, 6, 8, 10 , 1 , 1 , 1];
const SPEED_INCREMENT = 5;
const INITIAL_SPEED = 203;
const APPLE_DURATION = 2900;
const APPLE_INTERVAL = 40000;



const App = () => {
  const generateRandomApple = () => {
    const randomX = Math.floor(Math.random() * GRID_SIZE);
    const randomY = Math.floor(Math.random() * GRID_SIZE);
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    return { x: randomX, y: randomY, color: randomColor };
  };
  const [highestScore, setHighestScore] = useState(0);
  const [health, setHealth] = useState(100);
const [isAlive, setIsAlive] = useState(true)
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
    setIsAlive(true);
    setHealth(100) // Agrega esta línea para marcar la serpiente como viva nuevamente
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
      for (let i = 0; i < 15; i++) {
        newBombs.push(generateRandomBomb());
      }
      setBombs(newBombs);
    }, 20000);
  
    return () => {
      clearInterval(bombInterval);
    };
  }, []);
    
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

  const animationGameOver = (gameOver) ? "slide-in-right" : ""
  

  useEffect(() => {
    const checkCollision = () => {
      const head = snake[0];
      const handleColorCollision = (color) => {
        if (color === 'red') {
          // Reducir la velocidad a la mitad por 10 segundos
          setSpeed((prevSpeed) => prevSpeed * 3);
          setTimeout(() => {
            setSpeed(INITIAL_SPEED);
          }, 7000);
        } else if (color === 'Chartreuse') {
          // Duplicar la velocidad por 15 segundos
          setSpeed((prevSpeed) => prevSpeed / 1.80);
          setTimeout(() => {
            setSpeed(INITIAL_SPEED);
          }, 7000);
        }else if (color === 'Aqua') {
          const segmentsToCut = 4;
          
          // Verificar si la serpiente tiene la cantidad suficiente de segmentos para cortar
          if (snake.length > segmentsToCut) {
            // Obtener los segmentos más recientes que se deben cortar
            const segmentsToRemove = snake.slice(-segmentsToCut);
        
            // Verificar si los segmentos a cortar están presentes en el cuerpo de la serpiente
            const shouldCut = segmentsToRemove.every((segment) => snake.includes(segment));
        
            if (shouldCut) {
              // Reducir la longitud de la serpiente eliminando los segmentos
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
        const healthIncrease = 6.5;
        setHealth((prevHealth) => Math.min(prevHealth + healthIncrease, 100));
        setInterval((prevTimer) => prevTimer + 10);
  
        setScore((prevScore) => prevScore + scoreMultiplier);
        setApple(generateRandomApple());
        playEating();
  
        if (score % 10 === 0 && score !== 0) {
          setSpeed((prevSpeed) => Math.max(prevSpeed - SPEED_INCREMENT, 50));
        }
        if (apple.color === 'red' || apple.color === 'Chartreuse' || apple.color === 'Aqua') {
          handleColorCollision(apple.color);
        }
      }
    };
  
    if (health <= 0) {
      clearInterval(moveSnake);
      setGameOver(true);
      setIsAlive(false); // Agrega esta línea para marcar la serpiente como no viva
    }
    checkCollision()
  }, [snake, apple, score, playEating]);
  
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setHealth((prevHealth) => prevHealth - .5);
    }, 1000);
    document.querySelector('.health-bar-inner').style.width = `${health}%`;
    return () => {
      clearInterval(timerInterval);
    };
  }, []);
  
  

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
        newBombs.push(generateRandomBomb());
      }
      setBombs(newBombs);
    };
  
    const bombInterval = setInterval(generateBombs, 20000);
    generateBombs(); // Generar bombas inmediatamente
  
    return () => {
      clearInterval(bombInterval);
    };
  }, []);
  
  useEffect(() => {
    // Obtener la puntuación más alta del localStorage
    const storedHighestScore = localStorage.getItem('snakeGameHighestScore');
  
    if (storedHighestScore) {
      // Si la puntuación más alta está almacenada, actualizar el estado con su valor
      setHighestScore(parseInt(storedHighestScore));
    }
  }, []);
  
  useEffect(() => {
    if (score > highestScore) {
      // Si la puntuación actual supera la puntuación más alta, actualizarla
      setHighestScore(score);
  
      // Almacenar la nueva puntuación más alta en el localStorage
      localStorage.setItem('snakeGameHighestScore', score.toString());
    }
  }, [score]);
  

  
  
  

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
      <div className="direction-buttons">
        <button onClick={() => handleButtonClick('left')}> <span className='Arrows Arrows_left'><img width={40} src={arrow} alt="" /></span></button>
        <button onClick={() => handleButtonClick('up')}> <span className='Arrows Arrows_up '><img width={40} src={arrow} alt="" /></span></button>
        <button onClick={() => handleButtonClick('down')}> <span className='Arrows Arrows_down'><img width={40} src={arrow} alt="" /></span></button>
        <button onClick={() => handleButtonClick('right')}> <span className='Arrows Arrows_right'><img width={40} src={arrow} alt="" /></span></button>
      </div>
      {gameOver &&  (
        <div className={`${animationGameOver} game-over`}>
          <p className='GameOver'>Game Over!</p>
          <p>Your Score: {score}</p>
          <button className='BtnPlayAgain' onClick={restartGame}>Play Again</button>
        </div>
      )}
      <div className="score">Score: <span className='CounterScore'> {score}</span></div>
      <div className="highest-score">Highest Score: <span> {highestScore}</span> </div>
      <div
  className={`health-bar ${
    health <= 20 ? 'low-health' : health <= 30 ? 'lowred-health' : health <= 50 ? 'medium-health' :  health <= 70 ? 'lowCas-health' : ''
  }`}
>
  <div className="health-bar-inner" style={{ width: `${health}%` }}></div>
</div>


    </div>
  );
};

export default App;
