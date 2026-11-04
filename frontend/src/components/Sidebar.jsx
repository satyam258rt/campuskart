import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiShoppingBag,
  FiClock,
  FiPlusCircle,
  FiUser,
  FiShield,
  FiUsers,
  FiFileText,
  FiAlertTriangle,
  FiPieChart,
  FiList
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ mode = 'user' }) => {
  const { isAdmin } = useAuth();

  const userLinks = [
    { to: '/my-listings', label: 'My Listings', icon: FiGrid },
    { to: '/create-listing', label: 'Create Listing', icon: FiPlusCircle },
    { to: '/my-rentals', label: 'My Rentals', icon: FiClock },
    { to: '/orders', label: 'My Purchases', icon: FiShoppingBag },
    { to: '/seller/dashboard', label: 'Seller Dashboard', icon: FiList },
    { to: '/profile', label: 'Profile Settings', icon: FiUser }
  ];

  const adminLinks = [
    { to: '/admin', label: 'Overview', icon: FiPieChart },
    { to: '/admin/users', label: 'User Governance', icon: FiUsers },
    { to: '/admin/listings', label: 'Listings Approval', icon: FiFileText },
    { to: '/admin/orders', label: 'All Orders', icon: FiShoppingBag },
    { to: '/admin/disputes', label: 'Disputes & Escrow', icon: FiAlertTriangle },
    { to: '/admin/reports', label: 'Platform Reports', icon: FiGrid }
  ];

  const links = mode === 'admin' ? adminLinks : userLinks;

  return (
    <aside className="w-64 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm h-fit">
      <div className="px-3 py-2 mb-2 font-bold text-xs uppercase tracking-wider text-slate-400">
        {mode === 'admin' ? 'Admin Control' : 'Student Hub'}
      </div>
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}

        {mode !== 'admin' && isAdmin && (
          <div className="pt-4 mt-4 border-t border-slate-100">
            <NavLink
              to="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 transition"
            >
              <FiShield className="w-4 h-4" />
              <span>Switch to Admin</span>
            </NavLink>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
