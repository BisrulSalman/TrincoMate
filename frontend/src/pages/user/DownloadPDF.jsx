import { useParams, Link } from 'react-router-dom';
import { userBookings, userBookingHistory, userProfile } from '../../data/mockData';
import { Download, ArrowLeft, Printer } from 'lucide-react';

const DownloadPDF = () => {
  const { id } = useParams();
  const allBookings = [...userBookings, ...userBookingHistory];
  const booking = allBookings.find(b => b.id === id) || allBookings[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <Link to="/user/bookings" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-light)', fontWeight: '500' }}>
          <ArrowLeft size={18} /> Back to Bookings
        </Link>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePrint} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={18} /> Print
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => alert('Mock PDF Download Started!')}>
            <Download size={18} /> Download PDF
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '40px', backgroundColor: '#fff', borderTop: '8px solid var(--primary-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', color: 'var(--primary-color)', marginBottom: '4px' }}>TrincoMate</h1>
            <p style={{ color: 'var(--text-light)' }}>Booking Receipt & Ticket</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ fontSize: '18px' }}>Booking ID: {booking.id}</h3>
            <p style={{ color: 'var(--text-light)' }}>Status: <span style={{ color: booking.status === 'Approved' ? '#10b981' : booking.status === 'Rejected' ? '#e53935' : '#f59e0b', fontWeight: 'bold' }}>{booking.status}</span></p>
          </div>
        </div>

        <div className="grid-2" style={{ gap: '40px', marginBottom: '40px' }}>
          <div>
            <h3 style={{ fontSize: '16px', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '10px' }}>Customer Details</h3>
            <p style={{ fontWeight: '600', fontSize: '18px' }}>{userProfile.name}</p>
            <p style={{ color: 'var(--text-light)' }}>{userProfile.email}</p>
            <p style={{ color: 'var(--text-light)' }}>{userProfile.phone}</p>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '10px' }}>Service Details</h3>
            <p style={{ fontWeight: '600', fontSize: '18px' }}>{booking.serviceName}</p>
            <p style={{ color: 'var(--text-light)' }}>Type: {booking.serviceType}</p>
          </div>
        </div>

        <table style={{ border: '1px solid #e2e8f0', width: '100%' }}>
          <thead style={{ backgroundColor: '#f8fafc' }}>
            <tr>
              <th style={{ borderBottom: '1px solid #e2e8f0' }}>Description</th>
              <th style={{ borderBottom: '1px solid #e2e8f0' }}>Check-in</th>
              <th style={{ borderBottom: '1px solid #e2e8f0' }}>Check-out</th>
              <th style={{ borderBottom: '1px solid #e2e8f0' }}>Guests</th>
              <th style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '15px' }}>{booking.serviceName} Booking</td>
              <td style={{ padding: '15px' }}>{booking.checkIn}</td>
              <td style={{ padding: '15px' }}>{booking.checkOut}</td>
              <td style={{ padding: '15px' }}>{booking.guests}</td>
              <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', fontSize: '18px' }}>${booking.totalPrice}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: '40px', textAlign: 'center', color: 'var(--text-light)', fontSize: '14px' }}>
          <p>Thank you for booking with TrincoMate!</p>
          <p>If you have any questions, contact us at support@trincomate.com</p>
        </div>
      </div>
    </div>
  );
};

export default DownloadPDF;
