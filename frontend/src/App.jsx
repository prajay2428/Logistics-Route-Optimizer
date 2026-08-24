import './App.css'
import { Navigate, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import Warehouse from './pages/Warehouse'
import { useAuth } from './context/AuthContext'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

function App() {
  return (
    <div className="site-wrapper">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/About" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path = "/signup" element = {<Register />} />
          <Route
            path="/warehouse"
            element={
              <ProtectedRoute>
                <Warehouse />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <footer>© 2026 LRO. Built to keep logistics moving.</footer>
    </div>
  )
}

export default App
