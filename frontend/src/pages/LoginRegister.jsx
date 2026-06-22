import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogIn, UserPlus, Mail, Lock, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';

export default function LoginRegister() {
  const navigate = useNavigate();
  const { login, token } = useAuth();
  const { addToast } = useToast();

  // Redirect if already authenticated
  if (token) {
    navigate('/dashboard');
  }

  const [activeTab, setActiveTab] = useState('login'); // login | register
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('customer'); // customer | seller

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
    setRole('customer');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (response.ok) {
        login(data.token, data.user);
        addToast('Welcome Back!', `Successfully logged in as ${data.user.name}.`, 'success');
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid email or password');
        addToast('Login Failed', data.message || 'Invalid credentials.', 'error');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the server.');
      addToast('Connection Error', 'Could not reach server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await response.json();
      if (response.ok) {
        login(data.token, data.user);
        addToast('Account Created!', `Welcome to ReadNest, ${data.user.name}!`, 'success');
        navigate('/dashboard');
      } else {
        setError(data.message || 'Registration failed');
        addToast('Registration Failed', data.message || 'Check credentials.', 'error');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the server.');
      addToast('Connection Error', 'Could not reach server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 relative">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 18 }}
        className="w-full relative z-10"
      >
        <Card className="shadow-2xl overflow-hidden border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-7 text-white text-center space-y-1.5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary-500/10 to-transparent pointer-events-none"></div>
            <h2 className="text-2xl font-black flex items-center justify-center gap-2">
              <Sparkles size={18} className="text-primary-400 animate-pulse" /> Welcome to ReadNest
            </h2>
            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">
              AI recommendations & peer marketplace
            </p>
          </div>

          {/* Custom Tabs Slider */}
          <div className="flex border-b border-slate-100 dark:border-slate-805 relative bg-slate-50/50 dark:bg-slate-950/20">
            <button
              onClick={() => handleTabChange('login')}
              className={`flex-grow py-4.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-colors relative z-10 ${
                activeTab === 'login'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-slate-400 hover:text-slate-655 dark:hover:text-slate-350'
              }`}
            >
              <LogIn size={15} /> Log In
              {activeTab === 'login' && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-655 dark:bg-primary-500"
                />
              )}
            </button>
            <button
              onClick={() => handleTabChange('register')}
              className={`flex-grow py-4.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-colors relative z-10 ${
                activeTab === 'register'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-slate-400 hover:text-slate-655 dark:hover:text-slate-350'
              }`}
            >
              <UserPlus size={15} /> Create Account
              {activeTab === 'register' && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-655 dark:bg-primary-500"
                />
              )}
            </button>
          </div>

          {/* Form Contents */}
          <CardContent className="p-8 space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3.5 bg-rose-50 border border-rose-200 dark:bg-rose-950/25 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLogin}
                  className="space-y-5"
                >
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Email Address</label>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="pl-10"
                      />
                      <Mail size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Password</label>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="pl-10"
                      />
                      <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 font-bold flex items-center justify-center gap-1.5 shadow-xs"
                    size="md"
                  >
                    {loading ? 'Logging in...' : 'Log In'}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="register-form"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleRegister}
                  className="space-y-5"
                >
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Full Name</label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        className="pl-10"
                      />
                      <User size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Email Address</label>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="pl-10"
                      />
                      <Mail size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Password</label>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="pl-10"
                      />
                      <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* Account Type */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Account Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('customer')}
                        className={`h-11 rounded-xl border text-xs font-black transition-all ${
                          role === 'customer'
                            ? 'border-primary-600 bg-primary-50/15 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 shadow-2xs'
                            : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-655 hover:bg-slate-50/50'
                        }`}
                      >
                        Customer
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('seller')}
                        className={`h-11 rounded-xl border text-xs font-black transition-all ${
                          role === 'seller'
                            ? 'border-primary-600 bg-primary-50/15 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 shadow-2xs'
                            : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-655 hover:bg-slate-50/50'
                        }`}
                      >
                        Book Seller
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 font-bold flex items-center justify-center gap-1.5 shadow-xs"
                    size="md"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>

        </Card>
      </motion.div>
    </div>
  );
}
