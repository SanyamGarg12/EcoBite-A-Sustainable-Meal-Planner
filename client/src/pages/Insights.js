import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import './Insights.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#330867'];

function Insights() {
  const { user } = useAuth();
  const [patterns, setPatterns] = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchInsights();
    }
  }, [user]);

  const fetchInsights = async () => {
    try {
      const [patternsData, nutritionData] = await Promise.all([
        api.getMealPatterns(user.id),
        api.getNutritionInsights(user.id)
      ]);
      setPatterns(patternsData);
      setNutrition(nutritionData);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading insights...</div>;
  }

  if (!patterns || !nutrition) {
    return (
      <div className="insights-page">
        <div className="page-header">
          <h1>Computational Gastronomy Insights</h1>
          <p>Analyze your eating patterns and optimize for sustainability</p>
        </div>
        <div className="card">
          <p>Start logging meals to see insights!</p>
        </div>
      </div>
    );
  }

  const categoryData = patterns.categoryDistribution.map(cat => ({
    name: cat.category,
    value: parseFloat(cat.total_carbon || 0),
    meals: cat.meal_count
  }));

  const topIngredientsData = patterns.topIngredients.map(ing => ({
    name: ing.name,
    quantity: parseFloat(ing.total_quantity || 0),
    carbon: parseFloat(ing.carbon_footprint_per_kg || 0)
  }));

  const weeklyTrendData = patterns.weeklyTrends.map(week => ({
    week: new Date(week.week_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    carbon: parseFloat(week.total_carbon_footprint || 0),
    meals: week.total_meals || 0
  }));

  return (
    <div className="insights-page">
      <div className="page-header">
        <h1>Computational Gastronomy Insights</h1>
        <p>Analyze your eating patterns and optimize for sustainability</p>
      </div>

      {patterns.improvement && (
        <div className={`improvement-card ${patterns.improvement.isImproving ? 'positive' : 'negative'}`}>
          <h3>📈 Weekly Progress</h3>
          <p>
            {patterns.improvement.isImproving 
              ? `Great job! You've reduced your carbon footprint by ${patterns.improvement.carbonReduction}% this week!`
              : 'Keep working on reducing your carbon footprint this week.'}
          </p>
        </div>
      )}

      <div className="charts-grid">
        <div className="card">
          <h2>Carbon Footprint by Category</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p>No data available</p>
          )}
        </div>

        <div className="card">
          <h2>Top Ingredients by Consumption</h2>
          {topIngredientsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topIngredientsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#667eea" name="Quantity (kg)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No data available</p>
          )}
        </div>

        <div className="card">
          <h2>Weekly Carbon Footprint Trend</h2>
          {weeklyTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="carbon" stroke="#764ba2" strokeWidth={2} name="Carbon (kg CO₂)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>No data available</p>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Nutritional Optimization Suggestions</h2>
        {nutrition.optimizationSuggestions && nutrition.optimizationSuggestions.length > 0 ? (
          <div className="suggestions-list">
            {nutrition.optimizationSuggestions.map((suggestion, idx) => (
              <div key={idx} className="suggestion-item">
                <div className="suggestion-header">
                  <h3>{suggestion.name}</h3>
                  <span className="carbon-badge high">{suggestion.carbon_footprint_per_kg} kg CO₂/kg</span>
                </div>
                <p className="suggestion-category">Category: {suggestion.category}</p>
                {suggestion.alternatives && suggestion.alternatives.length > 0 && (
                  <div className="alternatives">
                    <p className="alternatives-title">Consider these alternatives:</p>
                    {suggestion.alternatives.map((alt, altIdx) => (
                      <div key={altIdx} className="alternative-item">
                        <span className="alt-name">{alt.name}</span>
                        <span className="alt-carbon">{alt.carbon_footprint_per_kg} kg CO₂/kg</span>
                        <span className="alt-reduction">↓ {alt.carbon_reduction}% less carbon</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No optimization suggestions available. Keep logging meals to get personalized recommendations!</p>
        )}
      </div>
    </div>
  );
}

export default Insights;

