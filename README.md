# UPS Reserve - Office Space Booking System

A modern, interactive office space booking and management system built with React and TypeScript.

## Features

- **Interactive Floor Plan**: Visual seat and resource booking with drag-and-drop functionality
- **Real-time Booking**: Book seats and resources with recurring booking options
- **Equipment Filtering**: Filter seats by available equipment (Monitor, Dock, Window Seat)
- **Multi-location Support**: Support for multiple floors, buildings, and office locations
- **Admin Controls**: Edit mode for floor plan customization and management
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd aura-seat-navigator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

## Usage

### Booking Seats
1. Navigate to the "Book Seats" tab
2. Select your preferred floor, building, and office location
3. Use equipment filters to find seats with specific amenities
4. Click on an available seat to view details and book
5. Choose booking options including recurring bookings

### Booking Resources
1. Navigate to the "Book Resource" tab
2. Select a resource type (meeting rooms, equipment, amenities)
3. Choose your preferred date and time slot
4. Confirm your booking

### Admin Features (Edit Mode)
1. Enable "Edit Mode" in the Book Seats section
2. Create new seats and desk areas
3. Drag and drop to reposition items
4. Adjust dimensions and rotations
5. Save changes to update the floor plan

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **Build Tool**: Vite
- **Icons**: Lucide React
- **State Management**: React Hooks

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── FloorPlan.tsx   # Main floor plan component
│   ├── ResourceBooking.tsx # Resource booking component
│   └── Navigation.tsx  # Navigation component
├── data/               # Data files
│   └── floorPlanData.ts # Floor plan configuration
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── pages/              # Page components
└── lib/                # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for UPS Reserve.

## Support

For support and questions, please contact the development team.
