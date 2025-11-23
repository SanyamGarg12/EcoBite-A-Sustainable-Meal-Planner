import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Recommendations.css';

function Recommendations() {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [alternatives, setAlternatives] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const data = await api.getIngredients();
      setIngredients(data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  const getAlternatives = async () => {
    if (!selectedIngredient) {
      alert('Please select an ingredient');
      return;
    }

    setLoading(true);
    try {
      const data = await api.getAlternatives(selectedIngredient);
      setAlternatives(data);
    } catch (error) {
      console.error('Error fetching alternatives:', error);
      alert('Error fetching alternatives');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommendations-page">
      <div className="page-header">
        <h1>Sustainable Alternatives</h1>
        <p>Find eco-friendly substitutes for your ingredients</p>
      </div>

      <div className="card">
        <h2>Find Alternatives</h2>
        <div className="input-group">
          <label>Select an ingredient to find sustainable alternatives</label>
          <select
            value={selectedIngredient}
            onChange={(e) => setSelectedIngredient(e.target.value)}
          >
            <option value="">Select ingredient...</option>
            {ingredients.map(ing => (
              <option key={ing.id} value={ing.id}>
                {ing.name} ({ing.carbon_footprint_per_kg} kg CO₂/kg)
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn"
          onClick={getAlternatives}
          disabled={loading || !selectedIngredient}
          style={{ marginTop: '16px', width: '100%' }}
        >
          {loading ? 'Finding alternatives...' : 'Get Alternatives'}
        </button>
      </div>

      {alternatives && (
        <div className="card">
          <h2>Original Ingredient</h2>
          <div className="ingredient-card original">
            <div className="ingredient-header">
              <h3>{alternatives.original_ingredient.name}</h3>
              <span className="carbon-badge">
                {alternatives.original_ingredient.carbon_footprint_per_kg} kg CO₂/kg
              </span>
            </div>
            <div className="ingredient-details">
              <div className="detail-item">
                <span className="label">Category:</span>
                <span>{alternatives.original_ingredient.category}</span>
              </div>
              <div className="detail-item">
                <span className="label">Nutrition (per 100g):</span>
                <span>
                  Protein: {alternatives.original_ingredient.nutritional_value.protein}g,
                  Carbs: {alternatives.original_ingredient.nutritional_value.carbs}g,
                  Fats: {alternatives.original_ingredient.nutritional_value.fats}g,
                  Calories: {alternatives.original_ingredient.nutritional_value.calories}kcal
                </span>
              </div>
            </div>
          </div>

          <h2 style={{ marginTop: '32px' }}>Recommended Alternatives</h2>
          {alternatives.alternatives.length === 0 ? (
            <p>No alternatives found with lower carbon footprint.</p>
          ) : (
            <div className="alternatives-grid">
              {alternatives.alternatives.map((alt, index) => (
                <div key={alt.id} className="ingredient-card alternative">
                  <div className="ingredient-header">
                    <h3>{alt.name}</h3>
                    <span className="carbon-badge lower">
                      {alt.carbon_footprint_per_kg} kg CO₂/kg
                    </span>
                  </div>
                  <div className="reduction-badge">
                    {alt.carbon_reduction_percent.toFixed(1)}% less carbon
                  </div>
                  <div className="ingredient-details">
                    <div className="detail-item">
                      <span className="label">Category:</span>
                      <span>{alt.category}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Nutrition (per 100g):</span>
                      <span>
                        Protein: {alt.nutritional_value.protein}g,
                        Carbs: {alt.nutritional_value.carbs}g,
                        Fats: {alt.nutritional_value.fats}g,
                        Calories: {alt.nutritional_value.calories}kcal
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Nutrition Similarity:</span>
                      <span>{alt.nutrition_similarity_score.toFixed(1)}%</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Overall Score:</span>
                      <span className="score">{alt.overall_score.toFixed(1)}/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Recommendations;

