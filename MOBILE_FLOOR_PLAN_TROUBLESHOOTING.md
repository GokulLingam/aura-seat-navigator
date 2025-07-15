# Mobile Floor Plan Loading Troubleshooting Guide

## Overview
This guide helps resolve issues with the floor plan not loading on mobile devices.

## Recent Mobile Improvements Made

### 1. Enhanced Mobile API Calls
- Added 15-second timeout for mobile devices (vs 10s for desktop)
- Added proper headers for mobile requests
- Enhanced error handling with mobile-specific messages
- Added data validation for mobile responses

### 2. Improved Mobile UI
- Larger touch targets (12px height for inputs, 16px for buttons)
- Mobile-specific dropdown layout (full width, stacked)
- Better mobile status indicators
- Mobile debug information panel

### 3. Enhanced Touch Handling
- Improved pinch-to-zoom functionality
- Better touch event prevention
- Mobile-specific touch debugging logs
- Enhanced tap detection for seat selection

### 4. Mobile-Specific Features
- Mobile status indicator in top-left corner
- Mobile controls panel with debug info
- Quick action buttons for refresh and local data
- Mobile floating action button (larger size)

## Common Mobile Issues & Solutions

### Issue 1: Floor Plan Not Loading on Mobile
**Symptoms:**
- Loading spinner appears but never completes
- Error message shows "Failed to fetch floor plan"
- Page appears empty

**Solutions:**
1. **Check Network Connection**
   - Ensure mobile device has stable internet connection
   - Try switching between WiFi and mobile data
   - Check if other apps can access the internet

2. **Check Backend Server**
   - Ensure backend is running on `http://localhost:3001`
   - Verify API endpoint `/api/floorplan` is accessible
   - Check server logs for errors

3. **Check Browser Console**
   - Open browser developer tools on mobile
   - Look for error messages in console
   - Check network tab for failed requests

4. **Use Local Data Fallback**
   - Click "📱 Use Local Data" button in mobile controls
   - This loads sample data for testing

### Issue 2: Mobile Controls Not Working
**Symptoms:**
- Floating action button doesn't respond
- Mobile controls panel doesn't appear
- Touch interactions don't work

**Solutions:**
1. **Check Mobile Detection**
   - Verify `useIsMobile()` hook is working
   - Check if screen width is < 768px
   - Look for "Mobile device detected: true" in console

2. **Check Touch Events**
   - Ensure touch events are not being blocked
   - Check for "Touch start/end" logs in console
   - Verify pinch-to-zoom is working

3. **Check CSS Issues**
   - Ensure mobile-specific styles are applied
   - Check for z-index conflicts
   - Verify touch-action CSS properties

### Issue 3: Mobile Performance Issues
**Symptoms:**
- Slow loading times
- Laggy interactions
- High memory usage

**Solutions:**
1. **Optimize for Mobile**
   - Reduce zoom levels on mobile (default 100% vs 200% desktop)
   - Smaller floor plan container height (300px vs 400px)
   - Simplified rendering for mobile

2. **Check Device Performance**
   - Close other apps to free memory
   - Use a modern mobile browser
   - Check device storage space

3. **Network Optimization**
   - Use WiFi instead of mobile data if possible
   - Check for network throttling
   - Verify API response times

## Mobile Debug Information

### Console Logs to Look For
```
Mobile device detected: true
Selected values: { building: "campus30", office: "IN10", floor: "Floor8" }
Fetching floor plan for: { building: "campus30", office: "IN10", floor: "Floor8" }
Is mobile device: true
Fetching from: http://localhost:3001/api/floorplan?building=campus30&office=IN10&floor=Floor8
Response status: 200
Received data: { seats: [...], deskAreas: [...], officeLayout: {...} }
```

### Mobile Status Indicators
- **⏳ Loading...**: Request in progress
- **⚠️ Error**: API call failed
- **✅ Loaded**: Floor plan loaded successfully
- **📱 Ready**: Ready to load floor plan

### Mobile Debug Panel
The mobile controls panel shows:
- Current zoom level
- Number of seats loaded
- Loading status
- Error status
- Floor plan loaded status

## Testing Mobile Functionality

### 1. Basic Loading Test
1. Open app on mobile device
2. Select Building: "Campus 30"
3. Select Office: "IN10"
4. Select Floor: "Floor 8"
5. Click "📋 Load Floor Plan"
6. Verify loading indicator appears
7. Check for success/error message

### 2. Touch Interaction Test
1. Load floor plan successfully
2. Try tapping on seats
3. Test pinch-to-zoom functionality
4. Verify mobile controls panel opens
5. Test zoom controls in panel

### 3. Error Handling Test
1. Disconnect from internet
2. Try loading floor plan
3. Verify error message appears
4. Test "Use Local Data" button
5. Verify local data loads

### 4. Mobile Controls Test
1. Tap floating action button (bottom-right)
2. Verify mobile controls panel opens
3. Test all buttons in panel
4. Check debug information
5. Test panel close functionality

## Mobile-Specific Configuration

### Backend API Configuration
```javascript
// Mobile timeout configuration
const timeout = isMobile ? 15000 : 10000; // 15s for mobile, 10s for desktop

// Mobile headers
headers: {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}
```

### Mobile UI Configuration
```javascript
// Mobile-specific styling
className={`px-3 py-2 border border-input rounded-md bg-background text-sm ${
  isMobile ? 'w-full h-12 text-base' : 'min-w-[120px]'
}`}

// Mobile button styling
className={`bg-blue-600 hover:bg-blue-700 ${
  isMobile ? 'w-full h-12 text-base font-medium' : ''
}`}
```

### Mobile Touch Configuration
```javascript
// Touch event handling
onTouchStart={handleTouchStart}
onTouchMove={handleTouchMove}
onTouchEnd={handleTouchEnd}
style={{
  touchAction: 'pan-x pan-y pinch-zoom'
}}
```

## Troubleshooting Checklist

- [ ] Backend server is running on port 3001
- [ ] API endpoint `/api/floorplan` is accessible
- [ ] Mobile device has internet connection
- [ ] Browser supports touch events
- [ ] Screen width is < 768px (mobile detection)
- [ ] Console shows "Mobile device detected: true"
- [ ] No JavaScript errors in console
- [ ] Network requests are not blocked
- [ ] Touch events are not prevented
- [ ] Mobile-specific CSS is applied

## Emergency Fallback

If all else fails:
1. Click "📱 Use Local Data" button
2. This loads sample floor plan data
3. Allows testing of mobile interactions
4. No backend connection required

## Support

If issues persist:
1. Check browser console for errors
2. Verify backend server status
3. Test on different mobile devices
4. Check network connectivity
5. Review mobile debug information 