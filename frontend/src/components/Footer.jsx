import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-900/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Column 1: Info */}
          <div className="space-y-4 md:col-span-4">
            <Link to="/" className="flex items-center gap-2 text-slate-800 dark:text-white font-black text-xl group">
              <BookOpen size={20} className="text-indigo-650 dark:text-indigo-400 group-hover:rotate-6 transition-transform duration-300" />
              <span className="bg-gradient-to-r from-indigo-650 via-primary-500 to-rose-500 bg-clip-text text-transparent">ReadNest</span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-500 max-w-sm">
              The intelligent online bookstore and community marketplace. Discover curated matches powered by machine learning, and buy/sell used books directly with fellow readers.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="#" 
                className="p-2.5 rounded-full border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-405 hover:text-slate-800 dark:hover:text-white transition-all hover:scale-105" 
                title="Twitter"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a 
                href="#" 
                className="p-2.5 rounded-full border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-405 hover:text-slate-850 dark:hover:text-white transition-all hover:scale-105" 
                title="GitHub"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              </a>
              <a 
                href="#" 
                className="p-2.5 rounded-full border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-405 hover:text-slate-850 dark:hover:text-white transition-all hover:scale-105" 
                title="Contact Email"
              >
                <Mail size={14} />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="md:col-span-2">
            <h3 className="text-slate-850 dark:text-white font-bold text-xs uppercase tracking-widest mb-4">Directory</h3>
            <ul className="space-y-3 text-xs font-semibold">
              <li>
                <Link to="/catalog" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1 group">
                  <ArrowRight size={10} className="opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Book Catalog
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-primary-655 dark:hover:text-primary-400 transition-colors flex items-center gap-1 group">
                  <ArrowRight size={10} className="opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Marketplace Hub
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary-655 dark:hover:text-primary-400 transition-colors flex items-center gap-1 group">
                  <ArrowRight size={10} className="opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Join Bookstore
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Genres */}
          <div className="md:col-span-2">
            <h3 className="text-slate-855 dark:text-white font-bold text-xs uppercase tracking-widest mb-4">Genres</h3>
            <ul className="space-y-3 text-xs font-semibold">
              <li>
                <Link to="/catalog?genre=Fantasy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1 group">
                  <ArrowRight size={10} className="opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Fantasy & Magic
                </Link>
              </li>
              <li>
                <Link to="/catalog?genre=Sci-Fi" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1 group">
                  <ArrowRight size={10} className="opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Science Fiction
                </Link>
              </li>
              <li>
                <Link to="/catalog?genre=Mystery" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1 group">
                  <ArrowRight size={10} className="opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Mystery Thrillers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4 md:col-span-4">
            <h3 className="text-slate-855 dark:text-white font-bold text-xs uppercase tracking-widest">Stay Updated</h3>
            <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 font-medium">Subscribe for alerts when books matching your recommendations are listed.</p>
            <form className="flex border border-slate-205 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs focus-within:ring-1 focus-within:ring-primary-500/30" onSubmit={e => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border-none focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder-slate-400" 
              />
              <button 
                type="submit" 
                className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900 text-white px-4 py-2 text-xs font-bold transition-all flex-shrink-0"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-slate-200/60 dark:border-slate-900 text-center text-[10px] sm:text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>&copy; 2026 ReadNest Bookstore Inc. All rights reserved.</div>
          <div className="flex gap-6 font-semibold">
            <a href="#" className="hover:text-primary-655 dark:hover:text-primary-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-655 dark:hover:text-primary-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
