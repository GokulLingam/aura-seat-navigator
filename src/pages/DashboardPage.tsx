import BookingDashboard from '@/components/BookingDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import { useAuth } from '@/hooks/useAuth';

const DashboardPage = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <BookingDashboard />
    </div>
  );
};

export default DashboardPage; 