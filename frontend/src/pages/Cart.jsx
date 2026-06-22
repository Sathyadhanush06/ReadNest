import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, BookMarked, ShieldCheck, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';

export default function Cart() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { cartItems, updateCartQty, removeFromCart, totalAmount, totalItems, loading } = useCart();
  const { addToast } = useToast();

  const handleQtyChange = (bookId, bookTitle, currentQty, operation) => {
    let nextQty = currentQty;
    if (operation === 'plus') {
      nextQty = currentQty + 1;
    } else if (operation === 'minus' && currentQty > 1) {
      nextQty = currentQty - 1;
    }
    
    if (nextQty !== currentQty) {
      updateCartQty(bookId, nextQty);
      addToast('Cart Updated', `Updated quantity for "${bookTitle}".`, 'info');
    }
  };

  const handleRemove = (bookId, bookTitle) => {
    removeFromCart(bookId);
    addToast('Item Removed', `"${bookTitle}" has been removed from your cart.`, 'info');
  };

  const handleCheckoutClick = () => {
    if (!token) {
      addToast('Authentication Required', 'Please log in to continue to checkout.', 'warning');
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow space-y-4">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-64 w-96 rounded-2xl flex-shrink-0" />
        </div>
      </div>
    );
  }

  const freeShippingThreshold = 50;
  const isFreeShipping = totalAmount >= freeShippingThreshold;
  const amountToFreeShipping = freeShippingThreshold - totalAmount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
        Shopping Cart
      </h1>

      {cartItems.length > 0 ? (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="flex-grow space-y-4 w-full">
            
            {/* Free Shipping Alert banner */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 dark:bg-slate-900/10 dark:border-slate-850 flex items-center gap-3 text-xs sm:text-sm font-semibold">
              <Truck className="text-primary-500 animate-bounce" size={18} />
              <span>
                {isFreeShipping ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Congratulations! Your order qualifies for FREE Shipping.</span>
                ) : (
                  <span>
                    Add <span className="text-primary-600 dark:text-primary-400 font-black">${amountToFreeShipping.toFixed(2)}</span> more to unlock <span className="font-bold">FREE Shipping</span>.
                  </span>
                )}
              </span>
            </div>

            <AnimatePresence mode="popLayout">
              {cartItems.map(item => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                >
                  <Card className="hover:shadow-md transition-all duration-300 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 dark:border-slate-800/80">
                    <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                      
                      {/* Image cover preview */}
                      <Link 
                        to={`/book/${item.id}`}
                        className="w-16 h-20 sm:w-20 sm:h-26 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 flex-shrink-0 flex items-center justify-center block"
                      >
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <BookMarked size={20} className="text-slate-400" />
                        )}
                      </Link>

                      {/* Info and Details */}
                      <div className="flex-grow min-w-0 space-y-1">
                        <Badge variant="success" className="text-[8px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
                          {item.genre}
                        </Badge>
                        <Link to={`/book/${item.id}`} className="block group">
                          <h3 className="font-extrabold text-slate-805 dark:text-white text-sm sm:text-base truncate group-hover:text-primary-655 transition-colors leading-tight">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">{item.author}</p>
                        
                        {/* Price Small Screen */}
                        <span className="font-black text-xs block sm:hidden text-slate-900 dark:text-slate-100 mt-1">${item.price}</span>
                      </div>

                      {/* Quantity Incrementor */}
                      <div className="flex items-center gap-2 border border-slate-205 dark:border-slate-800 p-1.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                        <button 
                          onClick={() => handleQtyChange(item.id, item.title, item.quantity, 'minus')}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-805 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-xs font-black w-6 text-center text-slate-700 dark:text-slate-200">{item.quantity}</span>
                        <button 
                          onClick={() => handleQtyChange(item.id, item.title, item.quantity, 'plus')}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-805 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      {/* Total price for quantity */}
                      <div className="hidden sm:block text-right w-24 flex-shrink-0">
                        <span className="font-black text-sm sm:text-base text-slate-800 dark:text-white block">${(item.price * item.quantity).toFixed(2)}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block">${item.price} each</span>
                      </div>

                      {/* Remove item button */}
                      <button
                        onClick={() => handleRemove(item.id, item.title)}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Remove from Cart"
                      >
                        <Trash2 size={14} />
                      </button>

                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Cart Summary Card */}
          <aside className="w-full lg:w-96 flex-shrink-0">
            <Card className="shadow-md border-white/20 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/45 backdrop-blur-md">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-lg font-black border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-805 dark:text-white">
                  Order Summary
                </h2>

                <div className="space-y-4 text-xs sm:text-sm font-semibold text-slate-450 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-205">${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Total</span>
                    {isFreeShipping ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
                    ) : (
                      <span className="font-extrabold text-slate-700 dark:text-slate-205">$3.99</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes (Estimated)</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-205">$0.00</span>
                  </div>
                  
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2 flex justify-between font-black text-base text-slate-800 dark:text-white">
                    <span>Total Amount</span>
                    <span className="text-lg sm:text-xl">${isFreeShipping ? totalAmount.toFixed(2) : (totalAmount + 3.99).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    onClick={handleCheckoutClick}
                    className="w-full font-bold flex items-center justify-center gap-1.5 shadow-xs"
                    size="md"
                  >
                    Proceed to Checkout <ArrowRight size={14} />
                  </Button>
                  
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                    <ShieldCheck size={12} className="text-emerald-500" /> Secure Payments Protected
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

        </div>
      ) : (
        /* Empty State */
        <Card className="max-w-lg mx-auto bg-slate-50/50 dark:bg-slate-900/30 border-dashed border-slate-250 dark:border-slate-800 rounded-3xl">
          <CardContent className="p-12 text-center space-y-5">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-850 rounded-2xl flex items-center justify-center mx-auto text-slate-350 dark:text-slate-500 animate-bounce">
              <ShoppingBag size={28} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200">Your Cart is Empty</h3>
              <p className="text-xs sm:text-sm text-slate-450 dark:text-slate-500 font-semibold max-w-xs mx-auto">
                Discover match suggestions, explore catalog categories, and add books to check out!
              </p>
            </div>
            <Link to="/catalog">
              <Button size="sm" className="font-bold">
                Go to Catalog
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
