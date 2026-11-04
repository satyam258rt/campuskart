import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiUploadCloud,
  FiCamera,
  FiLink,
  FiTrash2,
  FiStar,
  FiPlus
} from 'react-icons/fi';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

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

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processingImages, setProcessingImages] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    quantity: 1,
    condition: 'GOOD',
    images: [],
    campus: { pickupLocation: '' }
  });

  useEffect(() => {
    api.get(`/resources/${id}`)
      .then((res) => {
        const r = res.data.resource || res.data;
        setFormData({
          title: r.title,
          description: r.description,
          price: r.price || '',
          quantity: r.quantity || 1,
          condition: r.condition || 'GOOD',
          images: r.images || [],
          campus: { pickupLocation: r.campus?.pickupLocation || '' }
        });
      })
      .catch((err) => {
        toast.error('Listing could not be loaded');
        navigate('/my-listings');
      })
      .finally(() => setLoading(false));
  }, [id, navigate, toast]);

  const handleFilesSelected = async (filesList) => {
    const files = Array.from(filesList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;

    setProcessingImages(true);
    try {
      const compressed = await Promise.all(files.map((f) => compressImage(f)));
      const newImages = compressed.map((item, idx) => ({
        url: item.dataUrl,
        isCover: formData.images.length === 0 && idx === 0,
        name: item.name
      }));

      const combined = [...formData.images, ...newImages];
      if (!combined.some((img) => img.isCover) && combined.length > 0) {
        combined[0].isCover = true;
      }
      setFormData((prev) => ({ ...prev, images: combined }));
      toast.success(`Added ${newImages.length} direct photo(s)!`);
    } catch (err) {
      toast.error('Failed to process image');
    } finally {
      setProcessingImages(false);
    }
  };

  const handleSetCover = (index) => {
    const updated = formData.images.map((img, i) => ({
      ...img,
      isCover: i === index
    }));
    setFormData({ ...formData, images: updated });
  };

  const handleRemoveImage = (index) => {
    const updated = formData.images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isCover)) {
      updated[0].isCover = true;
    }
    setFormData({ ...formData, images: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      // Check if any direct base64 photos need uploading to server static storage
      let finalizedImages = [...formData.images];
      const directBase64Images = formData.images.filter((img) => img.url?.startsWith('data:image/'));

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
          console.warn('Fallback to direct data URI:', uploadErr);
        }
      }

      await api.put(`/resources/${id}`, {
        ...formData,
        price: Number(formData.price) || 0,
        quantity: Number(formData.quantity) || 1,
        images: finalizedImages
      });
      toast.success('Listing updated successfully');
      navigate('/my-listings');
    } catch (err) {
      toast.error(err.message || 'Failed to update listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="my-20" />;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Edit Listing</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Update item details, price, condition, or add new direct photos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Description</label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        {/* Photos Management */}
        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Item Photos ({formData.images.length})
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1"
            >
              <FiPlus /> Add Direct Photos
            </button>
          </div>

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

          {formData.images.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No photos attached yet.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
              {formData.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`group relative rounded-xl border overflow-hidden bg-white shadow-sm aspect-square ${
                    img.isCover ? 'ring-2 ring-indigo-600 border-indigo-600' : 'border-slate-200'
                  }`}
                >
                  <img
                    src={img.url}
                    alt="Listing"
                    className="w-full h-full object-cover object-center block"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  {img.isCover ? (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-indigo-600 text-white text-[9px] font-bold flex items-center gap-0.5">
                      <FiStar className="fill-current w-2.5 h-2.5" /> Cover
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetCover(idx)}
                      className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition"
                    >
                      Set Cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow"
                  >
                    <FiTrash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Price (₹)</label>
            <input
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Available Quantity</label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Campus / Hostel Handover Location</label>
          <input
            type="text"
            required
            value={formData.campus.pickupLocation}
            onChange={(e) =>
              setFormData({ ...formData, campus: { pickupLocation: e.target.value } })
            }
            className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/my-listings')}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || processingImages}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            {submitting ? 'Saving Changes...' : 'Save & Publish Updates'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditListing;
