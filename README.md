# 📘 Social Media Platform — Campus Connect

Campus Connect is a modern social media platform project designed for campus communities.  
It aims to connect students by facilitating secure sign-ups, discussions, posts, and other social interactions — making campus communication easier and more engaging.

---

## 🚀 Features

- 🧑‍💻 **User Authentication** – Secure login and registration  
- 🗣 **Social Feed / Posts** – Create, view, and interact with posts  
- 💬 **Comments & Likes** – Engage with the community  
- 👤 **User Profiles** – Personalized profiles for each user  
- 🔄 **React & Tailwind UI** – Fast, responsive frontend  
- 🧱 **Backend APIs** – Organized server logic with TypeScript  
- 🔗 **Shared Types / Logic** – Consistent shared code between client & server

---

## 🛠 Tech Stack

### Frontend
- TypeScript
- Vite
- Tailwind CSS (via `tailwind.config.ts`)
- React / or framework used inside `client/`

### Backend
- Node.js
- TypeScript
- Express (or similar)
- Real-world API routing

### Shared
- Shared interfaces / types in `shared/`

---
Install Dependencies
Frontend
cd client
npm install
Backend
cd ../server
npm install
3. Setup Environment Variables
Create .env files in client/ and server/ and configure things like:
PORT=3000
DATABASE_URL=<your database url>
JWT_SECRET=<your secret key>

Adjust according to your backend and frontend needs.
4. Start the App
Start Backend
npm run dev

Start Frontend
cd ../client
npm run dev



