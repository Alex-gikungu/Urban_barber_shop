import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CreditCard, Users, Package } from 'lucide-react';

const Home = () => {
  return (
    <div className="bg-black text-white">
      {/* Hero Section */}
      <div className="relative min-h-screen">
        {/* Background image with dark overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://img1.wsimg.com/isteam/ip/c118cbcb-d10b-44fc-b513-6c49ad791ec3/blob.png/:/cr=t:16.67%25,l:0%25,w:100%25,h:66.67%25')",
            filter: 'brightness(0.4)',
            zIndex: 0,
          }}
        ></div>
        <div className="absolute inset-0 bg-black opacity-60" style={{ zIndex: 1 }}></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-wide drop-shadow-lg">
            Smart Barber Shop
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-xl drop-shadow-md">
            Your ultimate barber management system. Appointments, Staff, Inventory & Payments, all in one smart place.
          </p>

          <div className="space-x-6">
            <Link
              to="/appointments"
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 hover:from-pink-600 hover:to-red-600 transition text-lg font-semibold shadow-lg"
            >
              Manage Appointments
            </Link>
            <Link
              to="/staff"
              className="px-6 py-3 rounded-lg border border-white hover:bg-white hover:text-black transition text-lg font-semibold shadow-lg"
            >
              Staff Directory
            </Link>
          </div>

          <p className="mt-12 text-sm text-gray-300 max-w-md">
            Powered by modern web technologies to make your barber shop smarter and more efficient.
          </p>
        </div>
      </div>

      {/* New Section: Why Choose Smart Barber Shop? */}
      <div className="relative py-16">
        {/* Background image with dark overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')",
            filter: 'brightness(0.4)',
            zIndex: 0,
          }}
        ></div>
        <div className="absolute inset-0 bg-black opacity-60" style={{ zIndex: 1 }}></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 drop-shadow-lg">
            Why Choose Smart Barber Shop?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1: Easy Booking */}
            <div className="bg-gray-800/80 p-6 rounded-lg shadow-lg hover:scale-105 transition duration-300">
              <Calendar className="w-12 h-12 text-red-600 mb-4 mx-auto" />
              <h3 className="text-2xl font-semibold mb-4 text-center">Easy Booking</h3>
              <p className="text-gray-300 text-center">
                Schedule appointments effortlessly with our intuitive system. Choose your service, barber, and time slot in seconds.
              </p>
            </div>

            {/* Feature Card 2: Secure Payments */}
            <div className="bg-gray-800/80 p-6 rounded-lg shadow-lg hover:scale-105 transition duration-300">
              <CreditCard className="w-12 h-12 text-red-600 mb-4 mx-auto" />
              <h3 className="text-2xl font-semibold mb-4 text-center">Secure Payments</h3>
              <p className="text-gray-300 text-center">
                Pay conveniently with M-Pesa STK push, ensuring fast and secure transactions for all your services.
              </p>
            </div>

            {/* Feature Card 3: Expert Barbers */}
            <div className="bg-gray-800/80 p-6 rounded-lg shadow-lg hover:scale-105 transition duration-300">
              <Users className="w-12 h-12 text-red-600 mb-4 mx-auto" />
              <h3 className="text-2xl font-semibold mb-4 text-center">Expert Barbers</h3>
              <p className="text-gray-300 text-center">
                Our skilled barbers provide top-notch services, from classic haircuts to dreadlock styling, tailored to your style.
              </p>
            </div>
          </div>

          {/* Call-to-Action */}
          <div className="text-center mt-12">
            <Link
              to="/services"
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 hover:from-pink-600 hover:to-red-600 transition text-xl font-semibold shadow-lg"
            >
              Explore Our Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;