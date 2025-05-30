import React, { useEffect, useState } from 'react';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }
      const response = await fetch('http://127.0.0.1:5000/api/appointments/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      setAppointments(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await fetch(`http://127.0.0.1:5000/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchAppointments();
      } else {
        const errorData = await response.json();
        console.error('Failed to update appointment:', errorData.error || response.statusText);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) {
    return <p className="text-center mt-10 text-gray-400">Loading appointments...</p>;
  }

  return (
    <div className="p-4 min-h-screen bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">All Appointments</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="bg-gray-800 shadow-md rounded-lg p-4 border border-gray-700">
            <p className="mb-1"><span className="font-semibold">Customer:</span> {appointment.customer_name || 'N/A'}</p>
            <p className="mb-1"><span className="font-semibold">Barber:</span> {appointment.barber_name || 'N/A'}</p>
            <p className="mb-1"><span className="font-semibold">Service:</span> {appointment.service_name || 'N/A'}</p>
            <p className="mb-1"><span className="font-semibold">Date:</span> {appointment.date ? new Date(appointment.date).toLocaleString() : 'N/A'}</p>
            <p className="mb-1">
              <span className="font-semibold">Status:</span>
              <span className={`ml-1 px-2 py-1 rounded text-white text-sm ${appointment.status === 'pending' ? 'bg-yellow-500' : appointment.status === 'confirmed' ? 'bg-green-600' : 'bg-red-600'}`}>
                {appointment.status}
              </span>
            </p>
            {appointment.notes && <p className="mb-2"><span className="font-semibold">Notes:</span> {appointment.notes}</p>}

            <div className="flex justify-between mt-4">
              <button
                onClick={() => updateStatus(appointment.id, 'confirmed')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded"
              >
                Accept
              </button>
              <button
                onClick={() => updateStatus(appointment.id, 'cancelled')}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentList;