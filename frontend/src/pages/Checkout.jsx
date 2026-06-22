import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, CreditCard, CheckCircle, ArrowLeft, Loader, MapPin, Phone, Truck, Calendar, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

function ConfettiCanvas({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const particles = Array.from({ length: 120 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * -height - 20,
      r: Math.random() * 6 + 4,
      d: Math.random() * height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0,
      speed: Math.random() * 3 + 2,
    }));

    const resizeHandler = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', resizeHandler);

    function draw() {
      ctx.clearRect(0, 0, width, height);
      let finished = true;

      particles.forEach((p) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += p.speed;
        p.x += Math.sin(p.tiltAngle) * 0.5;
        p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 5;

        if (p.y < height) {
          finished = false;
        }

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });

      if (!finished) {
        animationFrameId = requestAnimationFrame(draw);
      }
    }

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeHandler);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const { cartItems, totalAmount, clearCart } = useCart();
  const { addToast } = useToast();

  const checkoutState = location.state || {};
  const isMarketplaceCheckout = checkoutState.type === 'marketplace';
  const marketplaceListing = checkoutState.listing;

  const displayItems = isMarketplaceCheckout && marketplaceListing
    ? [{ id: marketplaceListing.id, title: `${marketplaceListing.book_name} (Used - ${marketplaceListing.condition_state})`, quantity: 1, price: parseFloat(marketplaceListing.price || 0) }] 
    : cartItems;

  const displayTotal = isMarketplaceCheckout && marketplaceListing ? parseFloat(marketplaceListing.price || 0) : totalAmount;

  const [purchasedItems, setPurchasedItems] = useState([]);
  const [finalPaidAmount, setFinalPaidAmount] = useState(0);

  // Delivery Fields
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');

  // Payment simulated fields
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardFocused, setCardFocused] = useState(false); // to flip or highlight card

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null); // Will hold the created order ID

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address || !city || !zip || !phone || !cardNumber || !cardCvc) {
      addToast('Validation Error', 'Please fill out all address and payment fields.', 'warning');
      return;
    }

    setLoading(true);
    try {
      let response;
      let data;
      if (isMarketplaceCheckout) {
        response = await fetch(`${API_BASE_URL}/marketplace/${marketplaceListing.id}/buy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        data = await response.json();
      } else {
        response = await fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        data = await response.json();
      }

      if (response.ok) {
        if (isMarketplaceCheckout) {
          setPurchasedItems(displayItems);
          setFinalPaidAmount(parseFloat(marketplaceListing.price || 0));
          setOrderSuccess(`MP-${marketplaceListing.id}`);
          addToast('Purchase Confirmed!', `Successfully purchased used copy of "${marketplaceListing.book_name}".`, 'success');
        } else {
          setPurchasedItems([...cartItems]);
          setFinalPaidAmount(totalAmount);
          setOrderSuccess(data.orderId);
          clearCart(); // Clear local shopping cart state
          addToast('Order Placed!', 'Your order has been registered successfully.', 'success');
        }
      } else {
        addToast('Checkout Failed', data.message || 'Error processing order.', 'error');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      addToast('Connection Error', 'Network error placing order.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryEstimate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 3); // 3 days shipping
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Render format card number for visualization
  const formatCardNumber = (num) => {
    const defaultNum = '•••• •••• •••• ••••';
    if (!num) return defaultNum;
    const cleanNum = num.replace(/\s?/g, '');
    let result = '';
    for (let i = 0; i < 16; i++) {
      if (i < cleanNum.length) {
        result += cleanNum[i];
      } else {
        result += '•';
      }
      if ((i + 1) % 4 === 0 && i < 15) {
        result += ' ';
      }
    }
    return result;
  };

  // Redirect to Cart if empty
  if (!isMarketplaceCheckout && cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <ShoppingBag size={48} className="mx-auto text-slate-350" />
        <h2 className="text-xl font-bold">Checkout is Empty</h2>
        <Link to="/cart">
          <Button size="sm">Go to Shopping Cart</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 relative">
      
      {/* Back to Cart */}
      <Link to={isMarketplaceCheckout ? "/marketplace" : "/cart"} className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-655 dark:hover:text-slate-255 text-xs sm:text-sm font-bold transition-colors">
        <ArrowLeft size={14} /> {isMarketplaceCheckout ? "Back to Marketplace" : "Back to Shopping Cart"}
      </Link>

      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-2">
        Secure Checkout
      </h1>

      <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Side: Address and Card Info */}
        <div className="flex-grow space-y-8 w-full">
          
          {/* Shipping Address Card */}
          <Card className="shadow-xs border-white/20 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
            <CardContent className="p-6 space-y-5">
              <h2 className="text-lg font-black text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <MapPin size={16} className="text-primary-500" /> Delivery Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Street Address</label>
                  <Input
                    type="text"
                    placeholder="123 Bookstore lane, Suite 4B"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">City</label>
                  <Input
                    type="text"
                    placeholder="Gotham City"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">ZIP / Postal Code</label>
                  <Input
                    type="text"
                    placeholder="10001"
                    value={zip}
                    onChange={e => setZip(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Phone Number</label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                      className="pl-9"
                    />
                    <Phone size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Payment Simulation */}
          <Card className="shadow-xs border-white/20 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-lg font-black text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <CreditCard size={16} className="text-primary-500" /> Card Payment Simulation
              </h2>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                
                {/* Credit Card Visualizer Container */}
                <motion.div 
                  className="w-full sm:w-80 h-48 rounded-2xl p-6 text-white relative shadow-lg overflow-hidden flex flex-col justify-between"
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)'
                  }}
                  animate={{ rotateY: cardFocused ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Glowing light node */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  
                  {!cardFocused ? (
                    <>
                      <div className="flex justify-between items-start">
                        {/* Chip graphic */}
                        <div className="w-10 h-7 bg-amber-400/80 rounded-md border border-amber-300 flex flex-col justify-between p-1.5 shadow-inner">
                          <div className="grid grid-cols-3 gap-0.5 w-full h-full opacity-60">
                            {[...Array(6)].map((_, i) => (
                              <div key={i} className="bg-slate-950/20 rounded-2xs"></div>
                            ))}
                          </div>
                        </div>
                        <span className="font-black italic text-lg tracking-widest text-white/90">VISA</span>
                      </div>

                      {/* Card Number display */}
                      <div className="text-base sm:text-lg font-mono tracking-widest text-center py-2.5">
                        {formatCardNumber(cardNumber)}
                      </div>

                      <div className="flex justify-between items-end text-xs font-mono">
                        <div className="space-y-0.5 truncate max-w-[170px]">
                          <span className="text-[8px] uppercase text-white/60 tracking-wider block">Card Holder</span>
                          <span className="font-bold tracking-wider truncate block">{cardName.toUpperCase() || 'CARDHOLDER NAME'}</span>
                        </div>
                        <div className="space-y-0.5 flex-shrink-0 text-right">
                          <span className="text-[8px] uppercase text-white/60 tracking-wider block">Expires</span>
                          <span className="font-bold tracking-wider">{cardExpiry || 'MM/YY'}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col justify-between h-full py-2" style={{ transform: 'rotateY(180deg)' }}>
                      <div className="w-full h-10 bg-slate-950 -mx-6"></div>
                      <div className="space-y-1.5">
                        <span className="text-[8px] uppercase text-white/60 tracking-wider block">Security CVC</span>
                        <div className="w-full bg-white text-slate-800 text-right px-3 py-1.5 rounded-lg font-mono font-bold tracking-widest text-sm shadow-inner">
                          {cardCvc || '•••'}
                        </div>
                      </div>
                      <div className="text-[8px] text-white/40 text-center font-bold">Simulated ReadNest checkout engine.</div>
                    </div>
                  )}
                </motion.div>

                {/* Credit Card Inputs Fields */}
                <div className="flex-grow w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-3">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Cardholder Full Name</label>
                    <Input
                      type="text"
                      placeholder="Johnathan Doe"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      onFocus={() => setCardFocused(false)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Credit Card Number</label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        onFocus={() => setCardFocused(false)}
                        required
                        className="pl-9"
                      />
                      <CreditCard size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Expiry Date</label>
                    <Input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      onFocus={() => setCardFocused(false)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">CVC Code</label>
                    <Input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={cardCvc}
                      onChange={e => setCardCvc(e.target.value)}
                      onFocus={() => setCardFocused(true)}
                      onBlur={() => setCardFocused(false)}
                      required
                    />
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Order Review Summary */}
        <aside className="w-full lg:w-96 flex-shrink-0">
          <Card className="shadow-md border-white/20 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-lg font-black border-b border-slate-100 dark:border-slate-800 pb-3 text-slate-800 dark:text-white">
                Review Items
              </h2>

              <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                {displayItems.map(item => (
                  <div key={item.id} className="flex justify-between items-start gap-3 text-xs sm:text-sm pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-slate-805 dark:text-slate-200 truncate leading-snug">{item.title}</h4>
                      <span className="text-[9px] text-slate-405 dark:text-slate-500 font-bold block mt-0.5">Quantity: {item.quantity} × ${item.price}</span>
                    </div>
                    <span className="font-black text-slate-700 dark:text-slate-200 flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
                <div className="flex justify-between text-base font-black text-slate-850 dark:text-white">
                  <span>Estimated Total</span>
                  <span className="text-lg sm:text-xl">${displayTotal.toFixed(2)}</span>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full font-bold flex items-center justify-center gap-1.5"
                  size="md"
                >
                  {loading ? (
                    <>
                      <Loader size={15} className="animate-spin" /> Authorizing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} /> Pay & Place Order
                    </>
                  )}
                </Button>
                <p className="text-[9px] text-center text-slate-400 font-bold">Secure SSL transmission. Placed order is simulated.</p>
              </div>
            </CardContent>
          </Card>
        </aside>

      </form>

      {/* Success Popup Modal Overlay */}
      <AnimatePresence>
        {orderSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
            {/* Confetti canvas animation */}
            <ConfettiCanvas active={!!orderSuccess} />

            {/* Dark glass backdrop blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-xl bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden z-10 backdrop-blur-xl"
            >
              {/* Success background glow node */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="p-8 sm:p-10 text-center space-y-6">
                
                {/* Checkmark bubble */}
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-500/15">
                  <CheckCircle size={36} className="animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-855 dark:text-white tracking-tight">Order Confirmed!</h2>
                  <p className="text-xs sm:text-sm text-slate-450 dark:text-slate-500 font-semibold max-w-sm mx-auto">
                    {isMarketplaceCheckout 
                      ? 'Thank you for your purchase. Your P2P transaction has been successfully recorded.'
                      : 'Thank you for shopping at ReadNest. Your receipt has been emailed.'}
                  </p>
                </div>

                {/* High-visibility Order Detail Panel */}
                <div className="p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850 rounded-2xl text-left space-y-4">
                  
                  {/* Order ID */}
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-455 dark:text-slate-500 uppercase tracking-widest font-extrabold">Order Identifier</span>
                    <span className="text-lg font-black bg-gradient-to-r from-primary-600 to-rose-500 bg-clip-text text-transparent">
                      {orderSuccess && orderSuccess.toString().startsWith('MP-') ? `#${orderSuccess}` : `#RN-000${orderSuccess}`}
                    </span>
                  </div>

                  {/* Purchased books summary listing */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-455 dark:text-slate-505 uppercase tracking-widest font-extrabold block">Purchased Items</span>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1 text-slate-700 dark:text-slate-300">
                      {purchasedItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-xs font-semibold">
                          <span className="truncate max-w-[280px]">{item.title}</span>
                          <span className="text-slate-400 font-extrabold flex-shrink-0">Qty: {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total Paid Amount */}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-widest font-extrabold">Total Amount</span>
                    <span className="text-base font-black text-slate-850 dark:text-white">${finalPaidAmount.toFixed(2)}</span>
                  </div>

                  {/* Delivery Estimate */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-3 items-start">
                    <Truck size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-405 dark:text-slate-550 uppercase tracking-widest font-extrabold block">
                        {isMarketplaceCheckout ? 'P2P Coordination' : 'Estimated Delivery'}
                      </span>
                      <span className="text-xs font-black text-slate-705 dark:text-slate-205 leading-relaxed">
                        {isMarketplaceCheckout 
                          ? `The seller ${marketplaceListing?.seller_name} (${marketplaceListing?.seller_email}) has been notified. They will contact you shortly to coordinate shipping or meetup.` 
                          : getDeliveryEstimate()}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => navigate(isMarketplaceCheckout ? '/marketplace' : '/dashboard', isMarketplaceCheckout ? undefined : { state: { activeTab: 'orders' } })}
                    className="flex-grow font-bold flex items-center justify-center gap-1.5"
                    size="md"
                  >
                    <Calendar size={15} /> {isMarketplaceCheckout ? 'Marketplace Hub' : 'Track Order'}
                  </Button>
                  <Link to={isMarketplaceCheckout ? "/marketplace" : "/catalog"} className="flex-grow">
                    <Button 
                      variant="outline"
                      className="w-full font-bold"
                      size="md"
                    >
                      {isMarketplaceCheckout ? 'Back to Marketplace' : 'Continue Shopping'}
                    </Button>
                  </Link>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
