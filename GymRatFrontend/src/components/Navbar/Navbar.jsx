import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectToken, selectUser, logout } from '../../features/auth/authSlice';
import { logoutAPI } from '../../features/auth/authAPI';
import Button from '../Button/Button';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const token = useSelector(selectToken);
  const user = useSelector(selectUser);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutAPI();
    } catch {
      // Ignore API errors and still clear local auth state
    } finally {
      dispatch(logout());
      navigate('/');
    }
  };

  const handleDashboard = () => {
    if (user?.role === 'Admin') {
      navigate('/admin');
    } else {
      navigate('/member');
    }

    setMenuOpen(false);
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }

    setMenuOpen(false);
  };

  const navLinks = [
    {
      label: 'Home',
      action: () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });

        setMenuOpen(false);
      },
    },
    {
      label: 'Features',
      action: () => scrollToSection('features'),
    },
    {
      label: 'How it works',
      action: () => scrollToSection('howitworks'),
    },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'mx-4 mt-3 rounded-2xl backdrop-blur-md bg-white/20 shadow-lg px-6 py-3'
          : 'px-8 md:px-16 py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            })
          }
          className="flex items-center gap-2.5"
        >
          <div className="w-8 h-8 bg-[#1C1C1C] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-black">ID</span>
          </div>

          <span
            className="text-xl font-bold text-[#2A1F1A]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            IronDesk
          </span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-white/30 backdrop-blur-sm rounded-full px-2 py-1.5 border border-white/40">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={link.action}
              className="px-4 py-1.5 rounded-full text-sm text-[#2A1F1A] hover:bg-white/50 transition-all duration-200 cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {token ? (
            <>
              <button
                onClick={handleDashboard}
                className="text-sm text-[#2A1F1A] hover:text-[#C4956A] transition-colors px-4 py-2"
              >
                Dashboard
              </button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-[#2A1F1A] hover:text-[#C4956A] transition-colors px-4 py-2"
              >
                Login
              </Link>

              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register-gym')}
              >
                Register Gym
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span
            className={`block w-5 h-0.5 bg-[#1C1C1C] transition-all duration-300 ${
              menuOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-[#1C1C1C] transition-all duration-300 ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-[#1C1C1C] transition-all duration-300 ${
              menuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-3 bg-white/80 backdrop-blur-md rounded-2xl px-6 py-6 flex flex-col gap-4 border border-white/40">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={link.action}
              className="text-[#2A1F1A] text-sm text-left"
            >
              {link.label}
            </button>
          ))}

          {token ? (
            <>
              <button
                onClick={handleDashboard}
                className="text-[#2A1F1A] text-sm text-left"
              >
                Dashboard
              </button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[#2A1F1A] text-sm"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/register-gym');
                }}
              >
                Register Gym
              </Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;