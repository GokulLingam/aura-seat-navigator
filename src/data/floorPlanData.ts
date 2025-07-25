// Floor Plan Data - Generated on 13/7/2025, 2:02:28 pm
// Total Items Captured: 61 seats, 4 resources, 3 desk areas, 6 floor symbols

export interface Seat {
  id: string;
  x: number;
  y: number;
  status: 'available' | 'occupied' | 'selected';
  type: 'desk' | 'meeting-room' | 'phone-booth';
  equipment?: string[];
  rotation?: number;
}

export interface Resource {
  id: string;
  name: string;
  type: 'meeting-room' | 'equipment' | 'amenity';
  x: number;
  y: number;
  capacity?: number;
  status: 'available' | 'booked';
}

export interface DeskArea {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'workspace' | 'meeting-area' | 'phone-booth-area';
  color?: string;
  rotation?: number;
}

export interface FloorSymbol {
  id: string;
  type: 'emergency-exit' | 'cafeteria' | 'door' | 'washroom';
  x: number;
  y: number;
  rotation: number;
}

export interface OfficeLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWidth: number;
}

// Helper function to check if a seat is inside a desk area
function isSeatInDeskArea(seatX: number, seatY: number, deskArea: DeskArea): boolean {
  // For simplicity, we'll use a 4x4 bounding box around the seat
  const seatSize = 4;
  const seatLeft = seatX - seatSize / 2;
  const seatRight = seatX + seatSize / 2;
  const seatTop = seatY - seatSize / 2;
  const seatBottom = seatY + seatSize / 2;

  const deskLeft = deskArea.x;
  const deskRight = deskArea.x + deskArea.width;
  const deskTop = deskArea.y;
  const deskBottom = deskArea.y + deskArea.height;

  // Check if seat overlaps with desk area
  return !(seatRight < deskLeft || 
           seatLeft > deskRight || 
           seatBottom < deskTop || 
           seatTop > deskBottom);
}

