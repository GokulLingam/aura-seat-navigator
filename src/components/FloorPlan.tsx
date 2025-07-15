import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Monitor, Wifi, Coffee, ZoomIn, ZoomOut, RotateCcw, RotateCw, Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Undo2, Plus, Menu, X, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AspectRatio } from '@/components/ui/aspect-ratio';
// Import types only
import type { Seat, DeskArea } from '@/data/floorPlanData';
import floorPlanService from '@/services/floorPlanService';
// Import local data as fallback
import { seats as localSeats, deskAreas as localDeskAreas, officeLayout as localOfficeLayout } from '@/data/floorPlanData';

// Equipment filter options
const EQUIPMENT_OPTIONS = ["Monitor", "Dock", "Window Seat"];

const FloorPlan = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFloor, setSelectedFloor] = useState('Floor8');
  const [selectedOfficeLocation, setSelectedOfficeLocation] = useState('IN10');
  const [selectedBuilding, setSelectedBuilding] = useState('campus30');
  const [zoom, setZoom] = useState(isMobile ? 1 : 2); // Default zoom for mobile
  const [showZoomControls, setShowZoomControls] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(isMobile ? 100 : 200); // Percentage display
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const [zoomIndicatorTimeout, setZoomIndicatorTimeout] = useState<NodeJS.Timeout | null>(null);

  // Mobile-specific state
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Equipment filter state
  const [equipmentFilter, setEquipmentFilter] = useState<string[]>([]);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSeat, setEditingSeat] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [selectedDeskAreas, setSelectedDeskAreas] = useState<Set<string>>(new Set());
  const [selectedSymbols, setSelectedSymbols] = useState<Set<string>>(new Set());
  const [seatPositions, setSeatPositions] = useState<Record<string, { x: number; y: number; rotation: number }>>({});
  const [isDraggingSeat, setIsDraggingSeat] = useState(false);
  const [dragSeatStart, setDragSeatStart] = useState({ x: 0, y: 0 });

  // Touch state for mobile
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [isPinching, setIsPinching] = useState(false);
  const [pinchStartDistance, setPinchStartDistance] = useState(0);
  const [pinchStartZoom, setPinchStartZoom] = useState(1);

  // New features state
  const [newSeats, setNewSeats] = useState<Seat[]>([]);
  const [newSeatPositions, setNewSeatPositions] = useState<Record<string, { x: number; y: number; rotation: number }>>({});
  const [floorSymbols, setFloorSymbols] = useState<any[]>([]);
  const [symbolPositions, setSymbolPositions] = useState<Record<string, { x: number; y: number; rotation: number }>>({});
  const [deskAreaPositions, setDeskAreaPositions] = useState<Record<string, { x: number; y: number; rotation: number }>>({});
  const [isPlacingItem, setIsPlacingItem] = useState<'seat' | null>(null);

  // Undo functionality
  const [undoHistory, setUndoHistory] = useState<Record<string, { x: number; y: number; rotation: number }>[]>([]);
  const [undoIndex, setUndoIndex] = useState(-1);

  // Desk area creation state
  const [customDeskAreas, setCustomDeskAreas] = useState<Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
  }>>([]);
  const [isCreatingDeskArea, setIsCreatingDeskArea] = useState(false);
  const [deskAreaStart, setDeskAreaStart] = useState({ x: 0, y: 0 });
  const [deskAreaEnd, setDeskAreaEnd] = useState({ x: 0, y: 0 });

  // NEW: State for floor plan data from backend
  const [floorPlan, setFloorPlan] = useState<{ seats: Seat[]; deskAreas: DeskArea[]; officeLayout: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch floor plan data based on selected values
  const fetchFloorPlan = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching floor plan for:', { building: selectedBuilding, office: selectedOfficeLocation, floor: selectedFloor, date: selectedDate });
      
      // Direct API call to the correct endpoint
      const params = new URLSearchParams({
        building: selectedBuilding,
        office: selectedOfficeLocation,
        floor: selectedFloor,
        date: selectedDate
      });
      
      // Try multiple API endpoints for mobile compatibility
      const apiEndpoints = [
        `http://localhost:3001/api/floorplan?${params}`,
        `http://127.0.0.1:3001/api/floorplan?${params}`,
        `/api/floorplan?${params}` // Relative path fallback
      ];
      
      let response = null;
      let lastError = null;
      
      // Try each endpoint until one works
      for (const apiUrl of apiEndpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), isMobile ? 15000 : 10000);
          
          response = await fetch(apiUrl, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            },
            mode: 'cors'
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            break; // Success, exit the loop
          }
        } catch (err) {
          lastError = err;
          continue; // Try next endpoint
        }
      }
      
      if (!response || !response.ok) {
        throw lastError || new Error(`HTTP ${response?.status}: Failed to fetch floor plan from all endpoints`);
      }
      
      const data = await response.json();
      
      // Validate data structure for mobile
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format received from server');
      }
      
      // Ensure required properties exist
      if (!data.seats || !Array.isArray(data.seats)) {
        data.seats = [];
      }
      
      if (!data.deskAreas || !Array.isArray(data.deskAreas)) {
        data.deskAreas = [];
      }
      
      if (!data.officeLayout || typeof data.officeLayout !== 'object') {
        data.officeLayout = { width: 210, height: 82, x: 0, y: 0 };
      }
      
      setFloorPlan(data);
      setLoading(false);
      
    } catch (err) {
      console.error('Fetch error:', err);
      
      // Enhanced error handling for mobile
      let errorMessage = 'Failed to load floor plan';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.message.includes('CORS')) {
          errorMessage = 'CORS error. Backend server may not be configured for mobile access.';
        } else {
          errorMessage = err.message;
        }
      }
      
      // Final fallback: use local data
      setFloorPlan({
        seats: localSeats,
        deskAreas: localDeskAreas,
        officeLayout: localOfficeLayout
      });
      setError(`Using local data - ${errorMessage}`);
      setLoading(false);
    }
  };

  // Fetch data when selections change
  useEffect(() => {
    if (selectedBuilding && selectedOfficeLocation && selectedFloor) {
      fetchFloorPlan();
    }
  }, [selectedBuilding, selectedOfficeLocation, selectedFloor, selectedDate]);

  // Mobile-specific initialization
  useEffect(() => {
    if (isMobile) {
      // Set mobile-specific defaults
      if (!selectedBuilding) setSelectedBuilding('campus30');
      if (!selectedOfficeLocation) setSelectedOfficeLocation('IN10');
      if (!selectedFloor) setSelectedFloor('Floor8');
      
      // Auto-load floor plan on mobile if all values are set
      if (selectedBuilding && selectedOfficeLocation && selectedFloor && !floorPlan && !loading) {
        fetchFloorPlan();
      }
    }
  }, [isMobile]);

  // Use floorPlan?.seats, floorPlan?.deskAreas, floorPlan?.officeLayout instead of imported data
  const seats: Seat[] = floorPlan?.seats || [];
  const deskAreas: DeskArea[] = floorPlan?.deskAreas || [];
  const officeLayout = floorPlan?.officeLayout || { width: 210, height: 82, x: 0, y: 0 };
  const resources: any[] = [];

  // Layout editing state - match viewBox exactly by default
  const [layoutDimensions, setLayoutDimensions] = useState({
    width: officeLayout.width,
    height: officeLayout.height
  });

  // Layout position state for moving the layout
  const [layoutPosition, setLayoutPosition] = useState({
    x: officeLayout.x || 0,
    y: officeLayout.y || 0
  });

  // Calculate centered position for office layout
  const layoutWidth = layoutDimensions.width;
  const layoutHeight = layoutDimensions.height;
  const layoutX = layoutPosition.x;
  const layoutY = layoutPosition.y;

  // Calculate viewBox dimensions based on layout dimensions
  const viewBoxWidth = 210; // Office layout width + padding
  const viewBoxHeight = 160; // Office layout height + padding
  const viewBoxX = 0;
  const viewBoxY = 0;

  // Desk area editing state
  const [editingDeskArea, setEditingDeskArea] = useState<string | null>(null);
  const [deskAreaDimensions, setDeskAreaDimensions] = useState<Record<string, { width: number; height: number }>>({});

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<{
    type: 'seat' | 'resource' | 'symbol' | 'desk-area' | 'layout';
    id: string;
    startX: number;
    startY: number;
  } | null>(null);
  const [isDraggingItem, setIsDraggingItem] = useState(false);

  // Enhanced zoom state with better controls
  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 5); // Increased max zoom to 500%
    setZoom(newZoom);
    setZoomLevel(Math.round(newZoom * 100));
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, 0.1); // Decreased min zoom to 10%
    setZoom(newZoom);
    setZoomLevel(Math.round(newZoom * 100));
  };

  const handleResetZoom = () => { 
    setZoom(1); 
    setZoomLevel(100);
  };

  // Direct zoom to specific level
  const handleZoomToLevel = (level: number) => {
    const newZoom = level / 100;
    setZoom(newZoom);
    setZoomLevel(level);
  };

  // Enhanced wheel zoom with better sensitivity and indicator
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(5, zoom * delta));
      setZoom(newZoom);
      setZoomLevel(Math.round(newZoom * 100));
      setShowZoomIndicator(true);
      if (zoomIndicatorTimeout) clearTimeout(zoomIndicatorTimeout);
      setZoomIndicatorTimeout(setTimeout(() => setShowZoomIndicator(false), 900));
    }
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
      setTouchStartTime(Date.now());
    } else if (e.touches.length === 2) {
      // Pinch to zoom
      e.preventDefault(); // Prevent default to avoid conflicts
      setIsPinching(true);
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      setPinchStartDistance(distance);
      setPinchStartZoom(zoom);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPinching && e.touches.length === 2) {
      e.preventDefault(); // Prevent default to avoid conflicts
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const scale = distance / pinchStartDistance;
      const newZoom = Math.max(0.1, Math.min(5, pinchStartZoom * scale));
      setZoom(newZoom);
      setZoomLevel(Math.round(newZoom * 100));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const deltaTime = Date.now() - touchStartTime;
      
      // Single tap detection (less than 200ms and small movement)
      if (deltaTime < 200 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        // Handle tap for seat selection
        const svgElement = e.currentTarget.querySelector('svg') as SVGSVGElement;
        if (svgElement && svgElement.viewBox && svgElement.viewBox.baseVal) {
          const svgRect = svgElement.getBoundingClientRect();
          const viewBox = svgElement.viewBox.baseVal;
          const scaleX = viewBox.width / svgRect.width;
          const scaleY = viewBox.height / svgRect.height;
          const x = (touch.clientX - svgRect.left) * scaleX;
          const y = (touch.clientY - svgRect.top) * scaleY;
          
          // Find closest seat
          const allSeats = [...seats, ...newSeats];
          let closestSeat = null;
          let minDistance = Infinity;
          
          allSeats.forEach(seat => {
            const position = seatPositions[seat.id] || newSeatPositions[seat.id] || { x: 0, y: 0, rotation: 0 };
            const seatX = seat.x + position.x;
            const seatY = seat.y + position.y;
            const distance = Math.sqrt(Math.pow(x - seatX, 2) + Math.pow(y - seatY, 2));
            
            if (distance < minDistance && distance < 10) { // Within 10 units
              minDistance = distance;
              closestSeat = seat;
            }
          });
          
          if (closestSeat) {
            handleSeatClick(closestSeat.id, closestSeat.status, e as any);
          }
        }
      }
    }
    
    setTouchStart(null);
    setIsPinching(false);
  };

  // Function to create new seat
  const createNewSeat = () => {
    const newSeatId = `new-seat-${Date.now()}`;
    
    // Calculate middle of actual floor plan content area
    const middleX = 52.5; // (5 + 100) / 2
    const middleY = 27.5; // (5 + 50) / 2
    
    const newSeat: Seat = {
      id: newSeatId,
      x: middleX, // Position in middle of floor plan
      y: middleY,
      status: 'available',
      type: 'desk',
      equipment: [],
      rotation: 0
    };
    
    setNewSeats(prev => [...prev, newSeat]);
    setNewSeatPositions(prev => ({
      ...prev,
      [newSeatId]: { x: 0, y: 0, rotation: 0 }
    }));
    
    // Select the new seat
    setSelectedSeats(new Set([newSeatId]));
    setEditingSeat(newSeatId);
    setIsPlacingItem(null); // Don't require clicking to place
  };

  // Function to create desk area instantly in middle
  const startCreatingDeskArea = () => {
    // Calculate middle of actual floor plan content area
    const middleX = 52.5; // (5 + 100) / 2
    const middleY = 27.5; // (5 + 50) / 2
    
    // Default desk area size
    const defaultWidth = 20;
    const defaultHeight = 15;
    
    const newDeskArea = {
      id: `desk-area-${Date.now()}`,
      x: middleX - defaultWidth / 2, // Center the desk area
      y: middleY - defaultHeight / 2,
      width: defaultWidth,
      height: defaultHeight,
      name: `Desk Area ${customDeskAreas.length + 1}`,
      type: 'workspace' // Default type for new desk areas
    };
    
    setCustomDeskAreas(prev => [...prev, newDeskArea]);
    setIsCreatingDeskArea(false);
    setDeskAreaStart({ x: 0, y: 0 });
    setDeskAreaEnd({ x: 0, y: 0 });
  };



  // Function to cancel creation modes
  const cancelCreation = () => {
    setIsCreatingDeskArea(false);
    setIsPlacingItem(null);
    setDeskAreaStart({ x: 0, y: 0 });
    setDeskAreaEnd({ x: 0, y: 0 });
  };

  // Drag and drop handlers
  const handleItemMouseDown = (e: React.MouseEvent, type: 'seat' | 'resource' | 'symbol' | 'desk-area' | 'layout', id: string, x: number, y: number) => {
    if (!isEditMode || isPlacingItem || isCreatingDeskArea) return;
    
    console.log('Item mouse down:', type, id, 'Edit mode:', isEditMode);
    e.stopPropagation();
    setDraggedItem({ type, id, startX: e.clientX, startY: e.clientY });
    setIsDraggingItem(true);
  };

  // Helper function to constrain position within floor layout bounds
  const constrainPosition = (currentX: number, currentY: number, itemWidth: number = 4, itemHeight: number = 4) => {
    // No restrictions - items can be placed anywhere
    return {
      x: currentX,
      y: currentY
    };
  };

  // Add document-level mouse event listeners for better drag handling
  useEffect(() => {
    const handleDocumentMouseMove = (e: MouseEvent) => {
      if (!draggedItem || !isDraggingItem) return;
      
      // Get the SVG element from the floor plan container
      const svgElement = document.querySelector('.floor-plan-container svg') as SVGSVGElement;
      if (!svgElement || !svgElement.viewBox || !svgElement.viewBox.baseVal) return;
      
      const svgRect = svgElement.getBoundingClientRect();
      const viewBox = svgElement.viewBox.baseVal;
      
      // Calculate the scale factor between screen pixels and SVG units
      const scaleX = viewBox.width / svgRect.width;
      const scaleY = viewBox.height / svgRect.height;
      
      // Calculate the delta in SVG coordinates
      const deltaX = (e.clientX - draggedItem.startX) * scaleX;
      const deltaY = (e.clientY - draggedItem.startY) * scaleY;
      
      switch (draggedItem.type) {
        case 'seat':
          // Check if it's a new seat or existing seat
          const isNewSeat = newSeats.some(s => s.id === draggedItem.id);
          
          if (isNewSeat) {
            // Handle new seats
            setNewSeatPositions(prev => {
              const newPositions = { ...prev };
              
              // If the dragged seat is part of a multi-selection, move all selected seats
              if (selectedSeats.has(draggedItem.id) && selectedSeats.size > 1) {
                selectedSeats.forEach(seatId => {
                  const seat = newSeats.find(s => s.id === seatId);
                  if (seat) {
                    const newX = (prev[seatId]?.x || 0) + deltaX;
                    const newY = (prev[seatId]?.y || 0) + deltaY;
                    const constrained = constrainPosition(seat.x + newX, seat.y + newY);
                    newPositions[seatId] = {
                      x: constrained.x - seat.x,
                      y: constrained.y - seat.y,
                      rotation: prev[seatId]?.rotation || 0
                    };
                  }
                });
              } else {
                // Move only the dragged seat
                const seat = newSeats.find(s => s.id === draggedItem.id);
                if (seat) {
                  const newX = (prev[draggedItem.id]?.x || 0) + deltaX;
                  const newY = (prev[draggedItem.id]?.y || 0) + deltaY;
                  const constrained = constrainPosition(seat.x + newX, seat.y + newY);
                  newPositions[draggedItem.id] = {
                    x: constrained.x - seat.x,
                    y: constrained.y - seat.y,
                    rotation: prev[draggedItem.id]?.rotation || 0
                  };
                }
              }
              
              return newPositions;
            });
          } else {
            // Handle existing seats
            setSeatPositions(prev => {
              const newPositions = { ...prev };
              
              // If the dragged seat is part of a multi-selection, move all selected seats
              if (selectedSeats.has(draggedItem.id) && selectedSeats.size > 1) {
                selectedSeats.forEach(seatId => {
                  const seat = seats.find(s => s.id === seatId);
                  if (seat) {
                    const newX = (prev[seatId]?.x || 0) + deltaX;
                    const newY = (prev[seatId]?.y || 0) + deltaY;
                    const constrained = constrainPosition(seat.x + newX, seat.y + newY);
                    newPositions[seatId] = {
                      x: constrained.x - seat.x,
                      y: constrained.y - seat.y,
                      rotation: prev[seatId]?.rotation || 0
                    };
                  }
                });
              } else {
                // Move only the dragged seat
                const seat = seats.find(s => s.id === draggedItem.id);
                if (seat) {
                  const newX = (prev[draggedItem.id]?.x || 0) + deltaX;
                  const newY = (prev[draggedItem.id]?.y || 0) + deltaY;
                  const constrained = constrainPosition(seat.x + newX, seat.y + newY);
                  newPositions[draggedItem.id] = {
                    x: constrained.x - seat.x,
                    y: constrained.y - seat.y,
                    rotation: prev[draggedItem.id]?.rotation || 0
                  };
                }
              }
              
              return newPositions;
            });
          }
          break;
        case 'resource':
          // Resources don't have position offsets, so we'll update their base positions
          break;
        case 'symbol':
          console.log('Dragging symbol:', draggedItem.id, 'deltaX:', deltaX, 'deltaY:', deltaY);
          setSymbolPositions(prev => {
            const newPositions = { ...prev };
            
            // If the dragged symbol is part of a multi-selection, move all selected symbols
            if (selectedSymbols.has(draggedItem.id) && selectedSymbols.size > 1) {
              console.log('Moving multiple selected symbols');
              selectedSymbols.forEach(symbolId => {
                const symbol = floorSymbols.find(s => s.id === symbolId);
                if (symbol) {
                  const newX = (prev[symbolId]?.x || 0) + deltaX;
                  const newY = (prev[symbolId]?.y || 0) + deltaY;
                  const constrained = constrainPosition(symbol.x + newX, symbol.y + newY);
                  newPositions[symbolId] = {
                    x: constrained.x - symbol.x,
                    y: constrained.y - symbol.y,
                    rotation: prev[symbolId]?.rotation || 0
                  };
                  console.log(`Multi-selection: Symbol ${symbolId} moved to (${newPositions[symbolId].x}, ${newPositions[symbolId].y})`);
                }
              });
            } else {
              // Move only the dragged symbol
              console.log('Moving single symbol');
              const symbol = floorSymbols.find(s => s.id === draggedItem.id);
              if (symbol) {
                const newX = (prev[draggedItem.id]?.x || 0) + deltaX;
                const newY = (prev[draggedItem.id]?.y || 0) + deltaY;
                const constrained = constrainPosition(symbol.x + newX, symbol.y + newY);
                newPositions[draggedItem.id] = { 
                  x: constrained.x - symbol.x, 
                  y: constrained.y - symbol.y, 
                  rotation: prev[draggedItem.id]?.rotation || 0 
                };
                console.log(`Single symbol: ${draggedItem.id} moved to (${newPositions[draggedItem.id].x}, ${newPositions[draggedItem.id].y})`);
              }
            }
            
            return newPositions;
          });
          break;
        case 'desk-area':
          // Check if it's a custom desk area or existing desk area
          const isCustomDeskArea = customDeskAreas.some(a => a.id === draggedItem.id);
          
          if (isCustomDeskArea) {
            // Handle custom desk areas by updating their base positions
            setCustomDeskAreas(prev => {
              return prev.map(area => {
                if (area.id === draggedItem.id) {
                  const constrained = constrainPosition(area.x + deltaX, area.y + deltaY, area.width, area.height);
                  return {
                    ...area,
                    x: constrained.x,
                    y: constrained.y
                  };
                }
                return area;
              });
            });
          } else {
            // Handle existing desk areas
            setDeskAreaPositions(prev => {
              const area = deskAreas.find(a => a.id === draggedItem.id);
              if (area) {
                const newX = (prev[draggedItem.id]?.x || 0) + deltaX;
                const newY = (prev[draggedItem.id]?.y || 0) + deltaY;
                const constrained = constrainPosition(area.x + newX, area.y + newY, area.width, area.height);
                return {
                  ...prev,
                  [draggedItem.id]: {
                    x: constrained.x - area.x,
                    y: constrained.y - area.y,
                    rotation: prev[draggedItem.id]?.rotation || 0
                  }
                };
              }
              return prev;
            });
          }
          break;
        case 'layout':
          // Handle layout dragging
          setLayoutPosition(prev => ({ ...prev, x: prev.x + deltaX, y: prev.y + deltaY }));
          break;
      }
      
      setDraggedItem(prev => prev ? { ...prev, startX: e.clientX, startY: e.clientY } : null);
    };

    const handleDocumentMouseUp = () => {
      setDraggedItem(null);
      setIsDraggingItem(false);
    };

    // Add event listeners
    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [draggedItem, isDraggingItem, selectedSeats, selectedSymbols, seats, newSeats, floorSymbols, deskAreas, customDeskAreas, constrainPosition]);

  const handleItemMouseUp = () => {
    setDraggedItem(null);
    setIsDraggingItem(false);
  };

  // Layout dimension handlers
  const handleLayoutWidthChange = (value: string) => {
    const width = parseInt(value) || 0;
    setLayoutDimensions(prev => ({ ...prev, width }));
  };

  const handleLayoutHeightChange = (value: string) => {
    const height = parseInt(value) || 0;
    setLayoutDimensions(prev => ({ ...prev, height }));
  };

  // Desk area dimension handlers
  const handleDeskAreaWidthChange = (areaId: string, value: string) => {
    const width = parseInt(value) || 0;
    setDeskAreaDimensions(prev => ({
      ...prev,
      [areaId]: { ...prev[areaId], width }
    }));
  };

  const handleDeskAreaHeightChange = (areaId: string, value: string) => {
    const height = parseInt(value) || 0;
    setDeskAreaDimensions(prev => ({
      ...prev,
      [areaId]: { ...prev[areaId], height }
    }));
  };

  // Seat coordinate handlers
  const handleSeatXChange = (seatId: string, value: string) => {
    const x = parseFloat(value) || 0;
    const seat = seats.find(s => s.id === seatId) || newSeats.find(s => s.id === seatId);
    if (seat) {
      const isNewSeat = newSeats.some(s => s.id === seatId);
      if (isNewSeat) {
        setNewSeatPositions(prev => ({
          ...prev,
          [seatId]: { ...prev[seatId], x: x - seat.x }
        }));
      } else {
        setSeatPositions(prev => ({
          ...prev,
          [seatId]: { ...prev[seatId], x: x - seat.x }
        }));
      }
    }
  };

  const handleSeatYChange = (seatId: string, value: string) => {
    const y = parseFloat(value) || 0;
    const seat = seats.find(s => s.id === seatId) || newSeats.find(s => s.id === seatId);
    if (seat) {
      const isNewSeat = newSeats.some(s => s.id === seatId);
      if (isNewSeat) {
        setNewSeatPositions(prev => ({
          ...prev,
          [seatId]: { ...prev[seatId], y: y - seat.y }
        }));
      } else {
        setSeatPositions(prev => ({
          ...prev,
          [seatId]: { ...prev[seatId], y: y - seat.y }
        }));
      }
    }
  };

  const handleSeatRotationChange = (seatId: string, value: string) => {
    const rotation = parseFloat(value) || 0;
    const seat = seats.find(s => s.id === seatId) || newSeats.find(s => s.id === seatId);
    if (seat) {
      const isNewSeat = newSeats.some(s => s.id === seatId);
      if (isNewSeat) {
        setNewSeatPositions(prev => ({
          ...prev,
          [seatId]: { ...prev[seatId], rotation: rotation - (seat.rotation || 0) }
        }));
      } else {
        setSeatPositions(prev => ({
          ...prev,
          [seatId]: { ...prev[seatId], rotation: rotation - (seat.rotation || 0) }
        }));
      }
    }
  };

  // Helper function to get current seat position
  const getCurrentSeatPosition = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId) || newSeats.find(s => s.id === seatId);
    if (!seat) return { x: 0, y: 0, rotation: 0 };
    
    const isNewSeat = newSeats.some(s => s.id === seatId);
    const position = isNewSeat ? newSeatPositions[seatId] : seatPositions[seatId];
    const offset = position || { x: 0, y: 0, rotation: 0 };
    
    return {
      x: seat.x + offset.x,
      y: seat.y + offset.y,
      rotation: (seat.rotation || 0) + offset.rotation
    };
  };

  // Helper function to get current desk area dimensions
  const getCurrentDeskAreaDimensions = (areaId: string) => {
    const area = deskAreas.find(a => a.id === areaId) || customDeskAreas.find(a => a.id === areaId);
    if (!area) return { width: 0, height: 0 };
    
    const dimensions = deskAreaDimensions[areaId];
    return {
      width: dimensions?.width || area.width,
      height: dimensions?.height || area.height
    };
  };

  // Function to select desk area for editing
  const handleDeskAreaClick = (areaId: string) => {
    if (isEditMode) {
      setEditingDeskArea(areaId);
      // Initialize dimensions if not already set
      const area = deskAreas.find(a => a.id === areaId);
      if (area && !deskAreaDimensions[areaId]) {
        setDeskAreaDimensions(prev => ({
          ...prev,
          [areaId]: { width: area.width, height: area.height }
        }));
      }
    }
  };

  // Function to select symbol for editing
  const handleSymbolClick = (symbolId: string) => {
    // Only allow selection if not dragging
    if (!isEditMode || isDraggingItem) return;
    console.log('Symbol clicked:', symbolId, 'Edit mode:', isEditMode, 'Dragging:', isDraggingItem);
    setSelectedSymbols(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(symbolId)) {
        newSelection.delete(symbolId);
      } else {
        newSelection.add(symbolId);
      }
      console.log('Selected symbols after click:', Array.from(newSelection));
      return newSelection;
    });
  };

  // Movement functions with boundary constraints
  const moveSeats = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (selectedSeats.size === 0) return;
    
    const moveAmount = 5; // 5 units per click
    let deltaX = 0;
    let deltaY = 0;
    
    switch (direction) {
      case 'up':
        deltaY = -moveAmount;
        break;
      case 'down':
        deltaY = moveAmount;
        break;
      case 'left':
        deltaX = -moveAmount;
        break;
      case 'right':
        deltaX = moveAmount;
        break;
    }
    
    setSeatPositions(prev => {
      const newPositions = { ...prev };
      selectedSeats.forEach(seatId => {
        const seat = seats.find(s => s.id === seatId);
        if (seat) {
          const newX = (newPositions[seatId]?.x || 0) + deltaX;
          const newY = (newPositions[seatId]?.y || 0) + deltaY;
          const constrained = constrainPosition(seat.x + newX, seat.y + newY);
          newPositions[seatId] = {
            x: constrained.x - seat.x,
            y: constrained.y - seat.y,
            rotation: newPositions[seatId]?.rotation || 0
          };
        }
      });
      return newPositions;
    });
  };

  const moveDeskAreas = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (selectedDeskAreas.size === 0) return;
    
    const moveAmount = 5; // 5 units per click
    let deltaX = 0;
    let deltaY = 0;
    
    switch (direction) {
      case 'up':
        deltaY = -moveAmount;
        break;
      case 'down':
        deltaY = moveAmount;
        break;
      case 'left':
        deltaX = -moveAmount;
        break;
      case 'right':
        deltaX = moveAmount;
        break;
    }
    
    setDeskAreaPositions(prev => {
      const newPositions = { ...prev };
      selectedDeskAreas.forEach(areaId => {
        const area = deskAreas.find(a => a.id === areaId);
        if (area) {
          const newX = (newPositions[areaId]?.x || 0) + deltaX;
          const newY = (newPositions[areaId]?.y || 0) + deltaY;
          const constrained = constrainPosition(area.x + newX, area.y + newY, area.width, area.height);
          newPositions[areaId] = {
            x: constrained.x - area.x,
            y: constrained.y - area.y,
            rotation: newPositions[areaId]?.rotation || 0
          };
        }
      });
      return newPositions;
    });
  };

  // Delete function for symbols
  const deleteSelectedSymbols = () => {
    if (selectedSymbols.size === 0) return;
    
    setFloorSymbols(prev => prev.filter(symbol => !selectedSymbols.has(symbol.id)));
    setSymbolPositions(prev => {
      const newPositions = { ...prev };
      selectedSymbols.forEach(symbolId => {
        delete newPositions[symbolId];
      });
      return newPositions;
    });
    setSelectedSymbols(new Set());
  };

  // Delete selected seats
  const deleteSelectedSeats = () => {
    if (selectedSeats.size === 0) return;
    
    const seatCount = selectedSeats.size;
    const seatIds = Array.from(selectedSeats);
    
    // Show confirmation dialog
    const confirmed = confirm(`Are you sure you want to delete ${seatCount} selected seat${seatCount > 1 ? 's' : ''}?\n\nThis action cannot be undone.`);
    
    if (!confirmed) return;
    
    // Remove selected seats from the seats array
    setFloorPlan(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        seats: prev.seats.filter(seat => !selectedSeats.has(seat.id))
      };
    });
    
    // Remove selected seats from newSeats array
    setNewSeats(prev => prev.filter(seat => !selectedSeats.has(seat.id)));
    
    // Clean up positions for deleted seats
    setSeatPositions(prev => {
      const newPositions = { ...prev };
      selectedSeats.forEach(seatId => {
        delete newPositions[seatId];
      });
      return newPositions;
    });
    
    setNewSeatPositions(prev => {
      const newPositions = { ...prev };
      selectedSeats.forEach(seatId => {
        delete newPositions[seatId];
      });
      return newPositions;
    });
    
    // Clear selection
    setSelectedSeats(new Set());
    setEditingSeat(null);
    
    // Show success message
    alert(`✅ Successfully deleted ${seatCount} seat${seatCount > 1 ? 's' : ''}!\n\nRemember to save your changes to persist the deletion.`);
  };

  // Rotation function for symbols
  const rotateSymbols = (direction: 'clockwise' | 'counterclockwise') => {
    if (selectedSymbols.size === 0) return;
    
    const rotationAmount = direction === 'clockwise' ? 90 : -90;
    
    setSymbolPositions(prev => {
      const newPositions = { ...prev };
      selectedSymbols.forEach(symbolId => {
        const currentRotation = newPositions[symbolId]?.rotation || 0;
        newPositions[symbolId] = {
          ...newPositions[symbolId],
          rotation: currentRotation + rotationAmount
        };
      });
      return newPositions;
    });
  };

  // Movement function for symbols
  const moveSymbols = (direction: 'up' | 'down' | 'left' | 'right') => {
    console.log('moveSymbols called with direction:', direction, 'selectedSymbols:', Array.from(selectedSymbols));
    if (selectedSymbols.size === 0) {
      console.log('No symbols selected, returning');
      return;
    }
    
    const moveAmount = 5; // 5 units per click
    let deltaX = 0;
    let deltaY = 0;
    
    switch (direction) {
      case 'up':
        deltaY = -moveAmount;
        break;
      case 'down':
        deltaY = moveAmount;
        break;
      case 'left':
        deltaX = -moveAmount;
        break;
      case 'right':
        deltaX = moveAmount;
        break;
    }
    
    console.log('Moving symbols by deltaX:', deltaX, 'deltaY:', deltaY);
    
    setSymbolPositions(prev => {
      const newPositions = { ...prev };
      selectedSymbols.forEach(symbolId => {
        const symbol = floorSymbols.find(s => s.id === symbolId);
        if (symbol) {
          const currentX = newPositions[symbolId]?.x || 0;
          const currentY = newPositions[symbolId]?.y || 0;
          const newX = currentX + deltaX;
          const newY = currentY + deltaY;
          const constrained = constrainPosition(symbol.x + newX, symbol.y + newY);
          newPositions[symbolId] = {
            x: constrained.x - symbol.x,
            y: constrained.y - symbol.y,
            rotation: newPositions[symbolId]?.rotation || 0
          };
          console.log(`Symbol ${symbolId} moved from (${currentX}, ${currentY}) to (${newPositions[symbolId].x}, ${newPositions[symbolId].y})`);
        }
      });
      return newPositions;
    });
  };

  // Combined movement function
  const moveSelectedItems = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (selectedSeats.size > 0) {
      moveSeats(direction);
    }
    if (selectedDeskAreas.size > 0) {
      moveDeskAreas(direction);
    }
    if (selectedSymbols.size > 0) {
      moveSymbols(direction);
    }
  };

  // Save function to update floor plan in database
  const saveFloorPlan = async () => {
    try {
      setLoading(true);
      
      // Create updated data with current positions for existing seats
      const updatedSeats = seats.map(seat => {
        const position = seatPositions[seat.id];
        if (position) {
          return {
            ...seat,
            x: seat.x + position.x,
            y: seat.y + position.y,
            rotation: (seat.rotation || 0) + (position.rotation || 0)
          };
        }
        return seat;
      });

      // Add new seats created during the session
      const updatedNewSeats = newSeats.map(seat => {
        const position = newSeatPositions[seat.id];
        if (position) {
          return {
            ...seat,
            x: seat.x + position.x,
            y: seat.y + position.y,
            rotation: (seat.rotation || 0) + (position.rotation || 0)
          };
        }
        return seat;
      });

      // Combine all seats (existing + new)
      const allUpdatedSeats = [...updatedSeats, ...updatedNewSeats];

      const updatedResources = resources.map(resource => {
        // Resources don't have position offsets, so return as is
        return resource;
      });

      const updatedFloorSymbols = floorSymbols.map(symbol => {
        const position = symbolPositions[symbol.id];
        if (position) {
          return {
            ...symbol,
            x: symbol.x + position.x,
            y: symbol.y + position.y,
            rotation: (symbol.rotation || 0) + (position.rotation || 0)
          };
        }
        return symbol;
      });

      const updatedDeskAreas = deskAreas.map(area => {
        const position = deskAreaPositions[area.id];
        const dimensions = deskAreaDimensions[area.id];
        
        return {
          ...area,
          x: area.x + (position?.x || 0),
          y: area.y + (position?.y || 0),
          width: dimensions?.width || area.width,
          height: dimensions?.height || area.height
        };
      });

      // Add custom desk areas created during the session
      const allUpdatedDeskAreas = [...updatedDeskAreas, ...customDeskAreas];

      // Create the updated data object with ALL captured data
      const updatedData = {
        seats: allUpdatedSeats,
        resources: updatedResources,
        deskAreas: allUpdatedDeskAreas,
        officeLayout: {
          ...officeLayout,
          x: layoutPosition.x,
          y: layoutPosition.y,
          width: layoutDimensions.width,
          height: layoutDimensions.height
        },
        floorSymbols: updatedFloorSymbols
      };

      // Prepare the request payload
      const payload = {
        building_name: selectedBuilding,
        office_location: selectedOfficeLocation,
        floor_id: selectedFloor,
        plan_json: JSON.stringify(updatedData)
      };

      console.log('Saving floor plan to database:', payload);

      // Call the backend API to save the floor plan
      const response = await fetch('http://localhost:3001/api/floorplan/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('Save response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to save floor plan`);
      }

      const result = await response.json();
      console.log('Save result:', result);

      // Show success message
      const totalItems = allUpdatedSeats.length + updatedResources.length + allUpdatedDeskAreas.length + updatedFloorSymbols.length;
      const successMessage = `✅ Floor Plan Successfully Saved to Database!\n\n📊 Data Saved:\n• ${allUpdatedSeats.length} seats (${seats.length} existing + ${newSeats.length} new)\n• ${updatedResources.length} resources\n• ${allUpdatedDeskAreas.length} desk areas (${deskAreas.length} existing + ${customDeskAreas.length} custom)\n• ${updatedFloorSymbols.length} floor symbols\n• Office layout: ${layoutDimensions.width}x${layoutDimensions.height} at (${layoutPosition.x.toFixed(1)}, ${layoutPosition.y.toFixed(1)})\n\n🏢 Location: ${selectedBuilding} - ${selectedOfficeLocation} - ${selectedFloor}\n\nAll changes have been saved to the database!`;

      alert(successMessage + `\n\nSaved Layout X: ${layoutPosition.x.toFixed(1)}, Y: ${layoutPosition.y.toFixed(1)}`);
      
      // Reset edit mode and clear selections
      setIsEditMode(false);
      setSelectedSeats(new Set());
      setSelectedDeskAreas(new Set());
      setSelectedSymbols(new Set());
      setEditingSeat(null);
      setEditingDeskArea(null);
      
      // Refresh the floor plan data
      await fetchFloorPlan();
      
    } catch (error) {
      console.error('Error saving floor plan:', error);
      alert(`❌ Error saving floor plan to database: ${error.message}\n\nPlease try again or contact support.`);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle floor plan click for placing items
  const handleFloorPlanClick = (e: React.MouseEvent) => {
    if (!isPlacingItem && !isCreatingDeskArea) return;
    
    // Get the SVG element to calculate proper coordinates
    const svgElement = e.currentTarget.querySelector('svg') as SVGSVGElement;
    if (!svgElement || !svgElement.viewBox || !svgElement.viewBox.baseVal) return;
    
    const svgRect = svgElement.getBoundingClientRect();
    const viewBox = svgElement.viewBox.baseVal;
    
    // Calculate the scale factor between screen pixels and SVG units
    const scaleX = viewBox.width / svgRect.width;
    const scaleY = viewBox.height / svgRect.height;
    
    // Calculate coordinates in SVG units
    const x = (e.clientX - svgRect.left) * scaleX;
    const y = (e.clientY - svgRect.top) * scaleY;
    
    if (isPlacingItem === 'seat' && newSeats.length > 0) {
      const lastSeat = newSeats[newSeats.length - 1];
      const constrained = constrainPosition(x, y);
      setNewSeatPositions(prev => ({
        ...prev,
        [lastSeat.id]: { x: constrained.x - lastSeat.x, y: constrained.y - lastSeat.y, rotation: 0 }
      }));
      setIsPlacingItem(null);

    } else if (isCreatingDeskArea) {
      if (!deskAreaStart.x && !deskAreaStart.y) {
        // First click - set start point (no constraints)
        setDeskAreaStart({ x, y });
        setDeskAreaEnd({ x, y });
      } else {
        // Second click - create the desk area (no constraints)
        const minX = Math.min(deskAreaStart.x, x);
        const minY = Math.min(deskAreaStart.y, y);
        const width = Math.abs(x - deskAreaStart.x);
        const height = Math.abs(y - deskAreaStart.y);
        
        const newDeskArea = {
          id: `desk-area-${Date.now()}`,
          x: minX,
          y: minY,
          width: Math.max(5, width), // Minimum size of 5 units
          height: Math.max(5, height),
          name: `Desk Area ${customDeskAreas.length + 1}`
        };
        
        setCustomDeskAreas(prev => [...prev, newDeskArea]);
        setIsCreatingDeskArea(false);
        setDeskAreaStart({ x: 0, y: 0 });
        setDeskAreaEnd({ x: 0, y: 0 });
      }
    }
  };

  // Function to handle mouse move for desk area creation
  const handleFloorPlanMouseMove = (e: React.MouseEvent) => {
    if (!isCreatingDeskArea || (!deskAreaStart.x && !deskAreaStart.y)) return;
    
    // Get the SVG element to calculate proper coordinates
    const svgElement = e.currentTarget.querySelector('svg') as SVGSVGElement;
    if (!svgElement || !svgElement.viewBox || !svgElement.viewBox.baseVal) return;
    
    const svgRect = svgElement.getBoundingClientRect();
    const viewBox = svgElement.viewBox.baseVal;
    
    // Calculate the scale factor between screen pixels and SVG units
    const scaleX = viewBox.width / svgRect.width;
    const scaleY = viewBox.height / svgRect.height;
    
    // Calculate coordinates in SVG units
    const x = (e.clientX - svgRect.left) * scaleX;
    const y = (e.clientY - svgRect.top) * scaleY;
    
    // No constraints - set end point freely
    setDeskAreaEnd({ x, y });
  };

  // Update handleSeatClick to support multi-select and seat details
  const handleSeatClick = (seatId: string, status: string, event: React.MouseEvent) => {
    if (isEditMode) {
      // Edit mode behavior - allow clicking all seat types
      if (event.ctrlKey || event.metaKey) {
        // Multi-select: toggle seat in set
        setSelectedSeats(prev => {
          const newSet = new Set(prev);
          if (newSet.has(seatId)) {
            newSet.delete(seatId);
          } else {
            newSet.add(seatId);
          }
          return newSet;
        });
      } else {
        // Single select: select only this seat
        setSelectedSeats(new Set([seatId]));
      }
    } else {
      // Non-edit mode: only allow clicking available seats for booking
      if (status !== 'available') return;
      
      const seat = seats.find(s => s.id === seatId) || newSeats.find(s => s.id === seatId);
      if (seat) {
        setBookingSeat(seat);
        setShowBookingDialog(true);
        setRecurrenceType('none');
        setCustomDates([]);
        setRecurrenceEndDate('');
      }
    }
  };

  const getSeatColor = (seat: Seat) => {
    if (selectedSeats.has(seat.id)) return 'bg-seat-selected border-accent';
    if (seat.status === 'occupied') return 'bg-seat-occupied hover:bg-seat-selected';
    if (seat.status === 'reserved') return 'bg-yellow-500 hover:bg-seat-selected';
    if (seat.status === 'maintenance') return 'bg-gray-500 hover:bg-seat-selected';
    return 'bg-seat-available hover:bg-seat-selected';
  };



  // Layout position handlers
  const handleLayoutXChange = (value: string) => {
    const x = parseFloat(value) || 0;
    setLayoutPosition(prev => ({ ...prev, x }));
  };

  const handleLayoutYChange = (value: string) => {
    const y = parseFloat(value) || 0;
    setLayoutPosition(prev => ({ ...prev, y }));
  };

  // Layout move function
  const moveLayout = (direction: 'up' | 'down' | 'left' | 'right') => {
    const moveAmount = 5; // 5 units per click
    let deltaX = 0;
    let deltaY = 0;
    
    switch (direction) {
      case 'up':
        deltaY = -moveAmount;
        break;
      case 'down':
        deltaY = moveAmount;
        break;
      case 'left':
        deltaX = -moveAmount;
        break;
      case 'right':
        deltaX = moveAmount;
        break;
    }
    
    setLayoutPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
  };

  // Booking dialog state
  const [bookingSeat, setBookingSeat] = useState<Seat | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  // Recurring booking state
  const [recurrenceType, setRecurrenceType] = useState<'none' | 'daily' | 'weekly' | 'custom'>('none');
  const [customDates, setCustomDates] = useState<string[]>([]);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');

  // Time selection state
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  // Handler to open booking dialog
  const handleBookSeat = (seat: Seat) => {
    setBookingSeat(seat);
    setShowBookingDialog(true);
    setRecurrenceType('none');
    setCustomDates([]);
  };

  // Handler to close booking dialog
  const handleCloseBookingDialog = () => {
    setShowBookingDialog(false);
    setBookingSeat(null);
    setRecurrenceType('none');
    setCustomDates([]);
    setRecurrenceEndDate('');
    setStartTime('09:00');
    setEndTime('17:00');
  };

  // Filtered seats based on equipment
  const filteredSeats = equipmentFilter.length === 0
    ? seats
    : seats.filter(seat => equipmentFilter.every(eq => seat.equipment?.includes(eq)));

  // Add this handler inside the FloorPlan component
  const handleConfirmBooking = async () => {
    if (!bookingSeat) return;

    try {
      // Prepare the request body according to the API specification
      const requestBody = {
        id: `booking_${Date.now()}`, // Generate unique booking ID
        date: selectedDate,
        startTime: startTime, // Use selected start time
        endTime: endTime,   // Use selected end time
        bookType: "DESK",
        subType: bookingSeat.id, // Use seat ID as subType
        officeLocation: selectedOfficeLocation,
        building: selectedBuilding,
        floor: selectedFloor,
        recurrence: {
          type: recurrenceType.toUpperCase(), // Convert to uppercase to match API
          endDate: recurrenceEndDate || null,
          customDates: customDates.length > 0 ? customDates : null
        },
        notes: "Seat booking from floor plan", // Could be made configurable
        userId: user?.id || "user123" // Use actual user ID from auth context
      };

      console.log('Sending booking request:', requestBody);

      // Make API call to the booking endpoint
      const response = await fetch('http://localhost:3001/api/bookings/seat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('Booking response:', data);

      if (data.success) {
        // Show success message with booking details
        const bookingInfo = data.data;
        const successMessage = `✅ Booking Confirmed Successfully!

📅 Booking Details:
• Seat: ${bookingSeat.id}
• Date: ${selectedDate}
• Time: ${requestBody.startTime} - ${requestBody.endTime}
• Location: ${selectedBuilding} - ${selectedOfficeLocation} - ${selectedFloor}
• Total Bookings: ${bookingInfo.totalBookings}
• Booking Dates: ${bookingInfo.bookingDates.join(', ')}

${recurrenceType !== 'none' ? `🔄 Recurrence: ${recurrenceType.toUpperCase()}` : ''}
${recurrenceEndDate ? `📅 End Date: ${recurrenceEndDate}` : ''}
${customDates.length > 0 ? `📋 Custom Dates: ${customDates.join(', ')}` : ''}

Your booking has been confirmed and saved to the database!`;

        alert(successMessage);
        
        // Close the booking dialog
        handleCloseBookingDialog();
        
        // Refresh the floor plan to show updated seat status
        await fetchFloorPlan();
        
        // Optionally refresh the page to show updated seat colors
        // window.location.reload();
        
      } else {
        // Handle booking failure
        const errorMessage = data.message || 'Booking failed';
        const errorDetails = data.errors ? `\n\nErrors:\n${data.errors.join('\n')}` : '';
        
        alert(`❌ Booking Failed: ${errorMessage}${errorDetails}`);
      }
      
    } catch (error) {
      console.error('Booking error:', error);
      
      // Handle network or server errors
      let errorMessage = 'Network or server error occurred';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to the booking server. Please check your connection and try again.';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'CORS error. The booking server may not be configured for this domain.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(`❌ Booking Error: ${errorMessage}\n\nPlease try again or contact support if the problem persists.`);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Floor Plan Title and Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg md:text-2xl font-bold">Office Floor Plan</h2>
              {user?.role === 'admin' && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                  👑 Admin
                </Badge>
              )}
            </div>
            <p className="text-xs md:text-base text-muted-foreground">
              {isEditMode 
                ? 'Edit Mode: Create seats, desk areas, and symbols instantly in the middle of layout. Click to select, drag to move, use rotation buttons to rotate. Drag to pan, scroll to navigate.' 
                : 'Select a seat or resource to book. Drag to pan, scroll to navigate.'
              }
            </p>
          </div>
          

          
          {/* Admin Edit Mode Checkbox - Always Visible */}
          {user?.role === 'admin' && (
            <div className="flex items-center space-x-2 p-3 bg-purple-50 border-2 border-purple-300 rounded-lg shadow-sm">
              <Checkbox
                id="edit-mode-admin"
                checked={isEditMode}
                onCheckedChange={(checked) => {
                  setIsEditMode(checked as boolean);
                  setEditingSeat(null);
                  setSelectedSeat(null);
                }}
              />
              <label htmlFor="edit-mode-admin" className="text-sm font-medium text-purple-800 cursor-pointer">
                ✏️ Edit Floor Plan Mode
              </label>
              {isEditMode && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">
                  ACTIVE
                </Badge>
              )}
            </div>
          )}
          
          {/* Mobile Controls Toggle */}
          {isMobile && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileControls(!showMobileControls)}
                className="flex items-center gap-2"
              >
                {showMobileControls ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                Controls
              </Button>
            </div>
          )}
        </div>
        
        {/* Mobile Controls Panel */}
        {isMobile && showMobileControls && (
          <Card className="p-4 border-accent bg-accent/5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {user?.role === 'admin' && (
                  <div className="flex items-center space-x-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                    <Checkbox
                      id="edit-mode-mobile"
                      checked={isEditMode}
                      onCheckedChange={(checked) => {
                        setIsEditMode(checked as boolean);
                        setEditingSeat(null);
                        setSelectedSeat(null);
                      }}
                    />
                    <label htmlFor="edit-mode-mobile" className="text-sm font-medium text-purple-800">
                      ✏️ Edit Mode
                    </label>
                    {isEditMode && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="h-10 px-3"
                >
                  Filters
                </Button>
              </div>
              
              {/* Mobile Zoom Controls */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Zoom: {zoomLevel}%</span>
                <div className="flex flex-col items-center gap-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 500}
                    className="w-10 h-10 p-0"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleResetZoom}
                    className="w-10 h-10 p-0"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 10}
                    className="w-10 h-10 p-0"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Mobile Quick Actions */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={fetchFloorPlan}
                  disabled={loading}
                  className="flex-1 h-10"
                >
                  {loading ? '⏳ Loading...' : '🔄 Refresh'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setFloorPlan({
                      seats: localSeats,
                      deskAreas: localDeskAreas,
                      officeLayout: localOfficeLayout
                    });
                    setError('Using local data - Backend not available');
                  }}
                  className="flex-1 h-10"
                >
                  📱 Local Data
                </Button>
              </div>
            </div>
          </Card>
        )}
        
        {/* Desktop Controls */}
        {!isMobile && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {user?.role === 'ADMIN' && (
              <div className="flex items-center space-x-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                <Checkbox
                  id="edit-mode"
                  checked={isEditMode}
                  onCheckedChange={(checked) => {
                    setIsEditMode(checked as boolean);
                    setEditingSeat(null);
                    setSelectedSeat(null);
                  }}
                />
                <label htmlFor="edit-mode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-purple-800">
                  ✏️ Edit Mode
                </label>
                {isEditMode && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">
                    Active
                  </Badge>
                )}
              </div>
            )}

          </div>
        )}
      </div>

      {/* Floor and Office Location Selectors */}
      <Card className="p-4">
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} gap-4 items-start sm:items-center`}>
          <div className={`flex ${isMobile ? 'flex-col w-full' : 'items-center gap-2'}`}>
            <label className={`text-sm font-medium ${isMobile ? 'mb-2' : ''}`}>Building:</label>
            <select 
              className={`px-3 py-2 border border-input rounded-md bg-background text-sm ${isMobile ? 'w-full h-12 text-base' : 'min-w-[120px]'}`}
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
            >
              <option value="">Select Building</option>
              <option value="campus20">Campus 20</option>
              <option value="campus30">Campus 30</option>
              <option value="building-a">Building A</option>
              <option value="building-b">Building B</option>
              <option value="building-c">Building C</option>
            </select>
          </div>
          <div className={`flex ${isMobile ? 'flex-col w-full' : 'items-center gap-2'}`}>
            <label className={`text-sm font-medium ${isMobile ? 'mb-2' : ''}`}>Office Location:</label>
            <select 
              className={`px-3 py-2 border border-input rounded-md bg-background text-sm ${isMobile ? 'w-full h-12 text-base' : 'min-w-[150px]'}`}
              value={selectedOfficeLocation}
              onChange={(e) => setSelectedOfficeLocation(e.target.value)}
            >
              <option value="">Select Office</option>
              <option value="IN10">IN10</option>
              <option value="main-office">Main Office</option>
              <option value="branch-north">North Branch</option>
              <option value="branch-south">South Branch</option>
              <option value="branch-east">East Branch</option>
              <option value="branch-west">West Branch</option>
            </select>
          </div>
          <div className={`flex ${isMobile ? 'flex-col w-full' : 'items-center gap-2'}`}>
            <label className={`text-sm font-medium ${isMobile ? 'mb-2' : ''}`}>Floor:</label>
            <select 
              className={`px-3 py-2 border border-input rounded-md bg-background text-sm ${isMobile ? 'w-full h-12 text-base' : 'min-w-[120px]'}`}
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
            >
              <option value="">Select Floor</option>
              <option value="Floor8">Floor 8</option>
              <option value="Floor7">Floor 7</option>
              <option value="Floor6">Floor 6</option>
              <option value="Floor5">Floor 5</option>
              <option value="Floor4">Floor 4</option>
              <option value="Floor3">Floor 3</option>
              <option value="Floor2">Floor 2</option>
              <option value="Floor1">Floor 1</option>
            </select>
          </div>
          <div className={`flex ${isMobile ? 'flex-col w-full' : 'items-center gap-2'}`}>
            <label className={`text-sm font-medium ${isMobile ? 'mb-2' : ''}`}>Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`px-3 py-2 border border-input rounded-md bg-background text-sm ${isMobile ? 'w-full h-12 text-base' : 'min-w-[140px]'}`}
            />
          </div>
          <Button 
            onClick={fetchFloorPlan}
            disabled={!selectedBuilding || !selectedOfficeLocation || !selectedFloor || loading}
            className={`bg-blue-600 hover:bg-blue-700 ${isMobile ? 'w-full h-12 text-base font-medium' : ''}`}
          >
            {loading ? (isMobile ? 'Loading...' : 'Loading...') : (isMobile ? '📋 Load Floor Plan' : 'Load Floor Plan')}
          </Button>
        </div>
      </Card>

      {/* Equipment Filter UI */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="font-medium text-sm">Filter by Equipment:</span>
          {EQUIPMENT_OPTIONS.map(option => (
            <label key={option} className="flex items-center gap-1 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={equipmentFilter.includes(option)}
                onChange={e => {
                  if (e.target.checked) {
                    setEquipmentFilter([...equipmentFilter, option]);
                  } else {
                    setEquipmentFilter(equipmentFilter.filter(eq => eq !== option));
                  }
                }}
                className="accent-amber-500"
              />
              {option === 'Monitor' && <Monitor className="w-3 h-3" />}
              {option === 'Dock' && <Wifi className="w-3 h-3" />}
              {option === 'Window Seat' && <span className="inline-block w-3 h-3 bg-blue-200 border border-blue-400 rounded-sm" title="Window Seat"></span>}
              <span>{option}</span>
            </label>
          ))}
          {equipmentFilter.length > 0 && (
            <Button size="sm" variant="outline" className="ml-2 px-2 py-0.5 text-xs" onClick={() => setEquipmentFilter([])}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-seat-available rounded border"></div>
            <span>Available Desk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-seat-occupied rounded"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-seat-selected rounded border-2 border-accent"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-resource-available rounded"></div>
            <span>Meeting Room Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-resource-booked rounded"></div>
            <span>Meeting Room Booked</span>
          </div>
        </div>
      </Card>

      {/* Edit Mode Toolbar - Move to top in edit mode */}
      {isEditMode && (
        <div className="mb-6">
          <Card className="p-4 border-accent bg-accent/5">
            <div className="space-y-4">
              {/* Top Row - Main Controls */}
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-wrap gap-4 items-center">
                  {/* Rotation Controls */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Rotation:</span>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      onClick={() => {/* TODO: Add rotation logic */}}
                      disabled={!editingSeat && selectedSeats.size === 0}
                      className="w-8 h-8 p-0"
                    >
                      ↶
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      onClick={() => {/* TODO: Add rotation logic */}}
                      disabled={!editingSeat && selectedSeats.size === 0}
                      className="w-8 h-8 p-0"
                    >
                      ↷
                    </Button>
                  </div>

                  {/* Movement Controls */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Move:</span>
                    <div className="grid grid-cols-3 gap-1">
                      <div></div>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => moveSelectedItems('up')}
                        disabled={selectedSeats.size === 0 && selectedDeskAreas.size === 0 && selectedSymbols.size === 0}
                        className="w-8 h-8 p-0"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <div></div>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => moveSelectedItems('left')}
                        disabled={selectedSeats.size === 0 && selectedDeskAreas.size === 0 && selectedSymbols.size === 0}
                        className="w-8 h-8 p-0"
                        title="Move Left"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => moveSelectedItems('down')}
                        disabled={selectedSeats.size === 0 && selectedDeskAreas.size === 0 && selectedSymbols.size === 0}
                        className="w-8 h-8 p-0"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => moveSelectedItems('right')}
                        disabled={selectedSeats.size === 0 && selectedDeskAreas.size === 0 && selectedSymbols.size === 0}
                        className="w-8 h-8 p-0"
                        title="Move Right"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Delete Controls */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Delete:</span>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={deleteSelectedSeats}
                      disabled={selectedSeats.size === 0}
                      className="w-8 h-8 p-0"
                      title="Delete Selected Seats"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Layout Move Controls */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Layout:</span>
                    <div className="grid grid-cols-3 gap-1">
                      <div></div>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => moveLayout('up')}
                        className="w-8 h-8 p-0"
                        title="Move Layout Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <div></div>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => moveLayout('left')}
                        className="w-8 h-8 p-0"
                        title="Move Layout Left"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => moveLayout('down')}
                        className="w-8 h-8 p-0"
                        title="Move Layout Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => moveLayout('right')}
                        className="w-8 h-8 p-0"
                        title="Move Layout Right"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Symbol Controls */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Symbols:</span>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      onClick={() => rotateSymbols('counterclockwise')}
                      disabled={selectedSymbols.size === 0}
                      className="w-8 h-8 p-0"
                      title="Rotate Counterclockwise"
                    >
                      ↶
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      onClick={() => rotateSymbols('clockwise')}
                      disabled={selectedSymbols.size === 0}
                      className="w-8 h-8 p-0"
                      title="Rotate Clockwise"
                    >
                      ↷
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={deleteSelectedSymbols}
                      disabled={selectedSymbols.size === 0}
                      className="w-8 h-8 p-0"
                      title="Delete Selected Symbols"
                    >
                      ×
                    </Button>
                  </div>

                  {/* Creation Controls */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Create:</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={createNewSeat}
                      className="flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      New Seat
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={startCreatingDeskArea}
                      className="flex items-center gap-1"
                    >
                      <Move className="w-3 h-3" />
                      Desk Area
                    </Button>
                  </div>

                  {/* Admin Save Controls */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Save:</span>
                    <Button 
                      size="sm" 
                      variant="default" 
                      onClick={saveFloorPlan}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                    >
                      💾 Save Changes
                    </Button>
                  </div>

                  {/* Zoom Controls - Merged into toolbar */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Zoom:</span>
                    <div className="flex flex-col items-center gap-1">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= 500}
                        className="w-8 h-8 p-0"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3 h-3" />
                      </Button>
                      <div className="text-sm font-medium min-w-[3rem] text-center">
                        {zoomLevel}%
                      </div>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= 10}
                        className="w-8 h-8 p-0"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleResetZoom}
                        className="w-8 h-8 p-0"
                        title="Reset to 100%"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {(isPlacingItem || isCreatingDeskArea) && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={cancelCreation}
                      className="flex items-center gap-1"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {/* TODO: Add undo logic */}}
                    disabled={undoIndex <= 0}
                    className="flex items-center gap-1"
                  >
                    <Undo2 className="w-3 h-3" />
                    Undo
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {/* TODO: Add reset logic */}}
                  >
                    Reset Changes
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={saveFloorPlan}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>

              {/* Bottom Row - Dimension Inputs */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Layout Dimensions */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Office Layout</h4>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1">
                        <label className="text-xs">W:</label>
                        <input
                          type="number"
                          value={layoutDimensions.width}
                          onChange={(e) => handleLayoutWidthChange(e.target.value)}
                          className="w-16 px-2 py-1 text-xs border border-input rounded bg-background"
                          min="10"
                          step="1"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="text-xs">H:</label>
                        <input
                          type="number"
                          value={layoutDimensions.height}
                          onChange={(e) => handleLayoutHeightChange(e.target.value)}
                          className="w-16 px-2 py-1 text-xs border border-input rounded bg-background"
                          min="10"
                          step="1"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1">
                        <label className="text-xs">X:</label>
                        <input
                          type="number"
                          value={layoutPosition.x.toFixed(1)}
                          onChange={(e) => handleLayoutXChange(e.target.value)}
                          className="w-16 px-2 py-1 text-xs border border-input rounded bg-background"
                          step="0.1"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="text-xs">Y:</label>
                        <input
                          type="number"
                          value={layoutPosition.y.toFixed(1)}
                          onChange={(e) => handleLayoutYChange(e.target.value)}
                          className="w-16 px-2 py-1 text-xs border border-input rounded bg-background"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Desk Area Dimensions */}
                  {(editingDeskArea || selectedDeskAreas.size > 0) && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Desk Area</h4>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1">
                          <label className="text-xs">W:</label>
                          <input
                            type="number"
                            value={editingDeskArea ? getCurrentDeskAreaDimensions(editingDeskArea).width :
                                   selectedDeskAreas.size === 1 ? getCurrentDeskAreaDimensions(Array.from(selectedDeskAreas)[0]).width : 0}
                            onChange={(e) => {
                              if (editingDeskArea) {
                                handleDeskAreaWidthChange(editingDeskArea, e.target.value);
                              } else if (selectedDeskAreas.size === 1) {
                                handleDeskAreaWidthChange(Array.from(selectedDeskAreas)[0], e.target.value);
                              }
                            }}
                            className="w-16 px-2 py-1 text-xs border border-input rounded bg-background"
                            min="5"
                            step="1"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <label className="text-xs">H:</label>
                          <input
                            type="number"
                            value={editingDeskArea ? getCurrentDeskAreaDimensions(editingDeskArea).height :
                                   selectedDeskAreas.size === 1 ? getCurrentDeskAreaDimensions(Array.from(selectedDeskAreas)[0]).height : 0}
                            onChange={(e) => {
                              if (editingDeskArea) {
                                handleDeskAreaHeightChange(editingDeskArea, e.target.value);
                              } else if (selectedDeskAreas.size === 1) {
                                handleDeskAreaHeightChange(Array.from(selectedDeskAreas)[0], e.target.value);
                              }
                            }}
                            className="w-16 px-2 py-1 text-xs border border-input rounded bg-background"
                            min="5"
                            step="1"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Seat Position Controls */}
                  {(editingSeat || selectedSeats.size > 0) && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Seat Position</h4>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1">
                          <label className="text-xs">X:</label>
                          <input
                            type="number"
                            value={editingSeat ? getCurrentSeatPosition(editingSeat).x.toFixed(1) :
                                   selectedSeats.size === 1 ? getCurrentSeatPosition(Array.from(selectedSeats)[0]).x.toFixed(1) : 0}
                            onChange={(e) => {
                              if (editingSeat) {
                                handleSeatXChange(editingSeat, e.target.value);
                              } else if (selectedSeats.size === 1) {
                                handleSeatXChange(Array.from(selectedSeats)[0], e.target.value);
                              }
                            }}
                            className="w-16 px-2 py-1 text-xs border border-input rounded bg-background"
                            step="0.1"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <label className="text-xs">Y:</label>
                          <input
                            type="number"
                            value={editingSeat ? getCurrentSeatPosition(editingSeat).y.toFixed(1) :
                                   selectedSeats.size === 1 ? getCurrentSeatPosition(Array.from(selectedSeats)[0]).y.toFixed(1) : 0}
                            onChange={(e) => {
                              if (editingSeat) {
                                handleSeatYChange(editingSeat, e.target.value);
                              } else if (selectedSeats.size === 1) {
                                handleSeatYChange(Array.from(selectedSeats)[0], e.target.value);
                              }
                            }}
                            className="w-16 px-2 py-1 text-xs border border-input rounded bg-background"
                            step="0.1"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1">
                          <label className="text-xs">Rot:</label>
                          <input
                            type="number"
                            value={editingSeat ? getCurrentSeatPosition(editingSeat).rotation.toFixed(0) :
                                   selectedSeats.size === 1 ? getCurrentSeatPosition(Array.from(selectedSeats)[0]).rotation.toFixed(0) : 0}
                            onChange={(e) => {
                              if (editingSeat) {
                                handleSeatRotationChange(editingSeat, e.target.value);
                              } else if (selectedSeats.size === 1) {
                                handleSeatRotationChange(Array.from(selectedSeats)[0], e.target.value);
                              }
                            }}
                            className="w-16 px-2 py-1 text-xs border border-input rounded bg-background"
                            step="15"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Status Messages */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className={isMobile ? 'text-base' : ''}>Loading floor plan...</p>
            {isMobile && (
              <p className="text-sm text-muted-foreground mt-2">This may take a few moments on mobile</p>
            )}
          </div>
        </div>
      )}
      
      {error && (
        <div className="flex items-center justify-center p-8">
          <div className={`text-center ${isMobile ? 'w-full max-w-sm' : 'max-w-md'}`}>
            <div className="text-amber-600 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className={`text-muted-foreground mb-2 ${isMobile ? 'text-base' : 'text-sm'}`}>{error}</p>
            {error.includes('Using local data') && (
              <p className={`text-muted-foreground mb-3 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                The floor plan is now loaded with local data. You can still interact with it normally.
              </p>
            )}
            {!error.includes('Using local data') && (
              <div className={`flex ${isMobile ? 'flex-col' : 'gap-2'} justify-center mt-3 space-y-2`}>
                <Button 
                  size={isMobile ? 'default' : 'sm'}
                  onClick={fetchFloorPlan}
                  className={`bg-blue-600 hover:bg-blue-700 ${isMobile ? 'w-full h-12 text-base' : ''}`}
                >
                  {isMobile ? '🔄 Retry Loading' : 'Retry'}
                </Button>
                <Button 
                  size={isMobile ? 'default' : 'sm'}
                  variant="outline"
                  onClick={() => {
                    setFloorPlan({
                      seats: localSeats,
                      deskAreas: localDeskAreas,
                      officeLayout: localOfficeLayout
                    });
                    setError('Using local data - Backend not available');
                  }}
                  className={isMobile ? 'w-full h-12 text-base' : ''}
                >
                  {isMobile ? '📱 Use Local Data' : 'Use Local Data'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {!floorPlan && !loading && !error && (
        <div className="flex items-center justify-center p-8">
          <div className={`text-center ${isMobile ? 'w-full max-w-sm' : ''}`}>
            <p className={`text-gray-600 mb-4 ${isMobile ? 'text-base' : ''}`}>
              {isMobile ? '📱 Please select Building, Office Location, and Floor to load the floor plan' : 'Please select Building, Office Location, and Floor to load the floor plan'}
            </p>
            <Button 
              onClick={fetchFloorPlan}
              disabled={!selectedBuilding || !selectedOfficeLocation || !selectedFloor}
              className={`bg-blue-600 hover:bg-blue-700 ${isMobile ? 'w-full h-12 text-base font-medium' : ''}`}
            >
              {isMobile ? '📋 Load Floor Plan' : 'Load Floor Plan'}
            </Button>
          </div>
        </div>
      )}

      {/* Interactive Floor Plan */}
      <Card className="p-6 bg-gradient-subtle relative">
        {/* Custom CSS for zoom slider */}
        <style>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: hsl(var(--primary));
            cursor: pointer;
            border: 2px solid hsl(var(--background));
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            transition: all 0.2s ease;
          }
          
          .slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          }
          
          .slider::-moz-range-thumb {
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: hsl(var(--primary));
            cursor: pointer;
            border: 2px solid hsl(var(--background));
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            transition: all 0.2s ease;
          }
          
          .slider:focus::-moz-range-thumb {
            box-shadow: 0 0 0 3px hsl(var(--primary) / 0.3);
          }
        `}</style>

        {/* Simple Zoom Controls - Only show when not in edit mode */}
        {!isEditMode && !isPlacingItem && !isCreatingDeskArea && (
          <div style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10
          }}>
            <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg flex flex-col items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleZoomIn}
                disabled={zoomLevel >= 500}
                className="h-8 w-8 p-0"
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3" />
              </Button>
              <div className="text-sm font-medium min-w-[3rem] text-center">
                {zoomLevel}%
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleZoomOut}
                disabled={zoomLevel <= 10}
                className="h-8 w-8 p-0"
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
        <div 
          className={`floor-plan-container relative w-full bg-background rounded-lg border overflow-auto custom-scrollbar ${
            isCreatingDeskArea ? 'cursor-crosshair' : 'cursor-default'
          }`}
          onMouseMove={handleFloorPlanMouseMove}
          onClick={handleFloorPlanClick}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            height: isMobile ? '300px' : '400px', // Smaller height for mobile
            scrollbarWidth: 'thin',
            scrollbarColor: 'hsl(var(--border)) hsl(var(--background))',
            overflowX: 'auto',
            overflowY: 'auto',
            userSelect: isEditMode ? 'none' : 'auto',
            touchAction: 'pan-x pan-y pinch-zoom' // Enable touch gestures
          }}
          ref={(el) => {
            if (el) {
              // Set 50% horizontal scroll on mount
              const scrollWidth = el.scrollWidth;
              const clientWidth = el.clientWidth;
              const scrollLeft = (scrollWidth - clientWidth) * 0.5;
              el.scrollLeft = scrollLeft;
            }
          }}
        >
          <svg 
            className="w-full h-full" 
            viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
            preserveAspectRatio="xMidYMid meet"
            style={{
              width: `${100 * zoom}%`,
              height: `${100 * zoom}%`,
              minWidth: '100%',
              minHeight: '100%'
            }}
          >
            {/* SVG content - zoom is handled by SVG size */}
            <g>
            {/* Office Layout Background - Rendered from floor data */}
            <rect 
              x={layoutX} 
              y={layoutY} 
              width={layoutWidth} 
              height={layoutHeight} 
              fill={officeLayout.fillColor} 
              fillOpacity={officeLayout.fillOpacity} 
              stroke={officeLayout.strokeColor} 
              strokeWidth={officeLayout.strokeWidth} 
              onMouseDown={(e) => {
                if (isEditMode && !isPlacingItem && !isCreatingDeskArea) {
                  e.stopPropagation();
                  setDraggedItem({ 
                    type: 'layout', 
                    id: 'office-layout', 
                    startX: e.clientX, 
                    startY: e.clientY 
                  });
                  setIsDraggingItem(true);
                }
              }}
              onMouseUp={handleItemMouseUp}
              className={isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
            />
            
            {/* Render Static Desk Areas from Data */}
            {deskAreas.map((area) => {
              const position = deskAreaPositions[area.id] || { x: 0, y: 0, rotation: 0 };
              const actualX = area.x + position.x;
              const actualY = area.y + position.y;
              const actualRotation = position.rotation || 0;
              
              // Use edited dimensions if available, otherwise use original
              const currentDimensions = deskAreaDimensions[area.id];
              const currentWidth = currentDimensions?.width || area.width;
              const currentHeight = currentDimensions?.height || area.height;
              
              const getAreaColor = () => {
                switch (area.type) {
                  case 'workspace':
                    return 'hsl(var(--muted))';
                  case 'meeting-area':
                    return 'hsl(var(--secondary))';
                  case 'phone-booth-area':
                    return 'hsl(var(--accent))';
                  default:
                    return 'hsl(var(--muted))';
                }
              };

              const getAreaOpacity = () => {
                switch (area.type) {
                  case 'workspace':
                    return 0.3;
                  case 'meeting-area':
                    return 0.3;
                  case 'phone-booth-area':
                    return 0.2;
                  default:
                    return 0.3;
                }
              };

              const getTextSize = () => {
                if (area.width < 15) return 1.5;
                if (area.width < 30) return 2;
                return 2;
              };

              return (
                <g 
                  key={area.id}
                  transform={`rotate(${actualRotation} ${actualX + area.width/2} ${actualY + area.height/2})`}
                  onMouseDown={(e) => handleItemMouseDown(e, 'desk-area', area.id, actualX, actualY)}
                  onMouseUp={handleItemMouseUp}
                  onClick={(e) => {
                    if (isEditMode && !isDraggingItem) {
                      if (e.ctrlKey || e.metaKey) {
                        // Multi-select: toggle desk area in set
                        setSelectedDeskAreas(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(area.id)) {
                            newSet.delete(area.id);
                          } else {
                            newSet.add(area.id);
                          }
                          return newSet;
                        });
                      } else {
                        // Single select: select only this desk area
                        setSelectedDeskAreas(new Set([area.id]));
                        handleDeskAreaClick(area.id);
                      }
                    }
                  }}
                  className={isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
                >
                  <rect
                    x={actualX}
                    y={actualY}
                    width={currentWidth}
                    height={currentHeight}
                    fill={getAreaColor()}
                    fillOpacity={selectedDeskAreas.has(area.id) || editingDeskArea === area.id ? 0.5 : getAreaOpacity()}
                    stroke={selectedDeskAreas.has(area.id) || editingDeskArea === area.id ? 'hsl(var(--accent))' : 'hsl(var(--border))'}
                    strokeWidth={selectedDeskAreas.has(area.id) || editingDeskArea === area.id ? '0.5' : '0.3'}
                    rx="2"
                  />
                  <text
                    x={actualX + currentWidth / 2}
                    y={actualY + 2}
                    textAnchor="middle"
                    fontSize={getTextSize()}
                    fill="hsl(var(--muted-foreground))"
                    className="pointer-events-none"
                  >
                    {area.name}
                  </text>
                  {area.type === 'phone-booth-area' && (
                    <>
                      <text
                        x={actualX + currentWidth / 2}
                        y={actualY + 4}
                        textAnchor="middle"
                        fontSize={getTextSize()}
                        fill="hsl(var(--muted-foreground))"
                        className="pointer-events-none"
                      >
                        Booths
                      </text>
                    </>
                  )}
                </g>
              );
            })}

          


            {/* Render Desk Area Creation Preview */}
            {isCreatingDeskArea && deskAreaStart.x && deskAreaStart.y && (
              <g>
                <rect
                  x={Math.min(deskAreaStart.x, deskAreaEnd.x)}
                  y={Math.min(deskAreaStart.y, deskAreaEnd.y)}
                  width={Math.abs(deskAreaEnd.x - deskAreaStart.x)}
                  height={Math.abs(deskAreaEnd.y - deskAreaStart.y)}
                  fill="hsl(var(--accent))"
                  fillOpacity="0.2"
                  stroke="hsl(var(--accent))"
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                  rx="1"
                />
                <text
                  x={(deskAreaStart.x + deskAreaEnd.x) / 2}
                  y={(deskAreaStart.y + deskAreaEnd.y) / 2}
                  textAnchor="middle"
                  fontSize="1.2"
                  fill="hsl(var(--accent-foreground))"
                >
                  Click to finish
                </text>
              </g>
            )}

            {/* Render Custom Desk Areas */}
            {customDeskAreas.map((area) => (
              <g 
                key={area.id}
                onMouseDown={(e) => handleItemMouseDown(e, 'desk-area', area.id, area.x, area.y)}
                onMouseUp={handleItemMouseUp}
                onClick={(e) => {
                  if (isEditMode && !isDraggingItem) {
                    if (e.ctrlKey || e.metaKey) {
                      // Multi-select: toggle desk area in set
                      setSelectedDeskAreas(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(area.id)) {
                          newSet.delete(area.id);
                        } else {
                          newSet.add(area.id);
                        }
                        return newSet;
                      });
                    } else {
                      // Single select: select only this desk area
                      setSelectedDeskAreas(new Set([area.id]));
                      handleDeskAreaClick(area.id);
                    }
                  }
                }}
                className={isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
              >
                <rect
                  x={area.x}
                  y={area.y}
                  width={area.width}
                  height={area.height}
                  fill="hsl(var(--accent))"
                  fillOpacity={selectedDeskAreas.has(area.id) ? 0.5 : 0.3}
                  stroke={selectedDeskAreas.has(area.id) ? 'hsl(var(--accent))' : 'hsl(var(--border))'}
                  strokeWidth={selectedDeskAreas.has(area.id) ? '0.5' : '0.3'}
                  rx="2"
                />
                <text
                  x={area.x + area.width / 2}
                  y={area.y + 2}
                  textAnchor="middle"
                  fontSize="1.5"
                  fill="hsl(var(--accent-foreground))"
                  className="pointer-events-none"
                >
                  {area.name}
                </text>
              </g>
            ))}

            {/* Render Seats */}
            {filteredSeats.map((seat) => {
              const position = seatPositions[seat.id] || { x: 0, y: 0, rotation: 0 };
              const actualX = seat.x + position.x;
              const actualY = seat.y + position.y;
              const actualRotation = (seat.rotation || 0) + position.rotation;
              
              return (
                <g 
                  key={seat.id} 
                  transform={`rotate(${actualRotation} ${actualX} ${actualY})`}
                  onMouseDown={(e) => handleItemMouseDown(e, 'seat', seat.id, actualX, actualY)}
                  onMouseUp={handleItemMouseUp}
                  className={isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
                >
                  <rect
                    x={actualX - 2}
                    y={actualY - 2}
                    width="4"
                    height="4"
                    fill={
                      selectedSeats.has(seat.id) 
                        ? 'hsl(var(--seat-selected))'
                        : seat.status === 'occupied'
                        ? 'hsl(var(--seat-occupied))'
                        : 'hsl(var(--seat-available))'
                    }
                    stroke={
                      selectedSeats.has(seat.id)
                        ? '#FFD700' // Gold border for selected seat
                        : 'hsl(var(--border))'
                    }
                    strokeWidth={
                      selectedSeats.has(seat.id)
                        ? "0.5"
                        : "0.2"
                    }
                    rx="0.5"
                    className="transition-all duration-200"
                    onClick={(e) => handleSeatClick(seat.id, seat.status, e)}
                  />
                  {/* Small circle beside seat box */}
                  <circle
                    cx={actualX + 3}
                    cy={actualY}
                    r="0.8"
                    fill={
                      selectedSeats.has(seat.id) 
                        ? 'hsl(var(--seat-selected))'
                        : seat.status === 'occupied'
                        ? 'hsl(var(--seat-occupied))'
                        : 'hsl(var(--seat-available))'
                    }
                    fillOpacity="0.7"
                    stroke={
                      selectedSeats.has(seat.id)
                        ? '#FFD700' // Gold border for selected seat
                        : 'hsl(var(--border))'
                    }
                    strokeWidth={
                      selectedSeats.has(seat.id)
                        ? "0.3"
                        : "0.2"
                    }
                    className="pointer-events-none"
                  />
                  <text
                    x={actualX}
                    y={actualY + 0.5}
                    textAnchor="middle"
                    fontSize="1.5"
                    fill="hsl(var(--foreground))"
                    className="pointer-events-none"
                  >
                    {seat.id}
                  </text>
                  {seat.type === 'phone-booth' && (
                    <circle
                      cx={actualX}
                      cy={actualY - 3}
                      r="0.5"
                      fill="hsl(var(--accent))"
                    />
                  )}
                </g>
              );
            })}

            {/* Render New Seats */}
            {newSeats.map((seat) => {
              const position = newSeatPositions[seat.id] || { x: 0, y: 0, rotation: 0 };
              const actualX = seat.x + position.x;
              const actualY = seat.y + position.y;
              const actualRotation = (seat.rotation || 0) + position.rotation;
              
              return (
                <g 
                  key={seat.id} 
                  transform={`rotate(${actualRotation} ${actualX} ${actualY})`}
                  onMouseDown={(e) => handleItemMouseDown(e, 'seat', seat.id, actualX, actualY)}
                  onMouseUp={handleItemMouseUp}
                  className={isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
                >
                  <rect
                    x={actualX - 2}
                    y={actualY - 2}
                    width="4"
                    height="4"
                    fill={
                      selectedSeats.has(seat.id) 
                        ? 'hsl(var(--seat-selected))'
                        : seat.status === 'occupied'
                        ? 'hsl(var(--seat-occupied))'
                        : 'hsl(var(--seat-available))'
                    }
                    stroke={
                      selectedSeats.has(seat.id)
                        ? '#FFD700' // Gold border for selected seat
                        : 'hsl(var(--border))'
                    }
                    strokeWidth={
                      selectedSeats.has(seat.id)
                        ? "0.5"
                        : "0.2"
                    }
                    rx="0.5"
                    className="transition-all duration-200"
                    onClick={(e) => handleSeatClick(seat.id, seat.status, e)}
                  />
                  {/* Small circle beside seat box */}
                  <circle
                    cx={actualX + 3}
                    cy={actualY}
                    r="0.8"
                    fill={
                      selectedSeats.has(seat.id) 
                        ? 'hsl(var(--seat-selected))'
                        : seat.status === 'occupied'
                        ? 'hsl(var(--seat-occupied))'
                        : 'hsl(var(--seat-available))'
                    }
                    fillOpacity="0.7"
                    stroke={
                      selectedSeats.has(seat.id)
                        ? '#FFD700' // Gold border for selected seat
                        : 'hsl(var(--border))'
                    }
                    strokeWidth={
                      selectedSeats.has(seat.id)
                        ? "0.3"
                        : "0.2"
                    }
                    className="pointer-events-none"
                  />
                  <text
                    x={actualX}
                    y={actualY + 0.5}
                    textAnchor="middle"
                    fontSize="1.5"
                    fill="hsl(var(--foreground))"
                    className="pointer-events-none"
                  >
                    newseat
                  </text>
                </g>
              );
            })}



            {/* Render Resources */}
            {resources.map((resource) => (
              <g key={resource.id}>
                <rect
                  x={resource.x - 3}
                  y={resource.y - 2}
                  width="6"
                  height="4"
                  fill={resource.status === 'available' ? 'hsl(var(--resource-available))' : 'hsl(var(--resource-booked))'}
                  stroke="hsl(var(--border))"
                  strokeWidth="0.2"
                  rx="0.5"
                  className="cursor-pointer transition-all duration-200"
                />
                <text
                  x={resource.x}
                  y={resource.y + 0.5}
                  textAnchor="middle"
                  fontSize="1.2"
                  fill="hsl(var(--foreground))"
                  className="cursor-pointer pointer-events-none"
                >
                  {resource.id}
                </text>
                {resource.capacity && (
                  <text
                    x={resource.x}
                    y={resource.y + 2.5}
                    textAnchor="middle"
                    fontSize="1"
                    fill="hsl(var(--muted-foreground))"
                    className="pointer-events-none"
                  >
                    {resource.capacity}p
                  </text>
                )}
              </g>
            ))}

            {/* Render Amenities from Resources */}
            {resources.filter(resource => resource.type === 'amenity').map((amenity) => (
              <g key={amenity.id}>
                <circle
                  cx={amenity.x}
                  cy={amenity.y}
                  r="2"
                  fill="hsl(var(--accent))"
                  fillOpacity="0.7"
                  stroke="hsl(var(--accent))"
                  strokeWidth="0.3"
                />
                <text
                  x={amenity.x}
                  y={amenity.y + 1}
                  textAnchor="middle"
                  fontSize="1.2"
                  fill="hsl(var(--accent-foreground))"
                >
                  ☕
                </text>
                <text
                  x={amenity.x}
                  y={amenity.y + 3}
                  textAnchor="middle"
                  fontSize="1"
                  fill="hsl(var(--muted-foreground))"
                >
                  {amenity.name}
                </text>
              </g>
            ))}

            {/* Render Floor Symbols */}
            {floorSymbols.map((symbol) => {
              const position = symbolPositions[symbol.id] || { x: 0, y: 0, rotation: 0 };
              const actualX = symbol.x + position.x;
              const actualY = symbol.y + position.y;
              const actualRotation = (symbol.rotation || 0) + position.rotation;
              const isSelected = selectedSymbols.has(symbol.id);

              const renderSymbol = () => {
                switch (symbol.type) {
                  case 'door':
                    return (
                      <>
                        {/* Door SVG Icon */}
                        <rect
                          x="-3"
                          y="-2"
                          width="6"
                          height="4"
                          fill="hsl(var(--muted))"
                          stroke="hsl(var(--border))"
                          strokeWidth="0.2"
                          rx="0.5"
                        />
                        <rect
                          x="-2.5"
                          y="-1.5"
                          width="5"
                          height="3"
                          fill="hsl(var(--background))"
                          stroke="none"
                        />
                        <circle
                          cx="1.5"
                          cy="0"
                          r="0.3"
                          fill="hsl(var(--foreground))"
                        />
                      </>
                    );
                  case 'washroom':
                    return (
                      <>
                        {/* Washroom SVG Icon */}
                        <rect
                          x="-3"
                          y="-2"
                          width="6"
                          height="4"
                          fill="hsl(var(--secondary))"
                          stroke="hsl(var(--border))"
                          strokeWidth="0.2"
                          rx="0.5"
                        />
                        <circle
                          cx="-1"
                          cy="0"
                          r="0.8"
                          fill="hsl(var(--foreground))"
                        />
                        <rect
                          x="0.5"
                          y="-1"
                          width="1.5"
                          height="2"
                          fill="hsl(var(--foreground))"
                          rx="0.2"
                        />
                      </>
                    );
                  case 'emergency-exit':
                    return (
                      <>
                        {/* Fire Exit SVG Icon */}
                        <rect
                          x="-3"
                          y="-2"
                          width="6"
                          height="4"
                          fill="hsl(var(--destructive))"
                          stroke="hsl(var(--border))"
                          strokeWidth="0.2"
                          rx="0.5"
                        />
                       
                      </>
                    );
                  case 'cafeteria':
                    return (
                      <>
                        {/* Cafeteria/Entrance SVG Icon */}
                        <rect
                          x="-3"
                          y="-2"
                          width="6"
                          height="4"
                          fill="hsl(var(--accent))"
                          stroke="hsl(var(--border))"
                          strokeWidth="0.2"
                          rx="0.5"
                        />
                        <circle
                          cx="-1"
                          cy="0"
                          r="0.6"
                          fill="hsl(var(--accent-foreground))"
                        />
                        <circle
                          cx="1"
                          cy="0"
                          r="0.6"
                          fill="hsl(var(--accent-foreground))"
                        />
                        <rect
                          x="-0.5"
                          y="-0.8"
                          width="1"
                          height="0.3"
                          fill="hsl(var(--accent-foreground))"
                          rx="0.1"
                        />
                      </>
                    );
                  default:
                    return null;
                }
              };

              return (
                <g
                  key={symbol.id}
                  transform={`rotate(${actualRotation} ${actualX} ${actualY})`}
                  onMouseDown={(e) => handleItemMouseDown(e, 'symbol', symbol.id, actualX, actualY)}
                  onMouseUp={handleItemMouseUp}
                  onClick={(e) => {
                    console.log('Symbol <g> clicked:', symbol.id, 'Edit mode:', isEditMode, 'Dragging:', isDraggingItem);
                    handleSymbolClick(symbol.id);
                  }}
                  className={isEditMode ? (isDraggingItem && draggedItem?.id === symbol.id ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-pointer'}
                >
                  {/* Selection indicator - positioned at origin since parent is rotated */}
                  {isSelected && isEditMode && (
                    <circle
                      cx="0"
                      cy="0"
                      r="8"
                      fill="none"
                      stroke="hsl(var(--accent))"
                      strokeWidth="0.5"
                      strokeDasharray="2,2"
                      className="pointer-events-none"
                    />
                  )}
                  {renderSymbol()}
                </g>
              );
            })}
            </g>
          </svg>

          

        </div>
      </Card>

      {/* Instructions - Move to bottom in edit mode */}
      {isEditMode && (
        <div className="mt-4">
          <div className="text-xs text-muted-foreground border-t pt-3">
            <strong>Instructions:</strong> Click to select seats and desk areas. <strong>Ctrl/Cmd + Click</strong> for multi-select. 
            Use rotation and movement buttons to adjust positions. Items can be placed anywhere on the floor plan. Use <strong>Undo</strong> to revert changes.
            <br />
            <strong>Dimensions:</strong> Edit office layout and desk area dimensions using the input fields below. Click on desk areas to edit their size.
            <br />
            <strong>Layout:</strong> Use the Layout move buttons or drag the office layout background to reposition it. Edit X/Y coordinates for precise positioning.
            <br />
            <strong>Navigation:</strong> Use horizontal and vertical scroll to navigate the floor plan. <strong>Ctrl/Cmd + Scroll</strong> to zoom. Zoom controls available in top-right corner.
            <br />
            <strong>Drag & Drop:</strong> In edit mode, drag seats, symbols, desk areas, and the office layout to reposition them. Use <strong>Save Changes</strong> to update the floor plan data.
            <br />
            {(isPlacingItem || isCreatingDeskArea) && (
              <span className="text-accent-foreground font-medium">
                {isPlacingItem === 'seat' && '→ Click on floor plan to place new seat'}
                {isCreatingDeskArea && '→ Click and drag to create desk area'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Selected Seat Info */}
      {selectedSeat && (
        <Card className="p-4 border-accent">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Seat {selectedSeat}</h3>
              <div className="flex gap-2 mt-2">
                {seats.find(s => s.id === selectedSeat)?.equipment?.map((eq, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {eq === 'Monitor' && <Monitor className="w-3 h-3 mr-1" />}
                    {eq === 'Dock' && <Wifi className="w-3 h-3 mr-1" />}
                    {eq}
                  </Badge>
                ))}
              </div>
            </div>
            <Button variant="default" onClick={() => handleBookSeat(seats.find(s => s.id === selectedSeat) || newSeats[0])} className="bg-[#FFD700] text-amber-900 hover:bg-amber-400">
              Book This Seat
            </Button>
          </div>
        </Card>
      )}

      {/* Floating Zoom Indicator */}
      {showZoomIndicator && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          pointerEvents: 'none',
        }}>
          <div className="bg-background/90 px-6 py-3 rounded-2xl shadow-2xl border-2 border-primary text-3xl font-bold text-primary animate-fade-in-out">
            {zoomLevel}%
          </div>
        </div>
      )}

      {/* Booking Dialog/Modal */}
      {showBookingDialog && bookingSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background rounded-2xl shadow-2xl p-4 sm:p-8 md:p-10 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold">Book Seat {bookingSeat.id}</h2>
              <Button size="icon" variant="ghost" onClick={handleCloseBookingDialog}>&times;</Button>
            </div>
            {/* Seat Image Preview - Large and Wide */}
            <div className="w-full mb-2">
              <AspectRatio ratio={4/1.7} className="w-full h-32 sm:h-40 md:h-48 rounded-2xl overflow-hidden border border-muted bg-muted">
                <Avatar className="w-full h-full rounded-2xl">
                  <AvatarImage src="/placeholder.svg" alt="Seat preview" className="object-cover w-full h-full" />
                  <AvatarFallback>Seat</AvatarFallback>
                </Avatar>
              </AspectRatio>
            </div>
            <div className="mb-2">
              <div className="mb-2 text-sm sm:text-base text-muted-foreground">Type: <span className="font-medium">{bookingSeat.type}</span></div>
              <div className="mb-2 text-sm sm:text-base text-muted-foreground">Status: <span className="font-medium capitalize">{bookingSeat.status}</span></div>
              <div className="mb-2 text-sm sm:text-base text-muted-foreground">User: <span className="font-medium">{user?.name || 'Not logged in'}</span></div>
              <div className="mb-2 text-sm sm:text-base text-muted-foreground">Office Location: <span className="font-medium">{selectedOfficeLocation.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span></div>
              <div className="mb-2 text-sm sm:text-base text-muted-foreground">Building: <span className="font-medium">{selectedBuilding.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span></div>
              <div className="mb-2 text-sm sm:text-base text-muted-foreground">Floor: <span className="font-medium">{selectedFloor.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span></div>
              <div className="mb-2 text-sm sm:text-base text-muted-foreground">Date: <span className="font-medium">{selectedDate}</span></div>
              {bookingSeat.equipment && bookingSeat.equipment.length > 0 && (
                <div className="mb-2 text-sm sm:text-base text-muted-foreground">Equipment: <span className="font-medium">{bookingSeat.equipment.join(', ')}</span></div>
              )}
            </div>
            
            {/* Time Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Booking Time</label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                    min="06:00"
                    max="22:00"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                    min="06:00"
                    max="22:00"
                  />
                </div>
              </div>
              {startTime >= endTime && (
                <p className="text-xs text-red-500 mt-1">End time must be after start time</p>
              )}
            </div>
            
            {/* Recurrence Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Recurrence</label>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant={recurrenceType === 'none' ? 'default' : 'outline'} onClick={() => setRecurrenceType('none')}>None</Button>
                <Button size="sm" variant={recurrenceType === 'daily' ? 'default' : 'outline'} onClick={() => setRecurrenceType('daily')}>Daily</Button>
                <Button size="sm" variant={recurrenceType === 'weekly' ? 'default' : 'outline'} onClick={() => setRecurrenceType('weekly')}>Weekly</Button>
                <Button size="sm" variant={recurrenceType === 'custom' ? 'default' : 'outline'} onClick={() => setRecurrenceType('custom')}>Custom Dates</Button>
              </div>
              
              {/* End Date for Recurring Bookings */}
              {(recurrenceType === 'daily' || recurrenceType === 'weekly') && (
                <div className="mt-2">
                  <label className="block text-xs mb-1">End Date</label>
                  <input
                    type="date"
                    value={recurrenceEndDate}
                    onChange={e => setRecurrenceEndDate(e.target.value)}
                    min={selectedDate}
                    className="border px-2 py-1 rounded text-xs w-full"
                    placeholder="Select end date"
                  />
                  {!recurrenceEndDate && (
                    <p className="text-xs text-red-500 mt-1">Please select an end date for recurring bookings</p>
                  )}
                </div>
              )}
              
              {recurrenceType === 'custom' && (
                <div className="mt-2">
                  <label className="block text-xs mb-1">Select Dates</label>
                  <input
                    type="date"
                    onChange={e => {
                      const date = e.target.value;
                      if (date && !customDates.includes(date)) setCustomDates([...customDates, date]);
                    }}
                    className="border px-2 py-1 rounded text-xs"
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {customDates.map(date => (
                      <span key={date} className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                        {date}
                        <button onClick={() => setCustomDates(customDates.filter(d => d !== date))} className="ml-1 text-amber-700">&times;</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button 
              variant="default" 
              className="w-full" 
              disabled={
                startTime >= endTime || 
                (recurrenceType === 'daily' && !recurrenceEndDate) ||
                (recurrenceType === 'weekly' && !recurrenceEndDate) ||
                (recurrenceType === 'custom' && customDates.length === 0)
              }
              onClick={handleConfirmBooking}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      )}


    </div>
  );
};

export default FloorPlan;