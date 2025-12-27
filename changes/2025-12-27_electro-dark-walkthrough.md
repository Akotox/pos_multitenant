# Electro Dark Walkthrough

I have successfully built the "Electro" e-commerce website with a dark mode design and live chat functionality.

## Features Implemented

### 1. Design & UI
- **Dark Mode**: Implemented using CSS variables (`--background: #0a0a0a`) and a custom color palette with neon accents.
- **Animations**: Used `framer-motion` for smooth entry animations on the Hero and Product cards.
- **Responsive Layout**: Fully responsive grid system for categories and products.
- **Components**:
    - `Hero`: Dynamic gradient background with "Great Sound" headline.
    - `CategoryGrid`: Interactive category icons.
    - `ProductList`: Grid of products with "Chat to Buy" functionality.

### 2. Live Chat System
- **Guest Access**: Users can chat without logging in. A unique session ID is generated and stored in `localStorage` to ensure chat continuation across page reloads.
- **Admin Panel**:
    - Login at `/admin/login` (Credentials: `admin@electro.com` / `admin`).
    - Dashboard at `/admin` shows active sessions and allows replying to guests.
- **Real-time Updates**: The chat uses polling (every 3s) to fetch new messages, ensuring a "live" feel without complex websocket infrastructure.

### 3. Tech Stack
- **Next.js 16**: App Router for modern routing and layouts.
- **TypeScript**: Full type safety.
- **Prisma & PostgreSQL**: Database schema for Users, Sessions, and Messages.
- **Vanilla CSS**: Custom utility classes in `globals.css` for a lightweight, tailored design.

## How to Run

1. **Database Setup**:
   Ensure you have a PostgreSQL database running. Update `.env` with your connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/electro_dark"
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Initialize Database**:
   ```bash
   npx prisma db push
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Access**:
   - Home: `http://localhost:3000`
   - Admin: `http://localhost:3000/admin/login`

## Verification
- **Build**: `npm run build` passed successfully.
- **Lint**: No linting errors.
- **Functionality**: The code implements all requested features, including the unique chat continuation logic.
