const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all meals for a user
router.get('/', async (req, res) => {
  try {
    const { user_id } = req.query;
    let query = 'SELECT * FROM meals';
    const params = [];
    
    if (user_id) {
      query += ' WHERE user_id = ?';
      params.push(user_id);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [meals] = await db.execute(query, params);
    res.json(meals);
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// Get meal by ID with ingredients
router.get('/:id', async (req, res) => {
  try {
    const [meals] = await db.execute(
      'SELECT * FROM meals WHERE id = ?',
      [req.params.id]
    );
    
    if (meals.length === 0) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    
    const meal = meals[0];
    
    // Get meal ingredients
    const [ingredients] = await db.execute(
      `SELECT mi.*, i.name, i.category, i.carbon_footprint_per_kg, i.nutritional_value
       FROM meal_ingredients mi
       JOIN ingredients i ON mi.ingredient_id = i.id
       WHERE mi.meal_id = ?`,
      [req.params.id]
    );
    
    meal.ingredients = ingredients.map(ing => ({
      ...ing,
      nutritional_value: typeof ing.nutritional_value === 'string'
        ? JSON.parse(ing.nutritional_value)
        : ing.nutritional_value
    }));
    
    res.json(meal);
  } catch (error) {
    console.error('Error fetching meal:', error);
    res.status(500).json({ error: 'Failed to fetch meal' });
  }
});

// Create a new meal
router.post('/', async (req, res) => {
  try {
    const { name, description, ingredients, user_id } = req.body;
    
    if (!name || !ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ error: 'Name and ingredients array are required' });
    }
    
    // Calculate total carbon footprint
    let totalCarbonFootprint = 0;
    let totalCalories = 0;
    
    for (const item of ingredients) {
      const [ingredientRows] = await db.execute(
        'SELECT carbon_footprint_per_kg, nutritional_value FROM ingredients WHERE id = ?',
        [item.ingredient_id]
      );
      
      if (ingredientRows.length === 0) {
        return res.status(404).json({ error: `Ingredient with id ${item.ingredient_id} not found` });
      }
      
      const ingredient = ingredientRows[0];
      const nutritional_value = typeof ingredient.nutritional_value === 'string'
        ? JSON.parse(ingredient.nutritional_value)
        : ingredient.nutritional_value;
      
      totalCarbonFootprint += item.quantity * ingredient.carbon_footprint_per_kg;
      totalCalories += (item.quantity * 1000 * nutritional_value.calories) / 100;
    }
    
    // Insert meal
    const [result] = await db.execute(
      'INSERT INTO meals (user_id, name, description, total_carbon_footprint, total_calories) VALUES (?, ?, ?, ?, ?)',
      [user_id || null, name, description || null, totalCarbonFootprint, totalCalories]
    );
    
    const mealId = result.insertId;
    
    // Insert meal ingredients
    for (const item of ingredients) {
      await db.execute(
        'INSERT INTO meal_ingredients (meal_id, ingredient_id, quantity) VALUES (?, ?, ?)',
        [mealId, item.ingredient_id, item.quantity]
      );
    }
    
    // Get the created meal with ingredients
    const [meals] = await db.execute(
      'SELECT * FROM meals WHERE id = ?',
      [mealId]
    );
    
    const meal = meals[0];
    
    const [mealIngredients] = await db.execute(
      `SELECT mi.*, i.name, i.category, i.carbon_footprint_per_kg, i.nutritional_value
       FROM meal_ingredients mi
       JOIN ingredients i ON mi.ingredient_id = i.id
       WHERE mi.meal_id = ?`,
      [mealId]
    );
    
    meal.ingredients = mealIngredients.map(ing => ({
      ...ing,
      nutritional_value: typeof ing.nutritional_value === 'string'
        ? JSON.parse(ing.nutritional_value)
        : ing.nutritional_value
    }));
    
    res.status(201).json(meal);
  } catch (error) {
    console.error('Error creating meal:', error);
    res.status(500).json({ error: 'Failed to create meal' });
  }
});

// Log a meal for daily tracking
router.post('/:id/log', async (req, res) => {
  try {
    const { user_id, date } = req.body;
    const mealId = req.params.id;
    
    if (!user_id || !date) {
      return res.status(400).json({ error: 'user_id and date are required' });
    }
    
    // Get meal carbon footprint
    const [meals] = await db.execute(
      'SELECT total_carbon_footprint FROM meals WHERE id = ?',
      [mealId]
    );
    
    if (meals.length === 0) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    
    // Ensure carbon footprint is a number
    const carbonFootprint = parseFloat(meals[0].total_carbon_footprint) || 0;
    
    // Insert daily meal log
    await db.execute(
      'INSERT INTO daily_meals (user_id, meal_id, date, carbon_footprint) VALUES (?, ?, ?, ?)',
      [user_id, mealId, date, carbonFootprint]
    );
    
    // Update weekly tracker
    const weekStart = getWeekStartDate(new Date(date));
    await updateWeeklyTracker(user_id, weekStart, carbonFootprint);
    
    res.json({ message: 'Meal logged successfully' });
  } catch (error) {
    console.error('Error logging meal:', error);
    res.status(500).json({ error: 'Failed to log meal' });
  }
});

// Helper function to get week start date (Monday)
function getWeekStartDate(date) {
  // Handle both Date objects and date strings (YYYY-MM-DD)
  let d;
  if (typeof date === 'string') {
    // Parse date string as local date to avoid timezone issues
    const [year, month, day] = date.split('-').map(Number);
    d = new Date(year, month - 1, day);
  } else {
    d = new Date(date);
  }
  
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const weekStart = new Date(d.setDate(diff));
  
  // Format as YYYY-MM-DD in local timezone
  const year = weekStart.getFullYear();
  const month = String(weekStart.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(weekStart.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayOfMonth}`;
}

// Helper function to update weekly tracker
async function updateWeeklyTracker(userId, weekStart, carbonFootprint) {
  try {
    const [existing] = await db.execute(
      'SELECT * FROM weekly_tracker WHERE user_id = ? AND week_start_date = ?',
      [userId, weekStart]
    );
    
    if (existing.length > 0) {
      const tracker = existing[0];
      // Ensure both values are parsed as floats to avoid string concatenation
      const currentTotal = parseFloat(tracker.total_carbon_footprint) || 0;
      const newCarbon = parseFloat(carbonFootprint) || 0;
      const newTotal = currentTotal + newCarbon;
      const newMealCount = parseInt(tracker.total_meals) + 1;
      const newAverage = newTotal / newMealCount;
      
      await db.execute(
        'UPDATE weekly_tracker SET total_carbon_footprint = ?, total_meals = ?, average_carbon_per_meal = ? WHERE id = ?',
        [newTotal, newMealCount, newAverage, tracker.id]
      );
    } else {
      const newCarbon = parseFloat(carbonFootprint) || 0;
      await db.execute(
        'INSERT INTO weekly_tracker (user_id, week_start_date, total_carbon_footprint, total_meals, average_carbon_per_meal) VALUES (?, ?, ?, 1, ?)',
        [userId, weekStart, newCarbon, newCarbon]
      );
    }
  } catch (error) {
    console.error('Error updating weekly tracker:', error);
  }
}

module.exports = router;

