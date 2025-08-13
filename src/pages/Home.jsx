import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCheckIns, getGoal } from '../services/supabase'
import './Home.css'

const calculateStreak = (checkIns) => {
  if (!checkIns || checkIns.length === 0) return 0
  
  let streak = 0
  let currentDate = new Date()
  let lastDate = new Date()
  
  // Sort check-ins by date descending
  const sortedCheckIns = [...checkIns].sort((a, b) => new Date(b.date) - new Date(a.date))
  
  // Check from today or yesterday
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  
  let startIndex = sortedCheckIns.findIndex(c => c.date.startsWith(today) || c.date.startsWith(yesterday))
  if (startIndex === -1) return 0
  
  // Check the first valid entry
  if (sortedCheckIns[startIndex].gambled) return 0
  streak = 1
  lastDate = new Date(sortedCheckIns[startIndex].date)
  
  // Iterate through the rest
  for (let i = startIndex + 1; i < sortedCheckIns.length; i++) {
    currentDate = new Date(sortedCheckIns[i].date)
    const diffDays = Math.round((lastDate - currentDate) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1 && !sortedCheckIns[i].gambled) {
      streak++
      lastDate = currentDate
    } else if (diffDays > 1) {
      break // Gap in dates
    } else if (sortedCheckIns[i].gambled) {
      break // Gambled, so streak is broken
    }
    // Ignore same-day entries
  }
  return streak
}

function Home({ user }) {
  const navigate = useNavigate()
  const [streak, setStreak] = useState(0)
  const [goal, setGoal] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchData()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const { data: checkIns, error: checkInError } = await getCheckIns(user.id, 90)
      if (checkInError) throw checkInError
      
      const currentStreak = calculateStreak(checkIns)
      setStreak(currentStreak)

      const { data: userGoal, error: goalError } = await getGoal(user.id)
      if (goalError && goalError.code !== 'PGRST116') throw goalError // Ignore no rows found
      setGoal(userGoal)
      
    } catch (error) {
      console.error('Error fetching home data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUrgeClick = () => {
    navigate('/quick')
  }

  const handleCheckInClick = () => {
    navigate('/checkin')
  }

  return (
    <div className="page home fade-in">
      <header className="home-header">
        <h1>Welcome back{user ? `, ${user.email.split('@')[0]}` : ''}!</h1>
        <p>Your private, judgment-free space to take control.</p>
      </header>

      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : user ? (
        <div className="user-dashboard">
          <div className="streak-display pulse">
            <div className="streak-number">{streak}</div>
            <div className="streak-label">Day Streak</div>
          </div>
          {goal && (
            <div className="goal-progress card">
              <h3>Your Goal: {goal.target_days} Gamble-Free Days</h3>
              <p>You're on your way! Keep up the great work.</p>
              <progress 
                className="progress-bar"
                value={streak} 
                max={goal.target_days}
              />
            </div>
          )}
          <div className="home-actions">
            <button onClick={handleCheckInClick} className="btn btn-secondary btn-lg btn-block">
              Daily Check-in
            </button>
          </div>
        </div>
      ) : (
        <div className="guest-welcome">
          <div className="card">
            <h2>New Here?</h2>
            <p>Start your journey to a gamble-free life. It's free, anonymous, and effective.</p>
            <Link to="/profile" className="btn btn-primary btn-lg btn-block">Get Started</Link>
          </div>
        </div>
      )}
      
      <div className="quick-help-cta">
        <h2>Feeling an urge?</h2>
        <p>Immediate tools to help you stay on track.</p>
        <button onClick={handleUrgeClick} className="btn btn-danger btn-lg btn-block">
          I have an urge now
        </button>
      </div>
    </div>
  )
}

export default Home
