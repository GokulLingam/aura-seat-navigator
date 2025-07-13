import BookingDashboard from '@/components/BookingDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import { useAuth } from '@/hooks/useAuth';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-6">
      {user?.role === 'admin' ? (
        <AdminDashboard />
      ) : (
        <BookingDashboard />
      )}
    </div>
  );
};

export default DashboardPage; 