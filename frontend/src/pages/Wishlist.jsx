import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL, useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Heart, ShoppingCart, Trash2, BookMarked, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';

export default function Wishlist() {
  const { token } = useAuth();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (bookId, bookTitle) => {
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist/${bookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setWishlist(prev => prev.filter(item => item.id !== bookId));
        addToast('Removed from Wishlist', `"${bookTitle}" has been removed.`, 'info');
      }
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const handleAddToCart = async (bookId, bookTitle) => {
    const success = await addToCart(bookId, 1);
    if (success) {
      addToast('Moved to Cart', `"${bookTitle}" added to shopping cart.`, 'success');
      // Remove from wishlist once added to cart:
      handleRemove(bookId, bookTitle);
    } else {
      addToast('Error', 'Could not move book to shopping cart.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="space-y-4">
              <Skeleton className="h-72 w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
        Saved Wishlist <Heart size={26} className="text-rose-500 fill-rose-500 animate-pulse" />
      </h1>

      {wishlist.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {wishlist.map(book => (
              <motion.div
                layout
                key={book.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="group bg-white/70 dark:bg-slate-900/50 border border-white/20 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full hover:-translate-y-1.5 backdrop-blur-md relative"
              >
                {/* Image Cover */}
                <div className="aspect-[3/4] relative overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                  <Link to={`/book/${book.id}`} className="block w-full h-full">
                    {book.image_url ? (
                      <img src={book.image_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-350 dark:text-slate-655 font-bold gap-2">
                        <BookMarked size={28} />
                        <span className="text-[9px] uppercase tracking-wider font-extrabold">No Cover</span>
                      </div>
                    )}
                  </Link>
                  <button
                    onClick={() => handleRemove(book.id, book.title)}
                    className="absolute top-3.5 right-3.5 p-2.5 rounded-full bg-slate-900/60 text-slate-250 hover:text-rose-500 hover:bg-white dark:hover:bg-rose-950/20 dark:hover:text-rose-455 transition-all shadow-sm border border-transparent hover:border-slate-205"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={13} />
                  </button>
                  <Badge variant="default" className="absolute top-3.5 left-3.5 bg-slate-900/80 backdrop-blur-xs text-white uppercase tracking-widest font-black text-[8px] hover:bg-slate-900 border border-white/10 rounded-md">
                    {book.genre}
                  </Badge>
                </div>

                {/* Details */}
                <div className="p-4.5 space-y-3.5 flex-grow flex flex-col justify-between">
                  <div>
                    <Link to={`/book/${book.id}`}>
                      <h3 className="font-extrabold text-slate-805 dark:text-white text-sm sm:text-base line-clamp-1 group-hover:text-primary-655 transition-colors leading-tight">
                        {book.title}
                      </h3>
                    </Link>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide mt-0.5">{book.author}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-850">
                    <span className="font-black text-base text-slate-900 dark:text-slate-100">${book.price}</span>
                    <button
                      onClick={() => handleAddToCart(book.id, book.title)}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-primary-600 dark:bg-slate-850 dark:hover:bg-primary-600 text-slate-700 dark:text-slate-200 hover:text-white transition-all shadow-2xs hover:shadow-md hover:shadow-primary-500/10"
                      title="Move to Cart"
                    >
                      <ShoppingCart size={14} />
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Empty wishlist card state */
        <Card className="max-w-lg mx-auto bg-slate-50/50 dark:bg-slate-900/30 border-dashed border-slate-250 dark:border-slate-800 rounded-3xl">
          <CardContent className="p-12 text-center space-y-5">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-850 rounded-2xl flex items-center justify-center mx-auto text-slate-350 dark:text-slate-500">
              <Heart size={28} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-805 dark:text-slate-200">Your Wishlist is Empty</h3>
              <p className="text-xs sm:text-sm text-slate-450 dark:text-slate-500 font-semibold max-w-xs mx-auto">
                No items saved to read later. Explore book details and wishlist them to help train custom recommendations!
              </p>
            </div>
            <Link to="/catalog">
              <Button size="sm" className="font-bold">
                Browse Catalog
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
