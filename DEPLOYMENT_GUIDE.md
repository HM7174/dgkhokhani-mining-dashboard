# 🚀 Render Deployment Guide

For complete deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## Quick Deploy

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   git remote add origin https://github.com/YOUR_USERNAME/mining-dashboard.git
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Click "Apply"

3. **Access Your App**:
   - Frontend: `https://mining-dashboard-frontend.onrender.com`
   - Login with: `admin` / `admin123`

## Files Created for Deployment

- `render.yaml` - Render Blueprint configuration
- `frontend/.env.example` - Frontend environment variables template
- `frontend/public/_redirects` - SPA routing configuration
- `.gitignore` - Git ignore rules

## Modified Files

- `frontend/src/services/api.js` - Added environment variable support
- `frontend/vite.config.js` - Added proxy configuration
- `backend/src/app.js` - Updated CORS settings

---

**See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions and troubleshooting.**
