import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginView from './Views/LoginView'
import DashboardView from './Views/DashboardView'
import MoviesView from './Views/MoviesView'
import AddMoviesView from './Views/AddMoviesView'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route path="/dashboard" element={<DashboardView />} />
        <Route path="/movies" element={<MoviesView />} />
        <Route path="/movies/add" element={<AddMoviesView />} />
        <Route path="/login" element={<LoginView />} />
      </Routes>
    </Router>
  )
}

export default App
