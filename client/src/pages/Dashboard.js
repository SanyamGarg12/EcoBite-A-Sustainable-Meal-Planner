import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import './Dashboard.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'];

function Dashboard() {
  const [ingredients, setIngredients] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topIngredients, setTopIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await api.getIngredients();
      setIngredients(data);
      
      // Process category data - ensure numeric conversion
      const categoryMap = {};
      data.forEach(ing => {
        const carbonFootprint = parseFloat(ing.carbon_footprint_per_kg) || 0;
        
        if (!categoryMap[ing.category]) {
          categoryMap[ing.category] = {
            name: ing.category,
            count: 0,
            avgCarbon: 0,
            totalCarbon: 0
          };
        }
        categoryMap[ing.category].count++;
        categoryMap[ing.category].totalCarbon += carbonFootprint;
      });
      
      const categoryArray = Object.values(categoryMap).map(cat => ({
        ...cat,
        avgCarbon: cat.count > 0 ? parseFloat((cat.totalCarbon / cat.count).toFixed(2)) : 0
      }));
      
      setCategoryData(categoryArray);
      
      // Top 5 ingredients by carbon footprint - ensure numeric sorting
      const sorted = [...data]
        .map(ing => ({
          ...ing,
          carbon_footprint_per_kg: parseFloat(ing.carbon_footprint_per_kg) || 0
        }))
        .sort((a, b) => b.carbon_footprint_per_kg - a.carbon_footprint_per_kg);
      setTopIngredients(sorted.slice(0, 5));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>EcoBite Dashboard</h1>
        <p>Understanding the environmental impact of food choices</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Ingredients</h3>
          <div className="value">{ingredients.length}</div>
          <div className="unit">items</div>
        </div>
        <div className="stat-card">
          <h3>Categories</h3>
          <div className="value">{categoryData.length}</div>
          <div className="unit">types</div>
        </div>
        <div className="stat-card">
          <h3>Avg Carbon Footprint</h3>
          <div className="value">
            {ingredients.length > 0
              ? (ingredients.reduce((sum, ing) => {
                  const carbon = parseFloat(ing.carbon_footprint_per_kg) || 0;
                  return sum + carbon;
                }, 0) / ingredients.length).toFixed(2)
              : '0.00'}
          </div>
          <div className="unit">kg CO₂/kg</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <h2>Carbon Footprint by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgCarbon" fill="#667eea" name="Avg CO₂ (kg/kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Top 5 High Carbon Ingredients</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topIngredients} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="carbon_footprint_per_kg" fill="#dc3545" name="CO₂ (kg/kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Category Distribution</h2>
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
                dataKey="count"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

