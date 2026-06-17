#!/bin/bash
set -e

echo "Starting deployment process..."

# Pull latest changes
echo "Pulling latest code from git..."
git pull origin main

# Setup Backend
echo "Setting up backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Setup Frontend
echo "Setting up frontend..."
cd frontend
npm install
npm run build
cd ..

# Restart PM2
echo "Restarting PM2 processes..."
pm2 reload ecosystem.config.js || pm2 start ecosystem.config.js

# Restart Nginx
echo "Testing Nginx configuration..."
sudo nginx -t
echo "Restarting Nginx..."
sudo systemctl reload nginx

echo "Deployment completed successfully!"
