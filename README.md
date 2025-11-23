# EcoBite - A Sustainable Meal Planner

EcoBite is a web-based application designed to promote sustainable eating by helping users understand the environmental impact of their meals. The platform calculates the carbon footprint of ingredients, visualizes the ecological cost of food choices, and recommends eco-friendly alternatives with comparable nutritional value.

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: MySQL
- **Frontend**: React
- **Visualization**: Recharts

## Features

1. **Carbon Footprint Calculator**: Calculate the environmental impact of meals and individual ingredients
2. **Interactive Dashboard**: Visualize environmental impact with charts and graphs
3. **Recommendation System**: Get sustainable ingredient alternatives with similar nutritional profiles
4. **Weekly Sustainability Tracker**: Track your weekly carbon footprint and meal statistics

## Project Structure

```
ecobite-project/
├── server/                 # Node.js backend
│   ├── config/            # Database configuration
│   ├── routes/            # API routes
│   └── index.js           # Server entry point
├── client/                # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service
│   │   └── App.js
│   └── package.json
├── database/              # Database scripts
│   ├── schema.sql         # Database schema
│   └── seed.sql           # Seed data
└── package.json           # Root package.json
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (root, server, and client)
npm run install-all
```

### 2. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE ecobite;
```

2. Run the schema script:
```bash
mysql -u root -p ecobite < database/schema.sql
```

3. Seed the database with sample data:
```bash
mysql -u root -p ecobite < database/seed.sql
```

### 3. Configure Environment Variables

1. Copy the example environment file:
```bash
cp server/.env.example server/.env
```

2. Edit `server/.env` with your database credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ecobite
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
```

### 4. Run the Application

#### Option 1: Run both server and client together
```bash
npm run dev
```

#### Option 2: Run separately

Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Ingredients
- `GET /api/ingredients` - Get all ingredients
- `GET /api/ingredients/:id` - Get ingredient by ID
- `GET /api/ingredients/search/:query` - Search ingredients

### Calculator
- `POST /api/calculator/meal` - Calculate carbon footprint for a meal
- `POST /api/calculator/ingredient` - Calculate carbon footprint for an ingredient

### Meals
- `GET /api/meals` - Get all meals
- `GET /api/meals/:id` - Get meal by ID
- `POST /api/meals` - Create a new meal
- `POST /api/meals/:id/log` - Log a meal for tracking

### Recommendations
- `GET /api/recommendations/alternatives/:ingredient_id` - Get alternatives for an ingredient
- `POST /api/recommendations/meal` - Get recommendations for a meal

### Tracker
- `GET /api/tracker/weekly/:user_id` - Get weekly tracker
- `GET /api/tracker/weekly/:user_id/history` - Get weekly history
- `GET /api/tracker/daily/:user_id` - Get daily meals
- `GET /api/tracker/stats/:user_id` - Get user statistics

## Usage

1. **Dashboard**: View overview of ingredients and their carbon footprints
2. **Calculator**: Add ingredients and quantities to calculate meal carbon footprint
3. **Recommendations**: Select an ingredient to find sustainable alternatives
4. **Tracker**: View weekly and daily carbon footprint statistics

## Database Schema

The database includes the following tables:
- `users` - User accounts
- `ingredients` - Food ingredients with carbon footprint data
- `meals` - User-created meals
- `meal_ingredients` - Junction table for meal ingredients
- `weekly_tracker` - Weekly sustainability tracking
- `daily_meals` - Daily meal logs

## Carbon Footprint Data

The application includes carbon footprint data (CO₂ equivalent in kg per kg of ingredient) for various food categories including:
- Meat (beef, lamb, pork, chicken, turkey)
- Dairy (milk, cheese, butter, yogurt)
- Fish (salmon, tuna, cod)
- Grains (rice, wheat, oats, quinoa)
- Legumes (lentils, chickpeas, beans)
- Vegetables and Fruits
- Nuts and Oils

## Development

### Adding New Ingredients

You can add new ingredients to the database by inserting into the `ingredients` table:

```sql
INSERT INTO ingredients (name, category, carbon_footprint_per_kg, unit, nutritional_value)
VALUES ('Ingredient Name', 'Category', 2.5, 'kg', '{"protein": 10, "carbs": 20, "fats": 5, "calories": 150}');
```

## License

MIT

## Author

Computational Gastronomy Course Project

