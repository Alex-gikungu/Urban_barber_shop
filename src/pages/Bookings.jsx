import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/bookings/')
      .then((res) => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching bookings:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 sm:p-12">
      <div className="max-w-7xl mx-auto bg-gray-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-white mb-6 border-b border-gray-600 pb-2">
          All Bookings
        </h1>

        {loading ? (
          <p className="text-center text-gray-400">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="text-center text-gray-400">No bookings available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-700 rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-700 text-gray-100 text-left">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Phone Number</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Barber</th>
                  <th className="px-4 py-3">Created At</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr key={booking.id} className="hover:bg-gray-700 border-b border-gray-600">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{booking.date}</td>
                    <td className="px-4 py-2">{booking.time}</td>
                    <td className="px-4 py-2">{booking.phone_number}</td>
                    <td className="px-4 py-2">{booking.service || 'N/A'}</td>
                    <td className="px-4 py-2">{booking.barber || 'N/A'}</td>
                    <td className="px-4 py-2">{booking.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
