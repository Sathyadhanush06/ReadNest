import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import BookDetails from './pages/BookDetails';
import LoginRegister from './pages/LoginRegister';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Marketplace from './pages/Marketplace';
import Dashboard from './pages/Dashboard';

// Protected Route Wrap
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function MainAppContent() {
  const [theme, setTheme] = useState(localStorage.getItem('rn_theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('rn_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 relative overflow-x-hidden">
        {/* Liquid Organic Blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-indigo-450/20 to-purple-500/20 dark:from-indigo-650/10 dark:to-purple-650/10 blur-3xl animate-liquid-1"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-rose-400/15 to-amber-400/15 dark:from-rose-600/8 dark:to-amber-600/8 blur-3xl animate-liquid-2"></div>
          <div className="absolute top-[35%] right-[15%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-teal-400/15 to-indigo-400/15 dark:from-teal-600/8 dark:to-indigo-600/8 blur-3xl animate-liquid-3"></div>
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar theme={theme} toggleTheme={toggleTheme} />
          
          <main className="flex-grow pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/book/:id" element={<BookDetails />} />
              <Route path="/login" element={<LoginRegister />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/marketplace" element={<Marketplace />} />
              
              {/* Protected Routes */}
              <Route path="/wishlist" element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              {/* Catch All */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <MainAppContent />
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
