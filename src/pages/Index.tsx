import Navigation from '@/components/Navigation';
import BookingDashboard from '@/components/BookingDashboard';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="container mx-auto px-4 py-6">
        <BookingDashboard />
      </div>
    </div>
  );
};

export default Index;
