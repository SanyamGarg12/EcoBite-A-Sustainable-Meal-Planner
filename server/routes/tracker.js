const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get weekly tracker for a user
router.get('/weekly/:user_id', async (req, res) => {
  try {
    const userId = req.params.user_id;
    const { week_start } = req.query;
    
    let query = 'SELECT * FROM weekly_tracker WHERE user_id = ?';
    const params = [userId];
    
    if (week_start) {
      query += ' AND week_start_date = ?';
      params.push(week_start);
    } else {
      // Get current week
      const weekStart = getWeekStartDate(new Date());
      query += ' AND week_start_date = ?';
      params.push(weekStart);
    }
    
    const [trackers] = await db.execute(query, params);
    
    if (trackers.length === 0) {
      return res.json({
        week_start_date: week_start || getWeekStartDate(new Date()),
        total_carbon_footprint: 0,
        total_meals: 0,
        average_carbon_per_meal: 0
      });
    }
    
    res.json(trackers[0]);
  } catch (error) {
    console.error('Error fetching weekly tracker:', error);
    res.status(500).json({ error: 'Failed to fetch weekly tracker' });
  }
});

// Get weekly history for a user
router.get('/weekly/:user_id/history', async (req, res) => {
  try {
    const userId = req.params.user_id;
    // Parse and sanitize limit - ensure it's a positive integer
    let limit = parseInt(req.query.limit) || 12;
    limit = Math.max(1, Math.min(limit, 100)); // Clamp between 1 and 100 for safety
    
    // LIMIT cannot use parameter placeholder, so we insert it directly (after sanitization)
    const [trackers] = await db.execute(
      `SELECT * FROM weekly_tracker WHERE user_id = ? ORDER BY week_start_date DESC LIMIT ${limit}`,
      [userId]
    );
    
    res.json(trackers);
  } catch (error) {
    console.error('Error fetching weekly history:', error);
    res.status(500).json({ error: 'Failed to fetch weekly history' });
  }
});

// Get daily meals for a user
router.get('/daily/:user_id', async (req, res) => {
  try {
    const userId = req.params.user_id;
    const { start_date, end_date } = req.query;
    
    let query = 'SELECT dm.*, m.name as meal_name FROM daily_meals dm LEFT JOIN meals m ON dm.meal_id = m.id WHERE dm.user_id = ?';
    const params = [userId];
    
    if (start_date && end_date) {
      query += ' AND dm.date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    } else if (start_date) {
      query += ' AND dm.date >= ?';
      params.push(start_date);
    } else {
      // Default to last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query += ' AND dm.date >= ?';
      params.push(sevenDaysAgo.toISOString().split('T')[0]);
    }
    
    query += ' ORDER BY dm.date DESC';
    
    const [meals] = await db.execute(query, params);
    
    res.json(meals);
  } catch (error) {
    console.error('Error fetching daily meals:', error);
    res.status(500).json({ error: 'Failed to fetch daily meals' });
  }
});

// Get statistics for a user
router.get('/stats/:user_id', async (req, res) => {
  try {
    const userId = req.params.user_id;
    
    // Current week stats
    const weekStart = getWeekStartDate(new Date());
    const [currentWeek] = await db.execute(
      'SELECT * FROM weekly_tracker WHERE user_id = ? AND week_start_date = ?',
      [userId, weekStart]
    );
    
    // Last 7 days total
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const [last7Days] = await db.execute(
      'SELECT SUM(carbon_footprint) as total, COUNT(*) as meal_count FROM daily_meals WHERE user_id = ? AND date >= ?',
      [userId, sevenDaysAgo.toISOString().split('T')[0]]
    );
    
    // All time stats
    const [allTime] = await db.execute(
      'SELECT SUM(carbon_footprint) as total, COUNT(*) as meal_count, AVG(carbon_footprint) as average FROM daily_meals WHERE user_id = ?',
      [userId]
    );
    
    // Weekly average
    const [weeklyAvg] = await db.execute(
      'SELECT AVG(total_carbon_footprint) as avg_weekly FROM weekly_tracker WHERE user_id = ?',
      [userId]
    );
    
    // Helper to safely parse float, handling null
    const safeParseFloat = (value) => {
      if (value === null || value === undefined || value === 'null') {
        return 0;
      }
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    const safeParseInt = (value) => {
      if (value === null || value === undefined || value === 'null') {
        return 0;
      }
      const parsed = parseInt(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    res.json({
      current_week: currentWeek.length > 0 ? {
        week_start_date: currentWeek[0].week_start_date,
        total_carbon_footprint: safeParseFloat(currentWeek[0].total_carbon_footprint),
        total_meals: safeParseInt(currentWeek[0].total_meals),
        average_carbon_per_meal: safeParseFloat(currentWeek[0].average_carbon_per_meal)
      } : {
        week_start_date: weekStart,
        total_carbon_footprint: 0,
        total_meals: 0,
        average_carbon_per_meal: 0
      },
      last_7_days: {
        total_carbon_footprint: safeParseFloat(last7Days[0]?.total),
        meal_count: safeParseInt(last7Days[0]?.meal_count)
      },
      all_time: {
        total_carbon_footprint: safeParseFloat(allTime[0]?.total),
        meal_count: safeParseInt(allTime[0]?.meal_count),
        average_per_meal: safeParseFloat(allTime[0]?.average)
      },
      weekly_average: safeParseFloat(weeklyAvg[0]?.avg_weekly)
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Helper function to get week start date (Monday)
function getWeekStartDate(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

module.exports = router;

