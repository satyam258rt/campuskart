import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiFilter, FiSearch, FiX, FiPlusCircle } from 'react-icons/fi';
import { FaBicycle, FaCalculator, FaBoxOpen } from 'react-icons/fa';
import api from '../services/api';
import ResourceCard from '../components/ResourceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const BrowseResources = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter States initialized from URL params
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [listingType, setListingType] = useState(searchParams.get('listingType') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  // Fetch categories once
  useEffect(() => {
    api.get('/categories')
      .then((res) => setCategories(res.data.categories || []))
      .catch((err) => console.error(err));
  }, []);

  // Sync state when URL params change
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setKeyword(searchParams.get('keyword') || '');
    setListingType(searchParams.get('listingType') || '');
    setPage(1);
  }, [searchParams]);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (selectedCategory) params.set('category', selectedCategory);
      if (listingType) params.set('listingType', listingType);
      if (condition) params.set('condition', condition);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (sort) params.set('sort', sort);
      params.set('page', page);
      params.set('limit', 12);

      const res = await api.get(`/resources?${params.toString()}`);
      setResources(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      console.error(err);
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedCategory, listingType, condition, minPrice, maxPrice, sort, page]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleApplySearch = (e) => {
    e?.preventDefault();
    setPage(1);
    const trimmed = keyword.trim();
    const newParams = {};
    if (trimmed) newParams.keyword = trimmed;
    // If keyword specifically matches a category or if user is searching broadly, keep category only if relevant
    if (selectedCategory) {
      const currentCatSlug = searchParams.get('category');
      if (currentCatSlug) newParams.category = currentCatSlug;
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setKeyword('');
    setSelectedCategory('');
    setListingType('');
    setCondition('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  const selectCategory = (slug) => {
    const matched = categories.find((c) => c.slug === slug || c.slug.includes(slug));
    const catId = matched?._id || slug;
    setSelectedCategory(catId);
    setSearchParams({ category: slug });
  };

  const isCatActive = (slug) => {
    if (!selectedCategory) return false;
    if (selectedCategory === slug) return true;
    const cat = categories.find((c) => c.slug === slug || c.slug.includes(slug));
    return cat && selectedCategory === cat._id;
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Campus Marketplace
          </h1>
          <p className="text-sm text-slate-500">
            Showing {total} listings in Cycles, Calculators & Other
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/create-listing"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
          >
            <FiPlusCircle className="w-4 h-4" />
            <span>Upload Listing</span>
          </Link>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:block">
              Sort:
            </label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick 3-Category Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => {
            setSelectedCategory('');
            setSearchParams((prev) => {
              prev.delete('category');
              return prev;
            });
          }}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition-all ${
            !selectedCategory
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          🌟 All Items
        </button>

        <button
          type="button"
          onClick={() => selectCategory('cycles')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all ${
            isCatActive('cycles')
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FaBicycle className="w-4 h-4 text-indigo-500" /> Cycles
        </button>

        <button
          type="button"
          onClick={() => selectCategory('calculators')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all ${
            isCatActive('calculators')
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FaCalculator className="w-4 h-4 text-emerald-500" /> Calculators
        </button>

        <button
          type="button"
          onClick={() => selectCategory('other')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all ${
            isCatActive('other')
              ? 'bg-amber-600 text-white shadow-md shadow-amber-200'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FaBoxOpen className="w-4 h-4 text-amber-500" /> Other
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1 space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <FiFilter className="text-indigo-600" /> Filters
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
            >
              Reset All
            </button>
          </div>

          {/* Search Box */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
              Search by Keyword
            </label>
            <form onSubmit={handleApplySearch} className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. cycle, calculator, lamp..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                />
                <FiSearch className="absolute left-3 top-2.5 text-slate-400" />
                {keyword && (
                  <button
                    type="button"
                    onClick={() => {
                      setKeyword('');
                      setSearchParams((prev) => {
                        const copy = new URLSearchParams(prev);
                        copy.delete('keyword');
                        return copy;
                      });
                    }}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    title="Clear search"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                Search Listings
              </button>
            </form>
          </div>

          {/* Listing Type Filter */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
              Transaction Mode
            </label>
            <div className="space-y-1.5 text-sm">
              {[
                { label: 'All Listings', val: '' },
                { label: 'For Sale (Buy Outright)', val: 'BUY' },
                { label: 'For Rent (Daily/Semester)', val: 'RENT' },
                { label: 'Both (Buy or Rent)', val: 'BOTH' }
              ].map((opt) => (
                <label key={opt.val} className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="radio"
                    name="listingType"
                    checked={listingType === opt.val}
                    onChange={() => {
                      setListingType(opt.val);
                      setPage(1);
                    }}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Condition Filter */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
              Condition
            </label>
            <select
              value={condition}
              onChange={(e) => {
                setCondition(e.target.value);
                setPage(1);
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
            >
              <option value="">Any Condition</option>
              <option value="NEW">Brand New / Sealed</option>
              <option value="LIKE_NEW">Like New (Mint)</option>
              <option value="GOOD">Good / Functional</option>
              <option value="FAIR">Fair / Usable</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
              Price Range (₹)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => {
                setPage(1);
                fetchResources();
              }}
              className="mt-2 w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition"
            >
              Apply Price
            </button>
          </div>
        </div>

        {/* Resources Grid / Results Area */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <LoadingSpinner size="lg" />
          ) : resources.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-3xl">
                <FaBoxOpen />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  No Products Found in This Selection
                </h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  You can upload your own Cycles, Calculators, or Other student gear right now!
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  to="/create-listing"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
                >
                  <FiPlusCircle className="w-4 h-4" />
                  <span>Upload A Product</span>
                </Link>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <ResourceCard key={resource._id} resource={resource} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {total > 12 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500 font-medium px-2">
                Page {page} of {Math.ceil(total / 12)}
              </span>
              <button
                disabled={page >= Math.ceil(total / 12)}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseResources;
