import React, { useState } from "react";
import axios from "axios";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    try {
      const res = await axios.post("http://localhost:5000/contact/", formData);
      setStatus("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Error sending message:", err);
      setStatus("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black/95 text-white relative">
      {/* Optional background image overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage:
            "url('https://img1.wsimg.com/isteam/ip/c118cbcb-d10b-44fc-b513-6c49ad791ec3/blob.png/:/cr=t:16.67%25,l:0%25,w:100%25,h:66.67%25')",
          zIndex: 0,
        }}
      ></div>
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="relative z-10 max-w-6xl mx-auto p-6 md:p-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
          Contact Us
        </h1>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-black/70 p-8 rounded-lg shadow-lg border border-gray-700 space-y-6"
          >
            <div>
              <label className="block font-semibold mb-2">Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                type="text"
                placeholder="Enter your name"
                className="w-full border border-gray-600 p-4 rounded text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Email Address</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                placeholder="you@example.com"
                className="w-full border border-gray-600 p-4 rounded text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                placeholder="Type your message here..."
                className="w-full border border-gray-600 p-4 rounded text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-600"
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:scale-105 transition duration-300"
            >
              Send Message
            </button>

            {status && (
              <p className="mt-4 text-sm text-yellow-400 font-medium">{status}</p>
            )}
          </form>

          {/* Contact Info */}
          <div className="bg-black/70 p-8 rounded-lg shadow-lg border border-gray-700 space-y-6">
            <h2 className="text-2xl font-semibold">Visit Us</h2>
            <p><strong>Smart Barber Shop</strong></p>
            <p>Tom Mboya Street, Nairobi, Kenya</p>
            <p>
              Email:{" "}
              <a
                href="mailto:info@smartbarbershop.com"
                className="text-red-400 hover:underline"
              >
                info@smartbarbershop.com
              </a>
            </p>
            <p>Phone: +254 712 345 678</p>
          </div>
        </div>
      </div>

      {/* Full-Width Map Section */}
      <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-xl animate-fade-in delay-700 mt-16">
        <iframe
          title="Smart Barber Shop Location"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src="https://www.openstreetmap.org/export/embed.html?bbox=36.8212%2C-1.2876%2C36.8222%2C-1.2866&layer=mapnik&marker=-1.2871%2C36.8217"
          style={{ border: "none" }}
        ></iframe>
      </div>
    </div>
  );
};

export default Contact;
