import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveCheckIn, logEvent } from '../services/supabase'
import './CheckIn.css'

function CheckIn({ user }) {
  const navigate = useNavigate()
  const [urgeLevel, setUrgeLevel] = useState(0)
  const [gambled, setGambled] = useState(null)
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    const checkInData = {
      user_id: user?.id || 'anonymous',
      date: new Date().toISOString(),
      urge_level: urgeLevel,
      gambled: gambled === 'yes',
      amount: gambled === 'yes' && amount ? parseFloat(amount) : null,
      notes: notes || null
    }

    try {
      const { error } = await saveCheckIn(checkInData)
      if (error) throw error
      
      logEvent({
        user_id: user?.id || 'anonymous',
        type: 'daily_checkin',
        metadata: { 
          urge_level: urgeLevel,
          gambled: gambled === 'yes'
        }
      })
      
      // Navigate to home with success message
      navigate('/', { state: { message: 'Check-in complete! Keep up the great work!' } })
      
    } catch (error) {
      console.error('Error saving check-in:', error)
      alert('Failed to save check-in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getUrgeEmoji = (level) => {
    const emojis = ['😌', '😐', '😟', '😰', '😤']
    return emojis[level] || '😐'
  }

  return (
    <div className="page checkin fade-in">
      <div className="page-header">
        <h1>Daily Check-In</h1>
        <p>Quick and private. Track your progress.</p>
      </div>

      <div className="checkin-form">
        <div className="card">
          <h3>How strong were your urges today?</h3>
          <div className="urge-scale">
            {[0, 1, 2, 3, 4].map(level => (
              <button
                key={level}
                className={`urge-level ${urgeLevel === level ? 'selected' : ''}`}
                onClick={() => setUrgeLevel(level)}
              >
                <span className="urge-emoji">{getUrgeEmoji(level)}</span>
                <span className="urge-number">{level}</span>
              </button>
            ))}
          </div>
          <p className="scale-labels">
            <span>No urge</span>
            <span>Very strong</span>
          </p>
        </div>

        <div className="card">
          <h3>Did you gamble today?</h3>
          <div className="gamble-buttons">
            <button
              className={`gamble-option ${gambled === 'no' ? 'selected success' : ''}`}
              onClick={() => {
                setGambled('no')
                setAmount('')
              }}
            >
              <span className="gamble-icon">✓</span>
              <span>No, I didn't gamble</span>
            </button>
            <button
              className={`gamble-option ${gambled === 'yes' ? 'selected danger' : ''}`}
              onClick={() => setGambled('yes')}
            >
              <span className="gamble-icon">×</span>
              <span>Yes, I gambled</span>
            </button>
          </div>
        </div>

        {gambled === 'yes' && (
          <div className="card slip-details fade-in">
            <h3>It's okay. Let's learn from this.</h3>
            <div className="form-group">
              <label>Amount (optional)</label>
              <input
                type="number"
                placeholder="$0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>What triggered it? (optional)</label>
              <textarea
                placeholder="Helps you identify patterns..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
              />
            </div>
            <p className="encouragement">
              A slip doesn't erase your progress. Tomorrow is a fresh start.
            </p>
          </div>
        )}

        {gambled === 'no' && (
          <div className="card success-message fade-in">
            <div className="success-icon">🎉</div>
            <h3>Awesome! Another gamble-free day!</h3>
            <p>Every day counts. You're building something amazing.</p>
          </div>
        )}

        <button
          className="btn btn-primary btn-lg btn-block"
          onClick={handleSubmit}
          disabled={gambled === null || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Complete Check-In'}
        </button>
      </div>
    </div>
  )
}

export default CheckIn
