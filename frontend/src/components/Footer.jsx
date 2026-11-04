import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiHeart, FiCheckCircle } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm">
                CK
              </div>
              <span className="font-extrabold text-xl text-white">CampusKart</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 mb-4">
              The verified inside-campus student marketplace for buying, selling, and renting cycles, calculators, and essentials safely inside campus.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <FiShield className="w-4 h-4" /> Inside-Campus Students Only
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Campus Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/browse?category=cycles" className="hover:text-white transition">Cycles & Accessories</Link></li>
              <li><Link to="/browse?category=calculators" className="hover:text-white transition">Scientific Calculators</Link></li>
              <li><Link to="/browse?category=other" className="hover:text-white transition">Other Campus Gear</Link></li>
              <li><Link to="/browse?listingType=RENT" className="hover:text-white transition">Campus Rentals</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/browse" className="hover:text-white transition">All Listings</Link></li>
              <li><Link to="/create-listing" className="hover:text-white transition">Sell a Resource</Link></li>
              <li><Link to="/create-listing" className="hover:text-white transition">Rent Out Gear</Link></li>
              <li><Link to="/cart" className="hover:text-white transition">Cart & Checkout</Link></li>
              <li><Link to="/my-rentals" className="hover:text-white transition">Rental Tracker</Link></li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Campus Security
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><FiCheckCircle className="text-indigo-400" /> Admin-moderated listings</li>
              <li className="flex items-center gap-1.5"><FiCheckCircle className="text-indigo-400" /> Razorpay secure test escrow</li>
              <li className="flex items-center gap-1.5"><FiCheckCircle className="text-indigo-400" /> Automated deposit protection</li>
              <li className="flex items-center gap-1.5"><FiCheckCircle className="text-indigo-400" /> On-campus pickup locations</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CampusKart Marketplace. Built for university students.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with care for college campuses</span>
            <FiHeart className="w-3.5 h-3.5 text-rose-500 fill-current ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
