# CampusKart - Mobile Access & Cloud Hosting Guide

This guide explains how to open and use CampusKart from your mobile phone (iPhone / Android) and how to deploy it to a free cloud hosting portal.

---

## Part 1: Instant Mobile Access (Right Now from Your PC)

You don't need any cloud account to test and use CampusKart on your phone right now.

### Option A: Over Wi-Fi / Hotspot (Fastest & Simplest)
1. Ensure your laptop and phone are connected to the **same Wi-Fi network** (or connect your laptop to your phone's Mobile Hotspot).
2. Start the project by double-clicking **`start-all.bat`**.
3. Open your mobile browser (Chrome or Safari) and type:
   ```text
   http://10.141.187.85:5173
   ```
   *(Note: If your laptop changes Wi-Fi networks, run `start-all.bat` or `share-to-phone.bat` to see your updated local IP address).*

---

### Option B: Over 4G / 5G Mobile Data (Public Cloud Tunnel)
If your phone is on mobile data and not connected to the same Wi-Fi:
1. Make sure `start-all.bat` is running.
2. Double-click **`share-to-phone.bat`** in the project folder.
3. It will generate a secure public HTTPS URL (e.g. `https://quiet-bear-42.loca.lt`).
4. Open that URL on your phone!
   > **Note:** If the webpage asks for a "Tunnel Password", simply enter the IP printed on the `share-to-phone.bat` screen and click **"Click to Continue"**.

---

## Part 2: Permanent 24/7 Free Cloud Hosting (Render.com)

To have CampusKart hosted permanently on the internet so anyone can access it 24/7 without your computer being turned on:

### Prerequisites (Free Forever)
1. **GitHub Account** (Free): [github.com](https://github.com)
2. **MongoDB Atlas Account** (Free 512MB cloud database): [mongodb.com/atlas](https://www.mongodb.com/atlas)
3. **Render Account** (Free web service hosting): [render.com](https://render.com)

---

### Step 1: Create a Free MongoDB Atlas Database (2 minutes)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and sign up / log in.
2. Click **Create a Deployment** -> Select **M0 Free Cluster**.
3. Under **Security Quickstart**:
   - Create a database user (e.g. username: `campuskart_admin`, password: `<your-password>`).
   - Under **IP Access List**, click **Allow Access from Anywhere** (`0.0.0.0/0`).
4. Go to **Database** -> Click **Connect** -> Choose **Drivers (Node.js)**.
5. Copy your connection string. It looks like:
   ```text
   mongodb+srv://campuskart_admin:<password>@cluster0.xxxxx.mongodb.net/campuskart?retryWrites=true&w=majority
   ```

---

### Step 2: Push Your Project to GitHub
1. Open PowerShell in `c:\Users\GAYATHRI\OneDrive\Desktop\campuskart`.
2. Run:
   ```bash
   git init
   git add .
   git commit -m "CampusKart Full-Stack Release"
   git branch -M main
   git remote add origin https://github.com/<your-username>/campuskart.git
   git push -u origin main
   ```

---

### Step 3: Deploy on Render.com (1-Click)
1. Log into [Render.com](https://render.com).
2. Click **New +** in the top right -> Select **Web Service**.
3. Connect your `campuskart` GitHub repository.
4. Render will auto-detect settings or fill them as follows:
   - **Name**: `campuskart`
   - **Environment**: `Node`
   - **Region**: Singapore or Frankfurt (fastest for India)
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Scroll down to **Environment Variables** and add:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | *Your MongoDB Atlas connection string from Step 1* |
   | `JWT_SECRET` | *Any random string of 32+ characters* |
   | `REQUIRE_CAMPUS_EMAIL` | `true` |
   | `ALLOWED_CAMPUS_DOMAINS` | `mnnit.ac.in` |
6. Click **Create Web Service**.
7. In ~3 minutes, Render builds the React frontend and connects the Express backend!
8. You will receive a permanent live URL:
   ```text
   https://campuskart.onrender.com
   ```
   Open this URL on your phone anytime, anywhere!

---

## Features Tested & Verified for Mobile
- **Direct Camera Capture**: Take photos of cycles, calculators, or dorm items directly using your phone's camera.
- **Client-Side Image Resizing**: High-res smartphone camera photos are automatically optimized before upload.
- **Full-Width Responsive Cards**: Images fit inside their card frames without stretching or overflow.
- **Dynamic UPI Payment**: Scan QR codes or copy the official MNNIT handle directly into Google Pay / PhonePe / Paytm.
- **Forgot Password**: 1-click token reset for `@mnnit.ac.in` accounts.
- **Editable Student Profiles**: Update hostel address, phone number, and avatar directly from your mobile browser.
