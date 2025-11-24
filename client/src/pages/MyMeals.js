import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './MyMeals.css';

function MyMeals() {
  const { user } = useAuth();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchMeals();
    }
  }, [user]);

  const fetchMeals = async () => {
    try {
      const mealsData = await api.getMeals(user.id);
      // Fetch ingredients for each meal
      const mealsWithIngredients = await Promise.all(
        mealsData.map(async (meal) => {
          try {
            const mealWithIngredients = await api.getMealById(meal.id);
            return mealWithIngredients;
          } catch (error) {
            console.error(`Error fetching ingredients for meal ${meal.id}:`, error);
            return { ...meal, ingredients: [] };
          }
        })
      );
      setMeals(mealsWithIngredients);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMealExpansion = (mealId) => {
    setExpandedMeal(expandedMeal === mealId ? null : mealId);
  };

  const getCarbonFootprintColor = (carbon) => {
    if (carbon < 2) return '#43e97b'; // Green - Low
    if (carbon < 5) return '#fee140'; // Yellow - Medium
    if (carbon < 10) return '#fa709a'; // Orange - High
    return '#f093fb'; // Red - Very High
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Meat': '#fa709a',
      'Fish': '#4facfe',
      'Dairy': '#fee140',
      'Grain': '#43e97b',
      'Legume': '#764ba2',
      'Vegetable': '#30cfd0',
      'Fruit': '#f093fb',
    };
    return colors[category] || '#667eea';
  };

  const filteredMeals = meals.filter(meal =>
    meal.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meal.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading your meals...</div>;
  }

  return (
    <div className="my-meals-page">
      <div className="page-header">
        <div>
          <h1>My Meals</h1>
          <p>View and manage all your created meals with detailed ingredients and insights</p>
        </div>
        <Link to="/calculator" className="btn btn-primary">
          <span className="icon">➕</span>
          Create New Meal
        </Link>
      </div>

      {meals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <h2>No Meals Yet</h2>
          <p>Start creating meals in the Calculator to see them here!</p>
          <Link to="/calculator" className="btn btn-primary">
            Go to Calculator
          </Link>
        </div>
      ) : (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search meals by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="meals-grid">
            {filteredMeals.map((meal) => {
              const ingredients = meal.ingredients || [];
              const totalCarbon = parseFloat(meal.total_carbon_footprint || 0);
              const totalCalories = parseFloat(meal.total_calories || 0);
              const isExpanded = expandedMeal === meal.id;

              // Calculate insights
              const avgCarbonPerIngredient = ingredients.length > 0
                ? ingredients.reduce((sum, ing) => sum + (parseFloat(ing.carbon_footprint_per_kg || 0) * parseFloat(ing.quantity || 0)), 0) / ingredients.length
                : 0;

              const categoryBreakdown = ingredients.reduce((acc, ing) => {
                const cat = ing.category || 'Other';
                if (!acc[cat]) {
                  acc[cat] = { count: 0, carbon: 0 };
                }
                acc[cat].count += 1;
                acc[cat].carbon += parseFloat(ing.carbon_footprint_per_kg || 0) * parseFloat(ing.quantity || 0);
                return acc;
              }, {});

              return (
                <div key={meal.id} className="meal-card">
                  <div className="meal-card-header">
                    <div className="meal-title-section">
                      <h3 className="meal-name">{meal.name}</h3>
                      {meal.description && (
                        <p className="meal-description">{meal.description}</p>
                      )}
                    </div>
                    <div className="meal-stats-badge">
                      <div className="stat-item">
                        <span className="stat-icon">🌍</span>
                        <span className="stat-value" style={{ color: getCarbonFootprintColor(totalCarbon) }}>
                          {totalCarbon.toFixed(2)} kg CO₂
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">🔥</span>
                        <span className="stat-value">{totalCalories.toFixed(0)} cal</span>
                      </div>
                    </div>
                  </div>

                  <div className="meal-card-body">
                    <div className="meal-quick-info">
                      <div className="info-item">
                        <span className="info-label">Ingredients:</span>
                        <span className="info-value">{ingredients.length}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Created:</span>
                        <span className="info-value">
                          {new Date(meal.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    {ingredients.length > 0 && (
                      <button
                        className="expand-btn"
                        onClick={() => toggleMealExpansion(meal.id)}
                      >
                        {isExpanded ? (
                          <>
                            <span>Hide Details</span>
                            <span className="icon">▲</span>
                          </>
                        ) : (
                          <>
                            <span>View Ingredients & Insights</span>
                            <span className="icon">▼</span>
                          </>
                        )}
                      </button>
                    )}

                    {isExpanded && ingredients.length > 0 && (
                      <div className="meal-details">
                        <div className="ingredients-section">
                          <h4 className="section-title">
                            <span className="section-icon">🥘</span>
                            Ingredients ({ingredients.length})
                          </h4>
                          <div className="ingredients-list">
                            {ingredients.map((ing, idx) => {
                              const ingCarbon = parseFloat(ing.carbon_footprint_per_kg || 0) * parseFloat(ing.quantity || 0);
                              const ingCalories = (parseFloat(ing.quantity || 0) * 1000 * (ing.nutritional_value?.calories || 0)) / 100;
                              
                              return (
                                <div key={idx} className="ingredient-item">
                                  <div className="ingredient-header">
                                    <div className="ingredient-name-section">
                                      <span
                                        className="category-badge"
                                        style={{ backgroundColor: getCategoryColor(ing.category) }}
                                      >
                                        {ing.category}
                                      </span>
                                      <span className="ingredient-name">{ing.name}</span>
                                    </div>
                                    <span className="ingredient-quantity">
                                      {parseFloat(ing.quantity || 0).toFixed(2)} kg
                                    </span>
                                  </div>
                                  <div className="ingredient-stats">
                                    <div className="ingredient-stat">
                                      <span className="stat-label">Carbon:</span>
                                      <span className="stat-value" style={{ color: getCarbonFootprintColor(ingCarbon) }}>
                                        {ingCarbon.toFixed(2)} kg CO₂
                                      </span>
                                    </div>
                                    <div className="ingredient-stat">
                                      <span className="stat-label">Calories:</span>
                                      <span className="stat-value">{ingCalories.toFixed(0)} cal</span>
                                    </div>
                                    {ing.nutritional_value && (
                                      <div className="ingredient-nutrition">
                                        <span>P: {ing.nutritional_value.protein || 0}g</span>
                                        <span>C: {ing.nutritional_value.carbs || 0}g</span>
                                        <span>F: {ing.nutritional_value.fats || 0}g</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="insights-section">
                          <h4 className="section-title">
                            <span className="section-icon">📊</span>
                            Insights
                          </h4>
                          <div className="insights-grid">
                            <div className="insight-card">
                              <div className="insight-icon">🌍</div>
                              <div className="insight-content">
                                <div className="insight-label">Total Carbon Footprint</div>
                                <div className="insight-value" style={{ color: getCarbonFootprintColor(totalCarbon) }}>
                                  {totalCarbon.toFixed(2)} kg CO₂
                                </div>
                              </div>
                            </div>
                            <div className="insight-card">
                              <div className="insight-icon">📈</div>
                              <div className="insight-content">
                                <div className="insight-label">Avg Carbon per Ingredient</div>
                                <div className="insight-value">
                                  {avgCarbonPerIngredient.toFixed(2)} kg CO₂
                                </div>
                              </div>
                            </div>
                            <div className="insight-card">
                              <div className="insight-icon">🔥</div>
                              <div className="insight-content">
                                <div className="insight-label">Total Calories</div>
                                <div className="insight-value">{totalCalories.toFixed(0)} cal</div>
                              </div>
                            </div>
                            <div className="insight-card">
                              <div className="insight-icon">🥗</div>
                              <div className="insight-content">
                                <div className="insight-label">Total Ingredients</div>
                                <div className="insight-value">{ingredients.length}</div>
                              </div>
                            </div>
                          </div>

                          {Object.keys(categoryBreakdown).length > 0 && (
                            <div className="category-breakdown">
                              <h5 className="breakdown-title">Category Breakdown</h5>
                              <div className="category-list">
                                {Object.entries(categoryBreakdown).map(([category, data]) => (
                                  <div key={category} className="category-item">
                                    <div className="category-info">
                                      <span
                                        className="category-dot"
                                        style={{ backgroundColor: getCategoryColor(category) }}
                                      ></span>
                                      <span className="category-name">{category}</span>
                                      <span className="category-count">({data.count} items)</span>
                                    </div>
                                    <span className="category-carbon">
                                      {data.carbon.toFixed(2)} kg CO₂
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMeals.length === 0 && searchQuery && (
            <div className="no-results">
              <p>No meals found matching "{searchQuery}"</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MyMeals;

