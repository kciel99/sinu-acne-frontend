import { useState } from 'react'
import './App.css'

function App() {
  const [file, setFile] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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

          {/* All Ingredients Table */}
          <h3>All Ingredients</h3>
          <table>
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Category</th>
                <th>Comedogenic</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {results.allIngredients.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.Ingredient}</td>
                  <td>{item.Category}</td>
                  <td>{item.ComedogenicScore}</td>
                  <td>{item.Note}</td>
                </tr>
              ))}
            </tbody>
          </table>

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