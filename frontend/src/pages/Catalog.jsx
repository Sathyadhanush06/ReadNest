import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { API_BASE_URL, useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Search, SlidersHorizontal, Star, ShoppingCart, Heart, BookMarked, Sparkles, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { BookCard } from './Home';

export default function Catalog() {
  const location = useLocation();
  const { token } = useAuth();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  
  // Extract initial search from URL query
  const queryParams = new URLSearchParams(location.search);
  const urlSearch = queryParams.get('search') || '';
  const urlGenre = queryParams.get('genre') || '';

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState(urlSearch);
  const [genre, setGenre] = useState(urlGenre);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sort, setSort] = useState('newest');
  
  // Wishlist item tracking
  const [wishlistIds, setWishlistIds] = useState(new Set());
  
  // Mobile filter drawer toggler
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);



  // Genres available
  const genres = ['Fantasy', 'Sci-Fi', 'Fiction', 'Mystery', 'Biography', 'Science'];

  useEffect(() => {
    fetchBooks();
    if (token) {
      fetchWishlist();
    }
  }, [genre, sort, token]); // Re-fetch on genre or sort, search/prices require Apply click

  // Watch URL changes to update values
  useEffect(() => {
    const qParams = new URLSearchParams(location.search);
    const searchVal = qParams.get('search') || '';
    const genreVal = qParams.get('genre') || '';
    if (searchVal !== search) setSearch(searchVal);
    if (genreVal !== genre) setGenre(genreVal);
    
    // Trigger fetch directly if URL params change
    fetchBooksDirect(searchVal, genreVal);
  }, [location.search]);

  const fetchBooksDirect = async (searchVal, genreVal) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchVal) params.append('search', searchVal);
      if (genreVal) params.append('genre', genreVal);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minRating) params.append('minRating', minRating);
      if (sort) params.append('sort', sort);

      const response = await fetch(`${API_BASE_URL}/books?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (genre) params.append('genre', genre);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minRating) params.append('minRating', minRating);
      if (sort) params.append('sort', sort);

      const response = await fetch(`${API_BASE_URL}/books?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setWishlistIds(new Set(data.map(item => item.id)));
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchBooks();
    setMobileFiltersOpen(false);
    addToast('Filters Applied', 'Book list updated successfully.', 'success');
  };

  const handleClearFilters = () => {
    setSearch('');
    setGenre('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSort('newest');
    setLoading(true);
    setMobileFiltersOpen(false);
    fetch(`${API_BASE_URL}/books`)
      .then(res => res.json())
      .then(data => {
        setBooks(data);
        setLoading(false);
        addToast('Filters Cleared', 'Reset all search criteria.', 'info');
      });
  };

  const handleToggleWishlist = async (e, bookId, bookTitle) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      addToast('Authentication Required', 'Please login to save books to wishlist.', 'warning');
      return;
    }

    const isWishlisted = wishlistIds.has(bookId);
    try {
      if (isWishlisted) {
        const response = await fetch(`${API_BASE_URL}/wishlist/${bookId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const next = new Set(wishlistIds);
          next.delete(bookId);
          setWishlistIds(next);
          addToast('Removed from Wishlist', `"${bookTitle}" removed.`, 'info');
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ bookId })
        });
        if (response.ok) {
          const next = new Set(wishlistIds);
          next.add(bookId);
          setWishlistIds(next);
          addToast('Saved to Wishlist', `"${bookTitle}" added.`, 'success');
        }
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  const handleAddToCartClick = async (e, bookId, bookTitle) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }
    const success = await addToCart(bookId, 1);
    if (success) {
      addToast('Added to Cart', `"${bookTitle}" is now in your shopping cart.`, 'success');
    } else {
      addToast('Out of Stock', 'Could not add book to shopping cart.', 'error');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  const renderFiltersForm = () => (
    <form onSubmit={handleApplyFilters} className="space-y-6">
      {/* Search Term */}
      <div className="space-y-2">
        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Keyword Search</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Title, author, genre..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-all text-slate-850 dark:text-slate-105"
          />
          <span className="absolute left-3.5 top-3.5 text-slate-400"><Search size={14} /></span>
        </div>
      </div>

      {/* Genre Select */}
      <div className="space-y-2">
        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Genre Category</label>
        <select
          value={genre}
          onChange={e => setGenre(e.target.value)}
          className="w-full px-3.5 h-11 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs sm:text-sm focus:outline-none focus:border-primary-500 text-slate-850 dark:text-slate-105 focus:ring-1 focus:ring-primary-500/20 transition-all"
        >
          <option value="">All Categories</option>
          {genres.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Price Range ($)</label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            className="px-3 h-11 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs sm:text-sm focus:outline-none focus:border-primary-500 text-center text-slate-850 dark:text-slate-105 focus:ring-1 focus:ring-primary-500/20"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            className="px-3 h-11 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs sm:text-sm focus:outline-none focus:border-primary-500 text-center text-slate-850 dark:text-slate-105 focus:ring-1 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="space-y-2">
        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Min Rating</label>
        <select
          value={minRating}
          onChange={e => setMinRating(e.target.value)}
          className="w-full px-3.5 h-11 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs sm:text-sm focus:outline-none focus:border-primary-500 text-slate-850 dark:text-slate-105 focus:ring-1 focus:ring-primary-500/20 transition-all"
        >
          <option value="">Any Rating</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
        </select>
      </div>

      {/* Sorting */}
      <div className="space-y-2">
        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Sort Ordering</label>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="w-full px-3.5 h-11 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs sm:text-sm focus:outline-none focus:border-primary-500 text-slate-850 dark:text-slate-105 focus:ring-1 focus:ring-primary-500/20 transition-all"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="rating_desc">Highest Rated</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      <Button
        type="submit"
        className="w-full mt-2 font-bold"
        size="md"
      >
        Apply Filters
      </Button>
    </form>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Discover Books
          </h1>
          <p className="text-xs sm:text-sm text-slate-450 dark:text-slate-500 font-semibold">
            Search, filter, and discover titles with machine learning recommendations.
          </p>
        </div>

        {/* Mobile Filters Trigger */}
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 text-xs font-bold shadow-2xs"
        >
          <SlidersHorizontal size={14} /> Filters
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Desktop Filters Side Panel */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <Card className="sticky top-20 shadow-xs border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-md">
            <CardContent className="p-6 space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="font-extrabold text-sm sm:text-base flex items-center gap-2 text-slate-800 dark:text-white">
                  <SlidersHorizontal size={16} className="text-primary-500" /> Filters
                </h2>
                <button 
                  onClick={handleClearFilters}
                  className="text-xs text-primary-600 hover:text-primary-555 dark:text-primary-400 font-bold transition-colors"
                >
                  Clear All
                </button>
              </div>

              {renderFiltersForm()}
            </CardContent>
          </Card>
        </aside>

        {/* Book Catalog Grid */}
        <section className="flex-grow">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="space-y-4">
                  <Skeleton className="h-72 w-full rounded-2xl animate-pulse" />
                  <Skeleton className="h-4 w-3/4 animate-pulse" />
                  <Skeleton className="h-4 w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          ) : books.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6"
            >
              {books.map(book => {
                const isWishlisted = wishlistIds.has(book.id);
                return (
                  <motion.div key={book.id} variants={itemVariants}>
                    <BookCard
                      book={book}
                      isWishlisted={isWishlisted}
                      onToggleWishlist={(e) => handleToggleWishlist(e, book.id, book.title)}
                      onAddToCart={(e) => handleAddToCartClick(e, book.id, book.title)}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <Card className="max-w-md mx-auto mt-12 border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <CardContent className="p-8 text-center space-y-4">
                <SlidersHorizontal size={36} className="mx-auto text-slate-350 dark:text-slate-655" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">No Results Found</h3>
                <p className="text-xs sm:text-sm text-slate-455 dark:text-slate-500 font-semibold leading-relaxed">
                  We couldn't find any books matching your exact search filters. Try clearing your filters or widening your search criteria.
                </p>
                <Button
                  onClick={handleClearFilters}
                  size="sm"
                  className="mt-2 font-bold"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

      </div>

      {/* Mobile Drawer Slide-over */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            <div className="absolute inset-0 overflow-hidden">
              {/* Overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileFiltersOpen(false)}
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
              />

              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <motion.div 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="pointer-events-auto w-screen max-w-xs"
                >
                  <div className="flex h-full flex-col bg-white dark:bg-slate-900 shadow-xl overflow-y-scroll">
                    <div className="px-5 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <h2 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                        <SlidersHorizontal size={16} /> Filters
                      </h2>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={handleClearFilters}
                          className="text-xs text-primary-600 hover:text-primary-555 font-bold"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setMobileFiltersOpen(false)}
                          className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="px-5 py-6">
                      {renderFiltersForm()}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
