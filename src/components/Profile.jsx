import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Calendar, Bell, Star, MessageSquare, Copy } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../Authentication/AuthContext';

const Profile = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  // State for user profile
  const [userProfile, setUserProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    profileImage: 'https://via.placeholder.com/150',
    referralCode: '',
    preferences: '',
    loyaltyPoints: 0,
    visitCount: 0,
    stars: 0,
    nextAppointment: null,
    frequency: 'monthly',
  });

  // Schedule state
  const [schedule, setSchedule] = useState({
    date: null,
    frequency: 'weekly',
  });

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Discounts state
  const [discounts, setDiscounts] = useState([]);

  // Review state
  const [newReview, setNewReview] = useState({
    comment: '',
    rating: 0,
    barberId: '',
  });

  // Barbers state
  const [barbers, setBarbers] = useState([]);

  // Preferences state
  const [preferences, setPreferences] = useState('');

  // Track 401 errors
  const [authErrorCount, setAuthErrorCount] = useState(0);
  const maxAuthErrors = 3;

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

  // Handle errors
  const handleError = (err, defaultMessage, endpoint) => {
    if (err.response?.status === 401) {
      console.error(`Auth error at ${endpoint}:`, err.response);
      setAuthErrorCount((prev) => {
        const newCount = prev + 1;
        if (newCount >= maxAuthErrors) {
          toast.error('Session expired. Please log in again.');
          logout();
          setTimeout(() => navigate('/login'), 2000);
        } else {
          toast.warn(`Authentication issue at ${endpoint}. Retrying...`);
        }
        return newCount;
      });
    } else if (err.response?.status === 403) {
      toast.error('You are not authorized to perform this action.');
    } else if (err.response?.status === 404) {
      toast.error(`${defaultMessage} Endpoint not found. Please contact support.`);
      console.warn(`404 at ${endpoint}:`, err);
    } else {
      toast.error(defaultMessage);
      console.error(`Error at ${endpoint}:`, err);
    }
  };

  // Fetch user profile, notifications, and barbers
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get(`/profile/profile/${user.id}`);
        console.log('Profile response:', response.data);
        setUserProfile({
          ...response.data,
          profileImage: response.data.profileImage || 'https://via.placeholder.com/150',
          nextAppointment: response.data.nextAppointment ? new Date(response.data.nextAppointment) : null,
        });
        setPreferences(response.data.preferences || '');
      } catch (err) {
        handleError(err, 'Failed to load profile.', `/profile/profile/${user.id}`);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get(`/profile/notifications/${user.id}`);
        console.log('Notifications response:', response.data);
        setNotifications(response.data);
      } catch (err) {
        handleError(err, 'Failed to load notifications.', `/profile/notifications/${user.id}`);
      }
    };

    const fetchBarbers = async () => {
      try {
        const response = await axiosInstance.get('/staff/barbers');
        console.log('Barbers response:', response.data);
        setBarbers(response.data);
      } catch (err) {
        handleError(err, 'Failed to load barbers.', '/staff/barbers');
        setBarbers([]);
      }
    };

    if (isLoggedIn && user?.id) {
      console.log('Fetching data for user:', user);
      setAuthErrorCount(0);
      fetchProfile();
      fetchNotifications();
      fetchBarbers();
    } else {
      console.warn('No valid user session. Redirecting to login.');
      toast.error('Please log in to view your profile.');
      navigate('/login');
    }
  }, [user, isLoggedIn, navigate]);

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const response = await axiosInstance.post(`/profile/profile-image/${user.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Image upload response:', response.data);
        const imageUrl = response.data.imageUrl || 'https://via.placeholder.com/150';
        setUserProfile({ ...userProfile, profileImage: imageUrl });
        toast.success('Profile image updated successfully!');
      } catch (err) {
        handleError(err, 'Failed to upload image.', `/profile/profile-image/${user.id}`);
      }
    }
  };

  // Handle preferences update
  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.patch(`/profile/preferences/${user.id}`, { preferences });
      console.log('Preferences updated:', preferences);
      setUserProfile({ ...userProfile, preferences });
      toast.success('Preferences updated successfully!');
    } catch (err) {
      handleError(err, 'Failed to update preferences.', `/profile/preferences/${user.id}`);
    }
  };

  // Handle schedule form
  const handleDateChange = (date) => {
    setSchedule({ ...schedule, date });
  };

  const handleScheduleChange = (e) => {
    setSchedule({ ...schedule, [e.target.name]: e.target.value });
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!schedule.date) {
      toast.error('Please select a date.');
      return;
    }
    try {
      const response = await axiosInstance.post('/profile/schedule', {
        user_id: user.id,
        date: schedule.date.toISOString(),
        frequency: schedule.frequency,
      });
      console.log('Schedule response:', response.data);
      const day = schedule.date.getDate();
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        {
          id: prevNotifications.length + 1,
          message: `Shave reminder for ${day}th of each month`,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ]);
      setUserProfile({
        ...userProfile,
        nextAppointment: schedule.date,
        frequency: schedule.frequency,
      });
      toast.success(`Schedule saved: Shave on ${day}th, reminded ${schedule.frequency}`);
    } catch (err) {
      handleError(err, 'Failed to save schedule.', '/profile/schedule');
    }
  };

  // Update loyalty points and visits
  const handleLoyaltyUpdate = async () => {
    try {
      await axiosInstance.patch(`/profile/loyalty/${user.id}`);
      const response = await axiosInstance.get(`/profile/profile/${user.id}`);
      console.log('Loyalty update response:', response.data);
      setUserProfile({
        ...response.data,
        profileImage: response.data.profileImage || 'https://via.placeholder.com/150',
        nextAppointment: response.data.nextAppointment ? new Date(response.data.nextAppointment) : null,
      });
      toast.success('Loyalty points and visit count updated!');
    } catch (err) {
      handleError(err, 'Failed to update loyalty.', `/profile/loyalty/${user.id}`);
    }
  };

  // Toggle notifications dropdown
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await axiosInstance.patch(`/profile/notifications/${id}/read`);
      console.log('Notification marked as read:', id);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      toast.success('Notification marked as read.');
    } catch (err) {
      handleError(err, 'Failed to mark notification as read.', `/profile/notifications/${id}/read`);
    }
  };

  // Copy referral code/link
  const handleCopyReferral = () => {
    const referralLink = `https://smartbarbershop.com/register?ref=${userProfile.referralCode}`;
    navigator.clipboard.write(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  // Handle referral bonus
  const handleReferralBonus = async (referredUserId) => {
    try {
      await axiosInstance.post('/profile/referrals', { referredUserId });
      console.log('Referral bonus applied for user:', referredUserId);
      setDiscounts([...discounts, '10% off your next service for referral!']);
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        {
          id: prevNotifications.length + 1,
          message: 'Referral discount earned! 10% off your next service',
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ]);
      const response = await axiosInstance.get(`/profile/profile/${user.id}`);
      setUserProfile({
        ...response.data,
        profileImage: response.data.profileImage || 'https://via.placeholder.com/150',
        nextAppointment: response.data.nextAppointment ? new Date(response.data.nextAppointment) : null,
      });
      toast.success('Referral bonus applied!');
    } catch (err) {
      handleError(err, 'Failed to process referral.', '/profile/referrals');
    }
  };

  // Handle review form changes
  const handleReviewChange = (e) => {
    setNewReview({ ...newReview, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (rating) => {
    setNewReview({ ...newReview, rating });
  };

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim() || !newReview.barberId || !newReview.rating) {
      toast.error('Please enter a comment, select a barber, and provide a rating.');
      return;
    }
    try {
      await axiosInstance.post('/profile/reviews', {
        customer_id: user.id,
        barber_id: newReview.barberId,
        rating: parseInt(newReview.rating),
        comment: newReview.comment,
      });
      console.log('Review submitted:', newReview);
      toast.success('Review submitted successfully!');
      setNewReview({ comment: '', rating: 0, barberId: '' });
    } catch (err) {
      handleError(err, 'Failed to submit review.', '/profile/reviews');
    }
  };

  // Count unread notifications
  const unreadCount = notifications.filter((notif) => !notif.is_read).length;

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
      <div className="relative z-10 max-w-4xl mx-auto p-6">
        <ToastContainer position="top-right" autoClose={3000} />
        <h1 className="text-4xl font-bold mb-8 text-center">Profile</h1>

        <div className="bg-black/70 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">User Information</h2>
          <img
            src={userProfile.profileImage}
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/150';
              console.warn('Failed to load profile image:', userProfile.profileImage);
            }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block mx-auto mb-4 text-gray-200"
          />
          <p className="text-lg"><strong>Name:</strong> {userProfile.fullName}</p>
          <p className="text-lg"><strong>Email:</strong> {userProfile.email}</p>
          <p className="text-lg"><strong>Phone:</strong> {userProfile.phone || 'Not set'}</p>
          <p className="text-lg flex items-center">
            <strong>Referral Code:</strong> {userProfile.referralCode || 'None'}
            <Copy
              className="ml-2 w-5 h-5 cursor-pointer text-blue-400 hover:text-blue-300"
              onClick={handleCopyReferral}
            />
          </p>
          <p className="text-lg"><strong>Loyalty Points:</strong> {userProfile.loyaltyPoints}</p>
          <p className="text-lg"><strong>Visit Count:</strong> {userProfile.visitCount}</p>
          <p className="text-lg">
            <strong>Stars:</strong> {'★'.repeat(userProfile.stars)}{'☆'.repeat(5 - userProfile.stars)}
          </p>
          <button
            onClick={handleLoyaltyUpdate}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg hover:scale-105 transition duration-300"
          >
            Simulate Visit (Add Loyalty Points)
          </button>
        </div>

        <div className="bg-black/70 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">Preferences</h2>
          <form onSubmit={handlePreferencesSubmit}>
            <textarea
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="Enter your preferences (e.g., preferred barber, haircut style)"
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition duration-300"
            />
            <button
              type="submit"
              className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg hover:scale-105 transition duration-300"
            >
              Save Preferences
            </button>
          </form>
        </div>

        <div className="bg-black/70 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">Schedule</h2>
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-200" />
              <label className="text-lg">Date:</label>
              <DatePicker
                selected={schedule.date || userProfile.nextAppointment}
                onChange={handleDateChange}
                dateFormat="MM/dd/yyyy"
                placeholderText="Select a date"
                className="ml-2 p-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-lg">Frequency:</label>
              <select
                name="frequency"
                value={schedule.frequency || userProfile.frequency}
                onChange={handleScheduleChange}
                className="ml-2 p-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg hover:scale-105 transition duration-300"
            >
              Save Schedule
            </button>
          </form>
        </div>

        <div className="bg-black/70 p-6 rounded-lg shadow-lg mb-6 relative">
          <h2 className="text-2xl font-semibold mb-4">Notifications ({unreadCount} unread)</h2>
          <Bell
            className="w-6 h-6 cursor-pointer text-blue-400 hover:text-blue-300"
            onClick={toggleNotifications}
          />
          {showNotifications && (
            <div
              ref={notificationRef}
              className="absolute top-full left-0 mt-2 w-full bg-gray-800 p-4 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto"
            >
              {notifications.length === 0 ? (
                <p className="text-gray-200">No notifications</p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 mb-2 rounded-lg ${
                      notif.is_read ? 'bg-gray-700' : 'bg-gray-600'
                    }`}
                  >
                    <p className="text-gray-200">{notif.message}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(notif.created_at).toLocaleString()}
                    </p>
                    {!notif.is_read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="mt-2 text-blue-400 hover:text-blue-300"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="bg-black/70 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">Discounts</h2>
          {discounts.length === 0 ? (
            <p className="text-gray-200">No discounts available</p>
          ) : (
            discounts.map((discount, index) => (
              <p key={index} className="text-gray-200">{discount}</p>
            ))
          )}
        </div>

        <div className="bg-black/70 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">Refer a Friend</h2>
          <input
            type="text"
            placeholder="Enter referred user's ID"
            onChange={(e) => e.target.value && handleReferralBonus(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition duration-300"
          />
        </div>

        <div className="bg-black/70 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Leave a Review</h2>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="text-lg">Barber:</label>
              <select
                name="barberId"
                value={newReview.barberId}
                onChange={handleReviewChange}
                className="ml-2 p-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none"
              >
                <option value="">Select a barber</option>
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <label className="text-lg">Rating:</label>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  fill={star <= newReview.rating ? 'gold' : 'none'}
                  stroke="gold"
                  className="w-6 h-6 ml-2 cursor-pointer"
                  onClick={() => handleRatingChange(star)}
                />
              ))}
            </div>
            <div>
              <label className="text-lg">Comment:</label>
              <textarea
                name="comment"
                value={newReview.comment}
                onChange={handleReviewChange}
                placeholder="Write your review"
                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition duration-300"
              />
            </div>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg hover:scale-105 transition duration-300"
            >
              Submit Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;