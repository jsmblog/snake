

const GameOverCard = ({animationGameOver , score , restartGame}) => {
  return (
    <div className={`${animationGameOver} game-over`}>
          <p className='GameOver'>Game Over!</p>
          <p>Your Score: {score}</p>
          <button className='BtnPlayAgain' onClick={restartGame}>Play Again</button>
        </div>
  )
}

export default GameOverCard