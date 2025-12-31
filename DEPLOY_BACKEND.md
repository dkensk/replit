# 🚀 Deploy Your Backend

Your backend is a **Node.js/Express** app with **PostgreSQL** database. Here are the best deployment options:

## Option 1: Railway (Easiest - Recommended) ⭐

Railway makes it super easy to deploy Node.js apps with databases.

### Steps:

1. **Sign up at:** https://railway.app
2. **Click "New Project"**
3. **Choose "Deploy from GitHub repo"**
   - Connect your GitHub account
   - Select your repository: `dkensk/replit`
4. **Add PostgreSQL Database:**
   - Click "+ New" → "Database" → "PostgreSQL"
   - Railway will automatically create a database
5. **Set Environment Variables:**
   - Go to your service → "Variables"
   - Add these:
     ```
     DATABASE_URL=<Railway will auto-fill this>
     SESSION_SECRET=<generate a random string>
     NODE_ENV=production
     PORT=5000
     AI_INTEGRATIONS_OPENAI_API_KEY=<your OpenAI key if you use it>
     AI_INTEGRATIONS_OPENAI_BASE_URL=<if needed>
     ```
6. **Configure Build:**
   - Railway should auto-detect Node.js
   - Make sure it runs: `npm run build && npm start`
7. **Deploy:**
   - Railway will automatically deploy
   - You'll get a URL like: `https://your-app.up.railway.app`

**That's it!** Your backend will be live.

---

## Option 2: Render (Free Tier Available)

### Steps:

1. **Sign up at:** https://render.com
2. **Click "New +" → "Web Service"**
3. **Connect GitHub:**
   - Select your repository
4. **Configure:**
   - **Name:** edge-hockey-backend
   - **Environment:** Node
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (or paid)
5. **Add PostgreSQL Database:**
   - Click "New +" → "PostgreSQL"
   - Create database
   - Copy the **Internal Database URL**
6. **Set Environment Variables:**
   - In your web service → "Environment"
   - Add:
     ```
     DATABASE_URL=<paste the database URL>
     SESSION_SECRET=<random string>
     NODE_ENV=production
     PORT=10000
     ```
7. **Deploy:**
   - Render will deploy automatically
   - You'll get: `https://edge-hockey-backend.onrender.com`

---

## Option 3: Replit (If You're Already Using It)

If your backend is already on Replit:

1. **Make sure it's running** on Replit
2. **Get your Replit URL:**
   - It should be: `https://your-repl-name.your-username.repl.co`
3. **That's your backend URL!**

**Note:** Replit free tier may sleep after inactivity. Consider upgrading or using Railway/Render for production.

---

## Option 4: Heroku (Classic, but Paid)

1. **Install Heroku CLI:** https://devcenter.heroku.com/articles/heroku-cli
2. **Login:** `heroku login`
3. **Create app:** `heroku create edge-hockey-backend`
4. **Add PostgreSQL:** `heroku addons:create heroku-postgresql:mini`
5. **Set environment variables:**
   ```bash
   heroku config:set SESSION_SECRET=your-secret-here
   heroku config:set NODE_ENV=production
   ```
6. **Deploy:** `git push heroku main`
7. **Your URL:** `https://edge-hockey-backend.herokuapp.com`

---

## After Deployment

### 1. Get Your Backend URL

Once deployed, you'll have a URL like:
- Railway: `https://your-app.up.railway.app`
- Render: `https://your-app.onrender.com`
- Replit: `https://your-repl.repl.co`

### 2. Update Your App

1. **Create `.env` file** in your project root:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```
   Replace with your actual backend URL.

2. **Rebuild your iOS app:**
   ```bash
   npm run build
   npx cap sync ios
   ```

3. **Push to GitHub** (triggers build)

4. **Download new build** and upload to TestFlight

### 3. Set Up CORS

Make sure your backend allows requests from your app. Add this to your Express app (if not already there):

```typescript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Or your specific domain
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
```

---

## Quick Start Recommendation

**Use Railway** - it's the easiest:
1. Sign up
2. Connect GitHub
3. Add PostgreSQL
4. Deploy
5. Done!

**Which option do you want to use?** I can help you with the specific steps!

