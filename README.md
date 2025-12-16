# Admin Panel

Admin panel for Rooted Voices healthcare platform.

## Features

- **Dashboard**: Overview of users, sessions, subscriptions, and revenue
- **User Management**: View all users (admins, therapists, clients)
- **Therapist Management**: View all therapists with their details
- **Client Management**: View all clients and their assigned therapists
- **Payment Management**: View all payment transactions
- **Pricing Management**: Create, update, and delete pricing tiers
- **Payment Split Configuration**: Configure platform fee vs therapist fee

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
VITE_API_URL=http://localhost:5001/api
```

3. Start development server:
```bash
npm run dev
```

The admin panel will be available at `http://localhost:5173` (or the port Vite assigns).

## Admin Account

To create an admin account, you need to:
1. Register a user with role 'admin' via the backend API
2. Or update an existing user's role to 'admin' in the database

Example MongoDB command:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## Login

Use your admin credentials to log in. The admin panel requires:
- Email and password
- User must have role 'admin'

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React Icons
