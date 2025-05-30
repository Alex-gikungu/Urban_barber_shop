import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', phone: '' });

  useEffect(() => {
    fetchStaff();
  }, []);

const fetchStaff = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:5000/api/staff');
    if (Array.isArray(res.data)) {
      setStaffList(res.data);
    } else {
      console.warn('Unexpected response:', res.data);
      setStaffList([]);
    }
  } catch (error) {
    console.error('Error fetching staff:', error);
    setStaffList([]);
  }
};


  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await axios.delete(`http://127.0.0.1:5000/api/staff/${id}`);
        setStaffList(staffList.filter((staff) => staff.id !== id));
      } catch (error) {
        console.error('Error deleting staff:', error);
      }
    }
  };

  const handleEdit = (staff) => {
    setEditingId(staff.id);
    setEditForm({
      name: staff.name,
      email: staff.email,
      role: staff.role,
      phone: staff.phone || ''
    });
  };

  const handleSave = async (id) => {
    try {
      await axios.patch(`http://127.0.0.1:5000/api/staff/${id}`, editForm);
      setEditingId(null);
      fetchStaff();
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white py-10 px-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Staff Members</h1>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700 text-sm md:text-base">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-3 border border-gray-700">Name</th>
              <th className="p-3 border border-gray-700">Email</th>
              <th className="p-3 border border-gray-700">Role</th>
              <th className="p-3 border border-gray-700">Phone</th>
              <th className="p-3 border border-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff) => (
              <tr key={staff.id} className="text-center">
                {editingId === staff.id ? (
                  <>
                    <td className="border p-2">
                      <input
                        type="text"
                        className="w-full p-1 text-black"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="email"
                        className="w-full p-1 text-black"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        className="w-full p-1 text-black"
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        className="w-full p-1 text-black"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      />
                    </td>
                    <td className="border p-2 space-x-2">
                      <button
                        onClick={() => handleSave(staff.id)}
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-500 hover:bg-gray-600 px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border p-2">{staff.name}</td>
                    <td className="border p-2">{staff.email}</td>
                    <td className="border p-2">{staff.role}</td>
                    <td className="border p-2">{staff.phone || '-'}</td>
                    <td className="border p-2 space-x-2">
                      <button
                        onClick={() => handleEdit(staff)}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(staff.id)}
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Staff;
