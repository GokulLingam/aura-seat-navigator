# UPS Reserve API Integration Guide

This guide explains how the UPS Reserve frontend integrates with the backend API for authentication, seat booking, resource management, and floor plan operations.

## Overview

The application now uses real API calls instead of mock data. The integration is built around several service classes that handle different aspects of the application:

- **ApiService**: Core API client with authentication and request handling
- **SeatService**: Seat management and booking operations
- **ResourceService**: Resource booking and management
- **FloorPlanService**: Floor plan operations and layout management

## Architecture

### Service Layer Structure

```
src/services/
├── apiService.ts          # Core API client
├── seatService.ts         # Seat operations
├── resourceService.ts     # Resource operations
└── floorPlanService.ts    # Floor plan operations

src/config/
└── api.ts                 # API configuration and constants
```

### Authentication Flow

1. **Login**: User credentials are sent to `/auth/login`
2. **Token Storage**: JWT tokens are stored in localStorage
3. **Request Authentication**: All API requests include the Bearer token
4. **Token Refresh**: Expired tokens are automatically refreshed
5. **Logout**: Tokens are cleared on logout

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_DEBUG_LOGGING=true
VITE_ENABLE_RECURRING_BOOKINGS=true
VITE_ENABLE_ADVANCED_FILTERS=true
VITE_ENABLE_FLOOR_PLAN_EDITING=true
VITE_ENABLE_RESOURCE_BOOKING=true

# Authentication
VITE_TOKEN_EXPIRY_WARNING_MINUTES=5
```

### API Configuration

The `src/config/api.ts` file contains all API-related configuration:

- Base URL and endpoints
- Feature flags
- Error messages
- HTTP status codes
- Retry configuration

## Usage Examples

### Authentication

```typescript
import { useAuth } from '@/hooks/useAuth';

const { login, logout, user, isAuthenticated } = useAuth();

// Login
try {
  await login('user@example.com', 'password');
  // User is now authenticated
} catch (error) {
  console.error('Login failed:', error);
}

// Logout
await logout();
```

### Seat Operations

```typescript
import seatService from '@/services/seatService';

// Get all seats
const seats = await seatService.getSeats({
  date: '2024-01-15',
  equipment: ['Monitor', 'Dock']
});

// Book a seat
const booking = await seatService.bookSeat({
  seatId: 'D1',
  date: '2024-01-15',
  startTime: '09:00',
  endTime: '17:00',
  recurring: {
    type: 'weekly',
    endDate: '2024-02-15'
  }
});

// Get user's bookings
const myBookings = await seatService.getMyBookings();
```

### Resource Operations

```typescript
import resourceService from '@/services/resourceService';

// Get available resources
const resources = await resourceService.getResources({
  type: 'meeting-room',
  capacity: 10,
  date: '2024-01-15'
});

// Book a resource
const booking = await resourceService.bookResource({
  resourceId: 'MR1',
  date: '2024-01-15',
  startTime: '10:00',
  endTime: '11:00'
});

// Get resource availability
const availability = await resourceService.getResourceAvailability(
  'MR1',
  '2024-01-15'
);
```

### Floor Plan Operations

```typescript
import floorPlanService from '@/services/floorPlanService';

// Get floor plan
const floorPlan = await floorPlanService.getFloorPlan('floor-1');

// Update floor plan
await floorPlanService.updateFloorPlan('floor-1', {
  seats: updatedSeats,
  layout: updatedLayout
});

// Get buildings and floors
const buildings = await floorPlanService.getBuildings();
const floors = await floorPlanService.getFloorsByBuilding('Building A');
```

## Error Handling

The API services include comprehensive error handling:

```typescript
try {
  const result = await seatService.bookSeat(bookingData);
  // Handle success
} catch (error) {
  // Error is automatically logged
  // You can access error.message for user-friendly messages
  console.error('Booking failed:', error.message);
}
```

### Error Types

- **Network Errors**: Connection issues
- **Authentication Errors**: Invalid or expired tokens
- **Authorization Errors**: Insufficient permissions
- **Validation Errors**: Invalid input data
- **Server Errors**: Backend issues

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh token
- `GET /auth/verify` - Verify token
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

### Seats
- `GET /seats` - Get all seats
- `POST /seats` - Create seat (admin)
- `PUT /seats/:id` - Update seat (admin)
- `DELETE /seats/:id` - Delete seat (admin)
- `GET /seats/:id/availability` - Get seat availability
- `GET /seats/stats` - Get seat statistics
- `GET /seats/search` - Search seats

### Bookings
- `POST /bookings` - Create booking
- `GET /bookings` - Get all bookings
- `GET /bookings/my` - Get user's bookings
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking

### Resources
- `GET /resources` - Get all resources
- `POST /resources` - Create resource (admin)
- `PUT /resources/:id` - Update resource (admin)
- `DELETE /resources/:id` - Delete resource (admin)
- `POST /resources/:id/book` - Book resource
- `GET /resources/:id/availability` - Get resource availability
- `GET /resources/stats` - Get resource statistics
- `GET /resources/search` - Search resources

### Floor Plans
- `GET /floors` - Get all floor plans
- `POST /floors` - Create floor plan (admin)
- `PUT /floors/:id` - Update floor plan (admin)
- `DELETE /floors/:id` - Delete floor plan (admin)
- `PUT /floors/:id/layout` - Save floor plan layout
- `GET /floors/:id/stats` - Get floor plan statistics
- `GET /floors/buildings` - Get all buildings
- `GET /floors/buildings/:building/floors` - Get floors for building

## Security Features

### JWT Token Management
- Automatic token refresh
- Secure token storage
- Token expiration handling
- Automatic logout on token failure

### Request Security
- HTTPS enforcement in production
- CORS configuration
- Request validation
- Rate limiting support

### Error Security
- No sensitive data in error messages
- Secure error logging
- User-friendly error messages

## Testing

### Mock Mode
For development without a backend, you can enable mock data:

```bash
VITE_ENABLE_MOCK_DATA=true
```

This will use the existing mock data instead of making API calls.

### API Testing
Use the provided demo credentials for testing:

- **Admin**: admin@upsreserve.com / admin123
- **Manager**: manager@upsreserve.com / manager123
- **Employee**: employee@upsreserve.com / employee123

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend allows requests from your frontend domain
2. **Authentication Errors**: Check that tokens are being sent correctly
3. **Network Errors**: Verify the API base URL is correct
4. **Timeout Errors**: Increase the timeout value if needed

### Debug Mode
Enable debug logging to see detailed API request/response information:

```bash
VITE_ENABLE_DEBUG_LOGGING=true
```

### Network Tab
Use browser developer tools to inspect API requests and responses for debugging.

## Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Loading States**: Show loading indicators during API calls
3. **User Feedback**: Display success/error messages to users
4. **Token Management**: Let the service handle token refresh automatically
5. **Type Safety**: Use TypeScript interfaces for API responses
6. **Validation**: Validate data before sending to API

## Migration from Mock Data

The application has been updated to use real API calls while maintaining backward compatibility:

1. **Authentication**: Now uses real JWT tokens
2. **Data Fetching**: Seats, resources, and floor plans come from API
3. **Booking**: Real booking operations with persistence
4. **User Management**: Real user profiles and permissions

The mock data files are still available for reference and fallback scenarios. 