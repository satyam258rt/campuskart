import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiMapPin,
  FiPlus,
  FiArrowRight,
  FiCheckCircle,
  FiLayers
} from 'react-icons/fi';
import { FaBicycle, FaCalculator, FaBoxOpen } from 'react-icons/fa';
import api from '../services/api';
import ResourceCard from '../components/ResourceCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [recentResources, setRecentResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.get('/resources?limit=12&sort=newest');
        setRecentResources(res.data || []);
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Clean, Modern Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-12 shadow-xl">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold backdrop-blur-md">
            <FiMapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>MNNIT Allahabad • Student Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Buy, Sell & Rent Inside MNNIT.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Trade cycles, calculators, and hostel essentials with student peers. Direct handovers at SVBH, Tandon, Tilak, Malviya, Raman or SAC with zero middleman fees.
          </p>

          {/* Search Box */}
          <form onSubmit={handleHeroSearch} className="flex gap-2 pt-2 max-w-lg">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search Hero cycle, Casio fx-991, study lamp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white text-slate-800 text-sm font-semibold outline-none focus:ring-4 focus:ring-indigo-300/40 shadow-lg"
              />
              <FiSearch className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 font-bold text-sm rounded-2xl shadow transition"
            >
              Search
            </button>
          </form>

          {/* 3 Clean Category Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-bold">Categories:</span>
            <Link
              to="/browse?category=cycles"
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center gap-1.5 font-semibold"
            >
              <FaBicycle className="text-indigo-300" /> Cycles
            </Link>
            <Link
              to="/browse?category=calculators"
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center gap-1.5 font-semibold"
            >
              <FaCalculator className="text-emerald-300" /> Calculators
            </Link>
            <Link
              to="/browse?category=other"
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center gap-1.5 font-semibold"
            >
              <FaBoxOpen className="text-amber-300" /> Other Essentials
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Simple Feature Cards (Cycles, Calculators, Other) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/browse?category=cycles"
          className="group p-5 bg-white rounded-3xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-lg transition flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center text-xl transition">
            <FaBicycle />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition text-sm">
              Cycles & Locks
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Geared bikes, locks, helmets</p>
          </div>
          <FiArrowRight className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
        </Link>

        <Link
          to="/browse?category=calculators"
          className="group p-5 bg-white rounded-3xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-lg transition flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-xl transition">
            <FaCalculator />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition text-sm">
              Exam Calculators
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Casio fx-991, graphing tools</p>
          </div>
          <FiArrowRight className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
        </Link>

        <Link
          to="/browse?category=other"
          className="group p-5 bg-white rounded-3xl border border-slate-200/80 hover:border-amber-400 hover:shadow-lg transition flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center text-xl transition">
            <FaBoxOpen />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition text-sm">
              Other Essentials
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Study lamps, lab coats, organizers</p>
          </div>
          <FiArrowRight className="text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition" />
        </Link>
      </section>

      {/* Live Campus Listings Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Recent Campus Listings
            </h2>
            <p className="text-xs text-slate-500">Live items for sale & rent across MNNIT hostels</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/create-listing"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
            >
              <FiPlus />
              <span>+ Sell Item</span>
            </Link>
            <Link
              to="/browse"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hidden sm:flex items-center gap-1 px-3 py-2"
            >
              <span>View All</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" />
        ) : recentResources.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 max-w-xl mx-auto space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl">
              <FiLayers />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">No Listings Yet</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Be the first to list a Cycle, Calculator, or Hostel gear on campus!
              </p>
            </div>
            <Link
              to="/create-listing"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              <FiPlus />
              <span>Post Your Item Now</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {recentResources.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </div>
        )}
      </section>

      {/* Simple Floating Sell Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <Link
          to="/create-listing"
          className="flex items-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-full shadow-2xl transition hover:scale-105"
        >
          <FiPlus className="w-4 h-4" />
          <span>Sell Item</span>
        </Link>
      </div>
    </div>
  );
};

export default Home;
