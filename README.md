# CardApp – Digital Business Card SaaS

A production-ready full-stack platform for creating and sharing **Virtual Digital Business Cards**. Users get a personal card with contact info and links, shareable via public URL, QR code, or NFC (URL written to tag).

## Tech Stack

| Layer      | Stack                          |
|-----------|---------------------------------|
| Frontend  | Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Shadcn UI |
| Backend   | Node.js, Express, TypeScript   |
| Database  | MongoDB, Mongoose ODM          |
| Auth      | JWT, bcrypt                    |
| Storage   | Cloudinary (profile images; optional, URL also supported) |
| QR        | `qrcode` npm package           |

## Features

- **Auth**: Register, login, JWT
- **Dashboard**: Profile, links, theme (color + dark mode), QR code, analytics, live card preview
- **Public card** at `/card/[username]`: profile image, name, bio, Call/Email/WhatsApp + social/custom links
- **Save Contact**: vCard (`.vcf`) download
- **QR code**: Generated in dashboard, points to card URL
- **NFC**: Card URL can be written to NFC tags (Web NFC on Android Chrome)
- **Analytics**: Profile views, link clicks, QR scans, NFC taps; daily views and per-link clicks
- **Share**: Copy link, WhatsApp, Email, QR download

## Project Structure

```
cardapp/
├── frontend/          # Next.js App Router
│   ├── app/
│   │   ├── login, register, dashboard, card/[username]
│   │   └── layout, page, globals.css
│   ├── components/
│   ├── contexts/
│   └── lib/
├── backend/           # Express API
│   ├── src/
│   │   ├── config, controllers, middleware, models, routes, services
│   │   ├── db.ts, seed.ts, types.ts
│   │   └── ...
│   └── server.ts
├── shared/
│   └── types/
└── README.md
```

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB (local, or MongoDB Atlas)

### 1. Database

Create a MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas)) and set its URL in `backend/.env` (see `backend/.env.example`).

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, FRONTEND_URL, CARD_BASE_URL

npm install
npm run db:seed   # optional: creates demo user
npm run dev
```

Backend runs at **http://localhost:4000**.

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
# Optional: set NEXT_PUBLIC_API_URL=http://localhost:4000 if you need to call API from another origin

npm install
npm run dev
```

Frontend runs at **http://localhost:3000**. Next.js rewrites `/api/*` to the backend.

### 4. Seed data

After `npm run db:seed` in backend:

- **Email**: demo@cardapp.com  
- **Password**: demo123  
- **Username**: shubham → card at **http://localhost:3000/card/shubham**

## API Routes

| Method | Route | Description |
|--------|--------|-------------|
| POST | /auth/register | Register |
| POST | /auth/login | Login |
| POST | /auth/logout | Logout (client discards token) |
| GET | /auth/me | Current user (JWT) |
| GET | /user/profile | Get profile (JWT) |
| PUT | /user/profile | Update profile (JWT) |
| GET | /links | List links (JWT) |
| POST | /links | Create link (JWT) |
| PUT | /links/:id | Update link (JWT) |
| DELETE | /links/:id | Delete link (JWT) |
| POST | /links/reorder | Reorder links (JWT) |
| GET | /card/:username | Public card data |
| GET | /card/:username/vcard | vCard download |
| POST | /card/:username/view | Record view |
| POST | /card/:username/link-click | Record link click |
| POST | /card/:username/qr | Record QR scan |
| POST | /card/:username/nfc | Record NFC tap |
| GET | /analytics | Analytics (JWT) |
| GET | /qr | QR data URL + card URL (JWT) |

## Deployment

- **Frontend**: Vercel. Set `NEXT_PUBLIC_API_URL` to your backend URL if needed.
- **Backend**: Render or Railway. Set env: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `CARD_BASE_URL` (e.g. `https://your-app.vercel.app`).
- **Database**: MongoDB Atlas (or any MongoDB). Use the connection string in `DATABASE_URL`.
- Mongoose creates collections on first write. Run `npm run db:seed` optionally to create a demo user.

## Security

- JWT auth middleware on protected routes
- Rate limiting on auth and API
- Input validation (Zod)
- CORS configured with `FRONTEND_URL`
- Passwords hashed with bcrypt
- Secrets via environment variables

## License

MIT.
