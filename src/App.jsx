import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Coach from './pages/Coach'
import QuickHelp from './pages/QuickHelp'
import CheckIn from './pages/CheckIn'
import Learn from './pages/Learn'
import Profile from './pages/Profile'
import Navigation from './components/Navigation'
import { supabase, getCurrentUser } from './services/supabase'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for user on mount
    checkUser()

    // Listen for auth changes if Supabase is configured
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null)
        }
      )

      return () => subscription.unsubscribe()
    } else {
      // No Supabase, use localStorage for demo
      const localUser = localStorage.getItem('demoUser')
      if (localUser) {
        setUser(JSON.parse(localUser))
      }
      setLoading(false)
    }
  }, [])

  const checkUser = async () => {
    try {
      const { user } = await getCurrentUser()
      setUser(user)
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home user={user} setUser={setUser} />} />
          <Route path="/coach" element={<Coach user={user} />} />
          <Route path="/quick" element={<QuickHelp user={user} />} />
          <Route path="/checkin" element={<CheckIn user={user} />} />
          <Route path="/learn" element={<Learn user={user} />} />
          <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  )
}

export default App
