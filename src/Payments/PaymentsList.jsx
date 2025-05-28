import { useEffect, useState } from 'react';
import axios from 'axios';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState('');

  const fetchPayments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/payments');
      setPayments(res.data);
    } catch (err) {
      console.error('Error fetching payments', err);
    }
  };

  const deletePayment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;

    try {
      await axios.delete(`http://localhost:5000/payments/${id}`);
      setMessage('Payment deleted');
      setPayments(payments.filter(payment => payment.id !== id));
    } catch (err) {
      setMessage('Failed to delete payment');
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Payment List</h2>
      {message && <p className="mb-2 text-green-600">{message}</p>}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">User</th>
              <th className="border px-4 py-2">Appointment</th>
              <th className="border px-4 py-2">Amount</th>
              <th className="border px-4 py-2">Method</th>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">No payments found.</td>
              </tr>
            ) : (
              payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{p.id}</td>
                  <td className="border px-4 py-2">{p.user_id}</td>
                  <td className="border px-4 py-2">{p.appointment_id}</td>
                  <td className="border px-4 py-2">KES {p.amount}</td>
                  <td className="border px-4 py-2">{p.payment_method}</td>
                  <td className="border px-4 py-2">{new Date(p.payment_date).toLocaleString()}</td>
                  <td className="border px-4 py-2 text-center">
                    <button onClick={() => deletePayment(p.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentList;
