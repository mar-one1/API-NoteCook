# 🍽️ NoteCook API

This is the backend server for the **NoteCook** project. It provides RESTful APIs for user management, recipe storage, authentication, and media uploads.

---

## 📦 Tech Stack

* **Node.js**
* **Express.js**
* **MongoDB** (for local development)
* **PostgreSQL** (NeonDB for production)
* **JWT Authentication**
* **Multer** for file uploads

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/notecook-api.git
cd notecook-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment Configuration

Create a `.env` file at the root of the project and fill in the following values:

```env
```

> ✅ Comment/uncomment upload destination or DB based on your environment.

---

## 🧪 Run the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
NODE_ENV=production npm start
```

> Server starts on: `http://127.0.0.1:3000`

---

## 🛣️ API Endpoints (Basic Overview)

> Full API documentation coming soon

### Auth

```
POST   /api/auth/register       # Register a new user
POST   /api/auth/login          # Login user & receive token
GET    /api/auth/me             # Get current user (JWT required)
```

### Recipes

```
GET    /api/recipes             # Get all recipes
POST   /api/recipes             # Create a new recipe (auth required)
GET    /api/recipes/:id         # Get single recipe
PUT    /api/recipes/:id         # Update recipe (auth required)
DELETE /api/recipes/:id         # Delete recipe (auth required)
```

> Add more routes as needed.

---

## 📂 Folder Structure

```bash
├── controllers/       # Route handlers
├── models/            # Mongoose/Sequelize models
├── routes/            # API route definitions
├── middleware/        # Custom middleware like auth
├── utils/             # Helper functions
├── upload/            # Uploaded images/files
├── .env               # Environment variables
├── server.js          # Main entry point
├── package.json
```

---

## 🔐 Authentication

This project uses **JWT (JSON Web Tokens)** for secure authentication.

### Usage in Requests

Add the token received during login in the `Authorization` header:

```http
Authorization: Bearer <your_token>
```

---

## 🌍 Deployment

This API is configured to run on **Vercel** and uses **NeonDB** (PostgreSQL) in production.

Make sure the following environment variables are set on Vercel:

* `DATABASE_URL`
* `JWT_SECRET`
* `NODE_ENV=production`
* `VERCEL_PORT`

---

## 🛠️ Available Scripts

```bash
npm run dev     # Start server with nodemon (dev mode)
npm start       # Start server (production)
```

---

## ✅ Badges

---

## 🧑‍💻 Author

**Marwane Rays**
📧 Contact: [your\_email@example.com](mailto:your_email@example.com)
💼 GitHub: [github.com/yourusername](https://github.com/yourusername)

---

## 📃 License

This project is licensed under the **MIT License**.
