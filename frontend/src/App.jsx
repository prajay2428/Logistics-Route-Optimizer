import './App.css'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
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
        </Routes>
      </main>
      <footer>© 2026 LRO. Built to keep logistics moving.</footer>
    </div>
  )
}

export default App
