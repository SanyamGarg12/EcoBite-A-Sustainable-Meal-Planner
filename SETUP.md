# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

Or use the convenience script:
```bash
npm run install-all
```

## Step 2: Set Up MySQL Database

1. Make sure MySQL is running on your system

2. Create the database and run the schema:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ecobite;"
mysql -u root -p ecobite < database/schema.sql
mysql -u root -p ecobite < database/seed.sql
```

3. Create `.env` file in the `server` directory:
```bash
cd server
cp env.template .env
```

4. Edit `server/.env` with your MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=ecobite
PORT=5000
JWT_SECRET=any_random_string_here
```

## Step 3: Run the Application

### Option 1: Run both together (recommended)
```bash
npm run dev
```

### Option 2: Run separately

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run client
```

## Step 4: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running: `mysql -u root -p`
- Check your credentials in `server/.env`
- Ensure the database `ecobite` exists

### Port Already in Use
- Change the PORT in `server/.env` if 5000 is taken
- Change React port by setting PORT in `client/.env` (create if needed)

### Missing Dependencies
- Delete `node_modules` folders and reinstall:
  ```bash
  rm -rf node_modules server/node_modules client/node_modules
  npm run install-all
  ```

