const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ingredients', require('./routes/ingredients'));
app.use('/api/meals', require('./routes/meals'));
app.use('/api/calculator', require('./routes/calculator'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/tracker', require('./routes/tracker'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'EcoBite API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