// Updated seats with current positions (excluding seats in desk areas)
// Total seats: 71 (71 existing + 0 new)
export const seats: Seat[] = [
  {
    id: "D1",
    x: 7,
    y: 5,
    status: "available" as const,
    type: "desk" as const,
    equipment: [
      "Monitor",
      "Dock",
      "Window Seat"
    ],
    rotation: 0
  }, {
    id: "D2",
    x: 7.730657859981704,
    y: 19.892523418729393,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D3",
    x: 7.485122162687269,
    y: 12.285046837458783,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D4",
    x: 86.62946192392619,
    y: 7.144859958221865,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D5",
    x: 77.54464112403213,
    y: 7.55607490856082,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D6",
    x: 44.72470291900969,
    y: 32.43457940406744,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D7",
    x: 48.57142884328903,
    y: 22.771028071102045,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D8",
    x: 32.69345375158234,
    y: 34.07943920542324,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D9",
    x: 32.28422758942499,
    y: 24.827102822796814,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D10",
    x: 48.24404791356318,
    y: 14.957944014661955,
    status: "available" as const,
    type: "desk" as const,
    equipment: [
      "Window Seat"
    ],
    rotation: 0
  },
  {
    id: "D11",
    x: 33.18452514617128,
    y: 16.808411291187248,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D12",
    x: 55.528273599964685,
    y: 6.73364500788292,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D13",
    x: 47.75297651897431,
    y: 6.528037532713441,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D14",
    x: 33.266370378602744,
    y: 9.4065421850861,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D15",
    x: 21.153275978744034,
    y: 35.51869153160956,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D16",
    x: 19.59821656254592,
    y: 25.238317773135766,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D17",
    x: 19.43452609768299,
    y: 15.163551489831434,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D18",
    x: 19.59821656254595,
    y: 6.322430057543972,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D19",
    x: 8.058038789707616,
    y: 35.929906481948535,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D20",
    x: 7.976193557276126,
    y: 28.528037375847386,
    status: "available" as const,
    type: "desk" as const,
    equipment: [
      "Window Seat"
    ],
    rotation: 0
  },
  {
    id: "D21",
    x: 124.68749500456342,
    y: 23.387850496610486,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D22",
    x: 115.19344804251182,
    y: 23.182243021441,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D23",
    x: 105.45386538316592,
    y: 24.621495347627338,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D24",
    x: 134.5907681287722,
    y: 23.182243021440996,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D25",
    x: 132.95386348014256,
    y: 14.7523365394925,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D26",
    x: 124.27826884240598,
    y: 15.369158965000928,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D27",
    x: 115.27529327494318,
    y: 15.36915896500092,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D28",
    x: 104.71725829128297,
    y: 16.397196340848318,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D29",
    x: 137.94642265846267,
    y: 6.733645007882927,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D30",
    x: 129.43451848558908,
    y: 6.528037532713448,
    status: "available" as const,
    type: "desk" as const,
    equipment: [
      "Window Seat"
    ],
    rotation: 0
  },
  {
    id: "D31",
    x: 122.06844756675603,
    y: 6.322430057543979,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D32",
    x: 113.72023385874513,
    y: 7.14485995822189,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D33",
    x: 104.96279398857712,
    y: 7.761682383730307,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D34",
    x: 92.44047342656111,
    y: 27.91121495033895,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D35",
    x: 79.75446239968196,
    y: 27.705607475169476,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D36",
    x: 94.97767563193696,
    y: 22.154205645593628,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D37",
    x: 85.89285483204273,
    y: 22.359813120763093,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D38",
    x: 75.74404601053959,
    y: 23.387850496610483,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D39",
    x: 94.89583039950534,
    y: 6.528037532713437,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D40",
    x: 88.34821180498705,
    y: 15.163551489831443,
    status: "available" as const,
    type: "desk" as const,
    equipment: [
      "Window Seat"
    ],
    rotation: 0
  },
  {
    id: "D41",
    x: 77.54464112403204,
    y: 15.57476644017039,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D42",
    x: 203.2589181387813,
    y: 20.098130893898887,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D43",
    x: 193.7648711767301,
    y: 24.415887872457812,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D44",
    x: 178.37796747961255,
    y: 10.84579451127243,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D45",
    x: 195.72915675508543,
    y: 19.68691594356003,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D46",
    x: 189.75445478758755,
    y: 12.696261787797711,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D47",
    x: 183.12499096063812,
    y: 22.976635546271556,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D48",
    x: 181.07886014985144,
    y: 17.01401876635674,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D49",
    x: 198.5937398901868,
    y: 13.313084213306151,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D50",
    x: 197.8571327983041,
    y: 7.9672898588998,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D51",
    x: 126.89731628021306,
    y: 72.7336445372847,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D52",
    x: 120.75892384785217,
    y: 59.98598107677726,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D53",
    x: 136.63689893955882,
    y: 60.19158855194675,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D54",
    x: 120.51338815055774,
    y: 65.33177543118362,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D55",
    x: 101.36160376159216,
    y: 67.79906513321728,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D56",
    x: 107.17261526422706,
    y: 75.20093423931837,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D57",
    x: 105.781246312892,
    y: 58.75233622576043,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D58",
    x: 109.79166270203439,
    y: 62.658878253980426,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D59",
    x: 94.07737807519064,
    y: 76.84579404067418,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D60",
    x: 89.0848188968705,
    y: 62.247663303641474,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D61",
    x: 81.8824384429006,
    y: 68.21028008355626,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D62",
    x: 90.55803308063705,
    y: 69.64953240974256,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D63",
    x: 79.34523623752466,
    y: 61.630840878133064,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D64",
    x: 68.62351078900102,
    y: 73.76168191313201,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D65",
    x: 67.88690369711773,
    y: 66.97663523253942,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D66",
    x: 80.9002956537226,
    y: 75.40654171448784,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D67",
    x: 96.77827074542907,
    y: 62.864485729149834,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D68",
    x: 53.4821427891778,
    y: 74.17289686347092,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D69",
    x: 69.27827264845291,
    y: 60.397196027116095,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D70",
    x: 50.944940583801916,
    y: 67.18224270770887,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  },
  {
    id: "D71",
    x: 48.16220268113172,
    y: 59.16355117609932,
    status: "available" as const,
    type: "desk" as const,
    equipment: [],
    rotation: 0
  }  
].filter(seat => {
  // Check if seat is inside any desk area
  const deskAreas = [
    {
      id: "area1",
      name: "Main Workspace",
      x: 28.53720220537611,
      y: 8.44859817042422,
      width: 60,
      height: 40,
      type: "workspace" as const,
      rotation: 0
    },
    {
      id: "area2",
      name: "Meeting Area",
      x: 56.78720315688773,
      y: -6.6074764244045525,
      width: 30,
      height: 25,
      type: "meeting-area" as const,
      rotation: 0
    },
    {
      id: "area3",
      name: "Phone Booths",
      x: 102.32142598875387,
      y: 2.1495328803407787,
      width: 15,
      height: 15,
      type: "phone-booth-area" as const,
      rotation: 0
    },
    {
      id: "desk-area-1752395711925",
      x: 96.43600817234389,
      y: 31.71962608466013,
      width: 20,
      height: 15,
      name: "Desk Area 1",
      type: "workspace" as const,
      rotation: 0
    },
    {
      id: "desk-area-1752395712413",
      x: 99.13690084258265,
      y: 21.02803737584738,
      width: 20,
      height: 15,
      name: "Desk Area 2",
      type: "workspace" as const,
      rotation: 0
    },
    {
      id: "desk-area-1752395712777",
      x: 100.20088886419184,
      y: 28.841121432287462,
      width: 20,
      height: 15,
      name: "Desk Area 3",
      type: "workspace" as const,
      rotation: 0
    },
    {
      id: "desk-area-1752395775134",
      x: 42.5,
      y: 20,
      width: 20,
      height: 15,
      name: "Desk Area 4",
      type: "workspace" as const,
      rotation: 0
    },
    {
      id: "desk-area-1752395775837",
      x: 42.5,
      y: 20,
      width: 20,
      height: 15,
      name: "Desk Area 6",
      type: "workspace" as const,
      rotation: 0
    },
    {
      id: "desk-area-1752395776101",
      x: 42.5,
      y: 20,
      width: 20,
      height: 15,
      name: "Desk Area 7",
      type: "workspace" as const,
      rotation: 0
    },
    {
      id: "desk-area-1752395776373",
      x: 42.5,
      y: 20,
      width: 20,
      height: 15,
      name: "Desk Area 8",
      type: "workspace" as const,
      rotation: 0
    },
    {
      id: "desk-area-1752395776685",
      x: 42.5,
      y: 20,
      width: 20,
      height: 15,
      name: "Desk Area 9",
      type: "workspace" as const,
      rotation: 0
    }
  ];

  // Return true if seat is NOT inside any desk area
  return !deskAreas.some(deskArea => isSeatInDeskArea(seat.x, seat.y, deskArea));
});

