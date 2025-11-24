import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Tracker.css';

function Tracker() {
  const { user } = useAuth();
  const userId = user?.id;
  const [stats, setStats] = useState(null);
  const [weeklyHistory, setWeeklyHistory] = useState([]);
  const [dailyMeals, setDailyMeals] = useState([]);
  const [savedMeals, setSavedMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggingMeal, setLoggingMeal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    try {
      const [statsData, historyData, dailyData, mealsData] = await Promise.all([
        api.getStats(userId),
        api.getWeeklyHistory(userId),
        api.getDailyMeals(userId),
        api.getMeals(userId)
      ]);
      
      setStats(statsData);
      setWeeklyHistory(historyData || []);
      setDailyMeals(dailyData || []);
      setSavedMeals(mealsData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tracker data:', error);
      setStats(null);
      setWeeklyHistory([]);
      setDailyMeals([]);
      setSavedMeals([]);
      setLoading(false);
    }
  };

  const logMeal = async (mealId, date) => {
    setLoggingMeal(true);
    try {
      await api.logMeal(mealId, userId, date);
      alert('Meal logged successfully!');
      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Error logging meal:', error);
      alert('Error logging meal. Please try again.');
    } finally {
      setLoggingMeal(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const weeklyChartData = (weeklyHistory || []).map(week => ({
    week: new Date(week.week_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    carbon: parseFloat(week.total_carbon_footprint || 0) || 0,
    meals: parseInt(week.total_meals || 0) || 0
  })).reverse();

  const dailyChartData = (dailyMeals || []).reduce((acc, meal) => {
    if (!meal || !meal.date) return acc;
    let dateString = meal.date;
    if (meal.date && meal.date.includes('T')) {
      dateString = meal.date.split('T')[0];
    }
    const existing = acc.find(item => item.originalDate === dateString);
    const carbonValue = parseFloat(meal.carbon_footprint || 0) || 0;
    if (existing) {
      existing.carbon += carbonValue;
      existing.meals += 1;
    } else {
      // Parse date as local to avoid timezone issues
      const [year, month, day] = dateString.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      acc.push({
        originalDate: dateString,
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        carbon: carbonValue,
        meals: 1
      });
    }
    return acc;
  }, []).sort((a, b) => {
    // Sort by date string directly (YYYY-MM-DD format)
    return a.originalDate.localeCompare(b.originalDate);
  }).slice(-7);

  return (
    <div className="tracker-page">
      <div className="page-header">
        <h1>Sustainability Tracker</h1>
        <p>Track your weekly environmental impact</p>
      </div>

      {!stats ? (
        <div className="card">
          <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Unable to load tracker data. Please try again later.
          </p>
        </div>
      ) : (
        <>
          {/* Quick Log Meal Section */}
          <div className="log-meal-card">
            <h2>📝 Log a Meal</h2>
            <div className="log-meal-content">
              <div className="log-meal-date-group">
                <label>Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="log-meal-buttons">
                {savedMeals.length > 0 ? (
                  <div className="meals-buttons-grid">
                    {savedMeals.slice(0, 5).map((meal) => (
                      <button
                        key={meal.id}
                        onClick={() => logMeal(meal.id, selectedDate)}
                        disabled={loggingMeal}
                        className="meal-log-button"
                      >
                        {loggingMeal ? 'Logging...' : `Log ${meal.name}`}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="no-meals-message">
                    <p>
                      No saved meals yet. Create meals in the Calculator first!
                    </p>
                    <Link to="/calculator" className="calculator-link-button">
                      Go to Calculator →
                    </Link>
                  </div>
                )}
              </div>
            </div>
            {savedMeals.length > 5 && (
              <p style={{ marginTop: '16px', fontSize: '13px', opacity: 0.9 }}>
                Showing 5 of {savedMeals.length} saved meals. Create more in Calculator.
              </p>
            )}
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Current Week</h3>
              <div className="value">{parseFloat(stats.current_week?.total_carbon_footprint || 0).toFixed(2)}</div>
              <div className="unit">kg CO₂</div>
              <div className="sub-value">{(stats.current_week?.total_meals) || 0} meals</div>
            </div>
            <div className="stat-card">
              <h3>Last 7 Days</h3>
              <div className="value">{parseFloat(stats.last_7_days?.total_carbon_footprint || 0).toFixed(2)}</div>
              <div className="unit">kg CO₂</div>
              <div className="sub-value">{(stats.last_7_days?.meal_count) || 0} meals</div>
            </div>
            <div className="stat-card">
              <h3>All Time Total</h3>
              <div className="value">{parseFloat(stats.all_time?.total_carbon_footprint || 0).toFixed(2)}</div>
              <div className="unit">kg CO₂</div>
              <div className="sub-value">{(stats.all_time?.meal_count) || 0} meals</div>
            </div>
            <div className="stat-card">
              <h3>Average per Meal</h3>
              <div className="value">{parseFloat(stats.all_time?.average_per_meal || 0).toFixed(2)}</div>
              <div className="unit">kg CO₂</div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="card">
              <h2>Weekly Carbon Footprint Trend</h2>
              {weeklyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="carbon" stroke="#667eea" strokeWidth={2} name="Carbon (kg CO₂)" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No weekly data available. Start logging meals to see your progress!
                </p>
              )}
            </div>

            <div className="card">
              <h2>Daily Carbon Footprint (Last 7 Days)</h2>
              {dailyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="carbon" fill="#764ba2" name="Carbon (kg CO₂)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No daily data available. Start logging meals to see your progress!
                </p>
              )}
            </div>

            <div className="card">
              <h2>Weekly Meal Count</h2>
              {weeklyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="meals" fill="#28a745" name="Number of Meals" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No weekly data available.
                </p>
              )}
            </div>
          </div>

          <div className="card">
            <h2>Recent Meals</h2>
            {dailyMeals.length > 0 ? (
              <div className="meals-list">
                {dailyMeals.slice(0, 10).map((meal, index) => {
                  // Format date properly - handle both date strings and timestamps
                  let dateString = meal.date;
                  if (meal.date && meal.date.includes('T')) {
                    // If it's a timestamp, extract just the date part
                    dateString = meal.date.split('T')[0];
                  }
                  
                  // Parse date as local (not UTC) to avoid timezone shifts
                  // Split YYYY-MM-DD and create date in local timezone
                  const [year, month, day] = dateString.split('-').map(Number);
                  const dateObj = new Date(year, month - 1, day); // month is 0-indexed
                  
                  const displayDate = dateObj.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  });
                  
                  return (
                    <div key={index} className="meal-item">
                      <div className="meal-name">{meal.meal_name || 'Unknown Meal'}</div>
                      <div className="meal-date">{displayDate}</div>
                      <div className="meal-carbon">{parseFloat(meal.carbon_footprint || 0).toFixed(2)} kg CO₂</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <p style={{ marginBottom: '16px' }}>
                  No meals logged yet. Start tracking your meals!
                </p>
                <Link 
                  to="/calculator" 
                  className="btn"
                  style={{ display: 'inline-block' }}
                >
                  Create & Log Your First Meal
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Tracker;

