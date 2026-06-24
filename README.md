# 🌊 Kavy Choudhary - Full-Stack Creative Portfolio

A premium, highly optimized 3D creative portfolio website featuring real-time interactive ocean environments, custom WebGL animations (dolphin dive, shark attack, glowing seahorses, volumetric crepuscular rays), and a working contact form that delivers inquiries directly to your email.

The project is structured as a **full-stack monorepo** with a separated frontend and backend, configured for easy local development and one-click deployment to hosting services like Render.

---

## 📁 Repository Structure

```bash
kv_portfolio/
├── frontend/             # Vite + React 3D WebGL Frontend App
│   ├── src/              # React Components & Three.js/Fiber Scenes
│   ├── public/           # Static Assets (Models, Videos, Images)
│   ├── package.json      # Frontend package configuration
│   └── vite.config.js    # Vite dev server with proxy settings
├── backend/              # Node.js + Express API Server
│   ├── server.js         # API endpoints & static serving logic
│   └── package.json      # Backend server package configuration
├── package.json          # Root Monorepo package script configs
└── README.md             # This instruction documentation
```

---

## 🚀 Local Development

### 1. Installation
Install dependencies for both frontend and backend automatically by running the monorepo script in the root directory:
```bash
npm run install-all
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
SMTP_SERVICE=gmail
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```
> **Note**: For Gmail, `SMTP_PASS` must be a **Gmail App Password** (not your regular password). Generate it under Google Account Security -> App Passwords.

### 3. Run the Server
Start the backend Express server:
```bash
# In backend/ folder
npm run dev

# Or in root folder
npm start
```
Start the frontend Vite server:
```bash
# In frontend/ folder
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. The Vite server is configured to proxy `/api/*` requests to the Express server at port `5000`.

---

## ☁️ Deployment on Render

This project is structured to deploy as a **single Render Web Service** (Monorepo Node.js Server). The Express server will compile the frontend Vite build on launch and serve it statically, eliminating CORS issues and hosting fees.

### Render Configuration Settings

Create a new **Web Service** on Render and configure the following parameters:

1. **Repository URL**: Your GitHub Repository URL
2. **Runtime**: `Node`
3. **Build Command**: `npm run install-all && npm run build`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   - Add a secret file or individual variables under the **Environment** tab:
     - `SMTP_SERVICE`: `gmail`
     - `SMTP_USER`: `your-email@gmail.com`
     - `SMTP_PASS`: `your-gmail-app-password`
     - `PORT`: `5000`

---

## ✉️ Contact Form Email Setup (Nodemailer)
- When a user submits the form, it sends a payload to `POST /api/contact`.
- The backend compiles a stylized HTML email displaying the sender's name, email link, and message.
- The message is sent **directly** to `kavychoudhary49@gmail.com` with the sender's email configured in the `replyTo` field, allowing you to click "Reply" inside your mail client to write directly back to them.
