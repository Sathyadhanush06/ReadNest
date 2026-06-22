import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Package, ShoppingBag, Plus, BookOpen, Star, 
  Trash2, User, RefreshCw, BarChart2, ShieldCheck, 
  ChevronRight, AlertCircle, Edit, DollarSign, X, Check, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';

export default function Dashboard() {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  
  // Tab control
  const [activeTab, setActiveTab] = useState('');

  // Datasets
  const [orders, setOrders] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [catalogBooks, setCatalogBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dashboard Metrics
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalBooks: 0,
    totalUsers: 6,
    totalDeals: 0
  });

  // Catalog form states (Admin CRUD)
  const [isEditingCatalog, setIsEditingCatalog] = useState(null); // null or bookId
  const [catalogTitle, setCatalogTitle] = useState('');
  const [catalogAuthor, setCatalogAuthor] = useState('');
  const [catalogGenre, setCatalogGenre] = useState('');
  const [catalogDescription, setCatalogDescription] = useState('');
  const [catalogPrice, setCatalogPrice] = useState('');
  const [catalogStock, setCatalogStock] = useState('');
  const [catalogCover, setCatalogCover] = useState('');

  // Fetch initial data based on role
  useEffect(() => {
    if (user) {
      const stateTab = location.state?.activeTab;
      if (stateTab) {
        setActiveTab(stateTab);
      } else {
        if (user.role === 'admin') {
          setActiveTab('catalog');
        } else if (user.role === 'seller') {
          setActiveTab('inventory');
        } else {
          setActiveTab('orders');
        }
      }
    }
  }, [user, location.state]);

  useEffect(() => {
    if (!token || !activeTab) return;

    if (user.role === 'admin') {
      fetchAdminData();
    } else if (user.role === 'seller') {
      fetchSellerData();
    } else {
      fetchCustomerData();
    }
  }, [activeTab, token]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const ordRes = await fetch(`${API_BASE_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setOrders(ordData);
      }

      const listRes = await fetch(`${API_BASE_URL}/marketplace/my-listings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (listRes.ok) {
        const listData = await listRes.json();
        setMyListings(listData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerData = async () => {
    setLoading(true);
    try {
      const listRes = await fetch(`${API_BASE_URL}/marketplace/my-listings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (listRes.ok) {
        const listData = await listRes.json();
        setMyListings(listData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const ordRes = await fetch(`${API_BASE_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let ordData = [];
      if (ordRes.ok) {
        ordData = await ordRes.json();
        setOrders(ordData);
      }

      const catRes = await fetch(`${API_BASE_URL}/books`);
      let catData = [];
      if (catRes.ok) {
        catData = await catRes.json();
        setCatalogBooks(catData);
      }

      const dealsRes = await fetch(`${API_BASE_URL}/marketplace`);
      let dealsCount = 0;
      if (dealsRes.ok) {
        const dealsData = await dealsRes.json();
        dealsCount = dealsData.length;
      }

      const sumSales = ordData.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

      setMetrics({
        totalSales: sumSales,
        totalBooks: catData.length,
        totalUsers: 6,
        totalDeals: dealsCount
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCatalogBook = async (e) => {
    e.preventDefault();
    if (!catalogTitle || !catalogAuthor || !catalogGenre || !catalogPrice || catalogStock === undefined) {
      addToast('Validation Error', 'Please fill out all required fields.', 'warning');
      return;
    }

    const payload = {
      title: catalogTitle,
      author: catalogAuthor,
      genre: catalogGenre,
      description: catalogDescription,
      price: parseFloat(catalogPrice),
      stock: parseInt(catalogStock),
      image_url: catalogCover || null
    };

    try {
      let response;
      if (isEditingCatalog) {
        response = await fetch(`${API_BASE_URL}/books/${isEditingCatalog}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/books`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        addToast(
          isEditingCatalog ? 'Book Updated' : 'Book Created', 
          isEditingCatalog ? `"${catalogTitle}" updated.` : `"${catalogTitle}" added.`, 
          'success'
        );
        handleResetCatalogForm();
        fetchAdminData();
      } else {
        const err = await response.json();
        addToast('Action Failed', err.message || 'Error occurred.', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditCatalogClick = (book) => {
    setIsEditingCatalog(book.id);
    setCatalogTitle(book.title);
    setCatalogAuthor(book.author);
    setCatalogGenre(book.genre);
    setCatalogDescription(book.description);
    setCatalogPrice(book.price);
    setCatalogStock(book.stock);
    setCatalogCover(book.image_url || '');
  };

  const handleResetCatalogForm = () => {
    setIsEditingCatalog(null);
    setCatalogTitle('');
    setCatalogAuthor('');
    setCatalogGenre('');
    setCatalogDescription('');
    setCatalogPrice('');
    setCatalogStock('');
    setCatalogCover('');
  };

  const handleDeleteCatalogBook = async (bookId, bookTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${bookTitle}" from catalog?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        addToast('Book Removed', `"${bookTitle}" removed from store catalog.`, 'info');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        addToast('Order Status Updated', `Order #000${orderId} marked as ${newStatus}.`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUsedListing = async (listingId, bookName) => {
    if (!window.confirm(`Delete listing for "${bookName}"?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/marketplace/${listingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        addToast('Listing Deleted', `Listing for "${bookName}" removed.`, 'info');
        if (user.role === 'customer') fetchCustomerData();
        if (user.role === 'seller') fetchSellerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkListingSold = async (listingId, bookName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/marketplace/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'sold' })
      });
      if (response.ok) {
        addToast('Marked as Sold', `"${bookName}" listing marked sold.`, 'success');
        if (user.role === 'customer') fetchCustomerData();
        if (user.role === 'seller') fetchSellerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Profile Summary Card Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-xl relative overflow-hidden">
        {/* Glow node */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-rose-455 text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-white/20 uppercase">
            {user.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black">{user.name}</h1>
            <div className="flex flex-wrap gap-2 items-center text-xs text-slate-400 font-semibold">
              <span>{user.email}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
              <Badge variant="default" className="bg-primary-500/15 text-primary-400 border border-primary-500/35 uppercase text-[9px] font-black tracking-widest rounded-md">
                {user.role} Account
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Admin System Overview Panel */}
      {user.role === 'admin' && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="shadow-xs border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-primary-500/15 text-primary-600 dark:text-primary-400 rounded-2xl shadow-inner"><DollarSign size={20} /></div>
              <div>
                <span className="text-[10px] text-slate-405 dark:text-slate-500 font-extrabold block uppercase tracking-wider">Total Sales</span>
                <span className="text-base sm:text-lg font-black text-slate-850 dark:text-white">${metrics.totalSales.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-xs border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-primary-500/15 text-primary-600 dark:text-primary-400 rounded-2xl shadow-inner"><BookOpen size={20} /></div>
              <div>
                <span className="text-[10px] text-slate-405 dark:text-slate-500 font-extrabold block uppercase tracking-wider">Catalog Books</span>
                <span className="text-base sm:text-lg font-black text-slate-855 dark:text-white">{metrics.totalBooks}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-primary-500/15 text-primary-600 dark:text-primary-400 rounded-2xl shadow-inner"><User size={20} /></div>
              <div>
                <span className="text-[10px] text-slate-405 dark:text-slate-500 font-extrabold block uppercase tracking-wider">Registered</span>
                <span className="text-base sm:text-lg font-black text-slate-855 dark:text-white">{metrics.totalUsers}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-primary-500/15 text-primary-600 dark:text-primary-400 rounded-2xl shadow-inner"><RefreshCw size={20} /></div>
              <div>
                <span className="text-[10px] text-slate-405 dark:text-slate-500 font-extrabold block uppercase tracking-wider">Market Deals</span>
                <span className="text-base sm:text-lg font-black text-slate-855 dark:text-white">{metrics.totalDeals}</span>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Main Switcher Panels Section */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        
        {/* Switchers Side Panel */}
        <aside className="w-full sm:w-60 flex-shrink-0 flex flex-row sm:flex-col gap-2 p-2.5 rounded-2xl border border-white/20 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md shadow-xs overflow-x-auto select-none">
          {user.role === 'customer' && (
            <>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full py-3 px-4 rounded-xl text-left text-xs font-black transition-all flex items-center gap-2.5 ${
                  activeTab === 'orders' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm' : 'text-slate-655 dark:text-slate-400 hover:bg-slate-105/50 dark:hover:bg-slate-855/30'
                }`}
              >
                <Package size={14} /> View Orders
              </button>
              <button
                onClick={() => setActiveTab('used')}
                className={`w-full py-3 px-4 rounded-xl text-left text-xs font-black transition-all flex items-center gap-2.5 ${
                  activeTab === 'used' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm' : 'text-slate-655 dark:text-slate-400 hover:bg-slate-105/50 dark:hover:bg-slate-855/30'
                }`}
              >
                <RefreshCw size={14} /> Marketplace Resales
              </button>
            </>
          )}

          {user.role === 'seller' && (
            <>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`w-full py-3 px-4 rounded-xl text-left text-xs font-black transition-all flex items-center gap-2.5 ${
                  activeTab === 'inventory' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm' : 'text-slate-655 dark:text-slate-400 hover:bg-slate-105/50 dark:hover:bg-slate-855/30'
                }`}
              >
                <BookOpen size={14} /> Managed Listings
              </button>
            </>
          )}

          {user.role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('catalog')}
                className={`w-full py-3 px-4 rounded-xl text-left text-xs font-black transition-all flex items-center gap-2.5 ${
                  activeTab === 'catalog' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm' : 'text-slate-655 dark:text-slate-400 hover:bg-slate-105/50 dark:hover:bg-slate-855/30'
                }`}
              >
                <BookOpen size={14} /> Store Catalog
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full py-3 px-4 rounded-xl text-left text-xs font-black transition-all flex items-center gap-2.5 ${
                  activeTab === 'orders' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm' : 'text-slate-655 dark:text-slate-400 hover:bg-slate-105/50 dark:hover:bg-slate-855/30'
                }`}
              >
                <Package size={14} /> Customer Orders
              </button>
            </>
          )}
        </aside>

        {/* Panels Body */}
        <section className="flex-grow w-full min-w-0">
          <Card className="shadow-xs border-white/20 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
            <CardContent className="p-6">
              
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/3 rounded-xl" />
                  <Skeleton className="h-28 w-full rounded-2xl animate-pulse" />
                  <Skeleton className="h-28 w-full rounded-2xl animate-pulse" />
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  
                  {/* TAB: CUSTOMER ORDERS */}
                  {activeTab === 'orders' && user.role === 'customer' && (
                    <motion.div
                      key="customer-orders"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <h2 className="text-lg font-black text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                        Order History
                      </h2>
                      {orders.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-4">
                          {orders.map(order => (
                            <div key={order.id} className="pt-4 flex justify-between items-center gap-4 text-xs sm:text-sm">
                              <div>
                                <span className="font-extrabold text-slate-705 dark:text-slate-300 block">Order ID: #RN-000{order.id}</span>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide block mt-0.5">Placed: {new Date(order.created_at).toLocaleDateString()}</span>
                                <span className="font-black block text-slate-900 dark:text-slate-50 mt-1.5">${order.total_amount}</span>
                              </div>
                              <div className="text-right">
                                <span className={`text-[9px] uppercase tracking-widest px-2.5 py-1 rounded font-black border ${
                                  order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15' :
                                  order.status === 'cancelled' ? 'bg-rose-500/10 text-rose-605 border-rose-500/15' :
                                  'bg-amber-500/10 text-amber-600 border-amber-500/15 animate-pulse'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-400 font-bold text-xs">No orders recorded yet. Discover catalog books to place an order!</div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB: CUSTOMER USED LISTINGS */}
                  {activeTab === 'used' && user.role === 'customer' && (
                    <motion.div
                      key="customer-used"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <h2 className="text-lg font-black text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                        Your Marketplace Listings
                      </h2>
                      {myListings.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-4">
                          {myListings.map(listing => (
                            <div key={listing.id} className="pt-4 flex justify-between items-center gap-4 text-xs sm:text-sm">
                              <div>
                                <h4 className="font-extrabold text-slate-805 dark:text-white truncate max-w-[200px] sm:max-w-xs">{listing.book_name}</h4>
                                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block mt-0.5">Condition: {listing.condition_state}</span>
                                <span className="font-black block mt-1 text-slate-900 dark:text-slate-50">${listing.price}</span>
                              </div>
                              <div className="flex gap-2">
                                {listing.status === 'available' ? (
                                  <>
                                    <Button
                                      onClick={() => handleMarkListingSold(listing.id, listing.book_name)}
                                      className="font-bold h-8 px-3 rounded-lg text-xs"
                                      variant="default"
                                    >
                                      Mark Sold
                                    </Button>
                                    <button
                                      onClick={() => handleDeleteUsedListing(listing.id, listing.book_name)}
                                      className="p-2 bg-slate-50 dark:bg-slate-850 text-rose-500 hover:bg-rose-550/15 rounded-xl transition-all"
                                      title="Delete Listing"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </>
                                ) : (
                                  <Badge variant="secondary" className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold">Sold</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-405 font-bold text-xs">You have no marketplace used listings.</div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB: SELLER INVENTORY */}
                  {activeTab === 'inventory' && user.role === 'seller' && (
                    <motion.div
                      key="seller-inventory"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <h2 className="text-lg font-black text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                        Marketplace Inventory
                      </h2>
                      {myListings.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-4">
                          {myListings.map(listing => (
                            <div key={listing.id} className="pt-4 flex justify-between items-center gap-4 text-xs sm:text-sm">
                              <div>
                                <h4 className="font-extrabold text-slate-805 dark:text-white truncate max-w-[200px] sm:max-w-xs">{listing.book_name}</h4>
                                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block mt-0.5">Condition: {listing.condition_state}</span>
                                <span className="font-black block mt-1 text-slate-900 dark:text-slate-50">${listing.price}</span>
                              </div>
                              <div className="flex gap-2">
                                {listing.status === 'available' ? (
                                  <>
                                    <Button
                                      onClick={() => handleMarkListingSold(listing.id, listing.book_name)}
                                      className="font-bold h-8 px-3 rounded-lg text-xs"
                                      variant="default"
                                    >
                                      Mark Sold
                                    </Button>
                                    <button
                                      onClick={() => handleDeleteUsedListing(listing.id, listing.book_name)}
                                      className="p-2 bg-slate-50 dark:bg-slate-850 text-rose-500 hover:bg-rose-550/15 rounded-xl transition-all"
                                      title="Delete Listing"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </>
                                ) : (
                                  <Badge variant="secondary" className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold">Sold</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-405 font-bold text-xs">Your listing inventory is currently empty.</div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB: ADMIN CATALOG CRUD */}
                  {activeTab === 'catalog' && user.role === 'admin' && (
                    <motion.div
                      key="admin-catalog"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                      {/* CRUD Form */}
                      <Card className="bg-slate-50/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 rounded-2xl h-fit">
                        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-850 flex flex-row items-center justify-between">
                          <h3 className="text-xs uppercase tracking-widest text-slate-700 dark:text-slate-350 font-black">
                            {isEditingCatalog ? 'Edit Store Book' : 'Add Catalog Book'}
                          </h3>
                          {isEditingCatalog && (
                            <button onClick={handleResetCatalogForm} className="text-[10px] text-rose-500 font-black hover:underline uppercase">Cancel</button>
                          )}
                        </CardHeader>
                        <CardContent className="p-5 pt-4">
                          <form onSubmit={handleSaveCatalogBook} className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Book Title</label>
                              <Input
                                type="text"
                                value={catalogTitle}
                                onChange={e => setCatalogTitle(e.target.value)}
                                placeholder="Title"
                                required
                                className="h-9.5 text-xs rounded-lg"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Author Name</label>
                              <Input
                                type="text"
                                value={catalogAuthor}
                                onChange={e => setCatalogAuthor(e.target.value)}
                                placeholder="Author"
                                required
                                className="h-9.5 text-xs rounded-lg"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Genre</label>
                                <Input
                                  type="text"
                                  value={catalogGenre}
                                  onChange={e => setCatalogGenre(e.target.value)}
                                  placeholder="Genre"
                                  required
                                  className="h-9.5 text-xs rounded-lg"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Price ($)</label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={catalogPrice}
                                  onChange={e => setCatalogPrice(e.target.value)}
                                  placeholder="0.00"
                                  required
                                  className="h-9.5 text-xs rounded-lg"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Stock Qty</label>
                                <Input
                                  type="number"
                                  value={catalogStock}
                                  onChange={e => setCatalogStock(e.target.value)}
                                  placeholder="10"
                                  required
                                  className="h-9.5 text-xs rounded-lg"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Cover URL</label>
                                <Input
                                  type="text"
                                  value={catalogCover}
                                  onChange={e => setCatalogCover(e.target.value)}
                                  placeholder="https://..."
                                  className="h-9.5 text-xs rounded-lg"
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Synopsis</label>
                              <textarea
                                rows="3"
                                value={catalogDescription}
                                onChange={e => setCatalogDescription(e.target.value)}
                                placeholder="Description synopsis..."
                                className="w-full px-3.5 py-2 border border-slate-205 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-xs focus:outline-none focus:border-primary-500 dark:text-slate-100"
                                required
                              ></textarea>
                            </div>
                            <Button
                              type="submit"
                              className="w-full font-bold text-xs"
                              size="sm"
                            >
                              {isEditingCatalog ? 'Update Book' : 'Publish Catalog Book'}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>

                      {/* Catalog Listing */}
                      <div className="lg:col-span-2 space-y-4 max-h-[560px] overflow-y-auto pr-2">
                        <h3 className="font-extrabold text-slate-800 dark:text-white text-xs uppercase tracking-widest">Current Store Catalog</h3>
                        {catalogBooks.length > 0 ? (
                          <div className="space-y-3">
                            {catalogBooks.map(book => (
                              <div 
                                key={book.id} 
                                className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-850 rounded-xl flex items-center justify-between text-xs gap-3"
                              >
                                <div className="min-w-0 flex-grow">
                                  <h4 className="font-extrabold text-slate-800 dark:text-slate-205 truncate leading-snug">{book.title}</h4>
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider block mt-0.5">
                                    {book.author} • {book.genre} • ${book.price} • Stock: {book.stock}
                                  </span>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                  <button
                                    onClick={() => handleEditCatalogClick(book)}
                                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-350 rounded-lg transition-all"
                                    title="Edit Book"
                                  >
                                    <Edit size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCatalogBook(book.id, book.title)}
                                    className="p-2 bg-rose-50 text-rose-500 dark:bg-rose-955/20 dark:text-rose-455 rounded-lg transition-all"
                                    title="Delete Book"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-slate-400 text-xs">Catalog is currently empty.</div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB: ADMIN CUSTOMER ORDERS */}
                  {activeTab === 'orders' && user.role === 'admin' && (
                    <motion.div
                      key="admin-orders"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <h2 className="text-lg font-black text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                        Manage Customer Store Orders
                      </h2>
                      {orders.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-4 max-h-[500px] overflow-y-auto pr-2">
                          {orders.map(order => (
                            <div key={order.id} className="pt-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs sm:text-sm">
                              <div>
                                <span className="font-extrabold text-slate-705 dark:text-slate-355 block">Order ID: #RN-000{order.id}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide block mt-0.5">Customer: {order.user_name} ({order.user_email})</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide block mt-0.5">Placed: {new Date(order.created_at).toLocaleDateString()}</span>
                                <span className="font-black block text-slate-900 dark:text-slate-50 mt-1.5">${order.total_amount}</span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <label className="text-[9px] text-slate-450 dark:text-slate-500 uppercase font-black tracking-wider">Status:</label>
                                <select
                                  value={order.status}
                                  onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-black text-slate-700 dark:text-slate-300 focus:outline-none glossy-input"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="packed">Packed</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-405 text-xs font-bold">No customer store orders recorded yet.</div>
                      )}
                    </motion.div>
                  )}

                </AnimatePresence>
              )}

            </CardContent>
          </Card>
        </section>
      </div>

    </div>
  );
}
