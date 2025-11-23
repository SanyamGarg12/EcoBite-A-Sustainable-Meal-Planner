const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Calculate carbon footprint for a meal
router.post('/meal', async (req, res) => {
  try {
    const { ingredients } = req.body; // Array of {ingredient_id, quantity}
    
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients array is required' });
    }
    
    let totalCarbonFootprint = 0;
    let totalCalories = 0;
    const mealDetails = [];
    
    for (const item of ingredients) {
      const [ingredientRows] = await db.execute(
        'SELECT * FROM ingredients WHERE id = ?',
        [item.ingredient_id]
      );
      
      if (ingredientRows.length === 0) {
        return res.status(404).json({ error: `Ingredient with id ${item.ingredient_id} not found` });
      }
      
      const ingredient = ingredientRows[0];
      const nutritional_value = typeof ingredient.nutritional_value === 'string'
        ? JSON.parse(ingredient.nutritional_value)
        : ingredient.nutritional_value;
      
      // Calculate carbon footprint (quantity in kg * carbon_footprint_per_kg)
      const carbonFootprint = item.quantity * ingredient.carbon_footprint_per_kg;
      totalCarbonFootprint += carbonFootprint;
      
      // Calculate calories (quantity in kg * 1000g/kg * calories per 100g / 100)
      const calories = (item.quantity * 1000 * nutritional_value.calories) / 100;
      totalCalories += calories;
      
      mealDetails.push({
        ingredient: {
          id: ingredient.id,
          name: ingredient.name,
          category: ingredient.category
        },
        quantity: item.quantity,
        carbon_footprint: parseFloat(carbonFootprint.toFixed(2)),
        calories: parseFloat(calories.toFixed(2))
      });
    }
    
    res.json({
      total_carbon_footprint: parseFloat(totalCarbonFootprint.toFixed(2)),
      total_calories: parseFloat(totalCalories.toFixed(2)),
      ingredients: mealDetails,
      sustainability_score: calculateSustainabilityScore(totalCarbonFootprint)
    });
  } catch (error) {
    console.error('Error calculating meal carbon footprint:', error);
    res.status(500).json({ error: 'Failed to calculate carbon footprint' });
  }
});

// Calculate carbon footprint for a single ingredient
router.post('/ingredient', async (req, res) => {
  try {
    const { ingredient_id, quantity } = req.body;
    
    if (!ingredient_id || !quantity) {
      return res.status(400).json({ error: 'ingredient_id and quantity are required' });
    }
    
    const [ingredientRows] = await db.execute(
      'SELECT * FROM ingredients WHERE id = ?',
      [ingredient_id]
    );
    
    if (ingredientRows.length === 0) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    
    const ingredient = ingredientRows[0];
    const nutritional_value = typeof ingredient.nutritional_value === 'string'
      ? JSON.parse(ingredient.nutritional_value)
      : ingredient.nutritional_value;
    
    const carbonFootprint = quantity * ingredient.carbon_footprint_per_kg;
    const calories = (quantity * 1000 * nutritional_value.calories) / 100;
    
    res.json({
      ingredient: {
        id: ingredient.id,
        name: ingredient.name,
        category: ingredient.category
      },
      quantity: quantity,
      carbon_footprint: parseFloat(carbonFootprint.toFixed(2)),
      calories: parseFloat(calories.toFixed(2)),
      sustainability_score: calculateSustainabilityScore(carbonFootprint)
    });
  } catch (error) {
    console.error('Error calculating ingredient carbon footprint:', error);
    res.status(500).json({ error: 'Failed to calculate carbon footprint' });
  }
});

// Helper function to calculate sustainability score (0-100, higher is better)
function calculateSustainabilityScore(carbonFootprint) {
  // Score based on carbon footprint per meal
  // Lower carbon = higher score
  // Scale: 0-5 kg CO2 = 100-80, 5-10 = 80-60, 10-15 = 60-40, 15+ = 40-0
  if (carbonFootprint <= 5) {
    return Math.max(80, 100 - (carbonFootprint * 4));
  } else if (carbonFootprint <= 10) {
    return Math.max(60, 80 - ((carbonFootprint - 5) * 4));
  } else if (carbonFootprint <= 15) {
    return Math.max(40, 60 - ((carbonFootprint - 10) * 4));
  } else {
    return Math.max(0, 40 - ((carbonFootprint - 15) * 2.67));
  }
}

module.exports = router;

