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
    
    // Find alternatives with lower carbon footprint
    // Get more candidates to allow for better filtering
    const [alternatives] = await db.execute(
      `SELECT * FROM ingredients 
       WHERE id != ? 
       AND carbon_footprint_per_kg < ?
       ORDER BY carbon_footprint_per_kg ASC
       LIMIT 20`,
      [ingredientId, originalIngredient.carbon_footprint_per_kg]
    );
    
    // Score alternatives based on multiple factors
    const scoredAlternatives = alternatives.map(alt => {
      const altNutrition = typeof alt.nutritional_value === 'string'
        ? JSON.parse(alt.nutritional_value)
        : alt.nutritional_value;
      
      // 1. Category similarity score (0-100)
      // Same category = 100, different category = 0
      const categoryScore = alt.category === originalIngredient.category ? 100 : 0;
      
      // 2. Calculate nutritional similarity score (0-100)
      // Normalize differences to percentages of original values to make comparison fair
      const proteinDiff = originalNutrition.protein > 0 
        ? Math.abs(altNutrition.protein - originalNutrition.protein) / originalNutrition.protein * 100
        : Math.abs(altNutrition.protein - originalNutrition.protein);
      const carbsDiff = originalNutrition.carbs > 0
        ? Math.abs(altNutrition.carbs - originalNutrition.carbs) / originalNutrition.carbs * 100
        : Math.abs(altNutrition.carbs - originalNutrition.carbs);
      const fatsDiff = originalNutrition.fats > 0
        ? Math.abs(altNutrition.fats - originalNutrition.fats) / originalNutrition.fats * 100
        : Math.abs(altNutrition.fats - originalNutrition.fats);
      const caloriesDiff = originalNutrition.calories > 0
        ? Math.abs(altNutrition.calories - originalNutrition.calories) / originalNutrition.calories * 100
        : Math.abs(altNutrition.calories - originalNutrition.calories);
      
      // Average the normalized differences and convert to similarity score
      const avgDiff = (proteinDiff + carbsDiff + fatsDiff + caloriesDiff) / 4;
      const nutritionScore = Math.max(0, 100 - avgDiff);
      
      // 3. Calculate carbon reduction percentage
      const carbonReduction = ((originalIngredient.carbon_footprint_per_kg - alt.carbon_footprint_per_kg) / originalIngredient.carbon_footprint_per_kg) * 100;
      
      // 4. Overall score (weighted: 30% category, 30% nutrition, 40% carbon reduction)
      // Category similarity is important for practical substitutions
      const overallScore = (categoryScore * 0.3) + (nutritionScore * 0.3) + (Math.min(carbonReduction, 100) * 0.4);
      
      return {
        ...alt,
        nutritional_value: altNutrition,
        carbon_reduction_percent: parseFloat(carbonReduction.toFixed(2)),
        nutrition_similarity_score: parseFloat(nutritionScore.toFixed(2)),
        category_similarity: categoryScore,
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

