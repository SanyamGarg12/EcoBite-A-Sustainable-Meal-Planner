import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Calculator.css';

function Calculator() {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [result, setResult] = useState(null);
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

  const addIngredient = () => {
    setSelectedIngredients([
      ...selectedIngredients,
      { ingredient_id: '', quantity: 0.1 }
    ]);
  };

  const removeIngredient = (index) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index, field, value) => {
    const updated = [...selectedIngredients];
    updated[index][field] = field === 'quantity' ? parseFloat(value) || 0 : value;
    setSelectedIngredients(updated);
  };

  const calculateFootprint = async () => {
    if (selectedIngredients.length === 0) {
      alert('Please add at least one ingredient');
      return;
    }

    const validIngredients = selectedIngredients.filter(
      item => item.ingredient_id && item.quantity > 0
    );

    if (validIngredients.length === 0) {
      alert('Please select ingredients and enter quantities');
      return;
    }

    setLoading(true);
    try {
      const data = await api.calculateMeal(validIngredients);
      setResult(data);
    } catch (error) {
      console.error('Error calculating footprint:', error);
      alert('Error calculating carbon footprint');
    } finally {
      setLoading(false);
    }
  };

  const getSustainabilityBadge = (score) => {
    if (score >= 80) return 'badge-excellent';
    if (score >= 60) return 'badge-good';
    if (score >= 40) return 'badge-moderate';
    return 'badge-poor';
  };

  const getSustainabilityLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Moderate';
    return 'Poor';
  };

  return (
    <div className="calculator-page">
      <div className="page-header">
        <h1>Carbon Footprint Calculator</h1>
        <p>Calculate the environmental impact of your meals</p>
      </div>

      <div className="card">
        <h2>Add Ingredients</h2>
        {selectedIngredients.map((item, index) => (
          <div key={index} className="ingredient-row">
            <div className="input-group" style={{ flex: 2 }}>
              <label>Ingredient</label>
              <select
                value={item.ingredient_id}
                onChange={(e) => updateIngredient(index, 'ingredient_id', e.target.value)}
              >
                <option value="">Select ingredient...</option>
                {ingredients.map(ing => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} ({ing.carbon_footprint_per_kg} kg CO₂/kg)
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Quantity (kg)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={item.quantity}
                onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
              />
            </div>
            <button
              className="btn btn-danger"
              onClick={() => removeIngredient(index)}
              style={{ marginTop: '24px', height: '40px' }}
            >
              Remove
            </button>
          </div>
        ))}

        <button className="btn btn-secondary" onClick={addIngredient}>
          + Add Ingredient
        </button>

        <button
          className="btn"
          onClick={calculateFootprint}
          disabled={loading || selectedIngredients.length === 0}
          style={{ marginTop: '20px', width: '100%' }}
        >
          {loading ? 'Calculating...' : 'Calculate Carbon Footprint'}
        </button>
      </div>

      {result && (
        <div className="card result-card">
          <h2>Calculation Results</h2>
          
          <div className="result-summary">
            <div className="result-stat">
              <h3>Total Carbon Footprint</h3>
              <div className="result-value">{result.total_carbon_footprint} kg CO₂</div>
            </div>
            <div className="result-stat">
              <h3>Total Calories</h3>
              <div className="result-value">{result.total_calories.toFixed(0)} kcal</div>
            </div>
            <div className="result-stat">
              <h3>Sustainability Score</h3>
              <div className={`result-value ${getSustainabilityBadge(result.sustainability_score)}`}>
                {getSustainabilityLabel(result.sustainability_score)} ({result.sustainability_score.toFixed(0)}/100)
              </div>
            </div>
          </div>

          <h3 style={{ marginTop: '24px' }}>Ingredient Breakdown</h3>
          <div className="ingredients-breakdown">
            {result.ingredients.map((item, index) => (
              <div key={index} className="breakdown-item">
                <div className="breakdown-name">{item.ingredient.name}</div>
                <div className="breakdown-details">
                  <span>{item.quantity} kg</span>
                  <span>{item.carbon_footprint} kg CO₂</span>
                  <span>{item.calories.toFixed(0)} kcal</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Calculator;

