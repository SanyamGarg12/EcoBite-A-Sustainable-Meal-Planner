import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import './Tracker.css';

function Tracker() {
  const [userId] = useState(1); // For demo purposes
  const [stats, setStats] = useState(null);
  const [weeklyHistory, setWeeklyHistory] = useState([]);
  const [dailyMeals, setDailyMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, historyData, dailyData] = await Promise.all([
        api.getStats(userId),
        api.getWeeklyHistory(userId),
        api.getDailyMeals(userId)
      ]);
      
      setStats(statsData);
      setWeeklyHistory(historyData);
      setDailyMeals(dailyData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tracker data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const weeklyChartData = weeklyHistory.map(week => ({
    week: new Date(week.week_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    carbon: parseFloat(week.total_carbon_footprint || 0),
    meals: week.total_meals || 0
  })).reverse();

  const dailyChartData = dailyMeals.reduce((acc, meal) => {
    const date = meal.date;
    const existing = acc.find(item => item.originalDate === date);
    if (existing) {
      existing.carbon += parseFloat(meal.carbon_footprint || 0);
      existing.meals += 1;
    } else {
      acc.push({
        originalDate: date,
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        carbon: parseFloat(meal.carbon_footprint || 0),
        meals: 1
      });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.originalDate) - new Date(b.originalDate)).slice(-7);

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
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Current Week</h3>
              <div className="value">{stats.current_week.total_carbon_footprint.toFixed(2)}</div>
              <div className="unit">kg CO₂</div>
              <div className="sub-value">{stats.current_week.total_meals} meals</div>
            </div>
            <div className="stat-card">
              <h3>Last 7 Days</h3>
              <div className="value">{stats.last_7_days.total_carbon_footprint.toFixed(2)}</div>
              <div className="unit">kg CO₂</div>
              <div className="sub-value">{stats.last_7_days.meal_count} meals</div>
            </div>
            <div className="stat-card">
              <h3>All Time Total</h3>
              <div className="value">{stats.all_time.total_carbon_footprint.toFixed(2)}</div>
              <div className="unit">kg CO₂</div>
              <div className="sub-value">{stats.all_time.meal_count} meals</div>
            </div>
            <div className="stat-card">
              <h3>Average per Meal</h3>
              <div className="value">{stats.all_time.average_per_meal.toFixed(2)}</div>
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
                {dailyMeals.slice(0, 10).map((meal, index) => (
                  <div key={index} className="meal-item">
                    <div className="meal-name">{meal.meal_name || 'Unknown Meal'}</div>
                    <div className="meal-date">{meal.date}</div>
                    <div className="meal-carbon">{meal.carbon_footprint.toFixed(2)} kg CO₂</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                No meals logged yet. Use the Calculator to create and log meals!
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Tracker;

