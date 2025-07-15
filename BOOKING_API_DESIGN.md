# Booking API Design Plan

## Overview
This document outlines the complete API design for the seat booking system, including endpoints, data models, validation rules, and implementation guidelines.

## Table of Contents
1. [API Endpoints](#api-endpoints)
2. [Data Models](#data-models)
3. [Request/Response Formats](#requestresponse-formats)
4. [Validation Rules](#validation-rules)
5. [Error Handling](#error-handling)
6. [Authentication](#authentication)
7. [Database Schema](#database-schema)
8. [Implementation Examples](#implementation-examples)
9. [Testing Strategy](#testing-strategy)

---

## API Endpoints

### 1. Create Booking
**POST** `/api/bookings/seat`

Creates a new seat booking with support for recurring bookings.

### 2. Get Bookings
**GET** `/api/bookings`

Retrieves bookings with optional filtering.

### 3. Update Booking
**PUT** `/api/bookings/{bookingId}`

Updates an existing booking.

### 4. Cancel Booking
**DELETE** `/api/bookings/{bookingId}`

Cancels a booking.

### 5. Get Booking by ID
**GET** `/api/bookings/{bookingId}`

Retrieves a specific booking.

---

## Data Models

### Booking Request Model
```typescript
interface BookingRequest {
  seatId: string;
  date: string; // ISO 8601 format: YYYY-MM-DD
  officeLocation: string;
  building: string;
  floor: string;
  userId?: string; // Optional, can be extracted from auth token
  recurrence?: {
    type: 'none' | 'daily' | 'weekly' | 'custom';
    endDate?: string; // Required for daily/weekly
    customDates?: string[]; // Required for custom
  };
  notes?: string;
  equipment?: string[];
}
```

### Booking Response Model
```typescript
interface BookingResponse {
  success: boolean;
  message: string;
  data?: {
    bookingId: string;
    seatId: string;
    userId: string;
    date: string;
    officeLocation: string;
    building: string;
    floor: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    createdAt: string;
    updatedAt: string;
    recurrence?: {
      type: string;
      endDate?: string;
      customDates?: string[];
    };
    notes?: string;
    equipment?: string[];
  };
  errors?: string[];
}
```

### Booking Entity Model
```typescript
interface Booking {
  id: string;
  seatId: string;
  userId: string;
  date: Date;
  officeLocation: string;
  building: string;
  floor: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  recurrenceType: 'none' | 'daily' | 'weekly' | 'custom';
  recurrenceEndDate?: Date;
  customDates?: Date[];
  notes?: string;
  equipment?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Request/Response Formats

### 1. Create Booking Request
```json
{
  "seatId": "seat-001",
  "date": "2024-01-15",
  "officeLocation": "IN10",
  "building": "campus30",
  "floor": "Floor8",
  "recurrence": {
    "type": "weekly",
    "endDate": "2024-02-15"
  },
  "notes": "Need quiet area for focused work",
  "equipment": ["Monitor", "Dock"]
}
```

### 2. Create Booking Response (Success)
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "bookingId": "booking-12345",
    "seatId": "seat-001",
    "userId": "user-456",
    "date": "2024-01-15",
    "officeLocation": "IN10",
    "building": "campus30",
    "floor": "Floor8",
    "status": "confirmed",
    "createdAt": "2024-01-10T10:30:00Z",
    "updatedAt": "2024-01-10T10:30:00Z",
    "recurrence": {
      "type": "weekly",
      "endDate": "2024-02-15"
    },
    "notes": "Need quiet area for focused work",
    "equipment": ["Monitor", "Dock"]
  }
}
```

### 3. Create Booking Response (Error)
```json
{
  "success": false,
  "message": "Booking failed",
  "errors": [
    "Seat is already booked for the selected date",
    "Invalid recurrence configuration"
  ]
}
```

---

## Validation Rules

### 1. Required Fields
- `seatId`: Must be a valid seat ID
- `date`: Must be in YYYY-MM-DD format and not in the past
- `officeLocation`: Must be a valid office location
- `building`: Must be a valid building
- `floor`: Must be a valid floor

### 2. Date Validation
- Booking date cannot be in the past
- For recurring bookings, end date must be after start date
- Custom dates must be valid and not in the past

### 3. Recurrence Validation
- **Daily**: Requires `endDate`
- **Weekly**: Requires `endDate`
- **Custom**: Requires `customDates` array with at least one date
- **None**: No additional fields required

### 4. Business Rules
- User cannot book the same seat for overlapping dates
- Maximum booking duration: 30 days for recurring bookings
- Maximum custom dates: 50 dates per booking
- Seat must be available for all requested dates

---

## Error Handling

### HTTP Status Codes
- `200 OK`: Success
- `201 Created`: Booking created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Seat or booking not found
- `409 Conflict`: Seat already booked
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    "Specific error 1",
    "Specific error 2"
  ],
  "timestamp": "2024-01-10T10:30:00Z",
  "requestId": "req-12345"
}
```

---

## Authentication

### JWT Token Authentication
```typescript
// Request Headers
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

### Token Payload
```json
{
  "userId": "user-456",
  "email": "user@company.com",
  "role": "user",
  "exp": 1641810600
}
```

---

## Database Schema

### Bookings Table
```sql
CREATE TABLE bookings (
    id VARCHAR(36) PRIMARY KEY,
    seat_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    booking_date DATE NOT NULL,
    office_location VARCHAR(50) NOT NULL,
    building VARCHAR(50) NOT NULL,
    floor VARCHAR(50) NOT NULL,
    status ENUM('confirmed', 'pending', 'cancelled') DEFAULT 'confirmed',
    recurrence_type ENUM('none', 'daily', 'weekly', 'custom') DEFAULT 'none',
    recurrence_end_date DATE NULL,
    custom_dates JSON NULL,
    notes TEXT NULL,
    equipment JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_seat_date (seat_id, booking_date),
    INDEX idx_user_date (user_id, booking_date),
    INDEX idx_location_date (office_location, building, floor, booking_date),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

### Seats Table (Reference)
```sql
CREATE TABLE seats (
    id VARCHAR(50) PRIMARY KEY,
    seat_number VARCHAR(20) NOT NULL,
    office_location VARCHAR(50) NOT NULL,
    building VARCHAR(50) NOT NULL,
    floor VARCHAR(50) NOT NULL,
    status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
    equipment JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Implementation Examples

### Spring Boot Controller
```java
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping("/seat")
    public ResponseEntity<BookingResponse> createBooking(
            @RequestBody BookingRequest request,
            @RequestHeader("Authorization") String authHeader) {
        
        try {
            // Extract user from JWT token
            String userId = extractUserIdFromToken(authHeader);
            
            // Validate request
            ValidationResult validation = validateBookingRequest(request);
            if (!validation.isValid()) {
                return ResponseEntity.badRequest()
                    .body(BookingResponse.error(validation.getErrors()));
            }
            
            // Create booking
            Booking booking = bookingService.createBooking(request, userId);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(BookingResponse.success(booking));
                
        } catch (SeatAlreadyBookedException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(BookingResponse.error("Seat is already booked for the selected date"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(BookingResponse.error("Internal server error"));
        }
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getBookings(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String seatId,
            @RequestParam(required = false) String date) {
        
        List<Booking> bookings = bookingService.getBookings(userId, seatId, date);
        return ResponseEntity.ok(bookings);
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable String bookingId,
            @RequestHeader("Authorization") String authHeader) {
        
        try {
            String userId = extractUserIdFromToken(authHeader);
            bookingService.cancelBooking(bookingId, userId);
            
            return ResponseEntity.ok(BookingResponse.success("Booking cancelled successfully"));
        } catch (BookingNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(BookingResponse.error("Not authorized to cancel this booking"));
        }
    }
}
```

### Service Layer
```java
@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private SeatRepository seatRepository;

    @Transactional
    public Booking createBooking(BookingRequest request, String userId) {
        // Check if seat exists and is available
        Seat seat = seatRepository.findById(request.getSeatId())
            .orElseThrow(() -> new SeatNotFoundException("Seat not found"));
        
        // Generate booking dates based on recurrence
        List<LocalDate> bookingDates = generateBookingDates(request);
        
        // Check for conflicts
        checkBookingConflicts(request.getSeatId(), bookingDates);
        
        // Create bookings
        List<Booking> bookings = new ArrayList<>();
        for (LocalDate date : bookingDates) {
            Booking booking = new Booking();
            booking.setId(UUID.randomUUID().toString());
            booking.setSeatId(request.getSeatId());
            booking.setUserId(userId);
            booking.setBookingDate(date);
            booking.setOfficeLocation(request.getOfficeLocation());
            booking.setBuilding(request.getBuilding());
            booking.setFloor(request.getFloor());
            booking.setStatus("confirmed");
            booking.setRecurrenceType(request.getRecurrence().getType());
            booking.setRecurrenceEndDate(request.getRecurrence().getEndDate());
            booking.setCustomDates(request.getRecurrence().getCustomDates());
            booking.setNotes(request.getNotes());
            booking.setEquipment(request.getEquipment());
            
            bookings.add(booking);
        }
        
        return bookingRepository.saveAll(bookings).get(0);
    }

    private List<LocalDate> generateBookingDates(BookingRequest request) {
        List<LocalDate> dates = new ArrayList<>();
        LocalDate startDate = LocalDate.parse(request.getDate());
        
        switch (request.getRecurrence().getType()) {
            case "none":
                dates.add(startDate);
                break;
            case "daily":
                LocalDate endDate = LocalDate.parse(request.getRecurrence().getEndDate());
                LocalDate current = startDate;
                while (!current.isAfter(endDate)) {
                    dates.add(current);
                    current = current.plusDays(1);
                }
                break;
            case "weekly":
                endDate = LocalDate.parse(request.getRecurrence().getEndDate());
                current = startDate;
                while (!current.isAfter(endDate)) {
                    dates.add(current);
                    current = current.plusWeeks(1);
                }
                break;
            case "custom":
                request.getRecurrence().getCustomDates().forEach(dateStr -> 
                    dates.add(LocalDate.parse(dateStr)));
                break;
        }
        
        return dates;
    }

    private void checkBookingConflicts(String seatId, List<LocalDate> dates) {
        for (LocalDate date : dates) {
            boolean exists = bookingRepository.existsBySeatIdAndBookingDateAndStatus(
                seatId, date, "confirmed");
            if (exists) {
                throw new SeatAlreadyBookedException(
                    "Seat is already booked for " + date);
            }
        }
    }
}
```

---

## Testing Strategy

### Unit Tests
```java
@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    
    @Mock
    private SeatRepository seatRepository;
    
    @InjectMocks
    private BookingService bookingService;

    @Test
    void createBooking_Success() {
        // Given
        BookingRequest request = createValidBookingRequest();
        Seat seat = createAvailableSeat();
        
        when(seatRepository.findById(request.getSeatId()))
            .thenReturn(Optional.of(seat));
        when(bookingRepository.existsBySeatIdAndBookingDateAndStatus(any(), any(), any()))
            .thenReturn(false);
        when(bookingRepository.saveAll(any()))
            .thenReturn(List.of(createBooking()));
        
        // When
        Booking result = bookingService.createBooking(request, "user-123");
        
        // Then
        assertNotNull(result);
        assertEquals("confirmed", result.getStatus());
        verify(bookingRepository).saveAll(any());
    }

    @Test
    void createBooking_SeatAlreadyBooked_ThrowsException() {
        // Given
        BookingRequest request = createValidBookingRequest();
        Seat seat = createAvailableSeat();
        
        when(seatRepository.findById(request.getSeatId()))
            .thenReturn(Optional.of(seat));
        when(bookingRepository.existsBySeatIdAndBookingDateAndStatus(any(), any(), any()))
            .thenReturn(true);
        
        // When & Then
        assertThrows(SeatAlreadyBookedException.class, () -> 
            bookingService.createBooking(request, "user-123"));
    }
}
```

### Integration Tests
```java
@SpringBootTest
@AutoConfigureTestDatabase
class BookingControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private BookingRepository bookingRepository;

    @Test
    void createBooking_ValidRequest_Returns201() {
        // Given
        BookingRequest request = createValidBookingRequest();
        String token = generateValidToken();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<BookingRequest> entity = new HttpEntity<>(request, headers);
        
        // When
        ResponseEntity<BookingResponse> response = restTemplate.postForEntity(
            "/api/bookings/seat", entity, BookingResponse.class);
        
        // Then
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertNotNull(response.getBody().getData().getBookingId());
    }
}
```

---

## Frontend Integration

### React Hook for Booking
```typescript
import { useState } from 'react';

interface UseBookingReturn {
  createBooking: (request: BookingRequest) => Promise<BookingResponse>;
  loading: boolean;
  error: string | null;
}

export const useBooking = (): UseBookingReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = async (request: BookingRequest): Promise<BookingResponse> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/bookings/seat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Booking failed');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createBooking, loading, error };
};
```

### Usage in Component
```typescript
const FloorPlan = () => {
  const { createBooking, loading, error } = useBooking();

  const handleConfirmBooking = async () => {
    if (!bookingSeat) return;

    const request: BookingRequest = {
      seatId: bookingSeat.id,
      date: selectedDate,
      officeLocation: selectedOfficeLocation,
      building: selectedBuilding,
      floor: selectedFloor,
      recurrence: {
        type: recurrenceType,
        endDate: recurrenceEndDate,
        customDates: customDates
      }
    };

    try {
      const response = await createBooking(request);
      if (response.success) {
        alert('Seat booked successfully!');
        handleCloseBookingDialog();
        // Refresh floor plan to show updated seat status
        await fetchFloorPlan();
      }
    } catch (err) {
      console.error('Booking failed:', err);
    }
  };

  return (
    // Component JSX
  );
};
```

---

## Security Considerations

### 1. Input Validation
- Sanitize all user inputs
- Validate date formats and ranges
- Check for SQL injection attempts
- Validate JSON payload structure

### 2. Authentication & Authorization
- Require valid JWT tokens for all booking operations
- Verify user permissions for booking operations
- Implement rate limiting for booking requests
- Log all booking activities for audit

### 3. Data Protection
- Encrypt sensitive booking data
- Implement proper session management
- Use HTTPS for all API communications
- Follow GDPR compliance for user data

---

## Performance Considerations

### 1. Database Optimization
- Use appropriate indexes for frequent queries
- Implement connection pooling
- Consider caching for frequently accessed data
- Use pagination for large result sets

### 2. API Optimization
- Implement request/response compression
- Use async processing for heavy operations
- Implement proper error handling and logging
- Consider using GraphQL for complex queries

### 3. Monitoring
- Monitor API response times
- Track booking success/failure rates
- Monitor database performance
- Set up alerts for system issues

---

## Deployment Checklist

### 1. Environment Setup
- [ ] Configure database connections
- [ ] Set up JWT secret keys
- [ ] Configure CORS settings
- [ ] Set up logging and monitoring

### 2. Database Migration
- [ ] Create bookings table
- [ ] Create seats table
- [ ] Set up indexes
- [ ] Insert initial data

### 3. API Deployment
- [ ] Deploy Spring Boot application
- [ ] Configure load balancer
- [ ] Set up SSL certificates
- [ ] Configure environment variables

### 4. Testing
- [ ] Run unit tests
- [ ] Run integration tests
- [ ] Perform load testing
- [ ] Test error scenarios

---

This API design provides a comprehensive foundation for implementing a robust seat booking system with proper validation, error handling, and security measures. 