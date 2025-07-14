# Floor Plan Save API Specification

## Endpoint: `POST /api/floorplan/save`

### Purpose
Save updated floor plan data to the database after editing.

### Request Format

**URL:** `http://localhost:8080/api/floorplan/save`

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "building_name": "campus30",
  "office_location": "IN10", 
  "floor_id": "Floor8",
  "plan_json": "{\"seats\":[...],\"deskAreas\":[...],\"officeLayout\":{...}}"
}
```

### Request Body Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `building_name` | string | Building identifier | "campus30", "campus20" |
| `office_location` | string | Office location code | "IN10", "main-office" |
| `floor_id` | string | Floor identifier | "Floor8", "Floor7" |
| `plan_json` | string | JSON string containing the complete floor plan data | See example below |

### Example Request Body

```json
{
  "building_name": "campus30",
  "office_location": "IN10",
  "floor_id": "Floor8", 
  "plan_json": "{\"seats\":[{\"id\":\"D1\",\"x\":5.4,\"y\":17.14,\"status\":\"available\",\"type\":\"desk\",\"equipment\":[\"Monitor\",\"Dock\",\"Window Seat\"],\"rotation\":0}],\"deskAreas\":[{\"id\":\"area1\",\"name\":\"WORKSPACE 1💼\",\"color\":\"#FFD700\",\"x\":-4.02,\"y\":3.29,\"width\":65,\"height\":35,\"type\":\"workspace\",\"rotation\":0}],\"officeLayout\":{\"x\":-6.49,\"y\":1.65,\"width\":210,\"height\":82,\"fillColor\":\"hsl(var(--muted))\",\"fillOpacity\":0.1,\"strokeColor\":\"hsl(var(--border))\",\"strokeWidth\":1}}"
}
```

### Response Format

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Floor plan saved successfully",
  "data": {
    "building_name": "campus30",
    "office_location": "IN10",
    "floor_id": "Floor8",
    "updated_at": "2024-01-15T10:30:00Z",
    "items_count": {
      "seats": 92,
      "deskAreas": 15,
      "resources": 0,
      "floorSymbols": 0
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid request data",
  "error": "Validation failed"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Floor plan not found",
  "error": "No existing floor plan found for the specified location"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Failed to save floor plan",
  "error": "Database connection error"
}
```

### Backend Implementation (Spring Boot Example)

```java
@RestController
@RequestMapping("/api/floorplan")
public class FloorPlanController {

    @Autowired
    private FloorPlanService floorPlanService;

    @PostMapping("/save")
    public ResponseEntity<?> saveFloorPlan(@RequestBody FloorPlanSaveRequest request) {
        try {
            // Validate request
            if (request.getBuildingName() == null || request.getOfficeLocation() == null || 
                request.getFloorId() == null || request.getPlanJson() == null) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Missing required fields", null));
            }

            // Parse JSON to validate it's valid
            try {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode planData = mapper.readTree(request.getPlanJson());
            } catch (Exception e) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Invalid JSON format", null));
            }

            // Save to database
            FloorPlan savedPlan = floorPlanService.saveFloorPlan(
                request.getBuildingName(),
                request.getOfficeLocation(), 
                request.getFloorId(),
                request.getPlanJson()
            );

            // Count items
            JsonNode planData = mapper.readTree(request.getPlanJson());
            Map<String, Integer> itemCounts = new HashMap<>();
            itemCounts.put("seats", planData.has("seats") ? planData.get("seats").size() : 0);
            itemCounts.put("deskAreas", planData.has("deskAreas") ? planData.get("deskAreas").size() : 0);
            itemCounts.put("resources", planData.has("resources") ? planData.get("resources").size() : 0);
            itemCounts.put("floorSymbols", planData.has("floorSymbols") ? planData.get("floorSymbols").size() : 0);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("building_name", savedPlan.getBuildingName());
            responseData.put("office_location", savedPlan.getOfficeLocation());
            responseData.put("floor_id", savedPlan.getFloorId());
            responseData.put("updated_at", savedPlan.getUpdatedAt());
            responseData.put("items_count", itemCounts);

            return ResponseEntity.ok(new ApiResponse(true, "Floor plan saved successfully", responseData));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse(false, "Failed to save floor plan", e.getMessage()));
        }
    }
}

// Request DTO
public class FloorPlanSaveRequest {
    private String buildingName;
    private String officeLocation;
    private String floorId;
    private String planJson;

    // Getters and setters
    public String getBuildingName() { return buildingName; }
    public void setBuildingName(String buildingName) { this.buildingName = buildingName; }
    
    public String getOfficeLocation() { return officeLocation; }
    public void setOfficeLocation(String officeLocation) { this.officeLocation = officeLocation; }
    
    public String getFloorId() { return floorId; }
    public void setFloorId(String floorId) { this.floorId = floorId; }
    
    public String getPlanJson() { return planJson; }
    public void setPlanJson(String planJson) { this.planJson = planJson; }
}

// Service Implementation
@Service
public class FloorPlanService {

    @Autowired
    private FloorPlanRepository floorPlanRepository;

    public FloorPlan saveFloorPlan(String buildingName, String officeLocation, String floorId, String planJson) {
        // Generate table name
        String tableName = officeLocation + "_" + buildingName.replace(" ", "") + "_" + floorId.replace(" ", "") + "_table";
        
        // Check if record exists
        FloorPlan existingPlan = floorPlanRepository.findByLocation(buildingName, officeLocation, floorId);
        
        if (existingPlan != null) {
            // Update existing record
            existingPlan.setPlanJson(planJson);
            existingPlan.setUpdatedAt(new Date());
            return floorPlanRepository.save(existingPlan);
        } else {
            // Create new record
            FloorPlan newPlan = new FloorPlan();
            newPlan.setBuildingName(buildingName);
            newPlan.setOfficeLocation(officeLocation);
            newPlan.setFloorId(floorId);
            newPlan.setPlanJson(planJson);
            newPlan.setCreatedAt(new Date());
            newPlan.setUpdatedAt(new Date());
            return floorPlanRepository.save(newPlan);
        }
    }
}
```

