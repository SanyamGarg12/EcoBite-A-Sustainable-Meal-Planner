# 🌱 EcoBite - A Sustainable Meal Planner

<div align="center">

**Promoting Sustainable Eating Through Computational Gastronomy**

[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Project Structure](#-project-structure)

</div>

---

## 📖 About

EcoBite is a comprehensive web-based application designed to promote sustainable eating by helping users understand and reduce the environmental impact of their meals. The platform combines **computational gastronomy principles** with data-driven analysis to make sustainable eating both measurable and accessible.

### Key Highlights

- 🧮 **Real-time Carbon Footprint Calculator** for meals and ingredients
- 📊 **Interactive Dashboard** with beautiful data visualizations
- 🔍 **Smart Recommendation System** for sustainable alternatives
- 📈 **Personalized Sustainability Tracker** for progress monitoring
- 🔐 **User Authentication** for personalized meal tracking
- 🍽️ **Meal Management** with detailed insights

---

## ✨ Features

### 1. Carbon Footprint Calculator
- Calculate environmental impact of any meal or ingredient
- Real-time calculations as you add ingredients
- Per-ingredient breakdown with quantities
- Total calories calculation
- Save meals for future reference

### 2. Interactive Dashboard
- Overview statistics (total ingredients, categories, average carbon)
- Carbon footprint by category (bar chart)
- Top 5 high carbon ingredients visualization
- Category distribution (pie chart)
- Real-time data updates

### 3. Recommendation System
- Find sustainable alternatives for any ingredient
- Multi-factor scoring algorithm (category, nutrition, carbon reduction)
- Nutritional comparison to maintain dietary balance
- Top 5 ranked alternatives with carbon savings percentage

### 4. Sustainability Tracker
- Quick meal logging with date picker
- Statistics cards (current week, last 7 days, all-time)
- Weekly carbon footprint trend (line chart)
- Daily carbon footprint visualization (bar chart)
- Weekly meal count tracking
- Recent meals list with dates

### 5. My Meals
- View all created meals in one place
- Search functionality
- Expandable meal details
- Complete ingredient lists with quantities
- Carbon footprint breakdown
- Category-wise analysis
- Nutritional insights
- Color-coded indicators

---

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **Recharts** - Data visualization library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Context API** - Global state management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **JWT** - Authentication tokens
- **Bcrypt.js** - Password hashing

### Architecture
- **RESTful API** design
- **Three-tier architecture** (Presentation, Application, Data)
- **Responsive design** for all devices

---

## 🚀 Installation

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v14 or higher)
- **MySQL** (v8 or higher)
- **npm** or **yarn**

### Step 1: Clone the Repository

```bash
git clone https://github.com/SanyamGarg12/EcoBite-A-Sustainable-Meal-Planner.git
cd EcoBite-A-Sustainable-Meal-Planner
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

Or use the convenience script:
```bash
npm run install-all
```

### Step 3: Database Setup

1. **Create MySQL database:**
```sql
CREATE DATABASE ecobite;
```

2. **Run the schema:**
```bash
mysql -u root -p ecobite < database/schema.sql
```

3. **Seed the database:**
```bash
mysql -u root -p ecobite < database/seed.sql
```

### Step 4: Configure Environment Variables

1. **Copy the environment template:**
```bash
cp server/env.template server/.env
```

2. **Edit `server/.env` with your credentials:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ecobite
PORT=5000
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
```

### Step 5: Run the Application

#### Option 1: Run Both Together (Recommended)
```bash
npm run dev
```

#### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
npm run server
# or
cd server && npm start
```

**Terminal 2 - Frontend:**
```bash
npm run client
# or
cd client && npm start
```

### Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

---

## 📱 Usage

### Getting Started

1. **Sign Up** - Create a new account or log in
2. **Explore Dashboard** - View ingredient statistics and visualizations
3. **Calculate Carbon Footprint** - Add ingredients to calculate meal impact
4. **Get Recommendations** - Find sustainable alternatives for ingredients
5. **Track Progress** - Log meals and monitor your sustainability journey
6. **Manage Meals** - View and manage all your created meals

### Example Workflow

1. Navigate to **Calculator**
2. Add ingredients (e.g., Beef 0.5kg, Rice 0.3kg)
3. View real-time carbon footprint calculation
4. Click **Get Recommendations** to find alternatives
5. Save the meal for future reference
6. Log the meal in **Tracker** to track your progress

---

## 📚 API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/verify` | Verify JWT token |

### Ingredients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ingredients` | Get all ingredients |
| GET | `/api/ingredients/:id` | Get ingredient by ID |
| GET | `/api/ingredients/search/:query` | Search ingredients |

### Calculator

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/calculator/meal` | Calculate meal carbon footprint |
| POST | `/api/calculator/ingredient` | Calculate ingredient footprint |

### Meals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meals` | Get meals (with user filter) |
| POST | `/api/meals` | Create new meal |
| GET | `/api/meals/:id` | Get meal by ID |
| POST | `/api/meals/:id/log` | Log meal to tracker |

### Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommendations/alternatives/:id` | Get alternatives for ingredient |
| POST | `/api/recommendations/meal` | Get meal recommendations |

### Tracker

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tracker/stats/:user_id` | Get user statistics |
| GET | `/api/tracker/weekly/:user_id/history` | Get weekly history |
| GET | `/api/tracker/daily/:user_id` | Get daily meals |

---

## 📁 Project Structure

```
EcoBite/
├── client/                    # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Navbar.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/          # React Context
│   │   │   └── AuthContext.js
│   │   ├── pages/            # Page components
│   │   │   ├── Dashboard.js
│   │   │   ├── Calculator.js
│   │   │   ├── Recommendations.js
│   │   │   ├── Tracker.js
│   │   │   ├── MyMeals.js
│   │   │   ├── Login.js
│   │   │   └── Signup.js
│   │   ├── services/         # API services
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── server/                    # Node.js Backend
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── ingredients.js
│   │   ├── calculator.js
│   │   ├── meals.js
│   │   ├── recommendations.js
│   │   └── tracker.js
│   ├── index.js
│   └── package.json
│
├── database/                  # Database scripts
│   ├── schema.sql
│   └── seed.sql
│
├── README.md
└── package.json
```

---

## 🗄️ Database Schema

### Tables

- **`users`** - User account information
- **`ingredients`** - Food ingredients with carbon footprint and nutritional data
- **`meals`** - User-created meal records
- **`meal_ingredients`** - Junction table for meal-ingredient relationships
- **`weekly_tracker`** - Aggregated weekly sustainability metrics
- **`daily_meals`** - Daily meal logging records

### Relationships

- Users → Meals (one-to-many)
- Meals ↔ Ingredients (many-to-many via meal_ingredients)
- Users → Daily Meals (one-to-many)
- Weekly Tracker aggregates daily meals per user per week

---

## 📊 Carbon Footprint Data

The application includes carbon footprint data (CO₂ equivalent in kg per kg of ingredient) for various food categories:

- **Meat**: Beef, Lamb, Pork, Chicken, Turkey
- **Dairy**: Milk, Cheese, Butter, Yogurt
- **Fish**: Salmon, Tuna, Cod
- **Grains**: Rice, Wheat, Oats, Quinoa
- **Legumes**: Lentils, Chickpeas, Black Beans, Soybeans
- **Vegetables**: Tomatoes, Potatoes, Carrots, Broccoli, Spinach, Onions
- **Fruits**: Apples, Bananas, Oranges, Berries
- **Nuts & Seeds**: Almonds, Walnuts, Peanuts
- **Oils**: Olive Oil, Coconut Oil, Sunflower Oil

---

## 🧮 Recommendation Algorithm

The recommendation system uses a **multi-factor scoring algorithm**:

1. **Category Similarity** (30% weight) - Same category gets higher score
2. **Nutritional Similarity** (30% weight) - Compares protein, carbs, fats, calories
3. **Carbon Reduction** (40% weight) - Percentage reduction in carbon footprint

**Overall Score Formula:**
```
S_overall = 0.3 × S_category + 0.3 × S_nutrition + 0.4 × R_carbon
```

---

## 🎯 Computational Gastronomy

EcoBite applies computational gastronomy principles through:

- **Quantitative Analysis** - Measuring food properties with numbers
- **Data-Driven Algorithms** - Making recommendations based on data
- **Pattern Recognition** - Finding patterns in meal tracking
- **Algorithm-Based Substitution** - Using math to find best ingredient swaps
- **Objective Comparison** - Comparing foods using clear metrics

---

## 🔧 Development

### Adding New Ingredients

Add new ingredients to the database:

```sql
INSERT INTO ingredients (name, category, carbon_footprint_per_kg, unit, nutritional_value)
VALUES (
    'Ingredient Name',
    'Category',
    2.5,
    'kg',
    '{"protein": 10, "carbs": 20, "fats": 5, "calories": 150}'
);
```

### Running Tests

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

### Building for Production

```bash
# Build frontend
cd client
npm run build

