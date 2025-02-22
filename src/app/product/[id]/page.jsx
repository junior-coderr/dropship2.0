'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CaretLeft, ShoppingBag, Truck, ArrowsClockwise, X, Lightning } from 'phosphor-react';
import { useCart } from '@/context/CartContext';

// Update mock data to include option flags
const product = {
  id: '1',
  name: 'Premium Cotton T-Shirt',
  price: 29.99,
  description: 'Premium quality cotton t-shirt with a comfortable fit. Perfect for everyday wear.',
  images: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
    'https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=800'
  ],
  hasSizes: true,
  hasColors: false, // Example: this product doesn't have color options
  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['White', 'Black', 'Navy'],
  features: [
    'Premium cotton material',
    'Comfortable fit',
    'Durable stitching',
    'Easy to wash'
  ]
};

export default function ProductDetail({ params }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const handleImageClick = () => {
    if (window.innerWidth < 768) { // Mobile devices
      setIsZoomed(!isZoomed);
    }
  };

  const handleMouseMove = (e) => {
    if (window.innerWidth >= 768 && imageRef.current) { // Desktop only
      const { left, top, width, height } = imageRef.current.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setZoomPosition({ x, y });
    }
  };

  const handleAddToCart = () => {
    if (product.hasSizes && !selectedSize) {
      alert('Please select a size');
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor
    });
  };

  const handleBuyNow = () => {
    if (product.hasSizes && !selectedSize) {
      alert('Please select a size');
      return;
    }
    // Add to cart first
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor
    });
    // Navigate to checkout
    router.push('/cart');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with Buy Now button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <CaretLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Product Details</h1>
        </div>
        {/* Mobile Buy Now Button - Header */}
        <button
          onClick={handleBuyNow}
          className="md:hidden flex items-center justify-center gap-1.5 px-4 py-2 bg-[#53D695] text-white text-sm font-medium rounded-full hover:bg-[#53D695]/90 transition-colors"
        >
          <Lightning 
            size={16} 
            weight="fill"
          />
          Buy Now
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery with Zoom */}
        <div className="space-y-4">
          <div 
            ref={imageRef}
            className={`relative aspect-square rounded-2xl overflow-hidden bg-gray-100 ${
              window.innerWidth >= 768 ? 'cursor-zoom-in' : ''
            }`}
            onClick={handleImageClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setZoomPosition({ x: 0, y: 0 })}
          >
            {/* Mobile Zoom Modal */}
            {isZoomed && window.innerWidth < 768 && (
              <div className="fixed inset-0 z-50 bg-black p-4" onClick={() => setIsZoomed(false)}>
                <button 
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10"
                  onClick={() => setIsZoomed(false)}
                >
                  <X size={24} className="text-white" />
                </button>
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            )}
            
            {/* Desktop Zoom Effect */}
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-200"
              style={{
                transform: window.innerWidth >= 768 && zoomPosition.x ? 'scale(1.5)' : 'scale(1)',
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
              }}
              priority
            />
          </div>
          
          {/* Thumbnails */}
          <div className="flex gap-4">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-square w-20 rounded-lg overflow-hidden ${
                  selectedImage === index ? 'ring-2 ring-[#53D695]' : 'ring-1 ring-gray-200'
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Simplified price section */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{product.name}</h2>
            <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold text-[#53D695]">
              ${product.price}
            </p>
          </div>

          {/* Conditional Size Selection */}
          {product.hasSizes && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Select Size</h3>
              <div className="flex gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border ${
                      selectedSize === size
                        ? 'border-[#53D695] bg-[#53D695]/10 text-[#53D695]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conditional Color Selection */}
          {product.hasColors && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Select Color</h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg border ${
                      selectedColor === color
                        ? 'border-[#53D695] bg-[#53D695]/10 text-[#53D695]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Description</h3>
            <p className="text-gray-500">{product.description}</p>
            <ul className="mt-4 space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#53D695]" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
              <div className="p-2 rounded-lg bg-[#53D695]/10">
                <Truck size={20} className="text-[#53D695]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Free Delivery</p>
                <p className="text-xs text-gray-500">Orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
              <div className="p-2 rounded-lg bg-[#53D695]/10">
                <ArrowsClockwise size={20} className="text-[#53D695]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Free Returns</p>
                <p className="text-xs text-gray-500">Within 30 days</p>
              </div>
            </div>
          </div>

          {/* Updated bottom buttons - show both buttons on all screens */}
          <div className="pt-6 grid grid-cols-2 gap-4">
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-[#53D695] font-medium rounded-full hover:bg-gray-50 transition-colors border-2 border-[#53D695] group"
            >
              <ShoppingBag 
                size={20}
                className="transition-transform group-hover:scale-110" 
              />
              Add to Cart
            </button>
            {/* Buy Now Button - Always visible */}
            <button
              onClick={handleBuyNow}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#53D695] text-white font-medium rounded-full hover:bg-[#53D695]/90 transition-colors group"
            >
              <Lightning 
                size={20} 
                weight="fill"
                className="transition-transform group-hover:scale-110" 
              />
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
