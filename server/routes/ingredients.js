const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all ingredients
router.get('/', async (req, res) => {
  try {
    const [ingredients] = await db.execute(
      'SELECT * FROM ingredients ORDER BY name'
    );
    
    // Parse JSON nutritional_value and ensure numeric types
    const parsedIngredients = ingredients.map(ing => ({
      ...ing,
      carbon_footprint_per_kg: parseFloat(ing.carbon_footprint_per_kg) || 0,
      nutritional_value: typeof ing.nutritional_value === 'string' 
        ? JSON.parse(ing.nutritional_value) 
        : ing.nutritional_value
    }));
    
    res.json(parsedIngredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});

// Get ingredient by ID
router.get('/:id', async (req, res) => {
  try {
    const [ingredients] = await db.execute(
      'SELECT * FROM ingredients WHERE id = ?',
      [req.params.id]
    );
    
    if (ingredients.length === 0) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    
    const ingredient = ingredients[0];
    ingredient.carbon_footprint_per_kg = parseFloat(ingredient.carbon_footprint_per_kg) || 0;
    ingredient.nutritional_value = typeof ingredient.nutritional_value === 'string'
      ? JSON.parse(ingredient.nutritional_value)
      : ingredient.nutritional_value;
    
    res.json(ingredient);
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    res.status(500).json({ error: 'Failed to fetch ingredient' });
  }
});

// Search ingredients by name or category
router.get('/search/:query', async (req, res) => {
  try {
    const query = `%${req.params.query}%`;
    const [ingredients] = await db.execute(
      'SELECT * FROM ingredients WHERE name LIKE ? OR category LIKE ? ORDER BY name',
      [query, query]
    );
    
    const parsedIngredients = ingredients.map(ing => ({
      ...ing,
      carbon_footprint_per_kg: parseFloat(ing.carbon_footprint_per_kg) || 0,
      nutritional_value: typeof ing.nutritional_value === 'string'
        ? JSON.parse(ing.nutritional_value)
        : ing.nutritional_value
    }));
    
    res.json(parsedIngredients);
  } catch (error) {
    console.error('Error searching ingredients:', error);
    res.status(500).json({ error: 'Failed to search ingredients' });
  }
});

module.exports = router;

