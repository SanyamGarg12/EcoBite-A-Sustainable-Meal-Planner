-- EcoBite Database Schema
CREATE DATABASE IF NOT EXISTS ecobite;
USE ecobite;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ingredients table with carbon footprint data
CREATE TABLE IF NOT EXISTS ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    carbon_footprint_per_kg DECIMAL(10, 2) NOT NULL COMMENT 'CO2 equivalent in kg per kg of ingredient',
    unit VARCHAR(20) DEFAULT 'kg',
    nutritional_value JSON COMMENT 'Stores protein, carbs, fats, calories per 100g',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_name (name)
);

-- Meals table
CREATE TABLE IF NOT EXISTS meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    total_carbon_footprint DECIMAL(10, 2) DEFAULT 0,
    total_calories DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Meal ingredients junction table
CREATE TABLE IF NOT EXISTS meal_ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meal_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL COMMENT 'Quantity in kg',
    FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);

-- Weekly sustainability tracker
CREATE TABLE IF NOT EXISTS weekly_tracker (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    week_start_date DATE NOT NULL,
    total_carbon_footprint DECIMAL(10, 2) DEFAULT 0,
    total_meals INT DEFAULT 0,
    average_carbon_per_meal DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_week (user_id, week_start_date)
);

-- Daily meal logs
CREATE TABLE IF NOT EXISTS daily_meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    meal_id INT,
    date DATE NOT NULL,
    carbon_footprint DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE SET NULL
);

-- Indexes for better performance
CREATE INDEX idx_meals_user ON meals(user_id);
CREATE INDEX idx_daily_meals_user_date ON daily_meals(user_id, date);
CREATE INDEX idx_weekly_tracker_user_week ON weekly_tracker(user_id, week_start_date);

