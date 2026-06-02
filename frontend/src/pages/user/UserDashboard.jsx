import { Routes, Route } from 'react-router-dom';
import UserLayout from '../../layouts/UserLayout';
import DashboardHome from './DashboardHome';
import MyProfile from './MyProfile';
import MyBookings from './MyBookings';
import BookingHistory from './BookingHistory';
import DownloadPDF from './DownloadPDF';

const UserDashboard = () => {
  return (
    <UserLayout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="history" element={<BookingHistory />} />
        <Route path="download/:id" element={<DownloadPDF />} />
      </Routes>
    </UserLayout>
  );
};

export default UserDashboard;