# The build folder will contain the production-ready files
```

---

## 📸 Screenshots

### Dashboard Overview

<div align="center">
  <img src="Readme Assets/dashboard.png" alt="Dashboard Overview" width="800"/>
  <p><em>Interactive dashboard showing ingredient statistics, carbon footprint by category, and data visualizations</em></p>
</div>

### Carbon Footprint Calculator

<div align="center">
  <img src="Readme Assets/Carbon calc 1.png" alt="Carbon Calculator - Adding Ingredients" width="800"/>
  <p><em>Adding ingredients and quantities to calculate meal carbon footprint</em></p>
</div>

<div align="center">
  <img src="Readme Assets/Carbon calc 2.png" alt="Carbon Calculator - Results" width="800"/>
  <p><em>Real-time carbon footprint calculation with per-ingredient breakdown</em></p>
</div>

### Recommendation System

<div align="center">
  <img src="Readme Assets/Recommendation System.png" alt="Recommendation System" width="800"/>
  <p><em>Finding sustainable alternatives with carbon reduction percentages and nutritional comparisons</em></p>
</div>

### Sustainability Tracker

<div align="center">
  <img src="Readme Assets/Tracker 1.png" alt="Tracker - Statistics" width="800"/>
  <p><em>Statistics cards showing current week, last 7 days, and all-time carbon footprint data</em></p>
</div>

<div align="center">
  <img src="Readme Assets/Tracker 2.png" alt="Tracker - Weekly Trends" width="800"/>
  <p><em>Weekly carbon footprint trends and meal count visualizations</em></p>
</div>

<div align="center">
  <img src="Readme Assets/Tracker 3.png" alt="Tracker - Daily Meals" width="800"/>
  <p><em>Daily carbon footprint chart and recent meals list</em></p>
</div>

### My Meals

<div align="center">
  <img src="Readme Assets/My meals 1.png" alt="My Meals - Overview" width="800"/>
  <p><em>View all created meals with search functionality and expandable details</em></p>
</div>

<div align="center">
  <img src="Readme Assets/My meals 2.png" alt="My Meals - Details" width="800"/>
  <p><em>Detailed meal view with ingredients, carbon footprint breakdown, and nutritional insights</em></p>
</div>

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Sanyam Garg (2022448)**

---

## 🙏 Acknowledgments

- Carbon footprint data based on research from Poore & Nemecek (2018)
- Computational gastronomy principles from Ahn et al. (2011)
- Built with modern web technologies and best practices

---

## 📧 Contact

Email me at sanyam22448@iiitd.ac.in

---

<div align="center">

[⬆ Back to Top](#-ecobite---a-sustainable-meal-planner)

</div>
