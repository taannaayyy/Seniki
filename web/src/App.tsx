import { BrowserRouter, Route, Routes } from 'react-router'
import Layout from './components/Layout'
import NotFound from './pages/NotFound'
import { NAV_ITEMS } from './navigation'

/**
 * Pages are nested under <Layout />, which renders them into its <Outlet />.
 * That keeps the sidebar and the clock mounted across navigation instead of
 * remounting them on every route change.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {NAV_ITEMS.map(({ path, Page }) => (
            <Route key={path} path={path} element={<Page />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
