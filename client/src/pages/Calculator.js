import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Calculator.css';

function Calculator() {
  const { user, isAuthenticated } = useAuth();
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mealName, setMealName] = useState('');
  const [saving, setSaving] = useState(false);

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

  const saveMeal = async () => {
    if (!mealName.trim()) {
      alert('Please enter a meal name');
      return;
    }

    if (!result) {
      alert('Please calculate the meal first');
      return;
    }

    setSaving(true);
    try {
      const mealData = {
        name: mealName,
        ingredients: selectedIngredients.filter(item => item.ingredient_id && item.quantity > 0),
        user_id: user.id
      };
      
      const savedMeal = await api.createMeal(mealData);
      alert('Meal saved successfully! You can now log it in the Tracker.');
      setMealName('');
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('Error saving meal');
    } finally {
      setSaving(false);
    }
  };

  const logMealToday = async () => {
    if (!result) {
      alert('Please calculate the meal first');
      return;
    }

    // First save the meal if not already saved
    if (!mealName.trim()) {
      alert('Please enter a meal name to log it');
      return;
    }

    setSaving(true);
    try {
      const mealData = {
        name: mealName,
        ingredients: selectedIngredients.filter(item => item.ingredient_id && item.quantity > 0),
        user_id: user.id
      };
      
      const savedMeal = await api.createMeal(mealData);
      
      // Log the meal for today
      const today = new Date().toISOString().split('T')[0];
      await api.logMeal(savedMeal.id, user.id, today);
      alert('Meal logged successfully! Check your Tracker to see the impact.');
      setMealName('');
      setResult(null);
      setSelectedIngredients([]);
    } catch (error) {
      console.error('Error logging meal:', error);
      alert('Error logging meal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="calculator-page">
      <div className="page-header">
        <h1>Carbon Footprint Calculator</h1>
        <p>Calculate the environmental impact of your meals</p>
      </div>

      <div className="card">
        <h2>Add Ingredients</h2>
        {isAuthenticated && (
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px', padding: '12px', background: '#f0f7ff', borderRadius: '6px' }}>
            💡 <strong>Tip:</strong> After calculating, you can save this meal and log it in your Tracker to track your weekly sustainability!
          </p>
        )}
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

          {isAuthenticated && (
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
              <h3>Save & Track This Meal</h3>
              <div className="input-group">
                <label>Meal Name</label>
                <input
                  type="text"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="e.g., Grilled Chicken Salad"
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  className="btn btn-success"
                  onClick={saveMeal}
                  disabled={saving || !mealName.trim()}
                  style={{ flex: 1 }}
                >
                  {saving ? 'Saving...' : 'Save Meal'}
                </button>
                <button
                  className="btn"
                  onClick={logMealToday}
                  disabled={saving || !mealName.trim()}
                  style={{ flex: 1 }}
                >
                  {saving ? 'Logging...' : 'Log Meal Today'}
                </button>
              </div>
              <p style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
                Save to use later, or log it today to track your weekly sustainability!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Calculator;

