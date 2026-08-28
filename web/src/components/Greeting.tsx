import { timeOfDay } from '../lib/locale'
import RobotIcon from './RobotIcon'
import './Greeting.css'

type GreetingProps = {
  name: string
  now: Date
}

function Greeting({ name, now }: GreetingProps) {
  return (
    <h1 className="greeting">
      <RobotIcon className="greeting-mark" />
      {timeOfDay(now)}, {name}
    </h1>
  )
}

export default Greeting
