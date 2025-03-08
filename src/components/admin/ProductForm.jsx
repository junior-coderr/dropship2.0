'use client';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Dialog } from '@headlessui/react';
import { X, Plus, Trash, Upload, VideoCamera } from 'phosphor-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ProductForm({ isOpen, onClose, product }) {
  const [loading, setLoading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [formData, setFormData] = useState(
    product || {
      name: '',
      description: '',
      price: '',
      images: [],
      video: null,
      category: 'uncategorized', 
      sizeType: 'free',
      sizes: [],
      hasColors: false,
      colors: [],
      bulletPoints: [''],
      status: 'draft',
      inStock: product?.inStock ?? true
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBulletPoint = (index, value) => {
    const newPoints = [...formData.bulletPoints];
    newPoints[index] = value;
    setFormData(prev => ({ ...prev, bulletPoints: newPoints }));
  };

  const addBulletPoint = () => {
    setFormData(prev => ({
      ...prev,
      bulletPoints: [...prev.bulletPoints, '']
    }));
  };

  const removeBulletPoint = (index) => {
    setFormData(prev => ({
      ...prev,
      bulletPoints: prev.bulletPoints.filter((_, i) => i !== index)
    }));
  };

  const handleColorAdd = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { name: '', code: '' }]
    }));
  };

  const handleColorChange = (index, field, value) => {
    const newColors = [...formData.colors];
    newColors[index][field] = value;
    setFormData(prev => ({ ...prev, colors: newColors }));
  };

  const removeColor = (index) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'image');

      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!res.ok) throw new Error('Upload failed');
        
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, data]
        }));
      } catch (error) {
        toast.error(`Upload failed: ${file.name}`);
      }
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file size client-side as well (50MB limit)
    const maxSizeVideo = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSizeVideo) {
      toast.error('Video file size exceeds the 50MB limit');
      return;
    }
    
    setUploadingVideo(true);
    const videoFormData = new FormData();
    videoFormData.append('file', file);
    videoFormData.append('fileType', 'video');
    
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: videoFormData
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Video upload failed');
      }
      
      const data = await res.json();
      setFormData(prev => ({
        ...prev,
        video: {
          url: data.url,
          alt: data.alt,
          filename: data.filename
        }
      }));
      toast.success('Video uploaded successfully');
    } catch (error) {
      toast.error(`Video upload failed: ${error.message}`);
    } finally {
      setUploadingVideo(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeVideo = () => {
    setFormData(prev => ({
      ...prev,
      video: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token'); // Get token from storage
      const url = product 
        ? `/api/admin/products/${product._id}`
        : '/api/admin/products';
      
      const res = await fetch(url, {
        method: product ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save product');

      toast.success(product ? 'Product updated!' : 'Product created!');
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black opacity-30" onClick={onClose} />
          
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {product ? 'Edit Product' : 'New Product'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bullet Points
                </label>
                {formData.bulletPoints.map((point, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => handleBulletPoint(index, e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="Enter bullet point"
                    />
                    <button
                      type="button"
                      onClick={() => removeBulletPoint(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addBulletPoint}
                  className="flex items-center gap-2 text-sm text-[#53D695] font-medium"
                >
                  <Plus size={16} />
                  Add Point
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size Type
                  </label>
                  <select
                    name="sizeType"
                    value={formData.sizeType}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="free">Free Size</option>
                    <option value="custom">Custom Sizes</option>
                  </select>

                  {formData.sizeType === 'custom' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Available Sizes (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="sizes"
                        value={formData.sizes.join(', ')}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          sizes: e.target.value.split(',').map(s => s.trim())
                        }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        placeholder="S, M, L, XL"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#53D695] focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Status
                  </label>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          inStock: e.target.checked
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#53D695] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#53D695]"></div>
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        {formData.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Colors
                  </label>
                  <button
                    type="button"
                    onClick={handleColorAdd}
                    className="text-sm text-[#53D695] hover:text-[#53D695]/80"
                  >
                    Add Color
                  </button>
                </div>
                
                <div className="space-y-2 mt-2">
                  {formData.colors.map((color, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={color.name}
                        onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                        placeholder="Color name"
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-[#53D695] focus:ring-[#53D695]"
                      />
                      <input
                        type="color"
                        value={color.code}
                        onChange={(e) => handleColorChange(index, 'code', e.target.value)}
                        className="w-12 h-9 rounded-md border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeColor(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                      >
                        <Trash size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Images
                </label>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        sizes="100px"
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                  {formData.images.length < 4 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer flex items-center justify-center">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={loading}
                        key={formData.images.length} // Add key to force input refresh
                      />
                      {loading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400" />
                      ) : (
                        <Upload size={24} className="text-gray-400" />
                      )}
                    </label>
                  )}
                </div>
              </div>

              {/* Product Video Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Video
                </label>
                <div className="mb-4">
                  {formData.video ? (
                    <div className="relative rounded-lg overflow-hidden">
                      <div className="aspect-video bg-gray-100">
                        <video
                          src={formData.video.url}
                          controls
                          className="w-full h-full"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  ) : (
                    <label className="aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer flex flex-col items-center justify-center">
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={handleVideoUpload}
                        className="hidden"
                        disabled={uploadingVideo || loading}
                      />
                      {uploadingVideo ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#53D695]" />
                      ) : (
                        <>
                          <VideoCamera size={32} className="text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Upload product video</p>
                          <p className="text-xs text-gray-400 mt-1">MP4, WebM or QuickTime format</p>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || uploadingVideo}
                className="w-full py-3 bg-[#53D695] text-white rounded-lg hover:bg-[#53D695]/90 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Product'}
              </button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </Dialog>
  );
}
