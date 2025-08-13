import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logEvent } from '../services/supabase'
import './QuickHelp.css'

const activities = [
  '20 push-ups or jumping jacks',
  'Cold shower or face wash',
  'Call or text a friend',
  'Fast walk around the block',
  'Play your favorite song LOUD',
  'Watch a funny video',
  'Do 10 burpees',
  'Clean something for 10 minutes',
  'Play a mobile game',
  'Journal for 5 minutes',
  'Practice box breathing (4-4-4-4)',
  'Stretch for 5 minutes'
]

function QuickHelp({ user }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState('')
  const [urgeLevel, setUrgeLevel] = useState(5)
  const [trigger, setTrigger] = useState('')

  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0) {
      setIsTimerActive(false)
      handleTimerComplete()
    }
  }, [isTimerActive, timeLeft])

  useEffect(() => {
    // Log that user accessed quick help
    logEvent({
      user_id: user?.id || 'anonymous',
      type: 'quick_help_accessed',
      metadata: { timestamp: new Date().toISOString() }
    })
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartTimer = () => {
    setIsTimerActive(true)
    setStep(2)
    
    logEvent({
      user_id: user?.id || 'anonymous',
      type: 'timer_started',
      metadata: { 
        urge_level: urgeLevel,
        trigger: trigger,
        activity: selectedActivity 
      }
    })
  }

  const handleTimerComplete = () => {
    setStep(3)
    
    logEvent({
      user_id: user?.id || 'anonymous',
      type: 'timer_completed',
      metadata: { 
        initial_urge: urgeLevel,
        trigger: trigger,
        activity: selectedActivity 
      }
    })
  }

  const handleSelectActivity = (activity) => {
    setSelectedActivity(activity)
  }

  const handleFinish = (stillHaveUrge) => {
    if (stillHaveUrge) {
      navigate('/coach')
    } else {
      navigate('/')
    }
    
    logEvent({
      user_id: user?.id || 'anonymous',
      type: 'quick_help_completed',
      metadata: { 
        success: !stillHaveUrge,
        initial_urge: urgeLevel,
        trigger: trigger
      }
    })
  }

  const resetTimer = () => {
    setTimeLeft(600)
    setIsTimerActive(true)
  }

  return (
    <div className="page quick-help fade-in">
      {step === 1 && (
        <div className="step-container">
          <h1>Let's manage this urge</h1>
          <p className="subtitle">You've got this. Let's ride it out together.</p>
          
          <div className="card">
            <h3>How strong is the urge?</h3>
            <div className="urge-scale">
              {[1, 2, 3, 4, 5].map(level => (
                <button
                  key={level}
                  className={`urge-level ${urgeLevel === level ? 'selected' : ''}`}
                  onClick={() => setUrgeLevel(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>What triggered this urge?</h3>
            <div className="trigger-options">
              {['Saw an ad', 'Payday', 'Stressed', 'Bored', 'Friends betting', 'Other'].map(t => (
                <button
                  key={t}
                  className={`chip ${trigger === t ? 'selected' : ''}`}
                  onClick={() => setTrigger(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>Pick a distraction activity</h3>
            <div className="activity-grid">
              {activities.slice(0, 6).map(activity => (
                <button
                  key={activity}
                  className={`activity-option ${selectedActivity === activity ? 'selected' : ''}`}
                  onClick={() => handleSelectActivity(activity)}
                >
                  {activity}
                </button>
              ))}
            </div>
          </div>

          <button 
            className="btn btn-primary btn-lg btn-block"
            onClick={handleStartTimer}
            disabled={!selectedActivity}
          >
            Start 10-Minute Timer
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="timer-container">
          <h1>Ride the wave</h1>
          <p className="timer-message">The urge will peak and fall. Just hold on.</p>
          
          <div className="timer-display">
            {formatTime(timeLeft)}
          </div>

          <div className="card activity-reminder">
            <h3>Your activity:</h3>
            <p className="activity-text">{selectedActivity}</p>
            <p className="encouragement">Go do it now! Come back when done.</p>
          </div>

          <div className="breathing-guide">
            <p>While waiting, try this:</p>
            <div className="breath-instruction">Breathe in for 4... Hold for 4... Out for 6...</div>
          </div>

          <div className="timer-actions">
            <button className="btn btn-secondary" onClick={resetTimer}>
              Add 10 More Minutes
            </button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>
              I'm Good Now
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="completion-container">
          <div className="success-icon">🎉</div>
          <h1>You did it!</h1>
          <p className="success-message">You rode out the urge. That's huge!</p>
          
          <div className="card reflection">
            <h3>Quick check-in</h3>
            <p>How are you feeling now?</p>
            
            <div className="completion-actions">
              <button 
                className="btn btn-success btn-lg btn-block"
                onClick={() => handleFinish(false)}
              >
                Feeling Better!
              </button>
              <button 
                className="btn btn-secondary btn-lg btn-block"
                onClick={() => handleFinish(true)}
              >
                Still Have an Urge
              </button>
            </div>
          </div>

          <div className="tips card">
            <h3>Remember:</h3>
            <ul>
              <li>Every urge you beat makes you stronger</li>
              <li>The urge always passes, even if it feels impossible</li>
              <li>You just proved you can do this</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuickHelp
