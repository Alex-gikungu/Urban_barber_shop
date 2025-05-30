import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { api } from '../Authentication/AuthContext';
import { useAuth } from '../Authentication/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

// Static services list
const services = [
  'Classic Haircut',
  'Beard Trim',
  'Hot Towel Shave',
  'Hair Coloring',
  'Hair Wash',
  'Hair Styling',
  'Scalp Massage',
  'Kids Haircut',
  'Fade Haircut',
  'Line-Up',
  'Facial Treatment',
  'Dreadlock Styling',
];

const Appointments = () => {
  const { user, isLoggedIn, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialService = query.get('service') || '';
  const initialBarber = query.get('barber') || '';

  const [appointments, setAppointments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [formData, setFormData] = useState({
    service: initialService,
    notes: '',
    status: 'pending',
    barber_id: '',
  });
  const [date, setDate] = useState(null);
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStaff = async () => {
    try {
      const res = await api.get('/staff/');
      const barbers = res.data.filter((staff) => staff.role.toLowerCase() === 'barber');
      setStaffList(barbers);
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  const fetchAppointments = async () => {
    if (!isLoggedIn || !token) {
      setError('Please log in to view appointments.');
      navigate('/login');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/appointments/user/${user.id}`);
      setAppointments(res.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      if (error.response?.data?.error === 'Token expired') {
        setError('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        setError(
          error.response?.data?.error ||
          'Failed to fetch appointments. Please check your network or try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const bookAppointment = async (data) => {
    if (!token) {
      setError('No authentication token found. Please log in again.');
      navigate('/login');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log('Sending appointment data:', data);
      await api.post('/appointments/', data);
      await fetchAppointments();
    } catch (error) {
      console.error('Error booking appointment:', error);
      if (error.response?.data?.error === 'Token expired') {
        setError('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        throw new Error(
          error.response?.data?.error ||
          'Failed to book appointment. Please check your network or try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    if (!token) {
      setError('No authentication token found. Please log in again.');
      navigate('/login');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.put(`/appointments/${id}`, { status: 'cancelled' }); // Update status to cancelled
      await fetchAppointments();
    } catch (error) {
      console.error('Error canceling appointment:', error);
      if (error.response?.data?.error === 'Token expired') {
        setError('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        setError(
          error.response?.data?.error ||
          'Failed to cancel appointment. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const reappoint = (appt) => {
    // Pre-fill the form with the cancelled appointment's details
    setFormData({
      service: appt.service,
      notes: appt.notes || '',
      status: 'pending',
      barber_id: appt.barber_id.toString(),
    });
    const apptDate = new Date(appt.date);
    setDate(apptDate);
    setTime(apptDate.toTimeString().slice(0, 5)); // Extract HH:MM
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to the form
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
  };

  const handleTimeChange = (e) => {
    setTime(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isLoggedIn || !token) {
      setError('Please log in to book an appointment.');
      navigate('/login');
      return;
    }
    if (!formData.service || !formData.barber_id || !date || !time) {
      setError('Please fill in all required fields (service, barber, date, and time).');
      return;
    }

    if (!/^\d{2}:\d{2}$/.test(time)) {
      setError('Invalid time format. Please use HH:MM (e.g., 14:30).');
      return;
    }

    let isoDate;
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const dateTime = new Date(date);
      dateTime.setHours(hours, minutes, 0, 0);
      if (isNaN(dateTime.getTime())) {
        throw new Error('Invalid date or time');
      }
      isoDate = dateTime.toISOString();
    } catch (err) {
      setError('Failed to process date and time. Please ensure valid inputs.');
      return;
    }

    const appointmentData = {
      customer_id: user.id,
      barber_id: parseInt(formData.barber_id),
      service: formData.service,
      status: formData.status,
      date: isoDate,
      notes: formData.notes,
    };

    try {
      await bookAppointment(appointmentData);
      setFormData({ service: '', notes: '', status: 'pending', barber_id: '' });
      setDate(null);
      setTime('');
      alert('Appointment booked successfully!');
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchStaff();
  }, [isLoggedIn, user, token]);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-10 px-6">
      {isLoggedIn ? (
        <div className="flex flex-col md:flex-row gap-10 items-start justify-center">
          {/* Appointment Form */}
          <div className="w-full md:w-1/2">
            <form
              onSubmit={handleSubmit}
              className="bg-black/70 rounded-lg p-8 max-w-lg w-full shadow-lg animate-fade-in"
            >
              <h2 className="text-3xl font-bold text-center mb-8">Book an Appointment</h2>

              {error && (
                <div className="mb-6 p-3 bg-red-600 text-white rounded-lg">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-lg mb-2">Service</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition duration-300"
                >
                  <option value="" disabled>Select a service</option>
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-lg mb-2">Barber</label>
                <select
                  name="barber_id"
                  value={formData.barber_id}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition duration-300"
                >
                  <option value="" disabled>Select a barber</option>
                  {staffList.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-lg mb-2">Date</label>
                <DatePicker
                  selected={date}
                  onChange={handleDateChange}
                  placeholderText="Select a date"
                  className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition duration-300"
                  calendarClassName="bg-gray-800 text-white border-gray-600"
                  dayClassName={() => 'text-white hover:bg-blue-400'}
                  popperClassName="bg-gray-800 text-white"
                  minDate={new Date()}
                />
              </div>

              <div className="mb-6">
                <label className="block text-lg mb-2">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={handleTimeChange}
                  className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition duration-300"
                />
              </div>

              <div className="mb-6">
                <label className="block text-lg mb-2">Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition duration-300"
                  placeholder="Any specific requests or notes?"
                  rows="4"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg hover:scale-105 hover:shadow-lg transition duration-300"
                disabled={loading || !isLoggedIn}
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
            </form>
          </div>

          {/* Appointment List */}
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl font-semibold mb-6 text-white">Your Appointments</h2>
            {loading && <p className="text-center text-gray-400">Loading...</p>}
            {appointments.length === 0 ? (
              <p className="text-gray-400 bg-gray-800 p-4 rounded-lg shadow">
                You have no appointments scheduled.
              </p>
            ) : (
              <ul className="space-y-4">
                {appointments.map((appt) => {
                  const formattedDate = appt.date
                    ? new Date(appt.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A';
                  const formattedTime = appt.date
                    ? new Date(appt.date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A';

                  return (
                    <li
                      key={appt.id}
                      className="bg-gray-800 text-white p-5 rounded-lg flex flex-col md:flex-row md:justify-between items-start md:items-center transition-all hover:shadow-lg"
                    >
                      <div>
                        <p><strong>Service:</strong> {appt.service_name || appt.service || 'N/A'}</p>
                        <p><strong>Barber:</strong> {appt.barber_name || 'N/A'}</p>
                        <p><strong>Date:</strong> {formattedDate}</p>
                        <p><strong>Time:</strong> {formattedTime}</p>
                        <p>
                          <strong>Status:</strong>{' '}
                          <span
                            className={`px-2 py-1 rounded text-sm text-white ${
                              appt.status === 'pending'
                                ? 'bg-yellow-500'
                                : appt.status === 'confirmed'
                                ? 'bg-green-600'
                                : appt.status === 'cancelled'
                                ? 'bg-red-600'
                                : 'bg-gray-600'
                            }`}
                          >
                            {appt.status}
                          </span>
                        </p>
                        {appt.notes && <p><strong>Notes:</strong> {appt.notes}</p>}
                      </div>
                      {appt.status === 'pending' && (
                        <button
                          onClick={() => cancelAppointment(appt.id)}
                          className="mt-4 md:mt-0 bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white"
                        >
                          Cancel
                        </button>
                      )}
                      {appt.status === 'cancelled' && (
                        <button
                          onClick={() => reappoint(appt)}
                          className="mt-4 md:mt-0 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white"
                        >
                          Re-appoint
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center text-lg text-white">Please log in to view or book appointments.</p>
      )}
    </div>
  );
};

export default Appointments;