### SQL Update Statement (Alternative)

If you prefer to use direct SQL instead of JPA:

```sql
-- Update existing floor plan
UPDATE IN10_campus30_Floor8_table 
SET plan_json = '{"seats":[...],"deskAreas":[...],"officeLayout":{...}}',
    updated_at = GETDATE()
WHERE building_name = 'campus 30' 
  AND office_location = 'IN10' 
  AND floor_id = 'Floor 8';

-- Or use UPSERT pattern
MERGE INTO IN10_campus30_Floor8_table AS target
USING (SELECT 'campus 30' as building_name, 'IN10' as office_location, 'Floor 8' as floor_id) AS source
ON target.building_name = source.building_name 
   AND target.office_location = source.office_location 
   AND target.floor_id = source.floor_id
WHEN MATCHED THEN
    UPDATE SET 
        plan_json = '{"seats":[...],"deskAreas":[...],"officeLayout":{...}}',
        updated_at = GETDATE()
WHEN NOT MATCHED THEN
    INSERT (building_name, office_location, floor_id, plan_json, created_at, updated_at)
    VALUES ('campus 30', 'IN10', 'Floor 8', '{"seats":[...],"deskAreas":[...],"officeLayout":{...}}', GETDATE(), GETDATE());
```

### Testing the API

You can test the save endpoint using curl:

```bash
curl -X POST http://localhost:8080/api/floorplan/save \
  -H "Content-Type: application/json" \
  -d '{
    "building_name": "campus30",
    "office_location": "IN10",
    "floor_id": "Floor8",
    "plan_json": "{\"seats\":[{\"id\":\"D1\",\"x\":5.4,\"y\":17.14,\"status\":\"available\",\"type\":\"desk\",\"equipment\":[\"Monitor\",\"Dock\",\"Window Seat\"],\"rotation\":0}],\"deskAreas\":[{\"id\":\"area1\",\"name\":\"WORKSPACE 1💼\",\"color\":\"#FFD700\",\"x\":-4.02,\"y\":3.29,\"width\":65,\"height\":35,\"type\":\"workspace\",\"rotation\":0}],\"officeLayout\":{\"x\":-6.49,\"y\":1.65,\"width\":210,\"height\":82,\"fillColor\":\"hsl(var(--muted))\",\"fillOpacity\":0.1,\"strokeColor\":\"hsl(var(--border))\",\"strokeWidth\":1}}"
  }'
```

### Frontend Integration

The frontend will automatically call this API when the "Save Changes" button is clicked in edit mode. The save function:

1. **Collects all changes** (seat positions, desk areas, new items, etc.)
2. **Prepares the payload** with building, office, floor, and updated JSON
3. **Calls the save API** with POST request
4. **Shows success/error message** to the user
5. **Refreshes the floor plan** to show the saved data
6. **Resets edit mode** and clears selections 