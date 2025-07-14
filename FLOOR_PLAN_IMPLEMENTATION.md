All endpoints are available at http://localhost:3001/api/ and require JWT authentication.

# Floor Plan Booking System - Frontend Implementation

## Overview

This document describes the complete frontend implementation of the Floor Plan Booking System. The system allows users to view floor plans, book desks, and manage bookings through an intuitive web interface.

## Architecture

### 1. API Service Layer (`src/services/floorPlanApiService.ts`)

The API service provides a clean interface to interact with the backend API. It includes:

- **Type Definitions**: Complete TypeScript interfaces for all data structures
- **CRUD Operations**: Full CRUD operations for buildings, floors, desks, and bookings
- **Error Handling**: Comprehensive error handling with proper TypeScript types
- **Mock Data Support**: Built-in mock data for development and testing

#### Key Interfaces:
- `Building`: Building information (name, address, city, country)
- `Floor`: Floor details (name, number, description, status)
- `FloorLayout`: Complete floor layout with desks, zones, and amenities
- `Desk`: Individual desk information (position, status, equipment)
- `Booking`: Booking details (user, desk, time slots, status)

### 2. Components

#### FloorPlanNew (`src/components/FloorPlanNew.tsx`)
- **Interactive Floor Plan**: Visual representation of the floor with clickable desks
- **Real-time Status**: Color-coded desk status (available, occupied, reserved, maintenance)
- **Equipment Display**: Visual indicators for desk equipment (monitor, keyboard, phone)
- **Booking Dialog**: Modal for creating new bookings with time selection
- **Responsive Design**: Works on desktop and mobile devices

#### FloorPlanBookingPage (`src/pages/FloorPlanBookingPage.tsx`)
- **Building/Floor Selection**: Dropdown selectors for choosing location
- **Date Selection**: Calendar picker for booking dates
- **My Bookings**: Sidebar showing user's current bookings
- **Floor Statistics**: Quick stats about desk availability
- **Integrated Floor Plan**: Embeds the FloorPlanNew component

#### AdminFloorManagement (`src/components/AdminFloorManagement.tsx`)
- **Tabbed Interface**: Separate tabs for buildings, floors, and desks management
- **CRUD Operations**: Create, read, update, delete for all entities
- **Data Tables**: Organized tables with sorting and filtering
- **Form Dialogs**: Modal forms for adding/editing entities
- **Admin Controls**: Role-based access for administrative functions

### 3. Mock Data System (`src/services/mockFloorPlanData.ts`)

Provides realistic sample data for development:

- **Sample Buildings**: Tech Campus Building A, Downtown Office
- **Sample Floors**: First Floor (25 desks), Second Floor (15 desks)
- **Sample Desks**: Various desk types with different equipment configurations
- **Sample Layout**: Complete floor layout with zones and amenities
- **Mock API Service**: Simulates real API responses with delays

## Features

### User Features
1. **Floor Plan Visualization**
   - Interactive floor plan with clickable desks
   - Color-coded status indicators
   - Equipment icons and tooltips
   - Zone highlighting and descriptions

2. **Booking Management**
   - Select building and floor
   - Choose date and time slots
   - Add booking notes
   - View current bookings
   - Cancel existing bookings

3. **Real-time Updates**
   - Live desk availability
   - Booking confirmation messages
   - Error handling and validation

### Admin Features
1. **Building Management**
   - Add/edit/delete buildings
   - Manage building details (address, city, country)

2. **Floor Management**
   - Create floors within buildings
   - Set floor numbers and descriptions
   - Activate/deactivate floors

3. **Desk Management**
   - Add desks to floors
   - Configure desk positions and dimensions
   - Set desk types and equipment
   - Manage desk status

## API Integration

### Backend API Endpoints

The system is designed to work with the following API endpoints:

