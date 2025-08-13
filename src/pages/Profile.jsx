import { useState } from 'react'
import { signInWithEmail, signOut, saveGoal } from '../services/supabase'
import './Profile.css'

function Profile({ user, setUser }) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [goalDays, setGoalDays] = useState('7')
  const [goalReason, setGoalReason] = useState('')

  const handleSignIn = async () => {
    if (!email) {
      setMessage('Please enter your email')
      return
    }

    setIsLoading(true)
    setMessage('')

    const { error } = await signInWithEmail(email)
    
    if (error) {
      if (error.message.includes('not configured')) {
        // Supabase not configured, use demo mode
        const demoUser = { id: 'demo', email: email }
        localStorage.setItem('demoUser', JSON.stringify(demoUser))
        setUser(demoUser)
        setMessage('Signed in (Demo Mode)')
      } else {
        setMessage(error.message)
      }
    } else {
      setMessage('Check your email for the sign-in link!')
    }
    
    setIsLoading(false)
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    const { error } = await signOut()
    
    if (!error || error.message.includes('not configured')) {
      localStorage.removeItem('demoUser')
      setUser(null)
      setMessage('Signed out successfully')
    } else {
      setMessage(error.message)
    }
    
    setIsLoading(false)
  }

  const handleSaveGoal = async () => {
    if (!goalDays || !goalReason) {
      setMessage('Please fill in both fields')
      return
    }

    setIsLoading(true)
    const goalData = {
      user_id: user?.id || 'anonymous',
      target_days: parseInt(goalDays),
      reason: goalReason,
      start_date: new Date().toISOString()
    }

    const { error } = await saveGoal(goalData)
    
    if (error) {
      setMessage('Failed to save goal')
    } else {
      setMessage('Goal saved successfully!')
      setShowGoalForm(false)
    }
    
    setIsLoading(false)
  }

  const handleExportData = () => {
    const data = {
      checkIns: JSON.parse(localStorage.getItem('checkIns') || '[]'),
      goal: JSON.parse(localStorage.getItem('userGoal') || 'null'),
      plan: JSON.parse(localStorage.getItem('userPlan') || 'null'),
      events: JSON.parse(localStorage.getItem('events') || '[]')
    }
    
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `gamble-free-data-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  const handleDeleteData = () => {
    if (confirm('Are you sure? This will delete all your local data.')) {
      localStorage.clear()
      setMessage('All data deleted')
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  return (
    <div className="page profile fade-in">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account and settings</p>
      </div>

      {!user ? (
        <div className="auth-section">
          <div className="card">
            <h2>Sign In / Sign Up</h2>
            <p>Save your progress across devices with a magic link - no password needed!</p>
            
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <button
              className="btn btn-primary btn-lg btn-block"
              onClick={handleSignIn}
              disabled={isLoading || !email}
            >
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </button>
            
            {message && (
              <div className={`alert ${message.includes('success') || message.includes('Check') ? 'alert-success' : 'alert-warning'}`}>
                {message}
              </div>
            )}
            
            <div className="demo-note">
              <p>Note: Without Supabase configured, you'll use demo mode with local storage.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="user-section">
          <div className="card user-info">
            <h3>Account</h3>
            <p className="user-email">{user.email}</p>
            <button className="btn btn-secondary" onClick={handleSignOut} disabled={isLoading}>
              Sign Out
            </button>
          </div>

          <div className="card">
            <h3>Your Goal</h3>
            {showGoalForm ? (
              <div className="goal-form">
                <div className="form-group">
                  <label>Target Days Gamble-Free</label>
                  <select value={goalDays} onChange={(e) => setGoalDays(e.target.value)}>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Why is this important to you?</label>
                  <textarea
                    placeholder="e.g., To save money, improve relationships, feel in control..."
                    value={goalReason}
                    onChange={(e) => setGoalReason(e.target.value)}
                    rows="3"
                  />
                </div>
                
                <div className="goal-actions">
                  <button className="btn btn-primary" onClick={handleSaveGoal} disabled={isLoading}>
                    Save Goal
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowGoalForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => setShowGoalForm(true)}>
                Set New Goal
              </button>
            )}
          </div>

          <div className="card">
            <h3>Data & Privacy</h3>
            <p className="privacy-note">Your data stays on your device unless you sign in.</p>
            
            <div className="data-actions">
              <button className="btn btn-secondary" onClick={handleExportData}>
                Export My Data
              </button>
              <button className="btn btn-danger" onClick={handleDeleteData}>
                Delete All Data
              </button>
            </div>
          </div>

          <div className="card resources">
            <h3>Get More Help</h3>
            <ul className="help-list">
              <li>
                <strong>National Problem Gambling Helpline:</strong>
                <a href="tel:1-800-522-4700">1-800-522-4700</a>
              </li>
              <li>
                <strong>Crisis Text Line:</strong>
                Text HOME to <a href="sms:741741">741741</a>
              </li>
              <li>
                <strong>Gamblers Anonymous:</strong>
                <a href="https://www.gamblersanonymous.org" target="_blank" rel="noopener noreferrer">
                  Find a meeting
                </a>
              </li>
            </ul>
          </div>

          {message && (
            <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-warning'}`}>
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Profile
