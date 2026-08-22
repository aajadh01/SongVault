# 🎶 Sibling Memory Vault — Full-Stack Application

A private digital sanctuary paired with physical Sibling License Cards. When a sibling scans their unique QR code or Soundwave Sticker, they enter a private 6-digit PIN to unlock their personal collection of songs, recordings, videos, images, and memories.

---

## 🌟 Key Features

* **Dynamic Public Card Experience (`/s/:cardId`)**: Pointing to unique sibling card URLs.
* **6-Digit Secret PIN Entry**: Auto-focus, auto-advance, backspace retreat, paste support, and touch virtual keypad.
* **Celebration Unlock Animation**: Golden lock unlatching animation, confetti burst, and personalized welcome message.
* **Intelligent Dynamic Song Flows**:
  * **0 Songs**: Emotional empty state screen.
  * **1 Song**: Directly opens custom Music Player (no song selection screen).
  * **2+ Songs**: Displays memory library grid with duration, badges, and *"← Back to Memories"* button.
* **Song-Specific Synchronized Backgrounds**: Videos (synced to playback state), images (cinematic pan/zoom), and ambient gradients.
* **Soundwave Sticker & QR Studio (`/admin/qr`)**: Generate and download print-ready **300 DPI PNG** soundwave stickers (*"OUR SONG ♡"* + scannable QR tag) and vector SVGs.
* **Full Admin Management Console (`/admin`)**: Sibling manager, auto Card ID generator, recording manager with media uploads, analytics.

---

## 🚀 Quick Deployment Guide

### 1. Frontend (Deploy on Vercel)
1. Import the repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable:
   * `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
4. Deploy!

---

### 2. Backend (Deploy on Render / Railway)
1. Create a new Web Service on [Render](https://render.com) or [Railway](https://railway.app).
2. Set **Root Directory** to `backend`.
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Configure Environment Variables:
   * `PORT` = `5000`
   * `MONGODB_URI` = `mongodb+srv://<username>:<password>@cluster.mongodb.net/sibling_vault?retryWrites=true&w=majority`
   * `JWT_SECRET` = `your_strong_production_jwt_secret_key`
   * `CLIENT_URL` = `https://your-frontend.vercel.app`
   * *(Optional for cloud media)*:
     * `CLOUDINARY_CLOUD_NAME` = `your_cloud_name`
     * `CLOUDINARY_API_KEY` = `your_api_key`
     * `CLOUDINARY_API_SECRET` = `your_api_secret`

---

## 💻 Local Development

### Backend
```bash
cd backend
npm install
npm run seed  # Seed initial demo siblings (THR7X9, SIB1S1, MEM0S0)
npm start     # Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # Runs on http://localhost:5173
```

---

## 🔒 Security

* **Bcrypt Password Hashing**: All 6-digit PINs and admin passwords hashed with salt.
* **Rate Limiting**: Brute force protection on PIN verification endpoint.
* **Zero Client Leaks**: Secret codes and private recordings never exposed in frontend code or public responses.
