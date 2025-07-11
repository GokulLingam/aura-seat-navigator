import Navigation from '@/components/Navigation';
import FloorPlan from '@/components/FloorPlan';

const FloorPlanPage = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="container mx-auto px-4 py-6">
        <FloorPlan />
      </div>
    </div>
  );
};

export default FloorPlanPage;