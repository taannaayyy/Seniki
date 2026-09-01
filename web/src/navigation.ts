import {
  CalendarIcon,
  FinanceIcon,
  HealthIcon,
  HomeIcon,
  JournalIcon,
  LearningIcon,
  PeopleIcon,
  TodoIcon,
} from './components/NavIcons'
import Calendar from './pages/Calendar'
import Finance from './pages/Finance'
import Health from './pages/Health'
import Home from './pages/Home'
import Journal from './pages/Journal'
import Learning from './pages/Learning'
import People from './pages/People'
import Todo from './pages/Todo'

/**
 * Every nav destination, used by both the sidebar links and the route table,
 * so a new section is added in exactly one place.
 */
export const NAV_ITEMS = [
  { path: '/', label: 'Home', Icon: HomeIcon, Page: Home },
  { path: '/calendar', label: 'Calendar', Icon: CalendarIcon, Page: Calendar },
  { path: '/todo', label: 'To-Do', Icon: TodoIcon, Page: Todo },
  { path: '/journal', label: 'Journal', Icon: JournalIcon, Page: Journal },
  { path: '/learning', label: 'Learning', Icon: LearningIcon, Page: Learning },
  { path: '/finance', label: 'Finance', Icon: FinanceIcon, Page: Finance },
  { path: '/health', label: 'Health', Icon: HealthIcon, Page: Health },
  { path: '/people', label: 'People', Icon: PeopleIcon, Page: People },
]
