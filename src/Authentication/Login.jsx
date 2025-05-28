import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineMail, AiOutlineLock, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { GoogleLogin } from '@react-oauth/google';
import { Link } from 'react-router-dom';
import { useAuth } from '../Authentication/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      toast.success('Login successful!');
    } catch (error) {
      toast.error('Login failed: Invalid credentials');
      console.error('Login error:', error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log('Google Sign-In Response:', credentialResponse);
    try {
      const response = await fetch('http://localhost:5000/api/auth/google/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        await login(data.user.email, null, data.token); // Pass token directly
        toast.success('Google Login successful!');
      } else {
        toast.error(data.error || 'Google Login failed');
        console.error('Google Login Error Response:', data);
      }
    } catch (error) {
      toast.error('Google Login failed!');
      console.error('Google login error:', error);
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google Sign-In Failure:', error);
    toast.error('Google Login failed! Check console for details.');
  };

  return (
    <div className="relative min-h-screen bg-black/95 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://insights.ibx.com/wp-content/uploads/2023/06/kym-barbershop.jpg')`,
          filter: 'brightness(0.4)',
          zIndex: 0,
        }}
      ></div>
      <div className="absolute inset-0 bg-black/50 z-0" />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="bg-black/70 p-8 rounded-lg shadow-lg w-full max-w-lg animate-fade-in">
          <h2 className="text-3xl font-bold mb-8 text-center text-white">Login</h2>
          <ToastContainer position="top-right" autoClose={3000} />
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg mb-2 text-white">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-200">
                  <AiOutlineMail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 pl-10 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition duration-300"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-lg mb-2 text-white">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-200">
                  <AiOutlineLock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full p-3 pl-10 pr-10 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition duration-300"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-200"
                >
                  {showPassword ? <AiOutlineEyeInvisible className="w-5 h-5" /> : <AiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg hover:scale-105 hover:shadow-lg transition duration-300"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-200">or</div>

          <div className="mt-4 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              theme="filled_black"
              size="large"
              shape="rectangular"
              width="100%"
            />
          </div>

          <p className="mt-6 text-center text-sm text-gray-200">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;