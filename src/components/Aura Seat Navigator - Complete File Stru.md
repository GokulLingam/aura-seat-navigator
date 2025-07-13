# Aura Seat Navigator - Complete File Structure

## Project Overview
A comprehensive office space booking and management system with interactive floor plans, resource booking, and admin controls.

## Key Features
- Interactive floor plan visualization
- Real-time seat and resource booking
- Equipment filtering and search
- Multi-location support
- Admin edit mode for floor plan customization
- Responsive design for all devices

## File Structure

### Core Components
- `FloorPlan.tsx` - Main interactive floor plan component
- `ResourceBooking.tsx` - Resource booking interface
- `Navigation.tsx` - Main navigation component
- `ProtectedRoute.tsx` - Authentication wrapper

### UI Components (`src/components/ui/`)
- Complete set of reusable UI components
- Form elements, buttons, cards, modals
- Consistent design system

### Data Management
- `floorPlanData.ts` - Floor plan configuration and data
- Seat, resource, and desk area definitions
- Office layout specifications

### Authentication
- `AuthContext.tsx` - User authentication context
- Login/logout functionality
- Role-based access control

### Pages
- `Index.tsx` - Dashboard/home page
- `FloorPlanPage.tsx` - Floor plan visualization page
- `ResourcesPage.tsx` - Resource booking page
- `Login.tsx` - Authentication page
- `NotFound.tsx` - 404 error page

## Technology Stack
- React 18 with TypeScript
- Tailwind CSS for styling
- Vite for build tooling
- Lucide React for icons
- React Router for navigation

## Development Features
- Hot reloading for development
- TypeScript for type safety
- ESLint for code quality
- Responsive design testing