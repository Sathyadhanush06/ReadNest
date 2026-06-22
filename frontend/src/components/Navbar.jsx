import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Heart, LogOut, Sun, Moon, Search, Menu, X, LayoutDashboard, Sparkles, Star, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ theme, toggleTheme }) {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Autocomplete Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const searchRef = useRef(null);

  useEffect(() => {
    // Hide suggestions when clicking outside
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch quick suggestions on query change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/books?search=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.slice(0, 5)); // show top 5 matches
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchFocused(false);
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (bookId) => {
    setSearchQuery('');
    setSuggestions([]);
    setSearchFocused(false);
    navigate(`/book/${bookId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">
          
          {/* Logo Button (Navigates to "/" via React Router Link) */}
          <Link 
            to="/" 
            className="flex items-center gap-2 font-extrabold text-xl sm:text-2xl tracking-tight text-slate-800 dark:text-white flex-shrink-0 group"
          >
            <BookOpen size={22} className="text-indigo-650 dark:text-indigo-400 group-hover:rotate-6 transition-transform duration-300" />
            <span className="bg-gradient-to-r from-indigo-650 via-primary-500 to-rose-500 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity font-black">ReadNest</span>
          </Link>

          {/* Navigation Middle Links */}
          <div className="hidden lg:flex items-center gap-8 flex-shrink-0 text-sm font-medium">
            <Link 
              to="/catalog" 
              className="text-slate-600 hover:text-primary-600 dark:text-slate-350 dark:hover:text-primary-400 transition-colors py-1 relative group"
            >
              Catalog
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-200"></span>
            </Link>
            <Link 
              to="/marketplace" 
              className="text-slate-600 hover:text-primary-600 dark:text-slate-350 dark:hover:text-primary-400 transition-colors py-1 relative group"
            >
              Marketplace
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-200"></span>
            </Link>
            
            {user && (
              <Link 
                to="/wishlist" 
                className="text-slate-600 hover:text-primary-655 dark:text-slate-350 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5 py-1 relative group"
              >
                <Heart size={15} className="text-rose-500 group-hover:fill-rose-500/25 transition-all" />
                Wishlist
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-200"></span>
              </Link>
            )}
          </div>

          {/* Center Search Input Bar */}
          <div ref={searchRef} className="hidden md:block flex-grow max-w-md relative mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search titles, authors, genres..."
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full text-xs sm:text-sm focus:outline-none placeholder-slate-405 dark:text-slate-100 glossy-input"
              />
              <span className="absolute left-4 top-2.5 text-slate-400"><Search size={16} /></span>
            </form>

            {/* Autocomplete suggestions popup */}
            <AnimatePresence>
              {searchFocused && (searchQuery.trim() !== '') && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.98 }}
                  className="absolute left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 text-slate-700 dark:text-slate-200"
                >
                  {searchLoading ? (
                    <div className="p-5 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-primary-500"></div>
                      Searching catalog...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="py-1">
                      {suggestions.map(book => (
                        <button
                          key={book.id}
                          onClick={() => handleSuggestionClick(book.id)}
                          className="w-full px-4 py-3 hover:bg-slate-55/60 dark:hover:bg-slate-800/40 text-left flex items-center gap-3 border-b last:border-0 border-slate-100/60 dark:border-slate-800/50 transition-colors"
                        >
                          <img 
                            src={book.image_url} 
                            alt={book.title} 
                            className="w-8 h-11 object-cover rounded shadow-xs flex-shrink-0"
                          />
                          <div className="min-w-0 flex-grow">
                            <span className="font-bold text-xs sm:text-sm block truncate text-slate-850 dark:text-white group-hover:text-primary-600">{book.title}</span>
                            <span className="text-[10px] text-slate-400 font-medium block truncate mt-0.5">{book.author} • {book.genre}</span>
                          </div>
                          <div className="flex items-center text-amber-500 text-[10px] font-bold gap-0.5 flex-shrink-0">
                            <Star size={10} fill="currentColor" />
                            <span>{parseFloat(book.average_rating || 0).toFixed(1)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 text-center text-xs text-slate-400">No books found matching query.</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side Options */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Theme Toggle */}
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme} 
              className="p-2.5 rounded-full hover:bg-slate-105/85 dark:hover:bg-slate-855/85 text-slate-600 dark:text-slate-350 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800 shadow-2xs"
              title="Toggle Theme"
              id="theme-toggle-btn"
            >
              {theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </motion.button>

            {/* Cart Icon */}
            <Link 
              to="/cart" 
              className="p-2.5 rounded-full hover:bg-slate-105/85 dark:hover:bg-slate-855/85 text-slate-600 dark:text-slate-350 relative transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800 shadow-2xs"
              id="cart-nav-link"
            >
              <ShoppingCart size={17} />
              {totalItems > 0 && (
                <motion.span 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] w-5 h-5 flex items-center justify-center rounded-full font-black border-2 border-white dark:border-slate-950 shadow-sm"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>

            {/* Auth Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1 rounded-full bg-slate-100/50 hover:bg-slate-200/50 dark:bg-slate-850/50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 transition-all border border-slate-200/40 dark:border-slate-800/30 pl-1.5 pr-3.5 shadow-2xs"
                  id="user-profile-menu-btn"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 via-primary-500 to-rose-455 text-white flex items-center justify-center font-black uppercase text-xs shadow-inner">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left text-[11px] font-semibold leading-tight max-w-[80px]">
                    <div className="truncate text-slate-800 dark:text-white font-bold">{user.name}</div>
                    <span className="text-[8px] text-indigo-650 dark:text-indigo-400 uppercase tracking-widest font-black block mt-0.5">{user.role}</span>
                  </div>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2.5 w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl py-2 border border-slate-205/60 dark:border-slate-800/80 z-50"
                    >
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/50 transition-colors font-semibold"
                      >
                        <LayoutDashboard size={14} className="text-slate-400" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm text-rose-500 hover:bg-rose-50/50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition-colors border-t border-slate-100 dark:border-slate-800 mt-1.5 pt-2.5 font-bold"
                      >
                        <LogOut size={14} />
                        Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-805 text-white dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900 text-xs sm:text-sm font-bold transition-all shadow-xs border border-transparent dark:border-slate-800"
                id="login-nav-btn"
              >
                Log In
              </Link>
            )}

            {/* Mobile Menu Toggler */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-slate-655 dark:text-slate-350 border border-transparent hover:border-slate-205 dark:hover:border-slate-800"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-3 shadow-lg overflow-hidden"
          >
            {/* Mobile Search Box */}
            <form onSubmit={handleSearchSubmit} className="relative pb-2">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs focus:outline-none dark:text-slate-100 placeholder-slate-450 glossy-input"
              />
              <span className="absolute left-3 top-2 text-slate-400"><Search size={14} /></span>
            </form>

            <Link 
              to="/catalog" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-205 font-bold text-sm"
            >
              Catalog
            </Link>
            <Link 
              to="/marketplace" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-205 font-bold text-sm"
            >
              Marketplace
            </Link>
            {user && (
              <>
                <Link 
                  to="/wishlist" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-205 font-bold text-sm flex items-center gap-2"
                >
                  <Heart size={14} className="text-rose-505" /> Wishlist
                </Link>
                <Link 
                  to="/dashboard" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-205 font-bold text-sm flex items-center gap-2"
                >
                  <LayoutDashboard size={14} className="text-slate-405" /> Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50/50 dark:text-rose-400 dark:hover:bg-rose-950/20 font-bold text-sm flex items-center gap-2"
                >
                  <LogOut size={14} /> Log Out
                </button>
              </>
            )}
            {!user && (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-3 rounded-full bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 text-sm font-bold shadow-sm"
              >
                Log In
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
