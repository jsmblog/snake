import { useEffect, useState } from "react";


const Score = ({score}) => {
    const [highestScore, setHighestScore] = useState(0);
    useEffect(() => {
        // Get the highest localStorage score
        const storedHighestScore = localStorage.getItem('snakeGameHighestScore');
      
        if (storedHighestScore) {
          // If the high score is stored, update the status with its value
          setHighestScore(parseInt(storedHighestScore));
        }
      }, []);
      
      useEffect(() => {
        if (score > highestScore) {
          // If the current score exceeds the highest score, update it
          setHighestScore(score);
      
          // Store the new high score in the localStorage
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