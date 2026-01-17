# Environment Variables Setup

## Backend (Render) - Required Variables

Set these in **Render Dashboard → Settings → Environment Variables**:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/luxe-ecommerce
JWT_SECRET=your-strong-secret-key-here
NODE_ENV=production
```

### How to get MONGODB_URI:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create an account or login
3. Create a new cluster (free tier available)
4. Click "Connect"
5. Choose "Connect your application"
6. Copy the connection string
7. Replace `<password>` with your database user password
8. Replace `myFirstDatabase` with `luxe-ecommerce`

### Generate strong JWT_SECRET:

Run in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use as JWT_SECRET.

---

## Frontend (Vercel) - Required Variables

Set these in **Vercel Dashboard → Settings → Environment Variables**:

```
REACT_APP_API_URL=https://your-render-service-name.onrender.com/api
```

Replace `your-render-service-name` with your actual Render service name.

---

## Local Development - Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update values in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/luxe-ecommerce
   JWT_SECRET=dev-secret-key-change-in-production
   NODE_ENV=development
   ```

3. Start MongoDB locally (if using local MongoDB)

4. Start backend:
   ```bash
   npm start
   ```

---

## ✅ Verification

### Backend Health Check:
```bash
curl https://your-render-url/api/health
```

Should return:
```json
{"status":"OK","message":"LUXE API is running"}
```

### Frontend:
Visit your Vercel deployment and ensure:
- Products load correctly
- API calls work
- No console errors