// Resources (meeting rooms, equipment, amenities)
// Total resources: 4
export const resources: Resource[] = [
  
];

// Desk areas (including custom areas created during session)
// Total desk areas: 3 (3 existing + 0 custom)
export const deskAreas: DeskArea[] = [
  {
    id: "area1",
    name: "Main Workspace",
    x: 1.6101207354199758,
    y: 1.869158965001005,
    width: 60,
    height: 40,
    type: "workspace",
    rotation: 0
  },
  {
    id: "area2",
    name: "Meeting Area",
    x: 70.53720220537593,
    y: 0.7943926816965927,
    width: 30,
    height: 31,
    type: "meeting-area",
    rotation: 0
  },
  {
    id: "area3",
    name: "Phone Booths",
    x: 194.1517767768707,
    y: 30.934579404067414,
    width: 15,
    height: 15,
    type: "phone-booth-area",
    rotation: 0
  },
  {
    id: "desk-area-1752395711925",
    x: 152.33630192304344,
    y: 1.4953272347471582,
    width: 20,
    height: 11,
    name: "Desk Area 1",
    type: "workspace",
    rotation: 0
  },
  {
    id: "desk-area-1752395712413",
    x: 172.96130049577494,
    y: 0.6728973340693543,
    width: 36,
    height: 29,
    name: "Desk Area 2",
    type: "workspace",
    rotation: 0
  },
  {
    id: "desk-area-1752395712777",
    x: 101.26487688580121,
    y: 1.2897197595777108,
    width: 50,
    height: 30,
    name: "Desk Area 3",
    type: "workspace",
    rotation: 0
  },
  {
    id: "desk-area-1752395775134",
    x: 49.94791615126461,
    y: 28.841121432287462,
    width: 12,
    height: 12,
    name: "Desk Area 4",
    type: "workspace",
    rotation: 0
  },
  {
    id: "desk-area-1752395775837",
    x: 36.36160756763919,
    y: 55.36448572914999,
    width: 129,
    height: 24,
    name: "Desk Area 6",
    type: "workspace",
    rotation: 131782036915220080
  },
  {
    id: "desk-area-1752395776101",
    x: 166.74106283098268,
    y: 51.66355117609926,
    width: 42,
    height: 27,
    name: "Desk Area 7",
    type: "workspace",
    rotation: 0
  },
  {
    id: "desk-area-1752395776373",
    x: 21.220239567815796,
    y: 63.99999968626786,
    width: 14,
    height: 15,
    name: "Desk Area 8",
    type: "workspace",
    rotation: 0
  },
  {
    id: "desk-area-1752395776685",
    x: 144.06993344746257,
    y: 61.9439249345732,
    width: 20,
    height: 15,
    name: "Desk Area 9",
    type: "workspace",
    rotation: 0
  },
  {
    id: "desk-area-1752396144756",
    x: 0.5952409950833473,
    y: 64.411214636607,
    width: 20,
    height: 15,
    name: "Desk Area 1",
    type: "workspace",
    rotation: 0
  }

];

// Floor symbols (doors, washrooms, emergency exits, etc.)
// Total floor symbols: 6
export const floorSymbols: FloorSymbol[] = [
  
];

// Office layout configuration with updated dimensions and position
// Layout dimensions: 210x160, Position: (0.0, 0.0)
export const officeLayout: OfficeLayout = {
  x: 0,
  y: 0,
  width: 210,
  height:82,
  fillColor: "hsl(var(--muted))",
  fillOpacity: 0.1,
  strokeColor: "hsl(var(--border))",
  strokeWidth: 1
};
