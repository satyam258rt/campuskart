import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiPlus,
  FiTrash2,
  FiInfo,
  FiCheck,
  FiZap,
  FiUploadCloud,
  FiCamera,
  FiLink,
  FiImage,
  FiStar,
  FiMapPin,
  FiPhone,
  FiShield
} from 'react-icons/fi';
import { FaBicycle, FaCalculator, FaBoxOpen } from 'react-icons/fa';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const MNNIT_HOSTELS = [
  'SVBH Hostel (Swami Vivekananda Boys Hostel)',
  'Tandon Hostel',
  'Tilak Hostel',
  'Malviya Hostel',
  'Raman Hostel',
  'Patel Hostel',
  'Tagore Hostel',
  'KNGH (Kamla Nehru Girls Hostel)',
  'C.V. Raman Hostel',
  'Student Activity Centre (SAC) Complex',
  'Central Library Steps / Front Gate',
  'Academic Building (Main Gate / MP Hall)',
  'MNNIT Main Campus Gate'
];

/**
 * Client-side fast image compressor using Canvas
 * Downscales 5-10MB mobile/camera photos to crisp ~150KB JPEG
 */
const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({
          dataUrl,
          name: file.name,
          sizeKb: Math.round(dataUrl.length / 1024)
        });
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const CreateListing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [processingImages, setProcessingImages] = useState(false);
  const [imageInputMode, setImageInputMode] = useState('direct'); // 'direct', 'camera', 'url'
  const [urlInput, setUrlInput] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    listingType: 'BUY',
    price: '',
    rentalPricing: {
      pricePerDay: '',
      securityDeposit: '',
      minDurationDays: 1,
      maxDurationDays: 30
    },
    quantity: 1,
    condition: 'LIKE_NEW',
    images: [],
    campus: {
      university: 'Motilal Nehru National Institute of Technology (MNNIT) Allahabad',
      campusName: 'MNNIT Prayagraj',
      pickupLocation: 'SVBH Hostel, MNNIT'
    },
    contactPhone: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    api.get('/categories')
      .then((res) => {
        const fetchedCats = res.data.categories || [];
        setCategories(fetchedCats);

        // Auto select category from URL param if available
        const paramCat = searchParams.get('category');
        if (paramCat) {
          const matched = fetchedCats.find(
            (c) =>
              c.slug === paramCat ||
              c.slug.includes(paramCat) ||
              c.name.toLowerCase().includes(paramCat.toLowerCase())
          );
          if (matched) {
            setFormData((prev) => ({ ...prev, category: matched._id }));
          }
        }
      })
      .catch((err) => console.error(err));
  }, [searchParams]);

  // Handle direct file selections (2, 3 or more photos)
  const handleFilesSelected = async (filesList) => {
    const files = Array.from(filesList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) {
      toast.error('Please select image files (PNG, JPG, JPEG, WEBP)');
      return;
    }

    setProcessingImages(true);
    try {
      const compressedResults = await Promise.all(
        files.map((file) => compressImage(file))
      );

      const newImages = compressedResults.map((item, idx) => ({
        url: item.dataUrl,
        isCover: formData.images.length === 0 && idx === 0,
        name: item.name,
        sizeKb: item.sizeKb
      }));

      const combined = [...formData.images, ...newImages];
      if (combined.length > 0 && !combined.some((img) => img.isCover)) {
        combined[0].isCover = true;
      }

      setFormData((prev) => ({ ...prev, images: combined }));
      toast.success(`Added ${newImages.length} direct photo(s) successfully!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to process one or more images');
    } finally {
      setProcessingImages(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // Set cover photo
  const handleSetCover = (index) => {
    const updated = formData.images.map((img, i) => ({
      ...img,
      isCover: i === index
    }));
    setFormData({ ...formData, images: updated });
    toast.info('Set as primary cover photo');
  };

  // Remove photo
  const handleRemoveImage = (index) => {
    const updated = formData.images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isCover)) {
      updated[0].isCover = true;
    }
    setFormData({ ...formData, images: updated });
  };

  // Add web URL image
  const handleAddUrlImage = (e) => {
    e?.preventDefault();
    if (!urlInput.trim()) return;
    const url = urlInput.trim();
    const newImage = {
      url,
      isCover: formData.images.length === 0,
      name: 'Web Image URL'
    };
    setFormData({ ...formData, images: [...formData.images, newImage] });
    setUrlInput('');
    toast.success('Image link added!');
  };

  // Fast preset templates
  const handleApplyPreset = (type) => {
    const cycleCat = categories.find((c) => c.slug === 'cycles' || c.name.toLowerCase().includes('cycle'));
    const calcCat = categories.find((c) => c.slug === 'calculators' || c.name.toLowerCase().includes('calculator'));
    const otherCat = categories.find((c) => c.slug === 'other' || c.name.toLowerCase().includes('other'));

    if (type === 'cycle') {
      setFormData({
        ...formData,
        title: 'Hero Sprint Pro 21-Speed Mountain Cycle',
        category: cycleCat?._id || '',
        listingType: 'BOTH',
        price: '3800',
        rentalPricing: { pricePerDay: '40', securityDeposit: '500', minDurationDays: 1, maxDurationDays: 30 },
        condition: 'LIKE_NEW',
        description: 'Hero Sprint Pro 21-speed geared bicycle with front suspension fork and dual disc brakes. Includes heavy-duty 5-digit number combination lock and bell. Ridden one semester, perfect condition.',
        images: [
          { url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80', isCover: true, name: 'Hero Cycle Front' },
          { url: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80', isCover: false, name: 'Gear Derailleur & Lock' }
        ],
        campus: { ...formData.campus, pickupLocation: 'SVBH Hostel Cycle Bay' }
      });
      toast.info('Loaded MNNIT Campus Cycle template with 2 photos!');
    } else if (type === 'calculator') {
      setFormData({
        ...formData,
        title: 'Casio fx-991CW ClassWiz Scientific Calculator',
        category: calcCat?._id || '',
        listingType: 'BOTH',
        price: '950',
        rentalPricing: { pricePerDay: '25', securityDeposit: '300', minDurationDays: 1, maxDurationDays: 15 },
        condition: 'LIKE_NEW',
        description: 'Genuine non-programmable Casio fx-991CW ClassWiz with 540+ functions including 4x4 matrix, vectors, calculus, and QR code graph generator. Permitted in semester examinations.',
        images: [
          { url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80', isCover: true, name: 'Casio fx-991 Front' },
          { url: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=800&q=80', isCover: false, name: 'Calculator Slide Case' }
        ],
        campus: { ...formData.campus, pickupLocation: 'Academic Building Gate or Library' }
      });
      toast.info('Loaded Scientific Calculator template with 2 photos!');
    } else if (type === 'other') {
      setFormData({
        ...formData,
        title: 'Adjustable LED Campus Study Lamp & Multi-Grid Desk Organizer',
        category: otherCat?._id || '',
        listingType: 'BUY',
        price: '350',
        condition: 'GOOD',
        description: 'Touch-dimmable warm/white LED desk lamp with flexible gooseneck and phone stand, paired with 4-compartment mesh metal desk organizer for hostel study room.',
        images: [
          { url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80', isCover: true, name: 'LED Study Lamp' }
        ],
        campus: { ...formData.campus, pickupLocation: 'SVBH Hostel Reception' }
      });
      toast.info('Loaded Other Campus Essentials template!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      if (formData.images.length === 0) {
        toast.error('Please upload at least 1 photo of your item (direct photo or image URL)');
        setSubmitting(false);
        return;
      }

      if (!formData.category) {
        toast.error('Please select a category (Cycles, Calculators, or Other)');
        setSubmitting(false);
        return;
      }

      // Check if any direct base64 photos need uploading to server static storage
      let finalizedImages = [...formData.images];
      const directBase64Images = formData.images.filter((img) => img.url.startsWith('data:image/'));

      if (directBase64Images.length > 0) {
        try {
          const uploadRes = await api.post('/upload', {
            images: formData.images.map((img) => ({
              data: img.url,
              isCover: img.isCover
            }))
          });
          if (uploadRes.data?.data?.images) {
            finalizedImages = uploadRes.data.data.images;
          }
        } catch (uploadErr) {
          console.warn('Server upload fallback to direct data URI:', uploadErr);
        }
      }

      const payload = {
        ...formData,
        price: Number(formData.price) || 0,
        quantity: Number(formData.quantity) || 1,
        images: finalizedImages.map((img) => ({
          url: img.url,
          isCover: img.isCover || false
        })),
        rentalPricing: {
          pricePerDay: Number(formData.rentalPricing.pricePerDay) || 0,
          securityDeposit: Number(formData.rentalPricing.securityDeposit) || 0,
          minDurationDays: Number(formData.rentalPricing.minDurationDays) || 1,
          maxDurationDays: Number(formData.rentalPricing.maxDurationDays) || 30
        }
      };

      await api.post('/resources', payload);
      toast.success('Your item has been posted to MNNIT CampusKart!');
      navigate('/browse');
    } catch (err) {
      toast.error(err.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* HostelBucket-Inspired Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <FiMapPin className="text-emerald-600" />
          <span>MNNIT Allahabad Hostel Marketplace</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Sell or Rent Gear to Hostel Mates
        </h1>
        <p className="text-sm text-slate-500 max-w-xl">
          List your cycles, exam calculators, or hostel essentials in 30 seconds. Direct handover at hostel gates with zero commission.
        </p>
      </div>

      {/* 1-Click Fast Autofill Templates */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-pink-50/60 rounded-3xl border border-indigo-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiZap className="text-indigo-600 font-bold" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950">
              Quick 1-Click Templates (Auto-fills specifications):
            </h2>
          </div>
          <span className="text-[10px] text-indigo-500 font-semibold hidden sm:inline">
            Click to try
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleApplyPreset('cycle')}
            className="p-3 bg-white hover:bg-indigo-50/80 border border-slate-200/80 hover:border-indigo-300 rounded-2xl text-left transition flex items-center gap-3 shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <FaBicycle />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-xs block">Campus Cycle</span>
              <span className="text-[10px] text-slate-400">Hero Sprint + Lock</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('calculator')}
            className="p-3 bg-white hover:bg-emerald-50/80 border border-slate-200/80 hover:border-emerald-300 rounded-2xl text-left transition flex items-center gap-3 shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <FaCalculator />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-xs block">Exam Calculator</span>
              <span className="text-[10px] text-slate-400">Casio fx-991CW</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('other')}
            className="p-3 bg-white hover:bg-amber-50/80 border border-slate-200/80 hover:border-amber-300 rounded-2xl text-left transition flex items-center gap-3 shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <FaBoxOpen />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-xs block">Hostel Gear</span>
              <span className="text-[10px] text-slate-400">Study Lamp / Table</span>
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        {/* Resource Title */}
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
            Resource Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Hero Sprint 21-Speed Cycle, Casio fx-991EX Calculator..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Category & Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white transition"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Item Condition *
            </label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white transition"
            >
              <option value="NEW">Brand New (Unused / Boxed)</option>
              <option value="LIKE_NEW">Like New (Mint Condition)</option>
              <option value="GOOD">Good (Lightly Used / Functional)</option>
              <option value="FAIR">Fair (Visible signs of use)</option>
            </select>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MULTI-OPTION DIRECT PHOTO UPLOADER (Requested Feature)        */}
        {/* ============================================================== */}
        <div className="space-y-3 p-5 bg-slate-50/80 rounded-2xl border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                Item Photos (Direct Photo Upload) *
              </label>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Upload 1, 2, 3 or more real photos from your phone or laptop.
              </p>
            </div>

            {/* Input Mode Selector Tabs */}
            <div className="inline-flex rounded-xl bg-slate-200/70 p-1 text-xs font-bold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setImageInputMode('direct')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  imageInputMode === 'direct'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FiUploadCloud className="w-3.5 h-3.5" />
                <span>Upload Photos</span>
              </button>

              <button
                type="button"
                onClick={() => setImageInputMode('camera')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  imageInputMode === 'camera'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FiCamera className="w-3.5 h-3.5" />
                <span>Camera</span>
              </button>

              <button
                type="button"
                onClick={() => setImageInputMode('url')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  imageInputMode === 'url'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FiLink className="w-3.5 h-3.5" />
                <span>Web URL</span>
              </button>
            </div>
          </div>

          {/* Hidden Inputs for Direct File Selection and Camera Capture */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFilesSelected(e.target.files);
              e.target.value = '';
            }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFilesSelected(e.target.files);
              e.target.value = '';
            }}
          />

          {/* MODE 1: Direct File Dropzone */}
          {imageInputMode === 'direct' && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl cursor-pointer text-center transition-all bg-white flex flex-col items-center justify-center gap-2 ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
                  : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shadow-sm">
                <FiUploadCloud />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Click to choose photos from your device, or drag & drop here
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Select 2, 3 or more photos (JPG, PNG, WEBP). Auto-compressed for instant loading.
                </p>
              </div>
              <button
                type="button"
                className="mt-1 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition"
              >
                Browse Photos
              </button>
            </div>
          )}

          {/* MODE 2: Camera Capture */}
          {imageInputMode === 'camera' && (
            <div
              onClick={() => cameraInputRef.current?.click()}
              className="p-6 border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-2xl cursor-pointer text-center flex flex-col items-center justify-center gap-2 hover:bg-emerald-50 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl">
                <FiCamera />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950">
                  Take a Direct Photo with Camera
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Opens your phone camera or webcam to snap a photo right now.
                </p>
              </div>
              <button
                type="button"
                className="mt-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition"
              >
                Open Camera
              </button>
            </div>
          )}

          {/* MODE 3: Web Image URL */}
          {imageInputMode === 'url' && (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase">
                Paste Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or direct image link"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddUrlImage}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
                >
                  Add URL
                </button>
              </div>
            </div>
          )}

          {processingImages && (
            <div className="flex items-center justify-center gap-2 py-3 text-xs text-indigo-600 font-bold">
              <LoadingSpinner size="sm" />
              <span>Optimizing & compressing your photos...</span>
            </div>
          )}

          {/* PREVIEWS OF UPLOADED PHOTOS (Grid with Cover selector & Delete) */}
          {formData.images.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-700">
                  Uploaded Photos ({formData.images.length})
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <FiPlus /> Add more photos
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {formData.images.map((img, index) => (
                  <div
                    key={index}
                    className={`group relative rounded-2xl border overflow-hidden bg-white shadow-sm transition-all ${
                      img.isCover ? 'ring-2 ring-indigo-600 border-indigo-600' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="aspect-square w-full bg-slate-100 overflow-hidden relative">
                      <img
                        src={img.url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover object-center block group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    </div>

                    {/* Cover Photo Badge */}
                    {img.isCover ? (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center gap-1 shadow-md">
                        <FiStar className="w-3 h-3 fill-current" /> Cover
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetCover(index)}
                        className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 hover:bg-indigo-600 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition shadow"
                        title="Click to set as main cover photo"
                      >
                        Set Cover
                      </button>
                    )}

                    {/* Delete Photo Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow transition"
                      title="Delete this photo"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Size badge if direct upload */}
                    {img.sizeKb && (
                      <div className="p-1.5 bg-white border-t border-slate-100 text-[10px] text-slate-500 font-medium truncate px-2">
                        {img.sizeKb} KB
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
            Description *
          </label>
          <textarea
            required
            rows={4}
            placeholder="Mention purchase year, condition, specifications, gear type, lock included, reasons for selling..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Listing Mode: BUY, RENT, BOTH */}
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            Listing Mode *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { type: 'BUY', label: 'Sell Outright', desc: 'Permanent sale to student' },
              { type: 'RENT', label: 'Rent Out', desc: 'Daily / Exam week rental' },
              { type: 'BOTH', label: 'Sell or Rent', desc: 'Buyer can pick buy or rent' }
            ].map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => setFormData({ ...formData, listingType: opt.type })}
                className={`py-3 px-3 rounded-2xl border text-left transition ${
                  formData.listingType === opt.type
                    ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-200'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">{opt.label}</span>
                  {formData.listingType === opt.type && (
                    <FiCheck className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Fields */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
          {(formData.listingType === 'BUY' || formData.listingType === 'BOTH') && (
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Selling Price (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="3500"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-8 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {(formData.listingType === 'RENT' || formData.listingType === 'BOTH') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Rental Price Per Day (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="40"
                    value={formData.rentalPricing.pricePerDay}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rentalPricing: { ...formData.rentalPricing, pricePerDay: e.target.value }
                      })
                    }
                    className="w-full pl-8 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Refundable Security Deposit (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="500"
                    value={formData.rentalPricing.securityDeposit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rentalPricing: { ...formData.rentalPricing, securityDeposit: e.target.value }
                      })
                    }
                    className="w-full pl-8 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quantity & Hostel Handover Location (HostelBucket-inspired) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Available Quantity *
            </label>
            <input
              type="number"
              min="1"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Hostel / Campus Handover Spot *
            </label>
            <div className="space-y-1.5">
              <select
                value={formData.campus.pickupLocation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    campus: { ...formData.campus, pickupLocation: e.target.value }
                  })
                }
                className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
              >
                {MNNIT_HOSTELS.map((hostel) => (
                  <option key={hostel} value={hostel}>
                    {hostel}
                  </option>
                ))}
                <option value="Custom Location">Other Custom Location...</option>
              </select>

              {formData.campus.pickupLocation === 'Custom Location' && (
                <input
                  type="text"
                  required
                  placeholder="Specify Room / Hostel / Gate..."
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      campus: { ...formData.campus, pickupLocation: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500"
                />
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || processingImages}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <LoadingSpinner size="sm" color="white" />
          ) : (
            <>
              <FiPlus className="w-5 h-5" />
              <span>Publish Listing to MNNIT Marketplace</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateListing;
