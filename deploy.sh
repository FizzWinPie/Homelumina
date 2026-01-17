#!/bin/bash 
set -e  # Exit on error

echo "🚀 Starting Manual deployment..."

cd /var/www/homelumina/Homelumina

# Pull latest changes
echo "📥 Pulling latest changes from prod branch..."
git fetch origin
git reset --hard origin/prod

# Install dependencies
echo "📦 Installing dependencies..."
cd server
npm install --production

# Restart application
echo "🔄 Restarting application..."
pm2 restart homelumina-backend
pm2 save

# Wait a moment and check status
sleep 2
pm2 status

echo "✅ Deployment completed successfully!"
pm2 logs homelumina-backend --lines 20