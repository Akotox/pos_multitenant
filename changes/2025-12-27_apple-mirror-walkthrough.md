# Apple Mirror Walkthrough

I have successfully built a mirror of the Apple website with an integrated Admin Panel using Next.js and Vanilla CSS.

## Features Implemented

### Frontend (User Facing)
- **Apple Design System**: Implemented a custom CSS design system mimicking Apple's typography, colors, and spacing.
- **Navbar**: Responsive navigation bar with backdrop blur and hover effects.
- **Hero Section**: Full-screen hero component with animations.
- **Landing Page**: Assembled landing page with product grids (iPhone 15, Vision Pro).
- **Footer**: Comprehensive footer with organized links.

### Admin Panel
- **Layout**: Dedicated admin layout with a sidebar navigation.
- **Dashboard**: Overview page showing key metrics (Sales, Users, Orders).
- **Product Management**: A functional table view to list products with status badges and mock actions.

## Verification Results

### Build Status
The project builds successfully with `npm run build`.
```bash
✓ Compiled successfully
✓ Generating static pages (6/6)
```

### Manual Verification Steps
1.  **Landing Page**: Open `http://localhost:3000` to see the Apple mirror.
    ![Apple Mirror Homepage](/Users/mac/.gemini/antigravity/brain/7bb25fc7-7010-47ac-9b4f-9e1979ead59f/apple_mirror_home_1764541011776.png)
2.  **Admin Dashboard**: Navigate to `http://localhost:3000/admin` to see the dashboard.
3.  **Products**: Click "Products" in the sidebar or go to `http://localhost:3000/admin/products` to manage inventory.

## Project Structure
- `app/globals.css`: Core design system variables.
- `components/`: Reusable UI components (Navbar, Hero, Footer).
- `app/admin/`: Admin routes and layout.
