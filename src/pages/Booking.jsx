import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Authentication/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar, Clock, User, DollarSign, Phone } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const Booking = () => {
  const { user, isLoggedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get service details from location state
  const { serviceId, title, barberName, price, discountPrice } = location.state || {};
  const finalPrice = discountPrice || price;

  // State for booking form
  const [booking, setBooking] = useState({
    date: null,
    time: '',
    phoneNumber: '',
  });

  // Available time slots (example, adjust as needed)
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  ];

  // Axios instance
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
  });

  // Set Authorization header
  const token = localStorage.getItem('token');
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Handle form changes
  const handleDateChange = (date) => {
    setBooking({ ...booking, date });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBooking({ ...booking, [name]: value });
  };

  // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!isLoggedIn) {
    toast.error('Please log in to book an appointment.');
    navigate('/login');
    return;
  }

  if (!booking.date || !booking.time || !booking.phoneNumber) {
    toast.error('Please fill in all fields.');
    return;
  }

  // if (!barberId) {
  //   toast.error('No barber selected. Please select a barber.');
  //   navigate('/services'); // Or redirect to a barber selection page
  //   return;
  // }

const phoneRegex = /^(?:\+2547\d{8}|07\d{8}|011\d{7})$/;

if (!phoneRegex.test(booking.phoneNumber)) {
  toast.error('Please enter a valid Kenyan phone number (e.g., 07xxxxxxxx, +2547xxxxxxxx, or 011xxxxxxx).');
  return;
}


  try {
    const formattedDate = booking.date.toISOString().split('T')[0];

    // Debug payload
    console.log('Booking payload:', {
      user_id: user.id,
      service_id: serviceId,
      // barber_id: barberId,
      date: formattedDate,
      time: booking.time,
      phone_number: booking.phoneNumber,
      notes: `Booking for ${title}`,
    });

    const bookingResponse = await axiosInstance.post('/bookings/', {
      user_id: user.id,
      service_id: serviceId,
      // barber_id: barberId,
      date: formattedDate,
      time: booking.time,
      phone_number: booking.phoneNumber,
      notes: `Booking for ${title}`,
    });

    const bookingId = bookingResponse.data.booking_id;

    const paymentResponse = await axiosInstance.post('/payments/', {
      user_id: user.id,
      booking_id: bookingId,
      amount: finalPrice,
      payment_method: 'mpesa',
      phone_number: booking.phoneNumber.startsWith('+254')
        ? booking.phoneNumber
        : `+254${booking.phoneNumber.startsWith('0') ? booking.phoneNumber.slice(1) : booking.phoneNumber}`,
    });

    toast.success('Booking created! Complete the M-Pesa payment on your phone.');
    console.log('Payment response:', paymentResponse.data);
    setTimeout(() => navigate('/profile'), 3000);
  } catch (err) {
    console.error('Booking error:', err);
    toast.error(err.response?.data?.error || 'Failed to create booking or initiate payment.');
  }
};

  // Prevent past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!serviceId) {
    return (
      <div className="min-h-screen bg-gray-900 text-white py-12 px-6">
        <h2 className="text-4xl font-bold text-center mb-12">Error</h2>
        <p className="text-center">No service selected. Please go back to the services page.</p>
        <button
          onClick={() => navigate('/services')}
          className="mt-4 mx-auto block bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
        >
          Back to Services
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-900 text-white py-12 px-6">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://insights.ibx.com/wp-content/uploads/2023/06/kym-barbershop.jpg')`,
          filter: 'brightness(0.4)',
          zIndex: 0,
        }}
      ></div>
      <div className="absolute inset-0 bg-black/50 z-0" />
      <div className="relative z-10 max-w-2xl mx-auto">
        <ToastContainer position="top-right" autoClose={3000} />
        <h2 className="text-4xl font-bold text-center mb-12">Book Your Visit</h2>
        <div className="bg-black/70 p-8 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold mb-6">{title}</h3>
          <div className="space-y-4 mb-6">
            <p className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              <strong>Barber:</strong> {barberName}
            </p>
            <p className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              <strong>Price:</strong>{' '}
              {discountPrice ? (
                <span>
                  <span className="line-through text-gray-400 mr-2">{price} KES</span>
                  <span className="text-green-400">{discountPrice} KES</span>
                </span>
              ) : (
                `${price} KES`
              )}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center text-lg mb-2">
                <Calendar className="w-5 h-5 mr-2" />
                Date
              </label>
              <DatePicker
                selected={booking.date}
                onChange={handleDateChange}
                minDate={today}
                dateFormat="MMMM d, yyyy"
                placeholderText="Select a date"
                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="flex items-center text-lg mb-2">
                <Clock className="w-5 h-5 mr-2" />
                Time
              </label>
              <select
                name="time"
                value={booking.time}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
              >
                <option value="">Select a time</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center text-lg mb-2">
                <Phone className="w-5 h-5 mr-2" />
                Phone Number (for M-Pesa)
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={booking.phoneNumber}
                onChange={handleInputChange}
                placeholder="e.g., 0712345678 or +254712345678"
                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg hover:scale-105 transition duration-300"
            >
              Confirm Booking & Pay
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;