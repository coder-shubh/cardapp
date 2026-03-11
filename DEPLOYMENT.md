# Free Deployment Guide – CardApp

Deploy frontend, backend, and database **for free** using:

| Part      | Service        | Free tier |
|-----------|----------------|-----------|
| Frontend  | **Vercel**     | Yes – Hobby plan |
| Backend   | **Render**     | Yes – Free web service (spins down when idle) |
| Database  | **MongoDB Atlas** | Yes – M0 cluster (512 MB) |

---

## 1. Database: MongoDB Atlas (free)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and sign up.
2. Create a **free M0 cluster** (e.g. AWS, region closest to you).
3. Create a database user (username + password). Save the password.
4. **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`) for Render to connect.
5. **Database** → Connect → **Drivers** → copy the connection string.  
   It looks like:  
   `mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. Create a database (e.g. `cardapp`) and use it in the URL:  
   `mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/cardapp?retryWrites=true&w=majority`  
   Save this as your **DATABASE_URL**.

---

## 2. Backend: Render (free)

1. Push your code to **GitHub** (create a repo and push the `cardapp` folder or the whole project).
2. Go to [render.com](https://render.com) and sign up (GitHub login is easiest).
3. **New** → **Web Service**.
4. Connect your GitHub repo. Choose the repo that contains the backend.
5. **Root Directory**: set to `backend` (if the repo root is `cardapp`; otherwise leave blank if the repo is backend-only).
6. **Build**:
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
7. **Environment variables** (add all):

   | Key            | Value |
   |----------------|--------|
   | `DATABASE_URL` | Your MongoDB Atlas connection string |
   | `JWT_SECRET`   | A long random string (e.g. generate with `openssl rand -base64 32`) |
   | `FRONTEND_URL` | `https://YOUR-VERCEL-APP.vercel.app` (update after deploying frontend) |
   | `CARD_BASE_URL`| Same as `FRONTEND_URL` (your public card URLs) |

8. Create the service. Render will build and deploy.  
9. Copy your backend URL, e.g. `https://cardapp-backend.onrender.com` (you’ll use it for the frontend).

**Note:** On the free plan, the service spins down after ~15 min of no traffic. The first request after that can take 30–60 seconds to wake up.

---

## 3. Frontend: Vercel (free)

1. Go to [vercel.com](https://vercel.com) and sign up (GitHub login is easiest).
2. **Add New** → **Project** → import the same GitHub repo.
3. **Root Directory**: set to `frontend` (if the repo root is `cardapp`).
4. **Environment variable**:
   - Name: `NEXT_PUBLIC_API_URL`  
   - Value: your Render backend URL, e.g. `https://cardapp-backend.onrender.com`
5. Deploy. Vercel will build and give you a URL like `https://cardapp-xxx.vercel.app`.

---

## 4. Connect everything

1. **Render (backend)**  
   - Update `FRONTEND_URL` and `CARD_BASE_URL` to your Vercel URL (e.g. `https://cardapp-xxx.vercel.app`).  
   - Redeploy the backend on Render (or trigger a redeploy from the dashboard).

2. **Optional: seed the database**  
   - Either run `npm run db:seed` locally with `DATABASE_URL` set to your Atlas URL,  
   - Or call your backend’s register endpoint once to create a user.

---

## Summary

| What        | Where to get it |
|------------|------------------|
| Database   | [MongoDB Atlas](https://www.mongodb.com/atlas) – free M0 cluster |
| Backend    | [Render](https://render.com) – free Web Service |
| Frontend   | [Vercel](https://vercel.com) – free Hobby plan |

After deployment:

- **App (frontend):** `https://your-app.vercel.app`
- **API (backend):** `https://your-backend.onrender.com`
- **Card URL:** `https://your-app.vercel.app/card/USERNAME`

---

## Other free options (alternatives)

- **Backend:** [Railway](https://railway.app) (free trial credit), [Fly.io](https://fly.io) (free tier), [Koyeb](https://www.koyeb.com) (free tier).
- **Frontend:** [Netlify](https://netlify.com) or [Cloudflare Pages](https://pages.cloudflare.com) can also host Next.js; Vercel is the most straightforward for Next.js.
