import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { EyeIcon, EyeSlashIcon, UserIcon, EnvelopeIcon, LockClosedIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const navigate = useNavigate(); // ✅ Initialize navigate
  const [form, setForm] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'barber',
    invitationCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      alert('Registration successful!');
      setForm({ fullname: '', email: '', password: '', confirmPassword: '', role: 'barber', invitationCode: '' });
      navigate('/login'); // ✅ Redirect to login page
    } catch (err) {
      alert('Registration failed. Check your input.');
      console.error(err);
    }
  };

  return (
    <div className="relative min-h-screen bg-black/95 text-white">
      {/* Background and overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://img1.wsimg.com/isteam/ip/c118cbcb-d10b-44fc-b513-6c49ad791ec3/blob.png/:/cr=t:16.67%25,l:0%25,w:100%25,h:66.67%25')",
          filter: 'brightness(0.4)',
          zIndex: 0,
        }}
      ></div>
      <div className="absolute inset-0 bg-black/50" style={{ zIndex: 1 }}></div>

      {/* Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="bg-black/70 p-8 rounded-lg shadow-lg w-full max-w-lg animate-fade-in">
          <h2 className="text-3xl font-bold mb-8 text-center text-white">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Full Name */}
            <div>
              <label className="block text-lg mb-2 text-white">Full Name</label>
              <div className="relative">
                <UserIcon className="w-5 h-5 absolute top-3 left-3 text-gray-200" />
                <input
                  type="text"
                  name="fullname"
                  value={form.fullname}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition duration-300"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-lg mb-2 text-white">Email</label>
              <div className="relative">
                <EnvelopeIcon className="w-5 h-5 absolute top-3 left-3 text-gray-200" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition duration-300"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-lg mb-2 text-white">Password</label>
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 absolute top-3 left-3 text-gray-200" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 pr-10 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition duration-300"
                  placeholder="Enter your password"
                  required
                />
                <span
                  className="absolute top-3 right-3 cursor-pointer text-gray-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-lg mb-2 text-white">Confirm Password</label>
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 absolute top-3 left-3 text-gray-200" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 pr-10 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition duration-300"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            {/* Invitation Code */}
            <div>
              <label className="block text-lg mb-2 text-white">Invitation Code</label>
              <input
                type="text"
                name="invitationCode"
                value={form.invitationCode}
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition duration-300"
                placeholder="Enter invitation code (if any)"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-lg mb-2 text-white">Role</label>
              <div className="relative">
                <UserGroupIcon className="w-5 h-5 absolute top-3 left-3 text-gray-200" />
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition duration-300"
                >
                  <option value="barber">Barber</option>
                  <option value="admin">Admin</option>
                  <option value="receptionist">Receptionist</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition duration-300"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
