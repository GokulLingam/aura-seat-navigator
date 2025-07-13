# Seat Drag & Drop Feature Guide

## 🎯 Overview
The Aura Seat Navigator includes a powerful drag and drop feature that allows you to move seats and other elements in edit mode. This guide explains how to use this functionality effectively.

## 🚀 Quick Start

### 1. **Test the Feature Immediately**
Open `test-drag-drop.html` in your browser to test the drag and drop functionality without running the development server.

### 2. **Use in the Main Application**
1. Navigate to the Floor Plan page
2. Enable "Edit Mode" checkbox
3. Start dragging seats!

## 📋 Features

### ✅ **Seat Dragging**
- **Single Seat**: Click and drag any seat to move it
- **Multi-Selection**: Select multiple seats and drag them together
- **Visual Feedback**: Cursor changes and seats highlight during drag

### ✅ **Selection Methods**
- **Single Click**: Select one seat
- **Ctrl/Cmd + Click**: Add/remove seats from selection
- **Select All**: Use the "Select All" button
- **Deselect All**: Use the "Deselect All" button

### ✅ **Save Functionality**
- **Save Changes**: Click "Save Changes" to download updated data
- **File Format**: Downloads as `floorPlanData.ts` (TypeScript) or `updated-seat-positions.json` (JSON)
- **Data Structure**: Includes all seat positions, resources, and floor symbols

## 🎮 How to Use

### **Step 1: Enable Edit Mode**
```
☑️ Check "Edit Mode" checkbox
```

### **Step 2: Select Seats**
```
🖱️ Click on seats to select them
⌨️ Ctrl/Cmd + Click for multi-selection
```

### **Step 3: Drag to Move**
```
🖱️ Click and drag any selected seat
📦 All selected seats move together
```

### **Step 4: Save Changes**
```
💾 Click "Save Changes" button
📁 File downloads automatically
```

## 🔧 Technical Details

### **Drag Threshold**
- **Distance**: 5 pixels movement required
- **Time**: 200ms hold required
- **Purpose**: Prevents accidental drags from clicks

### **Coordinate System**
- **SVG Coordinates**: All positions are in SVG units
- **Zoom Support**: Works correctly with zoomed views
- **Precision**: Sub-pixel positioning supported

### **Event Handling**
- **Mouse Down**: Starts potential drag operation
- **Mouse Move**: Checks threshold and updates positions
- **Mouse Up**: Finalizes drag or handles selection

## 📁 File Output

### **Main Application Output** (`floorPlanData.ts`)
```typescript
export const seats: Seat[] = [
  {
    id: "A1",
    x: 150,  // Updated position
    y: 200,  // Updated position
    status: "available",
    type: "desk",
    equipment: ["Monitor", "Dock"],
    rotation: 0
  },
  // ... more seats
];
```

### **Test File Output** (`updated-seat-positions.json`)
```json
{
  "seats": [
    {
      "id": "A1",
      "x": 150,
      "y": 200,
      "status": "available"
    }
  ]
}
```

## 🎨 Visual Indicators

### **Cursor States**
- **Default**: `cursor-pointer` (normal mode)
- **Edit Mode**: `cursor-grab` (ready to drag)
- **Dragging**: `cursor-grabbing` (actively dragging)

### **Selection States**
- **Unselected**: Green background
- **Selected**: Blue background with glow effect
- **Dragging**: Semi-transparent with grab cursor

### **Status Messages**
- **Ready**: "Ready to test drag and drop functionality"
- **Edit Mode**: "Edit mode ON/OFF"
- **Selection**: "Selected X seat(s)"
- **Drag**: "Seats moved successfully"
- **Save**: "Floor plan data saved! Check your downloads folder"

## 🔄 Multi-Selection Workflow

### **Select Multiple Seats**
1. Click first seat
2. Hold Ctrl/Cmd
3. Click additional seats
4. All selected seats will move together when dragged

### **Select All at Once**
1. Enable edit mode
2. Click "Select All" button
3. Drag any seat to move all seats

## 🛠️ Troubleshooting

### **Drag Not Working**
- ✅ Ensure edit mode is enabled
- ✅ Check if seat is not occupied
- ✅ Try clicking and holding for 200ms
- ✅ Move mouse more than 5 pixels

### **Multi-Selection Issues**
- ✅ Use Ctrl (Windows) or Cmd (Mac) for multi-select
- ✅ Ensure edit mode is enabled
- ✅ Click seats individually while holding modifier key

### **Save Not Working**
- ✅ Check browser download settings
- ✅ Ensure popup blockers are disabled
- ✅ Check downloads folder for the file

### **Performance Issues**
- ✅ Reduce number of selected seats
- ✅ Close other browser tabs
- ✅ Restart browser if needed

## 🎯 Best Practices

### **Efficient Workflow**
1. **Plan Layout**: Decide on new positions before starting
2. **Use Multi-Selection**: Select related seats together
3. **Save Regularly**: Save changes frequently
4. **Test Positions**: Verify seats are in correct locations

### **Data Management**
- **Backup**: Keep original data file as backup
- **Version Control**: Use meaningful file names with dates
- **Validation**: Check saved data for accuracy

## 🚀 Advanced Features

### **Keyboard Shortcuts**
- **Ctrl/Cmd + Click**: Multi-select
- **Escape**: Cancel current operation
- **Delete**: Remove selected items (if implemented)

### **Undo/Redo**
- **Undo**: Revert last change (if implemented)
- **Reset**: Return to original positions
- **History**: Track all changes (if implemented)

## 📞 Support

If you encounter any issues:
1. Check this guide for troubleshooting steps
2. Test with the `test-drag-drop.html` file
3. Verify browser compatibility
4. Check console for error messages

---

**Happy Dragging! 🎉** 