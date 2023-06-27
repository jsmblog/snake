

const HealthBar = ({health}) => {
  return (
    <div
  className={`health-bar ${
    health <= 10 ? 'low-health' : health <= 30 ? 'lowred-health' : health <= 40 ? 'medium-health' :  health <= 70 ? 'lowCas-health' : ''
  }`}
>
  <div className="health-bar-inner" style={{ width: `${health}%` }}></div>
</div>
  )
}

export default HealthBar