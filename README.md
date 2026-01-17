# LUXE Full Stack E-Commerce Application

Premium e-commerce platform with React frontend and Node.js backend.

## 🚀 Quick Start

### Prerequisites
- Node.js 22.x or higher
- MongoDB Atlas account (free tier available)
- GitHub account
- Render account (free tier)
- Vercel account (free tier)

## 📦 Backend (Render Deployment)

### Local Development
```bash
# 1. Create .env file
cp .env.example .env

# Edit .env and set:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: A strong secret key
# - NODE_ENV: development

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# Server runs on http://localhost:5000
```

### Production (Render)
```bash
# 1. Push to GitHub (master branch)
git push origin master

# 2. In Render Dashboard:
#    - Create new Web Service
#    - Connect Luxe-Trend-Bazar repository
#    - Set Build Command: yarn install
#    - Set Start Command: node server.js
#    - Add Environment Variables:
#      • MONGODB_URI = your-mongodb-uri
#      • JWT_SECRET = your-secret-key
#      • NODE_ENV = production

# 3. Deploy
```

## 🎨 Frontend (Vercel Deployment)

### Local Development
```bash
cd luxe-frontend

# 1. Create .env.local
cp .env.example .env.local

# Edit .env.local and set:
# - REACT_APP_API_URL: http://localhost:5000/api

# 2. Install dependencies
npm install

# 3. Start development server
npm start
# Frontend runs on http://localhost:3000
```

### Production (Vercel)
```bash
# 1. Push to GitHub (main branch)
git push origin main

# 2. In Vercel Dashboard:
#    - Create new project
#    - Connect luxe-frontend repository
#    - Add Environment Variable:
#      • REACT_APP_API_URL = https://your-render-url.onrender.com/api

# 3. Deploy
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/luxe-ecommerce
JWT_SECRET=your_super_secret_key_here
NODE_ENV=production
```

### Frontend (.env.local or Vercel)
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

## 📋 API Endpoints

### Health Check
```
GET /api/health
```

### Products
```
GET /api/products
GET /api/products/:id
GET /api/products/category/:category
```

### Cart
```
GET /api/cart/:sessionId
POST /api/cart/:sessionId/add
PUT /api/cart/:sessionId/update/:productId
DELETE /api/cart/:sessionId/remove/:productId
```

### Orders
```
POST /api/orders
GET /api/orders?email=user@example.com
GET /api/orders/:orderId
POST /api/orders/:orderId/track
POST /api/orders/:orderId/cancel
```

### Users
```
POST /api/users/register
POST /api/users/login
```

## 🧪 Testing

### Test Backend
```bash
# Health check
curl https://your-render-url/api/health

# Get products
curl https://your-render-url/api/products
```

### Test Frontend
```bash
# Visit your Vercel domain
https://your-vercel-domain.vercel.app

# Test features:
# - Browse products
# - Add to cart
# - Checkout
# - Place order
```

## 📚 Project Structure

```
Backend (src/):
├── server.js          # Main server file
├── routes/            # API routes
├── middleware/        # Express middleware
├── services/          # Business logic
└── invoices/          # Generated invoices

Frontend (luxe-frontend/):
├── public/            # Static files
├── src/
│   ├── components/    # React components
│   ├── services/      # API calls
│   ├── App.js         # Main app
│   └── index.js       # Entry point
└── package.json       # Dependencies
```

## 🔐 Security

- JWT authentication for user sessions
- Password hashing with bcryptjs
- CORS enabled for secure requests
- Helmet.js for security headers
- Environment variables for sensitive data

## 🐛 Troubleshooting

### Backend won't start
- Check MONGODB_URI is correct
- Check JWT_SECRET is set
- Check NODE_ENV is set
- View Render logs for errors

### Frontend API calls fail
- Check REACT_APP_API_URL is correct
- Check backend is running
- Check CORS settings
- View browser console for errors

### Environment variables not working
- Ensure variables are saved in dashboard
- Redeploy after adding variables
- Check variable names are exact
- For frontend, variables must start with `REACT_APP_`

## 📝 License

MIT License - See LICENSE file

## 👨‍💻 Author

Chirag Vijan

---

**Need Help?** Check DEPLOYMENT_GUIDE.md for step-by-step deployment instructions.
