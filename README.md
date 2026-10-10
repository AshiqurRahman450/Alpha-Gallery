# Alpha Gallery - Premium Client Media Portal

A premium, role-based React and Node.js web application for managing and showcasing client architectural photos and videos.

## Features
- **Admin Dashboard**: Create and manage Business Development Managers (BDMs). View all projects and media.
- **BDM Dashboard**: Securely isolated workspace where BDMs can create projects and upload media only for their assigned clients.
- **Media Uploading**: Integrated with Cloudinary for fast, optimized image and video delivery.
- **Premium Client Gallery**: A shareable, visually stunning, animated public gallery link for customers to view their project media, photos, and cinematic videos.
- **Role-Based Authentication**: Secure JWT-based auth with HTTP-only cookies.

## Technology Stack
- **Frontend**: React, Vite, Tailwind CSS v3, Framer Motion, React Hook Form, Zod.
- **Backend**: Node.js, Express, MongoDB Atlas, Mongoose.
- **Media Storage**: Cloudinary (via Multer).

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Cloudinary Account (for media uploads)

### 2. Backend Setup
1. Navigate to the server folder: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=a_strong_secret_key
   CLIENT_URL=http://localhost:5173
   
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
4. **Seed the Admin User**: Run `node scripts/createAdmin.js`. This will create the initial Admin account (`admin@alphagallery.com` / `admin123`).
5. Start the server: `npm run dev` (starts on port 5000 by default).

### 3. Frontend Setup
1. Navigate to the client folder: `cd client`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

### 4. Testing the Application
1. Open your browser to `http://localhost:5173`.
2. Login with the Admin credentials created in the seed script.
3. In the Admin Dashboard, navigate to **BDM Management** and create a new BDM.
4. Log out and log back in as the new BDM.
5. Create a new **Client Project**.
6. Click the edit/upload icon on the project card to upload images and videos (ensure your Cloudinary credentials are correct).
7. Copy the **Preview Gallery** link to view the premium customer-facing UI.

---

## Deployment Recommendations
- **Frontend**: Deploy the `client` directory to **Vercel** or **Netlify**. Ensure environment variables for API URL are set.
- **Backend**: Deploy the `server` directory to **Render**, **Railway**, or a VPS.
- **Database**: Use **MongoDB Atlas** for production.

**Important Security Note**: Never commit your `.env` files or expose the `JWT_SECRET` or Cloudinary secrets to the public repository or frontend React code.
