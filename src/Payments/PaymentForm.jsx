import { useState } from 'react';
import axios from 'axios';

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    user_id: '',
    appointment_id: '',
    amount: '',
    payment_method: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.user_id || !formData.appointment_id || !formData.amount || !formData.payment_method) {
      setMessage('Please fill in all fields.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/payments', formData);
      setMessage(res.data.message);
      setFormData({
        user_id: '',
        appointment_id: '',
        amount: '',
        payment_method: '',
      });
    } catch (error) {
      setMessage(error.response?.data?.error || 'Payment failed.');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Submit Payment</h2>
      {message && <p className="mb-4 text-sm text-blue-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="user_id" placeholder="User ID" value={formData.user_id} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
        <input name="appointment_id" placeholder="Appointment ID" value={formData.appointment_id} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
        <input name="amount" type="number" placeholder="Amount" value={formData.amount} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
        <input name="payment_method" placeholder="Payment Method (e.g., M-Pesa)" value={formData.payment_method} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Submit</button>
      </form>
    </div>
  );
};

export default PaymentForm;
