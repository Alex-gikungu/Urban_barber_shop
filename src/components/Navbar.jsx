import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '../Authentication/AuthContext'; // Import AuthContext

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth(); // Use AuthContext

  const handleLogout = () => {
    logout(); // Clear user data and localStorage
    navigate('/');
    setIsMobileMenuOpen(false); // Close mobile menu on logout
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const loggedInNavItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Make Payment', path: '/payments/new' },
    { label: 'Payment List', path: '/payments' },
    { label: 'Contact Us', path: '/contact' },
  ];

  const guestNavItems = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'Login', path: '/login' },
    { label: 'Register', path: '/register' },
  ];

  const navItems = isLoggedIn ? loggedInNavItems : guestNavItems;

  return (
    <nav className="bg-black/95 text-white shadow-lg sticky top-0 z-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-3xl font-bold text-white hover:scale-105 hover:shadow-glow transition duration-300">
          Smart Barber Shop
        </h1>

        {/* Desktop Nav Items */}
        <ul className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <li key={item.path} className="relative group">
              <Link
                to={item.path}
                className="text-white text-lg font-medium transition duration-300 group-hover:text-red-400"
              >
                {item.label}
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-red-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
          ))}

          {/* Profile Icon */}
          {isLoggedIn && (
            <li>
              <Link to="/profile" title="Profile">
                <User className="text-white hover:text-red-400 transition duration-300" size={24} />
              </Link>
            </li>
          )}
        </ul>

        {/* Logout Button (Desktop) */}
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="hidden md:block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg hover:scale-105 hover:shadow-lg transition duration-300"
          >
            Logout
          </button>
        )}

        {/* Hamburger Menu (Mobile) */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/95 px-4 py-6 animate-slide-in">
          <ul className="flex flex-col gap-4">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="text-white text-lg font-medium hover:text-red-400 transition duration-300"
                  onClick={toggleMobileMenu}
                >
                  {item.label}
                </Link>
              </li>
            ))}

            {/* Profile Icon - Mobile */}
            {isLoggedIn && (
              <li>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-white hover:text-red-400 transition duration-300"
                  onClick={toggleMobileMenu}
                >
                  <User size={20} />
                  Profile
                </Link>
              </li>
            )}

            {/* Logout Button - Mobile */}
            {isLoggedIn && (
              <li>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg w-full text-left transition duration-300"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;