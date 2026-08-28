import Composer from '../components/Composer'
import Greeting from '../components/Greeting'
import Place from '../components/Place'
import { useNow } from '../hooks/useNow'
import { USER_NAME } from '../lib/user'
import './Home.css'

function Home() {
  // Only the greeting's time-of-day depends on this, so a minute is plenty.
  const now = useNow(60_000)

  return (
    <div className="home">
      <Greeting name={USER_NAME} now={now} />
      <Composer />
      <Place />
    </div>
  )
}

export default Home
