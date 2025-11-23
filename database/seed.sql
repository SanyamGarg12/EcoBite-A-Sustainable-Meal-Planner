-- Seed data for EcoBite database
USE ecobite;

-- Insert sample ingredients with carbon footprint data (CO2 equivalent in kg per kg of ingredient)
INSERT INTO ingredients (name, category, carbon_footprint_per_kg, unit, nutritional_value) VALUES
-- Meat (high carbon footprint)
('Beef', 'Meat', 27.0, 'kg', '{"protein": 26, "carbs": 0, "fats": 15, "calories": 250}'),
('Lamb', 'Meat', 24.0, 'kg', '{"protein": 25, "carbs": 0, "fats": 21, "calories": 294}'),
('Pork', 'Meat', 12.0, 'kg', '{"protein": 27, "carbs": 0, "fats": 14, "calories": 242}'),
('Chicken', 'Meat', 6.9, 'kg', '{"protein": 27, "carbs": 0, "fats": 14, "calories": 239}'),
('Turkey', 'Meat', 10.9, 'kg', '{"protein": 29, "carbs": 0, "fats": 7, "calories": 189}'),

-- Dairy
('Milk', 'Dairy', 3.2, 'kg', '{"protein": 3.4, "carbs": 4.8, "fats": 3.6, "calories": 61}'),
('Cheese', 'Dairy', 13.5, 'kg', '{"protein": 25, "carbs": 1, "fats": 33, "calories": 402}'),
('Butter', 'Dairy', 12.0, 'kg', '{"protein": 0.9, "carbs": 0.1, "fats": 81, "calories": 717}'),
('Yogurt', 'Dairy', 3.2, 'kg', '{"protein": 10, "carbs": 4, "fats": 0.4, "calories": 59}'),

-- Fish
('Salmon', 'Fish', 11.9, 'kg', '{"protein": 20, "carbs": 0, "fats": 13, "calories": 208}'),
('Tuna', 'Fish', 6.1, 'kg', '{"protein": 30, "carbs": 0, "fats": 1, "calories": 132}'),
('Cod', 'Fish', 3.9, 'kg', '{"protein": 18, "carbs": 0, "fats": 0.7, "calories": 82}'),

-- Grains
('Rice', 'Grain', 4.0, 'kg', '{"protein": 2.7, "carbs": 28, "fats": 0.3, "calories": 130}'),
('Wheat', 'Grain', 1.4, 'kg', '{"protein": 13, "carbs": 71, "fats": 2, "calories": 327}'),
('Oats', 'Grain', 2.3, 'kg', '{"protein": 17, "carbs": 66, "fats": 7, "calories": 389}'),
('Quinoa', 'Grain', 1.4, 'kg', '{"protein": 14, "carbs": 64, "fats": 6, "calories": 368}'),

-- Legumes
('Lentils', 'Legume', 0.9, 'kg', '{"protein": 25, "carbs": 63, "fats": 1, "calories": 353}'),
('Chickpeas', 'Legume', 2.2, 'kg', '{"protein": 19, "carbs": 61, "fats": 6, "calories": 364}'),
('Black Beans', 'Legume', 2.0, 'kg', '{"protein": 21, "carbs": 62, "fats": 1, "calories": 341}'),
('Soybeans', 'Legume', 2.0, 'kg', '{"protein": 36, "carbs": 30, "fats": 20, "calories": 446}'),

-- Vegetables
('Tomatoes', 'Vegetable', 2.3, 'kg', '{"protein": 0.9, "carbs": 3.9, "fats": 0.2, "calories": 18}'),
('Potatoes', 'Vegetable', 0.3, 'kg', '{"protein": 2, "carbs": 17, "fats": 0.1, "calories": 77}'),
('Carrots', 'Vegetable', 0.4, 'kg', '{"protein": 0.9, "carbs": 10, "fats": 0.2, "calories": 41}'),
('Broccoli', 'Vegetable', 2.0, 'kg', '{"protein": 2.8, "carbs": 7, "fats": 0.4, "calories": 34}'),
('Spinach', 'Vegetable', 0.3, 'kg', '{"protein": 2.9, "carbs": 3.6, "fats": 0.4, "calories": 23}'),
('Onions', 'Vegetable', 0.4, 'kg', '{"protein": 1.1, "carbs": 9, "fats": 0.1, "calories": 40}'),

-- Fruits
('Apples', 'Fruit', 0.4, 'kg', '{"protein": 0.3, "carbs": 14, "fats": 0.2, "calories": 52}'),
('Bananas', 'Fruit', 0.7, 'kg', '{"protein": 1.1, "carbs": 23, "fats": 0.3, "calories": 89}'),
('Oranges', 'Fruit', 0.3, 'kg', '{"protein": 0.9, "carbs": 12, "fats": 0.2, "calories": 47}'),
('Berries', 'Fruit', 0.7, 'kg', '{"protein": 0.7, "carbs": 15, "fats": 0.3, "calories": 57}'),

-- Nuts and Seeds
('Almonds', 'Nuts', 2.3, 'kg', '{"protein": 21, "carbs": 22, "fats": 50, "calories": 579}'),
('Walnuts', 'Nuts', 2.1, 'kg', '{"protein": 15, "carbs": 14, "fats": 65, "calories": 654}'),
('Peanuts', 'Nuts', 2.5, 'kg', '{"protein": 26, "carbs": 16, "fats": 49, "calories": 567}'),

-- Oils
('Olive Oil', 'Oil', 6.0, 'kg', '{"protein": 0, "carbs": 0, "fats": 100, "calories": 884}'),
('Coconut Oil', 'Oil', 3.2, 'kg', '{"protein": 0, "carbs": 0, "fats": 100, "calories": 862}'),
('Sunflower Oil', 'Oil', 3.5, 'kg', '{"protein": 0, "carbs": 0, "fats": 100, "calories": 884}')

ON DUPLICATE KEY UPDATE name=name;

