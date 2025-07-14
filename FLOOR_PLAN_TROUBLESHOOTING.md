# Floor Plan Loading Troubleshooting Guide

## Issue: "Failed to fetch floor plan" Error

### What's Happening

The floor plan component is trying to fetch data from a backend API, but the request is failing. Here are the most common causes and solutions:

### 1. Backend Server Not Running

**Problem**: The backend API server is not running on the expected port.

**Solution**: 
- Start your backend server on port 3001 (or configure the correct port)
- The frontend expects the API at: `http://localhost:3001/api`

**To check if backend is running:**
```bash
# Try to access the API directly
curl http://localhost:3001/api/floorplan?building=campus%2030&office=IN10&floor=Floor%208
```

### 2. Wrong API Endpoint

**Problem**: The API endpoint might be different from what the frontend expects.

**Current frontend tries these endpoints:**
1. `GET /floors/location?building={building}&floor={floor}` (via floorPlanService)
2. `GET /floorplan?building={building}&office={office}&floor={floor}` (fallback)

**Expected backend endpoints:**
- `GET /api/floorplan` with query parameters
- `GET /api/floors/location` with query parameters

### 3. CORS Issues

**Problem**: The backend doesn't allow requests from the frontend domain.

**Solution**: Configure CORS on your backend to allow requests from `http://localhost:5173` (Vite dev server).

**Example CORS configuration (Spring Boot):**
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
```

### 4. Environment Configuration

**Problem**: The frontend is using the wrong API base URL.

**Solution**: Create a `.env` file in the project root:

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

### 5. Network/Firewall Issues

**Problem**: Network or firewall blocking the connection.

**Solution**:
- Check if port 3001 is accessible
- Try using a different port
- Check firewall settings

### 6. Backend Data Issues

**Problem**: The backend doesn't have data for the requested parameters.

**Solution**: Ensure your backend has data for:
- Building: "campus 30", "building-a", "building-b", etc.
- Office: "IN10", "main-office", etc.
- Floor: "Floor 8", "floor-1", etc.

### Current Fallback Behavior

The frontend now includes a fallback mechanism:

1. **First**: Try to use the floorPlanService
2. **Second**: Try direct API call to `/api/floorplan`
3. **Third**: Use local data from `src/data/floorPlanData.ts`

### How to Test

1. **Check Browser Console**: Open Developer Tools (F12) and look for:
   - Network requests to see what URLs are being called
   - Console errors for detailed error messages
   - Response status codes

2. **Test API Directly**: Use curl or Postman to test the API:
   ```bash
   curl "http://localhost:3001/api/floorplan?building=campus%2030&office=IN10&floor=Floor%208"
   ```

3. **Check Backend Logs**: Look at your backend server logs for any errors.

### Expected API Response Format

The backend should return data in this format:
```json
{
  "seats": [
    {
      "id": "D1",
      "x": 7,
      "y": 5,
      "status": "available",
      "type": "desk",
      "equipment": ["Monitor", "Dock", "Window Seat"],
      "rotation": 0
    }
  ],
  "deskAreas": [
    {
      "id": "area-1",
      "name": "Open Workspace",
      "x": 5,
      "y": 5,
      "width": 100,
      "height": 50,
      "type": "workspace"
    }
  ],
  "officeLayout": {
    "x": 0,
    "y": 0,
    "width": 210,
    "height": 82,
    "fillColor": "#f8f9fa",
    "fillOpacity": 0.5,
    "strokeColor": "#dee2e6",
    "strokeWidth": 1
  }
}
```

### Quick Fix for Development

If you just want to see the floor plan working:

1. The frontend will automatically fall back to local data if the API fails
2. You'll see a warning message: "Using local data - Backend not available"
3. The floor plan will still be fully functional with the local data

### Next Steps

1. **Start your backend server** on port 3001
2. **Configure CORS** to allow frontend requests
3. **Ensure your API endpoints** match what the frontend expects
4. **Add sample data** to your backend for testing
5. **Check the browser console** for detailed error messages

### Debug Information

The frontend now logs detailed information to help debug:
- API URLs being called
- Response status codes
- Error messages
- Fallback behavior

Check the browser console (F12) for this debug information when loading the floor plan. 