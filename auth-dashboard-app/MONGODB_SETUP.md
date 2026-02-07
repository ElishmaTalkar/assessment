# MongoDB Atlas Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/GitHub or email
3. Choose "Free" tier

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose "M0 FREE" tier
3. Select a cloud provider (AWS recommended)
4. Choose a region close to you
5. Click "Create Cluster"

### Step 3: Create Database User
1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `taskflow`
5. Password: Generate a secure password (save it!)
6. Database User Privileges: "Atlas admin"
7. Click "Add User"

### Step 4: Allow Network Access
1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 5: Get Connection String
1. Click "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `auth-dashboard`

### Step 6: Update .env
Open `backend/.env` and update:

```env
MONGODB_URI=mongodb+srv://taskflow:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/auth-dashboard?retryWrites=true&w=majority
```

### Step 7: Test Connection
```bash
cd backend
npm run seed
```

If successful, you'll see:
```
✅ MongoDB connected successfully
✅ Created 2 demo users
✅ Created 5 demo tasks
```

---

## Alternative: Install MongoDB Locally

If you prefer local installation:

```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Verify
brew services list | grep mongodb
# Should show "started"
```

Then use in .env:
```env
MONGODB_URI=mongodb://localhost:27017/auth-dashboard
```

---

## Troubleshooting

### "Authentication failed"
- Double-check password in connection string
- Ensure no special characters need URL encoding
- Verify database user was created

### "IP not whitelisted"
- Go to Network Access
- Add your current IP or allow all (0.0.0.0/0)

### "Connection timeout"
- Check your internet connection
- Verify firewall isn't blocking MongoDB
- Try a different region for your cluster

---

## Next Steps

After MongoDB is set up:

1. Seed the database: `npm run seed`
2. Start backend: `npm run dev`
3. Start frontend: `cd ../frontend && npm run dev`
4. Open: http://localhost:3000
