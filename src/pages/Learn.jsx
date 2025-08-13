import { useState } from 'react'
import { learnCards, getCategories } from '../data/learnCards'
import { logEvent } from '../services/supabase'
import './Learn.css'

function Learn({ user }) {
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const categories = ['All', ...getCategories()]

  const filteredCards = selectedCategory === 'All' 
    ? learnCards 
    : learnCards.filter(card => card.category === selectedCategory)

  const handleCardClick = (card) => {
    setSelectedCard(card)
    logEvent({
      user_id: user?.id || 'anonymous',
      type: 'learn_card_viewed',
      metadata: { card_id: card.id, card_title: card.title }
    })
  }

  const handleBack = () => {
    setSelectedCard(null)
  }

  if (selectedCard) {
    return (
      <div className="page learn fade-in">
        <button className="back-button" onClick={handleBack}>
          ← Back to cards
        </button>
        
        <article className="card-content">
          <header className="card-header">
            <h1>{selectedCard.title}</h1>
            <span className="card-meta">{selectedCard.duration} • {selectedCard.category}</span>
          </header>
          
          <div className="card-body">
            <p className="intro">{selectedCard.content.intro}</p>
            
            {selectedCard.content.sections.map((section, index) => (
              <section key={index} className="content-section">
                <h3>{section.title}</h3>
                <p className="section-text">{section.text}</p>
              </section>
            ))}
            
            <div className="practice-section">
              <h3>📝 Practice This Week</h3>
              <p>{selectedCard.content.practice}</p>
            </div>
          </div>
        </article>
      </div>
    )
  }

  return (
    <div className="page learn fade-in">
      <div className="page-header">
        <h1>Learn</h1>
        <p>Evidence-based micro-skills to beat gambling urges</p>
      </div>

      <div className="category-filter">
        {categories.map(cat => (
          <button
            key={cat}
            className={`chip ${selectedCategory === cat ? 'selected' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="cards-grid">
        {filteredCards.map(card => (
          <button
            key={card.id}
            className="learn-card"
            onClick={() => handleCardClick(card)}
          >
            <div className="card-category">{card.category}</div>
            <h3 className="card-title">{card.title}</h3>
            <div className="card-footer">
              <span className="card-duration">⏱ {card.duration}</span>
              <span className="card-arrow">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Learn
