import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from "./Authentication/AuthContext";
import Home from './pages/Home';
import About from './pages/About';
import Contact from "./pages/Contact";
import Register from "./Authentication/Register";
import Login from "./Authentication/Login";
import PaymentForm from "./Payments/PaymentForm";
import PaymentList from "./Payments/PaymentsList";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Service from "./pages/Service";
import Profile from "./components/Profile";
import Appointments from "./pages/Appointments";
import Booking from './pages/Booking';
import BookingPage from './pages/Bookings';
import AppointmentList from './pages/AppointmentList';
import Staff from './pages/Staff';
const App = () => {
  return (
    <GoogleOAuthProvider clientId="488127932223-06f7ptuo4ntg5peuj0eqsq96cello6t6.apps.googleusercontent.com">
      <Router>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/payments/new" element={<PaymentForm />} />
            <Route path="/payments" element={<PaymentList />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/bookings" element={<BookingPage />} />
            <Route path="/services" element={<Service />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/appointment" element={<AppointmentList />} />
            <Route path="/staff" element={<Staff />} />
          </Routes>
          <Footer />
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;