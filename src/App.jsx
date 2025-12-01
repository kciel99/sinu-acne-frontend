import { useState } from 'react'
import './App.css'

function App() {
  const [file, setFile] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedRows, setExpandedRows] = useState(new Set())

  const handleSubmit = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch('https://sinu-acne-backend.onrender.com/api/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      
      if (data.success) {
        setResults(data)
        setExpandedRows(new Set()) // 결과 나오면 초기화
      } else {
        setError(data.error || 'Analysis failed')
      }
    } catch (err) {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResults(null)
    setError(null)
    setExpandedRows(new Set())
  }

  const toggleRow = (index) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRows(newExpanded)
  }

  const expandAll = () => {
    if (results?.allIngredients) {
      setExpandedRows(new Set(results.allIngredients.map((_, i) => i)))
    }
  }

  const collapseAll = () => {
    setExpandedRows(new Set())
  }

  // 점수에 따른 색상
  const getScoreClass = (score) => {
    if (score === null || score === undefined || score === '') return 'score-unknown'
    const num = parseInt(score)
    if (num <= 1) return 'score-safe'
    if (num <= 2) return 'score-moderate'
    return 'score-risky'
  }

  // 위험 성분인지 체크
  const isWarning = (score) => {
    const num = parseInt(score)
    return num >= 3
  }

  return (
    <div className="app">
      {/* Header Card */}
      <div className="main-card">
        <div className="emoji-row">🧴 💖 ✨</div>
        <h1>SINU INGREDIENT CHECKER</h1>
        
        <div className="badge-row">
          <span className="badge">Non-Comedogenic?</span>
          <span className="badge yellow">Safe for Acne?</span>
        </div>

        {/* Hero Image */}
        <div className="hero-image">
          <img src="/illustration.png" alt="illustration" />
        </div>

        {/* Upload Section - 결과 없을 때만 */}
        {!results && (
          <>
            <div className="upload-box">
              <p>Upload a photo</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <button 
              className="analyze-btn"
              onClick={handleSubmit} 
              disabled={!file || loading}
            >
              {loading ? 'Analyzing... ⏳' : 'Analyze ingredients ✨'}
            </button>

            {error && <p className="error">{error}</p>}
          </>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <div className="result-card">
          {/* Concern Summary */}
          {results.hasConcerns ? (
            <div className="concern-box">
              <h3>⚠️ Ingredients of Concern</h3>
              {results.concernIngredients.map((item, idx) => (
                <div key={idx} className="concern-item">
                  <strong>{item.Ingredient}</strong>
                  <span className="concern-tag">⚠️ {item.Concern}</span>
                  <span className="score">Comedogenic Score: {item.ComedogenicScore}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="clear-box">
              <h3>✨ All Clear!</h3>
              <p>No ingredients of concern found.</p>
            </div>
          )}

          {/* All Ingredients - Accordion Style */}
          <div className="ingredients-section">
            <div className="ingredients-header">
              <h3>All Ingredients</h3>
              <div className="expand-buttons">
                <button onClick={expandAll} className="expand-btn">Expand All</button>
                <button onClick={collapseAll} className="expand-btn">Collapse</button>
              </div>
            </div>

            {/* Table Header */}
            <div className="accordion-header">
              <span>Ingredient</span>
              <span>Score</span>
            </div>

            {/* Accordion Items */}
            <div className="accordion-list">
              {results.allIngredients.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`accordion-item ${isWarning(item.ComedogenicScore) ? 'warning' : ''}`}
                >
                  <div 
                    className="accordion-row"
                    onClick={() => toggleRow(idx)}
                  >
                    <div className="ingredient-info">
                      {isWarning(item.ComedogenicScore) && <span className="warning-icon">⚠️</span>}
                      <div className="ingredient-text">
                        <span className="ingredient-name">{item.Ingredient}</span>
                        <span className="ingredient-category">{item.Category}</span>
                      </div>
                    </div>
                    <div className="row-right">
                      <span className={`score-badge ${getScoreClass(item.ComedogenicScore)}`}>
                        {item.ComedogenicScore !== null && item.ComedogenicScore !== '' 
                          ? item.ComedogenicScore 
                          : '?'}
                      </span>
                      <span className="chevron">{expandedRows.has(idx) ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  
                  {expandedRows.has(idx) && (
                    <div className="accordion-content">
                      <p>{item.Note || 'No additional information.'}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="score-legend">
              <span className="legend-title">Score Guide:</span>
              <span className="legend-item score-safe">0-1 Safe</span>
              <span className="legend-item score-moderate">2 Moderate</span>
              <span className="legend-item score-risky">3-5 Risky</span>
            </div>
          </div>

          <div className="again-wrap">
            <button className="reset-btn" onClick={handleReset}>
              Upload another photo 💕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
