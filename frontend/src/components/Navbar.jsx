import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiBell,
  FiPlusCircle,
  FiUser,
  FiPackage,
  FiClock,
  FiGrid,
  FiShield,
  FiLogOut,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { FaBicycle, FaCalculator, FaBoxOpen, FaStore, FaGraduationCap } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isVendor, isStudent, primaryRole } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [keyword, setKeyword] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/browse?keyword=${encodeURIComponent(keyword.trim())}`);
      setKeyword('');
    }
  };

  const getRoleBadge = () => {
    if (isAdmin) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
          <FiShield className="w-3 h-3 text-amber-600" /> Admin
        </span>
      );
    }
    if (isVendor) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <FaStore className="w-3 h-3 text-emerald-600" /> Vendor
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
        <FaGraduationCap className="w-3 h-3 text-indigo-600" /> Student
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <span className="font-extrabold text-xl">CK</span>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 block leading-tight">
                Campus<span className="text-indigo-600">Kart</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium block -mt-0.5">
                Official Campus Marketplace
              </span>
            </div>
          </Link>

          {/* Quick Category Tabs (Desktop) */}
          <div className="hidden xl:flex items-center gap-2">
            <Link
              to="/browse?category=cycles"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 transition"
            >
              <FaBicycle className="text-indigo-500 w-3.5 h-3.5" />
              <span>Cycles</span>
            </Link>
            <Link
              to="/browse?category=calculators"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 transition"
            >
              <FaCalculator className="text-emerald-500 w-3.5 h-3.5" />
              <span>Calculators</span>
            </Link>
            <Link
              to="/browse?category=other"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 transition"
            >
              <FaBoxOpen className="text-amber-500 w-3.5 h-3.5" />
              <span>Other</span>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search cycles, fx-991 calculators, essentials..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-50 focus:bg-white text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
            />
            <FiSearch className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          </form>

          {/* Action Links */}
          <div className="hidden lg:flex items-center gap-4 text-sm font-semibold text-slate-600">
            <Link to="/browse" className="hover:text-indigo-600 transition">
              All Items
            </Link>

            {isVendor && (
              <Link
                to="/seller/dashboard"
                className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition font-bold"
              >
                <FaStore className="w-3.5 h-3.5 text-emerald-600" />
                <span>Vendor Hub</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition font-bold"
              >
                <FiShield className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin Portal</span>
              </Link>
            )}

            <Link
              to="/create-listing"
              className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition"
            >
              <FiPlusCircle className="w-4 h-4" />
              <span>{isVendor ? 'Add Inventory' : 'Sell / Rent'}</span>
            </Link>
          </div>

          {/* Icons: Wishlist, Cart & Profile */}
          <div className="flex items-center gap-3">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-xl relative transition"
              title="Saved Wishlist"
            >
              <FiHeart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl relative transition"
              title="Shopping Cart"
            >
              <FiShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl relative transition"
                title="Notifications"
              >
                <FiBell className="w-5 h-5" />
              </Link>
            )}

            {/* Auth Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 bg-slate-100 hover:bg-slate-200/80 rounded-full transition border border-slate-200"
                >
                  <div className="text-left hidden sm:block">
                    <span className="text-xs font-bold text-slate-800 block leading-tight max-w-[100px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </div>
                  {getRoleBadge()}
                  <img
                    src={user?.avatar?.url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={user?.name}
                    className="w-7 h-7 rounded-full object-cover border border-indigo-200"
                  />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-sm font-medium animate-in fade-in"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      <div className="mt-1 flex items-center gap-2">
                        {getRoleBadge()}
                        {user?.campus?.studentId && (
                          <span className="text-[10px] font-mono font-bold text-slate-500">
                            {user.campus.studentId}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        <FiUser className="w-4 h-4 text-slate-400" /> My Profile
                      </Link>

                      <Link
                        to="/orders"
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        <FiPackage className="w-4 h-4 text-slate-400" /> My Orders & History
                      </Link>

                      <Link
                        to="/my-rentals"
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        <FiClock className="w-4 h-4 text-slate-400" /> My Rentals
                      </Link>

                      <Link
                        to="/my-listings"
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        <FiGrid className="w-4 h-4 text-slate-400" /> My Listings
                      </Link>

                      {(isVendor || isAdmin) && (
                        <Link
                          to="/seller/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-emerald-700 hover:bg-emerald-50 font-bold border-t border-slate-100"
                        >
                          <FaStore className="w-4 h-4 text-emerald-600" /> Vendor / Seller Hub
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2 text-amber-700 hover:bg-amber-50 font-bold border-t border-slate-100"
                        >
                          <FiShield className="w-4 h-4 text-amber-600" /> Admin Control Panel
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition"
                      >
                        <FiLogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search cycles, calculators, other..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 text-sm rounded-xl outline-none"
              />
              <FiSearch className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            </form>

            <div className="grid grid-cols-3 gap-2 py-2">
              <Link
                to="/browse?category=cycles"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center p-2 rounded-xl bg-slate-50 text-xs font-bold text-slate-700"
              >
                <FaBicycle className="text-indigo-600 w-4 h-4 mb-1" /> Cycles
              </Link>
              <Link
                to="/browse?category=calculators"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center p-2 rounded-xl bg-slate-50 text-xs font-bold text-slate-700"
              >
                <FaCalculator className="text-emerald-600 w-4 h-4 mb-1" /> Calculators
              </Link>
              <Link
                to="/browse?category=other"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center p-2 rounded-xl bg-slate-50 text-xs font-bold text-slate-700"
              >
                <FaBoxOpen className="text-amber-600 w-4 h-4 mb-1" /> Other
              </Link>
            </div>

            <div className="flex flex-col gap-1 text-sm font-semibold text-slate-700 pt-2 border-t border-slate-100">
              <Link to="/browse" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5">
                Browse All Marketplace Items
              </Link>
              <Link to="/create-listing" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 text-indigo-600 font-bold">
                + Create New Listing
              </Link>
              {isVendor && (
                <Link to="/seller/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 text-emerald-600 font-bold">
                  🏪 Vendor Portal & Inventory
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 text-amber-600 font-bold">
                  🛡️ Admin Control Panel
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
