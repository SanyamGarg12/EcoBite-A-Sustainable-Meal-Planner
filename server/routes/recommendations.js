const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get sustainable alternatives for an ingredient
router.get('/alternatives/:ingredient_id', async (req, res) => {
  try {
    const ingredientId = req.params.ingredient_id;
    
    // Get the original ingredient
    const [ingredientRows] = await db.execute(
      'SELECT * FROM ingredients WHERE id = ?',
      [ingredientId]
    );
    
    if (ingredientRows.length === 0) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    
    const originalIngredient = ingredientRows[0];
    const originalNutrition = typeof originalIngredient.nutritional_value === 'string'
      ? JSON.parse(originalIngredient.nutritional_value)
      : originalIngredient.nutritional_value;
    
    // Find alternatives with lower carbon footprint and similar nutritional profile
    const [alternatives] = await db.execute(
      `SELECT * FROM ingredients 
       WHERE id != ? 
       AND carbon_footprint_per_kg < ?
       ORDER BY carbon_footprint_per_kg ASC
       LIMIT 10`,
      [ingredientId, originalIngredient.carbon_footprint_per_kg]
    );
    
    // Score alternatives based on nutritional similarity and carbon reduction
    const scoredAlternatives = alternatives.map(alt => {
      const altNutrition = typeof alt.nutritional_value === 'string'
        ? JSON.parse(alt.nutritional_value)
        : alt.nutritional_value;
      
      // Calculate nutritional similarity score (0-100)
      const proteinDiff = Math.abs(altNutrition.protein - originalNutrition.protein);
      const carbsDiff = Math.abs(altNutrition.carbs - originalNutrition.carbs);
      const fatsDiff = Math.abs(altNutrition.fats - originalNutrition.fats);
      const caloriesDiff = Math.abs(altNutrition.calories - originalNutrition.calories);
      
      const nutritionScore = 100 - ((proteinDiff + carbsDiff + fatsDiff + caloriesDiff / 10) / 4);
      
      // Calculate carbon reduction percentage
      const carbonReduction = ((originalIngredient.carbon_footprint_per_kg - alt.carbon_footprint_per_kg) / originalIngredient.carbon_footprint_per_kg) * 100;
      
      // Overall score (weighted: 40% nutrition, 60% carbon reduction)
      const overallScore = (nutritionScore * 0.4) + (Math.min(carbonReduction, 100) * 0.6);
      
      return {
        ...alt,
        nutritional_value: altNutrition,
        carbon_reduction_percent: parseFloat(carbonReduction.toFixed(2)),
        nutrition_similarity_score: parseFloat(nutritionScore.toFixed(2)),
        overall_score: parseFloat(overallScore.toFixed(2))
      };
    });
    
    // Sort by overall score
    scoredAlternatives.sort((a, b) => b.overall_score - a.overall_score);
    
    res.json({
      original_ingredient: {
        ...originalIngredient,
        nutritional_value: originalNutrition
      },
      alternatives: scoredAlternatives.slice(0, 5) // Top 5 alternatives
    });
  } catch (error) {
    console.error('Error fetching alternatives:', error);
    res.status(500).json({ error: 'Failed to fetch alternatives' });
  }
});

// Get recommendations for a meal
router.post('/meal', async (req, res) => {
  try {
    const { ingredients } = req.body; // Array of {ingredient_id, quantity}
    
    if (!Array.isArray(ingredients)) {
      return res.status(400).json({ error: 'Ingredients array is required' });
    }
    
    const recommendations = [];
    
    for (const item of ingredients) {
      const [ingredientRows] = await db.execute(
        'SELECT * FROM ingredients WHERE id = ?',
        [item.ingredient_id]
      );
      
      if (ingredientRows.length === 0) continue;
      
      const ingredient = ingredientRows[0];
      
      // Get alternatives for this ingredient
      const [alternatives] = await db.execute(
        `SELECT * FROM ingredients 
         WHERE id != ? 
         AND carbon_footprint_per_kg < ?
         ORDER BY carbon_footprint_per_kg ASC
         LIMIT 3`,
        [item.ingredient_id, ingredient.carbon_footprint_per_kg]
      );
      
      if (alternatives.length > 0) {
        const originalNutrition = typeof ingredient.nutritional_value === 'string'
          ? JSON.parse(ingredient.nutritional_value)
          : ingredient.nutritional_value;
        
        const scoredAlternatives = alternatives.map(alt => {
          const altNutrition = typeof alt.nutritional_value === 'string'
            ? JSON.parse(alt.nutritional_value)
            : alt.nutritional_value;
          
          const carbonReduction = ((ingredient.carbon_footprint_per_kg - alt.carbon_footprint_per_kg) / ingredient.carbon_footprint_per_kg) * 100;
          
          return {
            ...alt,
            nutritional_value: altNutrition,
            carbon_reduction_percent: parseFloat(carbonReduction.toFixed(2))
          };
        });
        
        recommendations.push({
          original: {
            ...ingredient,
            nutritional_value: originalNutrition,
            quantity: item.quantity
          },
          alternatives: scoredAlternatives
        });
      }
    }
    
    res.json({ recommendations });
  } catch (error) {
    console.error('Error generating meal recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

module.exports = router;

