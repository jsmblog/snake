

const DirectionBtn = ({arrow , handleButtonClick}) => {
  return (
    <div className="direction-buttons">
        <button onClick={() => handleButtonClick('left')}> <span className='Arrows Arrows_left'><img width={40} src={arrow} alt="" /></span></button>
        <button onClick={() => handleButtonClick('up')}> <span className='Arrows Arrows_up '><img width={40} src={arrow} alt="" /></span></button>
        <button onClick={() => handleButtonClick('down')}> <span className='Arrows Arrows_down'><img width={40} src={arrow} alt="" /></span></button>
        <button onClick={() => handleButtonClick('right')}> <span className='Arrows Arrows_right'><img width={40} src={arrow} alt="" /></span></button>
      </div>
  )
}

export default DirectionBtn