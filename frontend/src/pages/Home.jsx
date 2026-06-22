import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Search, Star, BookOpen, ShieldCheck, RefreshCw, Sparkles, ArrowRight, BookMarked, ShoppingBag, Heart, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';

export default function Home() {
  const { user, token } = useAuth();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [recLoading, setRecLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [bestLoading, setBestLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  useEffect(() => {
    fetchTrending();
    fetchBestSellers();
    if (token) {
      fetchRecommendations();
      fetchWishlist();
    } else {
      setRecLoading(false);
    }
  }, [token]);

  const fetchTrending = async () => {
    setTrendingLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/books?sort=rating_desc`);
      if (response.ok) {
        const data = await response.json();
        setTrending(data.slice(0, 4));
      }
    } catch (err) {
      console.error('Error fetching trending books:', err);
    } finally {
      setTrendingLoading(false);
    }
  };

  const fetchBestSellers = async () => {
    setBestLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/books`);
      if (response.ok) {
        const data = await response.json();
        setBestSellers(data.slice(4, 8));
      }
    } catch (err) {
      console.error('Error fetching best sellers:', err);
    } finally {
      setBestLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setRecLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.slice(0, 4));
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setRecLoading(false);
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
    }
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
      console.error('Wishlist toggle error:', err);
    }
  };

  const handleAddToCartClick = async (e, bookId, bookTitle) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }
    const success = await addToCart(bookId, 1);
    if (success) {
      addToast('Added to Cart', `"${bookTitle}" added to shopping cart.`, 'success');
    } else {
      addToast('Out of Stock', 'Could not add book to shopping cart.', 'error');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } }
  };

  return (
    <div className="space-y-24 pb-24 overflow-hidden">
      
      {/* 1. Premium Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white py-28 sm:py-36 px-4 sm:px-6 lg:px-8">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[130px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[130px] pointer-events-none animate-pulse"></div>
        
        <div className="max-w-5xl mx-auto text-center space-y-10 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold bg-primary-500/10 text-primary-400 border border-primary-500/30 backdrop-blur-md shadow-xs">
              <Sparkles size={12} className="animate-spin text-rose-455" style={{ animationDuration: '4s' }} /> AI-powered Online Bookstore & P2P Marketplace
            </span>
          </motion.div>
          
          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-4xl sm:text-7xl font-black tracking-tight leading-none"
            >
              Your Personal Library, <br />
              <span className="bg-gradient-to-r from-indigo-400 via-primary-300 to-rose-400 bg-clip-text text-transparent text-glow">
                Reimagined by Intelligence
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="max-w-2xl mx-auto text-base text-slate-400 sm:text-lg font-medium leading-relaxed"
            >
              Discover hand-picked recommendations matching your exact tastes, reviews, and ratings. Swap or trade books with a peer-to-peer reader network.
            </motion.p>
          </div>

          {/* Search Box */}
          <motion.form 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            onSubmit={handleSearchSubmit} 
            className="max-w-2xl mx-auto flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-slate-200/10"
          >
            <div className="flex items-center flex-grow pl-3 text-slate-400">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search over 15,000+ titles, authors, genres..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none focus:ring-0 text-slate-800 dark:text-slate-100 pl-3.5 text-xs sm:text-sm placeholder-slate-400"
              />
            </div>
            <Button
              type="submit"
              className="bg-primary-600 hover:bg-primary-500 text-white font-bold"
              size="sm"
            >
              Search
            </Button>
          </motion.form>

          {/* Stats Grid */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="grid grid-cols-3 gap-6 max-w-xl mx-auto pt-12 border-t border-slate-900"
          >
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">15k+</div>
              <div className="text-[9px] sm:text-xs text-slate-500 font-extrabold uppercase tracking-widest">Book Catalog</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">2.5k+</div>
              <div className="text-[9px] sm:text-xs text-slate-500 font-extrabold uppercase tracking-widest">Active Readers</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">1.2k+</div>
              <div className="text-[9px] sm:text-xs text-slate-500 font-extrabold uppercase tracking-widest">P2P Transactions</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. AI Recommendation Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {token ? (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                  <Sparkles size={26} className="text-primary-500 animate-pulse" />
                  Recommended For You
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-medium">
                  Custom AI predictions optimized matching your ratings.
                </p>
              </div>
            </div>

            {recLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="space-y-4">
                    <Skeleton className="h-72 w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6"
              >
                {recommendations.map(book => (
                  <motion.div key={book.id} variants={itemVariants}>
                    <BookCard 
                      book={book} 
                      isWishlisted={wishlistIds.has(book.id)} 
                      onToggleWishlist={(e) => handleToggleWishlist(e, book.id, book.title)}
                      onAddToCart={(e) => handleAddToCartClick(e, book.id, book.title)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <Card className="border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <CardContent className="p-12 text-center space-y-4">
                  <Sparkles size={36} className="mx-auto text-slate-350 dark:text-slate-655" />
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">Building Your Recommendation Model</h3>
                  <p className="text-xs sm:text-sm text-slate-450 dark:text-slate-500 max-w-md mx-auto">
                    Leave rating reviews or purchase books so our algorithm engine learns your preferences and builds your profile.
                  </p>
                  <Link to="/catalog" className="inline-flex items-center gap-1.5 mt-2 text-xs sm:text-sm font-bold text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors">
                    Browse Books <ArrowRight size={14} />
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-50 to-primary-100/40 dark:from-slate-900/40 dark:to-slate-950 border border-primary-200/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs"
          >
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center justify-center md:justify-start gap-2.5">
                <Sparkles size={22} className="text-primary-500" />
                Unlock Custom AI Suggestions
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 max-w-xl font-semibold">
                Sign in to train your personalized matcher using content filters and reader demographics.
              </p>
            </div>
            <Link to="/login">
              <Button variant="default" size="md">
                Get Started Now
              </Button>
            </Link>
          </motion.div>
        )}
      </section>
 
      {/* 3. Trending Releases */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Trending Releases
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-medium">
              Critically acclaimed and high-rated bookstore selections.
            </p>
          </div>
          <Link to="/catalog" className="text-xs sm:text-sm font-bold text-primary-655 hover:text-primary-500 dark:text-primary-400 flex items-center gap-1.5 transition-colors">
            View All <ArrowRight size={14} />
          </Link>
        </div>
 
        {trendingLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="space-y-4">
                <Skeleton className="h-72 w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6"
          >
            {trending.map(book => (
              <motion.div key={book.id} variants={itemVariants}>
                <BookCard 
                  book={book} 
                  isWishlisted={wishlistIds.has(book.id)} 
                  onToggleWishlist={(e) => handleToggleWishlist(e, book.id, book.title)}
                  onAddToCart={(e) => handleAddToCartClick(e, book.id, book.title)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
 
      {/* 4. Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Best Sellers
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-medium">
              The community's most-purchased titles this month.
            </p>
          </div>
          <Link to="/catalog?sort=price_desc" className="text-xs sm:text-sm font-bold text-primary-655 hover:text-primary-500 dark:text-primary-400 flex items-center gap-1.5 transition-colors">
            Explore More <ArrowRight size={14} />
          </Link>
        </div>
 
        {bestLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="space-y-4">
                <Skeleton className="h-72 w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6"
          >
            {bestSellers.map(book => (
              <motion.div key={book.id} variants={itemVariants}>
                <BookCard 
                  book={book} 
                  isWishlisted={wishlistIds.has(book.id)} 
                  onToggleWishlist={(e) => handleToggleWishlist(e, book.id, book.title)}
                  onAddToCart={(e) => handleAddToCartClick(e, book.id, book.title)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
 
      {/* 5. Premium Value Propositions */}
      <section className="bg-slate-100/60 dark:bg-slate-900/20 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Why Choose ReadNest?</h2>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Elevating your reading journey with state-of-the-art tools.</p>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-350 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 overflow-hidden">
              <CardContent className="p-8 text-center space-y-5">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <Sparkles size={22} />
                </div>
                <h3 className="font-extrabold text-lg text-slate-850 dark:text-white">AI Recommendation Matcher</h3>
                <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
                  We match books based on ratings overlaps, genres, and text vectors, pointing you straight to items you'll fall in love with.
                </p>
              </CardContent>
            </Card>
             
            <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-350 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 overflow-hidden">
              <CardContent className="p-8 text-center space-y-5">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <RefreshCw size={22} />
                </div>
                <h3 className="font-extrabold text-lg text-slate-855 dark:text-white">Peer-to-Peer Resale</h3>
                <p className="text-xs sm:text-sm text-slate-450 dark:text-slate-500 leading-relaxed font-medium">
                  Done with a book? Sell it directly to other readers on our marketplace platform. Environmentally clean and wallet friendly.
                </p>
              </CardContent>
            </Card>
 
            <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-350 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 overflow-hidden">
              <CardContent className="p-8 text-center space-y-5">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="font-extrabold text-lg text-slate-855 dark:text-white">Verified Order Flows</h3>
                <p className="text-xs sm:text-sm text-slate-450 dark:text-slate-500 leading-relaxed font-medium">
                  Check out safely using stateful cart verification, robust address configurations, and real-time dashboard notifications.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
 
    </div>
  );
}
 
// Reusable Premium Book Card Component
export function BookCard({ book, isWishlisted, onToggleWishlist, onAddToCart }) {
  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-2 relative">
      
      {/* Wishlist Shortcut Button */}
      {onToggleWishlist && (
        <button
          onClick={onToggleWishlist}
          className={`absolute top-3.5 right-3.5 p-2.5 rounded-full backdrop-blur-md transition-all z-10 shadow-xs border ${
            isWishlisted 
              ? 'bg-rose-500 text-white border-rose-500 scale-105' 
              : 'bg-slate-900/60 text-slate-205 border-transparent hover:text-white hover:bg-slate-900/80 hover:scale-105'
          }`}
          title="Add to Wishlist"
        >
          <Heart size={13} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      )}

      {/* Image Container */}
      <div className="aspect-[3/4] relative overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
        {book.image_url ? (
          <Link to={`/book/${book.id}`} className="w-full h-full block">
            <img 
              src={book.image_url} 
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>
        ) : (
          <Link to={`/book/${book.id}`} className="w-full h-full flex flex-col items-center justify-center text-slate-350 dark:text-slate-655 font-bold gap-2">
            <BookMarked size={32} />
            <span className="text-[9px] uppercase tracking-wider font-extrabold">No Cover Image</span>
          </Link>
        )}
        

        
        {/* Genre Tag */}
        <Badge variant="default" className="absolute top-3.5 left-3.5 bg-slate-900/80 backdrop-blur-xs text-white uppercase tracking-widest font-black text-[8px] hover:bg-slate-900 border border-white/10 rounded-md z-10">
          {book.genre}
        </Badge>
      </div>

      {/* Book Details */}
      <div className="p-4.5 flex flex-col flex-grow justify-between space-y-4">
        <div className="space-y-1">
          <Link to={`/book/${book.id}`}>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-805 dark:text-white line-clamp-1 group-hover:text-primary-655 transition-colors leading-tight">
              {book.title}
            </h3>
          </Link>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide">{book.author}</p>
        </div>

        <div className="space-y-3.5">
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/85">
            <span className="font-black text-base text-slate-900 dark:text-slate-50">${book.price}</span>
            <div className="flex items-center text-xs text-amber-500 font-bold gap-0.5">
              <Star size={11.5} fill="currentColor" />
              <span>{parseFloat(book.average_rating || 0).toFixed(1)}</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-550">({book.review_count})</span>
            </div>
          </div>

          {onAddToCart && (
            <div>
              {book.stock > 0 ? (
                <button
                  onClick={onAddToCart}
                  className="w-full py-2 bg-slate-50 hover:bg-primary-600 dark:bg-slate-850 dark:hover:bg-primary-600 text-slate-700 dark:text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-md hover:shadow-primary-500/10"
                >
                  <ShoppingCart size={13} /> Add to Cart
                </button>
              ) : (
                <div className="w-full py-2 text-center text-xs font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl select-none">
                  Out of Stock
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
