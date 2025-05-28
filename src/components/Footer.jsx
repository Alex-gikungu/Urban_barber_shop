import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-10 mt-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* About Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">About Us</h2>
          <p className="text-gray-300">
            We provide a secure and simple platform for making and tracking payments for your appointments. Our goal is to enhance your digital experience with ease and reliability.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-bold mb-4">Quick Links</h2>
          <ul className="space-y-2">
            {[
              { label: 'Home', path: '/' },
              { label: 'About', path: '/about' },
              { label: 'Contact Us', path: '/contact' },
              { label: 'Login', path: '/login' },
            ].map((item) => (
              <li key={item.path} className="relative group">
                <Link
                  to={item.path}
                  className="text-white text-base font-medium transition duration-300 group-hover:text-red-400"
                >
                  {item.label}
                  <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-red-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Social Icons */}
        <div>
          <h2 className="text-xl font-bold mb-4">Follow Us</h2>
          <div className="flex space-x-4">
            {[
              { href: 'https://facebook.com', icon: <FaFacebook size={24} /> },
              { href: 'https://twitter.com', icon: <FaTwitter size={24} /> },
              { href: 'https://instagram.com', icon: <FaInstagram size={24} /> },
              { href: 'https://linkedin.com', icon: <FaLinkedin size={24} /> },
            ].map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-red-400 hover:scale-105 transition duration-300"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center mt-8 text-gray-400 text-sm">
        © {new Date().getFullYear()} Smart Barber Shop. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;