```
GET    /api/buildings                    # Get all buildings
GET    /api/buildings/:id                # Get specific building
POST   /api/buildings                    # Create new building
PUT    /api/buildings/:id                # Update building
DELETE /api/buildings/:id                # Delete building

GET    /api/floors                       # Get all floors
GET    /api/floors/:id                   # Get specific floor
POST   /api/floors                       # Create new floor
PUT    /api/floors/:id                   # Update floor
DELETE /api/floors/:id                   # Delete floor

GET    /api/floors/:id/layout            # Get floor layout
PUT    /api/floors/:id/layout            # Update floor layout

GET    /api/desks                        # Get all desks
GET    /api/desks/:id                    # Get specific desk
POST   /api/desks                        # Create new desk
PUT    /api/desks/:id                    # Update desk
DELETE /api/desks/:id                    # Delete desk

GET    /api/bookings                     # Get bookings
GET    /api/bookings/:id                 # Get specific booking
POST   /api/bookings                     # Create booking
PUT    /api/bookings/:id                 # Update booking
DELETE /api/bookings/:id                 # Cancel booking

GET    /api/bookings/availability        # Get desk availability
```

### Authentication

- Uses JWT tokens for authentication
- Automatic token refresh handling
- Role-based access control (admin, manager, employee, guest)

## Setup and Configuration

### 1. Environment Variables

Create a `.env` file with:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 2. Mock Data Mode

For development without a backend, the system automatically falls back to mock data when API calls fail. To enable this:

```typescript
// In floorPlanApiService.ts, the mock data is already enabled
return this.getMockResponse<T>(endpoint, options);
```

### 3. Backend Integration

To connect to a real backend:

1. Update `VITE_API_BASE_URL` to point to your backend
2. Ensure your backend implements the API endpoints described above
3. Set up authentication and CORS properly

## Usage

### For Users

1. **Navigate to Floor Plan Booking**
   - Click "Book Seats" in the navigation
   - Select building and floor from dropdowns
   - Choose a date

2. **Book a Desk**
   - Click on an available (green) desk
   - Select start and end times
   - Add optional notes
   - Click "Book Desk"

3. **Manage Bookings**
   - View current bookings in the sidebar
   - Cancel bookings if needed
   - See booking confirmations

### For Admins

1. **Access Admin Panel**
   - Navigate to the admin section (requires admin role)
   - Use the tabbed interface for different entities

2. **Manage Buildings**
   - Add new buildings with addresses
   - Edit existing building information
   - Delete buildings (cascades to floors and desks)

3. **Manage Floors**
   - Create floors within buildings
   - Set floor numbers and descriptions
   - Activate/deactivate floors

4. **Manage Desks**
   - Add desks with positions and dimensions
   - Configure desk types and equipment
   - Set desk status and availability

## Technical Details

### State Management
- Uses React hooks for local state management
- Context API for authentication and theme
- No external state management library required

### Styling
- Tailwind CSS for styling
- Shadcn/ui components for consistent UI
- Responsive design for mobile and desktop

### Performance
- Lazy loading of components
- Optimized re-renders with useCallback
- Efficient API calls with proper caching

### Error Handling
- Comprehensive error boundaries
- User-friendly error messages
- Graceful fallbacks to mock data

## Future Enhancements

1. **Real-time Updates**
   - WebSocket integration for live desk status
   - Push notifications for booking confirmations

2. **Advanced Features**
   - Recurring bookings
   - Desk preferences and favorites
   - Integration with calendar systems

3. **Analytics**
   - Booking analytics and reports
   - Floor utilization metrics
   - User behavior tracking

4. **Mobile App**
   - React Native version
   - Offline booking capabilities
   - QR code desk identification

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check `VITE_API_BASE_URL` configuration
   - Verify backend is running
   - Check CORS settings

2. **Mock Data Not Loading**
   - Ensure mock data files are properly imported
   - Check browser console for errors

3. **Authentication Issues**
   - Verify JWT token format
   - Check token expiration
   - Ensure proper role permissions

### Development Tips

1. **Testing with Mock Data**
   - Mock data is automatically used when API fails
   - Modify `mockFloorPlanData.ts` to test different scenarios

2. **Customizing the UI**
   - Update Tailwind classes for styling
   - Modify component props for different layouts
   - Add new UI components as needed

3. **Adding New Features**
   - Follow the existing component patterns
   - Use TypeScript interfaces for type safety
   - Implement proper error handling

## Conclusion

The Floor Plan Booking System provides a complete, production-ready solution for managing desk bookings in office environments. With its modular architecture, comprehensive API integration, and user-friendly interface, it can be easily customized and extended for specific organizational needs.

The implementation includes both user-facing booking functionality and administrative management tools, making it suitable for organizations of all sizes. The mock data system ensures smooth development and testing workflows, while the API-first design allows for easy integration with existing backend systems. 