import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BookOpen, Plus, DollarSign, X, Check, Eye, HelpCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';

export default function Marketplace() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { addToast } = useToast();
  
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Listing Fields
  const [bookName, setBookName] = useState('');
  const [condition, setCondition] = useState('Good');
  const [price, setPrice] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/marketplace`);
      if (response.ok) {
        const data = await response.json();
        setListings(data);
      }
    } catch (err) {
      console.error('Error fetching marketplace listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyItem = (item) => {
    if (!token) {
      addToast('Authentication Required', 'Please log in to purchase used books.', 'warning');
      return;
    }
    // Redirect to the Checkout page passing marketplace info in routing state
    navigate('/checkout', { state: { type: 'marketplace', listing: item } });
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!bookName || !price) {
      addToast('Validation Error', 'Please enter a book title and pricing value.', 'warning');
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/marketplace`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookName, condition, price })
      });

      if (response.ok) {
        addToast('Listing Created', `Successfully listed "${bookName}" on marketplace.`, 'success');
        setIsModalOpen(false);
        setBookName('');
        setCondition('Good');
        setPrice('');
        fetchListings();
      } else {
        const err = await response.json();
        addToast('Listing Error', err.message || 'Could not list used book.', 'error');
      }
    } catch (err) {
      console.error('Listing creation error:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  const getConditionColor = (cond) => {
    switch (cond) {
      case 'Like New':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 dark:border-emerald-500/30';
      case 'Good':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25 dark:border-indigo-500/30';
      case 'Fair':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 dark:border-amber-500/30';
      case 'Poor':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25 dark:border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/25 dark:border-slate-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 relative">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 dark:border-slate-800 pb-6">
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-855 dark:text-white flex items-center gap-2.5">
            Used Book Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-450 dark:text-slate-500 font-semibold">
            Trade, swap, and purchase pre-loved books from other community readers.
          </p>
        </div>

        <Button
          onClick={() => {
            if (!token) {
              addToast('Authentication Required', 'Log in to create marketplace listings.', 'warning');
              return;
            }
            setIsModalOpen(true);
          }}
          className="font-bold flex items-center gap-1.5 shadow-sm"
          size="md"
        >
          <Plus size={16} /> List a Used Book
        </Button>
      </div>

      {/* Listing Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="space-y-4">
              <Skeleton className="h-44 w-full rounded-2xl animate-pulse" />
              <Skeleton className="h-4 w-3/4 animate-pulse" />
            </div>
          ))}
        </div>
      ) : listings.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        >
          {listings.map(item => {
            const isSeller = user && user.id === item.seller_id;
            return (
              <motion.div key={item.id} variants={itemVariants}>
                <Card className="hover:shadow-lg transition-all duration-300 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 dark:border-slate-800/80 hover:-translate-y-1.5 shadow-2xs">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      {/* Condition Badge */}
                      <span className={`text-[9px] uppercase tracking-widest px-2.5 py-1 rounded font-black border ${getConditionColor(item.condition_state)}`}>
                        {item.condition_state}
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">${item.price}</span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-slate-805 dark:text-white text-base leading-snug line-clamp-2">
                        {item.book_name}
                      </h3>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
                        Listed by: <span className="text-slate-700 dark:text-slate-350 font-black normal-case text-xs">{item.seller_name}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-855">
                      {isSeller ? (
                        <div className="w-full py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 rounded-xl text-center text-xs font-black text-slate-400 select-none">
                          Your Marketplace Listing
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleBuyItem(item)}
                          className="w-full font-bold flex items-center justify-center gap-1.5"
                          size="sm"
                        >
                          <Check size={14} /> Buy Used Book
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        /* Empty state */
        <Card className="max-w-lg mx-auto bg-slate-50/50 dark:bg-slate-900/30 border-dashed border-slate-250 dark:border-slate-800 rounded-3xl">
          <CardContent className="p-12 text-center space-y-5">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-850 rounded-2xl flex items-center justify-center mx-auto text-slate-350 dark:text-slate-500">
              <ShoppingBag size={28} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-805 dark:text-slate-200">Marketplace is Quiet</h3>
              <p className="text-xs sm:text-sm text-slate-455 dark:text-slate-500 font-semibold max-w-xs mx-auto">
                No pre-loved copies are listed on the marketplace hub right now. List yours to trade with other readers!
              </p>
            </div>
            <Button
              onClick={() => {
                if (!token) {
                  addToast('Authentication Required', 'Log in to list marketplace items.', 'warning');
                  return;
                }
                setIsModalOpen(true);
              }}
              size="sm"
              className="font-bold"
            >
              Post a Used Book
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
            />
            
            {/* Modal Dialog */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden z-10 backdrop-blur-xl"
            >
              
              <div className="p-6 bg-slate-900/90 dark:bg-slate-950/90 text-white flex justify-between items-center border-b border-white/10">
                <h2 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                  <BookOpen size={16} className="text-indigo-400" /> Post Used Book Listing
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateListing} className="p-6 space-y-5 text-slate-700 dark:text-slate-200">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Book Title & Edition</label>
                  <Input
                    type="text"
                    placeholder="e.g. The Hobbit (4th Edition Hardcover)"
                    value={bookName}
                    onChange={e => setBookName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Condition</label>
                    <select
                      value={condition}
                      onChange={e => setCondition(e.target.value)}
                      className="w-full px-3.5 h-11 text-xs focus:outline-none text-slate-850 dark:text-slate-105 font-semibold rounded-2xl glossy-input"
                    >
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Asking Price ($)</label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        required
                        className="pl-7"
                      />
                      <span className="absolute left-3.5 top-3 text-xs text-slate-400 font-bold">$</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full font-bold flex items-center justify-center gap-1.5"
                    size="md"
                  >
                    {submitLoading ? 'Creating Listing...' : 'Publish Listing'}
                  </Button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
