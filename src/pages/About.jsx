import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-black/95 text-white py-12 px-6 md:px-12">
      {/* Content Section */}
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-12 animate-fade-in">
          About Smart Barber Shop
        </h1>

        {/* Intro Paragraphs */}
        <div className="space-y-6 mb-12">
          <p className="text-lg md:text-xl leading-relaxed animate-fade-in delay-100">
            Welcome to <strong>Smart Barber Shop</strong>, your all-in-one platform designed to simplify the day-to-day operations of modern barber shops. Whether you're scheduling appointments, managing inventory, handling payments, or keeping up with your team, we’ve built a system to help you do it all effortlessly.
          </p>
          <p className="text-lg md:text-xl leading-relaxed animate-fade-in delay-200">
            Our mission is to empower barbers with smart technology that saves time and boosts productivity. We understand the unique challenges of running a barber business — and that’s why we offer a seamless, intuitive, and reliable solution tailored specifically for you.
          </p>
        </div>

        {/* Values and Why Choose Us */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-black/70 rounded-lg p-6 shadow-lg animate-fade-in delay-300">
            <h2 className="text-3xl font-semibold mb-4 text-white">Our Values</h2>
            <ul className="list-disc list-inside space-y-3 text-gray-200">
              {['Professionalism & Excellence', 'Customer-Centered Approach', 'Smart Solutions for Real Problems', 'Transparency & Integrity'].map((value, index) => (
                <li key={index} className="relative group text-lg hover:text-red-400 transition-colors duration-300">
                  {value}
                  <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-red-400 transition-all duration-300 group-hover:w-full"></span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-black/70 rounded-lg p-6 shadow-lg animate-fade-in delay-400">
            <h2 className="text-3xl font-semibold mb-4 text-white">Why Choose Us?</h2>
            <ul className="list-disc list-inside space-y-3 text-gray-200">
              {['Easy Appointment Booking & Management', 'Inventory and Staff Management Tools', 'Secure and Fast Payment Processing', 'Mobile-friendly and Cloud-based'].map((value, index) => (
                <li key={index} className="relative group text-lg hover:text-red-400 transition-colors duration-300">
                  {value}
                  <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-red-400 transition-all duration-300 group-hover:w-full"></span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Location Text and Button */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold mb-6 animate-fade-in delay-500">
            Our Location
          </h2>
          <p className="text-lg md:text-xl leading-relaxed mb-8 text-gray-200 animate-fade-in delay-600">
            Find us in the heart of the city, always ready to serve you with style and precision.
          </p>
          <Link
            to="/appointments"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg hover:scale-105 hover:shadow-lg transition duration-300"
          >
            Book Now
          </Link>
        </div>
      </div>

      {/* Full-Width Map Section */}
      <div className="w-full h-[800px] md:h-[600px] rounded-lg overflow-hidden shadow-xl animate-fade-in delay-700 mt-16">
        <iframe
          title="Smart Barber Shop Location"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src="https://www.openstreetmap.org/export/embed.html?bbox=36.8212%2C-1.2876%2C36.8222%2C-1.2866&layer=mapnik&marker=-1.2871%2C36.8217"
          style={{ border: 'none' }}
        ></iframe>
      </div>
    </div>
  );
};

export default About;

