import './App.css'
import { Navigate, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import Warehouse from './pages/Warehouse'
import AddWarehouse from './pages/AddWarehouse'
import UseWarehouse from './pages/UseWarehouse'
import { useAuth } from './context/AuthContext'

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <p>Checking your session...</p>
  }

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
            path="/addwarehouse"
            element={
              <ProtectedRoute>
                <AddWarehouse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouse"
            element={
              <ProtectedRoute>
                <Warehouse />
              </ProtectedRoute>
            }
          />
          <Route path = "/warehouse/:id" element = {
            <ProtectedRoute>
              <UseWarehouse />
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
