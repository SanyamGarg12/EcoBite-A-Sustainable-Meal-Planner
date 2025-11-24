const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get meal pattern analysis for a user
router.get('/patterns/:user_id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.user_id;
    
    // Verify user can only access their own data
    if (req.user.userId !== parseInt(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get most consumed ingredients (from meals that have ingredients)
    const [topIngredients] = await db.execute(
      `SELECT 
        i.name, 
        i.category,
        i.carbon_footprint_per_kg,
        SUM(mi.quantity) as total_quantity,
        COUNT(DISTINCT m.id) as meal_count
      FROM meal_ingredients mi
      JOIN meals m ON mi.meal_id = m.id
      JOIN ingredients i ON mi.ingredient_id = i.id
      WHERE m.user_id = ?
      GROUP BY i.id, i.name, i.category, i.carbon_footprint_per_kg
      ORDER BY total_quantity DESC
      LIMIT 10`,
      [userId]
    );

    // Get category distribution (from meals that have ingredients)
    const [categoryDist] = await db.execute(
      `SELECT 
        i.category,
        COUNT(DISTINCT m.id) as meal_count,
        SUM(mi.quantity * i.carbon_footprint_per_kg) as total_carbon,
        AVG(i.carbon_footprint_per_kg) as avg_carbon
      FROM meal_ingredients mi
      JOIN meals m ON mi.meal_id = m.id
      JOIN ingredients i ON mi.ingredient_id = i.id
      WHERE m.user_id = ?
      GROUP BY i.category
      ORDER BY total_carbon DESC`,
      [userId]
    );

    // Get meal statistics from daily_meals (works even without ingredients)
    // Use IFNULL to handle NULL values from SUM/AVG when no rows exist
    const [mealStats] = await db.execute(
      `SELECT 
        COUNT(DISTINCT dm.id) as total_logged_meals,
        COUNT(DISTINCT dm.date) as days_with_meals,
        IFNULL(SUM(dm.carbon_footprint), 0) as total_carbon,
        IFNULL(AVG(dm.carbon_footprint), 0) as avg_carbon_per_meal
      FROM daily_meals dm
      WHERE dm.user_id = ?`,
      [userId]
    );

    // Get weekly trends - format dates as strings to avoid timezone issues
    const [weeklyTrends] = await db.execute(
      `SELECT 
        DATE_FORMAT(week_start_date, "%Y-%m-%d") as week_start_date,
        total_carbon_footprint,
        total_meals,
        average_carbon_per_meal
      FROM weekly_tracker
      WHERE user_id = ?
      ORDER BY week_start_date DESC
      LIMIT 12`,
      [userId]
    );

    // Calculate improvement metrics
    const improvement = weeklyTrends.length >= 2 ? {
      carbonReduction: weeklyTrends[0].total_carbon_footprint < weeklyTrends[1].total_carbon_footprint
        ? ((weeklyTrends[1].total_carbon_footprint - weeklyTrends[0].total_carbon_footprint) / weeklyTrends[1].total_carbon_footprint * 100).toFixed(2)
        : 0,
      isImproving: weeklyTrends[0].total_carbon_footprint < weeklyTrends[1].total_carbon_footprint
    } : null;

    // Ensure mealStats has proper defaults
    const stats = mealStats[0] || {};
    const safeMealStats = {
      total_logged_meals: parseInt(stats.total_logged_meals) || 0,
      days_with_meals: parseInt(stats.days_with_meals) || 0,
      total_carbon: parseFloat(stats.total_carbon) || 0,
      avg_carbon_per_meal: parseFloat(stats.avg_carbon_per_meal) || 0
    };

    res.json({
      topIngredients: topIngredients || [],
      categoryDistribution: categoryDist || [],
      weeklyTrends: (weeklyTrends || []).reverse(),
      improvement,
      mealStats: safeMealStats
    });
  } catch (error) {
    console.error('Error fetching patterns:', error);
    res.status(500).json({ error: 'Failed to fetch meal patterns' });
  }
});

// Get nutritional optimization suggestions
router.get('/nutrition/:user_id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.user_id;
    
    if (req.user.userId !== parseInt(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get average nutritional intake from logged meals
    // Use IFNULL to handle NULL values when no rows exist
    const [nutritionData] = await db.execute(
      `SELECT 
        IFNULL(AVG(m.total_calories), 0) as avg_calories,
        COUNT(DISTINCT dm.date) as days_logged
      FROM daily_meals dm
      JOIN meals m ON dm.meal_id = m.id
      WHERE dm.user_id = ? AND dm.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
      [userId]
    );

    // Get ingredients with high carbon but good nutrition
    const [suggestions] = await db.execute(
      `SELECT 
        i.id,
        i.name,
        i.category,
        i.carbon_footprint_per_kg,
        i.nutritional_value
      FROM ingredients i
      WHERE i.carbon_footprint_per_kg > 5
      ORDER BY i.carbon_footprint_per_kg DESC
      LIMIT 5`
    );

    const suggestionsWithAlternatives = await Promise.all(
      suggestions.map(async (ing) => {
        const [alternatives] = await db.execute(
          `SELECT * FROM ingredients 
           WHERE category = ? 
           AND carbon_footprint_per_kg < ?
           ORDER BY carbon_footprint_per_kg ASC
           LIMIT 3`,
          [ing.category, ing.carbon_footprint_per_kg]
        );
        return {
          ...ing,
          alternatives: alternatives.map(alt => ({
            ...alt,
            carbon_reduction: ((ing.carbon_footprint_per_kg - alt.carbon_footprint_per_kg) / ing.carbon_footprint_per_kg * 100).toFixed(2)
          }))
        };
      })
    );

    const nutrition = nutritionData[0] || {};
    res.json({
      averageNutrition: {
        avg_calories: parseFloat(nutrition.avg_calories) || 0,
        days_logged: parseInt(nutrition.days_logged) || 0
      },
      optimizationSuggestions: suggestionsWithAlternatives
    });
  } catch (error) {
    console.error('Error fetching nutrition insights:', error);
    res.status(500).json({ error: 'Failed to fetch nutrition insights' });
  }
});

module.exports = router;

