// import { useState, useEffect } from 'react';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { useAuth } from '../Authentication/AuthContext';
// import { useLocation } from 'react-router-dom';

// // Static mapping of barber names to User.id (replace with actual IDs from your User table)
// const barberMapping = {
//   'John': 2, // Example: User.id for John
//   'Michael': 3,
//   'David': 4,
//   'Alex': 5,
//   'Samuel': 6,
//   'James': 7,
//   'Peter': 8,
//   'Oliver': 9,
//   'Chris': 10,
//   'Mark': 11,
//   'Daniel': 12,
//   'Luke': 13,
// };

// // Barber services (same as in Services.jsx)
// const services = [
//   'Classic Haircut',
//   'Beard Trim',
//   'Hot Towel Shave',
//   'Hair Coloring',
//   'Hair Wash',
//   'Hair Styling',
//   'Scalp Massage',
//   'Kids Haircut',
//   'Fade Haircut',
//   'Line-Up',
//   'Facial Treatment',
//   'Dreadlock Styling',
// ];

// const AppointmentForm = ({ onBook }) => {
//   const { user, isLoggedIn } = useAuth();
//   const location = useLocation();
//   const query = new URLSearchParams(location.search);
//   const initialService = query.get('service') || '';
//   const initialBarber = query.get('barber') || '';

//   const [formData, setFormData] = useState({
//     service: initialService,
//     notes: '',
//     status: 'pending',
//     barber_id: barberMapping[initialBarber] || '',
//   });
//   const [date, setDate] = useState(null);
//   const [time, setTime] = useState('');

//   useEffect(() => {
//     if (initialBarber && barberMapping[initialBarber]) {
//       setFormData((prev) => ({ ...prev, barber_id: barberMapping[initialBarber] }));
//     }
//   }, [initialBarber]);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleDateChange = (selectedDate) => {
//     setDate(selectedDate);
//   };

//   const handleTimeChange = (e) => {
//     setTime(e.target.value);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!isLoggedIn) {
//       alert('Please log in to book an appointment.');
//       return;
//     }
//     if (!formData.service || !formData.barber_id || !date || !time) {
//       alert('Please fill in all required fields (service, barber, date, and time).');
//       return;
//     }

//     const dateTime = date ? new Date(date).setHours(...time.split(':').map(Number)) : null;
//     const isoDate = dateTime ? new Date(dateTime).toISOString() : null;

//     const appointmentData = {
//       customer_id: user.id,
//       barber_id: parseInt(formData.barber_id),
//       service: formData.service,
//       status: formData.status,
//       date: isoDate,
//       notes: formData.notes,
//     };

//     try {
//       await onBook(appointmentData);
//       setFormData({ service: '', notes: '', status: 'pending', barber_id: '' });
//       setDate(null);
//       setTime('');
//       alert('Appointment booked successfully!');
//     } catch (error) {
//       console.error('Error booking appointment:', error);
//       alert(`Failed to book appointment: ${error.response?.data?.error || 'Please try again.'}`);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-black/95 text-white py-12 px-6 md:px-12 flex items-center justify-center">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-black/70 rounded-lg p-8 max-w-lg w-full shadow-lg animate-fade-in"
//       >
//         <h2 className="text-3xl font-bold text-center mb-8">Book an Appointment</h2>

//         <div className="mb-6">
//           <label className="block text-lg mb-2">Service</label>
//           <select
//             name="service"
//             value={formData.service}
//             onChange={handleChange}
//             className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition duration-300"
//           >
//             <option value="" disabled>Select a service</option>
//             {services.map((service) => (
//               <option key={service} value={service}>
//                 {service}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="mb-6">
//           <label className="block text-lg mb-2">Barber</label>
//           <select
//             name="barber_id"
//             value={formData.barber_id}
//             onChange={handleChange}
//             className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition duration-300"
//           >
//             <option value="" disabled>Select a barber</option>
//             {Object.keys(barberMapping).map((barberName) => (
//               <option key={barberName} value={barberMapping[barberName]}>
//                 {barberName}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="mb-6">
//           <label className="block text-lg mb-2">Date</label>
//           <DatePicker
//             selected={date}
//             onChange={handleDateChange}
//             placeholderText="Select a date"
//             className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition duration-300"
//             calendarClassName="bg-gray-800 text-white border-gray-600"
//             dayClassName={() => 'text-white hover:bg-blue-400'}
//             popperClassName="bg-gray-800 text-white"
//             minDate={new Date()}
//           />
//         </div>

//         <div className="mb-6">
//           <label className="block text-lg mb-2">Time</label>
//           <input
//             type="time"
//             value={time}
//             onChange={handleTimeChange}
//             className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition duration-300"
//           />
//         </div>

//         <div className="mb-6">
//           <label className="block text-lg mb-2">Additional Notes</label>
//           <textarea
//             name="notes"
//             value={formData.notes}
//             onChange={handleChange}
//             className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition duration-300"
//             placeholder="Any specific requests or notes?"
//             rows="4"
//           />
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg hover:scale-105 hover:shadow-lg transition duration-300"
//           disabled={!isLoggedIn}
//         >
//           Book Appointment
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AppointmentForm;