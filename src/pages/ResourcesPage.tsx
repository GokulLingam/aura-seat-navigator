import Navigation from '@/components/Navigation';
import ResourceBooking from '@/components/ResourceBooking';

const ResourcesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="container mx-auto px-4 py-6">
        <ResourceBooking />
      </div>
    </div>
  );
};

export default ResourcesPage;