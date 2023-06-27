import { useEffect, useState } from "react";


const Score = ({score}) => {
    const [highestScore, setHighestScore] = useState(0);
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
    <>
    <div className="score">Score: <span className='CounterScore'> {score}</span></div>
      <div className="highest-score">Highest Score: <span> {highestScore}</span> </div>
    </>
  )
}

export default Score