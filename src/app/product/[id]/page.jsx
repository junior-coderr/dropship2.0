'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CaretLeft, ShoppingBag, Truck, ArrowsClockwise, X, Lightning } from 'phosphor-react';
import { useCart } from '@/context/CartContext';
import { useParams } from "next/navigation";
import { useProduct } from '@/hooks/useProduct';
import { useCountdown } from '@/context/CountdownContext';
import CountdownTimer from '@/components/CountdownTimer';

const DEFAULT_PLACEHOLDER = '/placeholder.png';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, addingToCart } = useCart();
  const { product, loading, error } = useProduct(params.id);
  const { countdown } = useCountdown();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [slidePosition, setSlidePosition] = useState(0);

  const minSwipeDistance = 50;

  const formatPrice = (price) => `$${price?.toFixed(2)}`;
  const calculateOriginalPrice = (price) => price * 1.3;

  const onTouchStart = (e) => {
    if (isZoomed) return; // Don't allow swiping when zoomed
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const onTouchMove = (e) => {
    if (isZoomed || !isSwiping) return; // Don't allow swiping when zoomed
    setTouchEnd(e.targetTouches[0].clientX);
    const diff = touchStart - e.targetTouches[0].clientX;
    setSlidePosition(-diff);
  };

  const onTouchEnd = () => {
    if (isZoomed) return; // Don't allow swiping when zoomed
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && selectedImage < product.images.length - 1) {
      setSelectedImage(prev => prev + 1);
    }
    if (isRightSwipe && selectedImage > 0) {
      setSelectedImage(prev => prev - 1);
    }

    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
    setSlidePosition(0);
  };

  // Update slidePosition when selectedImage changes
  useEffect(() => {
    setSlidePosition(0);
  }, [selectedImage]);

  // Set default selections when component mounts
  useEffect(() => {
console.log('Product:', product);
    if (product?.sizes?.length > 0) {
      setSelectedSize(product.sizes[0]); // Set first size as default
    }
    if (product?.colors?.length > 0) {
      const firstColor = typeof product.colors[0] === 'object' ? 
        product.colors[0].name : 
        product.colors[0];
      setSelectedColor(firstColor); // Set first color as default
    }
  }, [product]); // Run once when component mounts

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
    // Ensure we have a color selected
    const cartColor = selectedColor || (product.colors?.length > 0 ? 
      (typeof product.colors[0] === 'object' ? product.colors[0].name : product.colors[0]) 
      : '');

    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || DEFAULT_PLACEHOLDER,
      size: selectedSize,
      color: cartColor
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  const renderFeatures = (features) => {
    if (!Array.isArray(features)) {
      console.warn('Features is not an array:', features);
      return null;
    }
  
    return features.map((feature, index) => (
      <li key={index} className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-1.5 h-1.5 rounded-full bg-[#53D695]" />
        {/* Handle feature objects by converting to string or accessing specific property */}
        {typeof feature === 'object' ? 
          (feature.name || JSON.stringify(feature)) : 
          feature
        }
      </li>
    ));
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto animate-pulse">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square rounded-2xl bg-gray-200" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {error || 'Product not found'}
        </h2>
        <button
          onClick={() => router.back()}
          className="text-[#53D695] hover:text-[#53D695]/80"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 xs:px-4 sm:px-6 pb-24 md:pb-6 max-w-5xl">
      {/* Header with Buy Now button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
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
          className="md:hidden flex items-center justify-center gap-1 px-3 py-2 bg-[#53D695] text-white text-sm font-medium rounded-full hover:bg-[#53D695]/90 transition-colors"
        >
          <Lightning 
            size={16} 
            weight="fill"
          />
          Buy Now
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-8">
        {/* Image Gallery with Zoom */}
        <div className="space-y-4 w-full max-w-[320px] xs:max-w-lg mx-auto -mx-2 xs:mx-0">
          <div 
            ref={imageRef}
            className="relative aspect-square w-full overflow-hidden bg-gray-100 sm:rounded-2xl"
            onClick={handleImageClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setZoomPosition({ x: 0, y: 0 })}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
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
                  src={product.images?.[selectedImage]?.url || DEFAULT_PLACEHOLDER}
                  alt={product.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            )}

            {/* Mobile swipeable image */}
            <div 
              className={`md:hidden w-full h-full relative transition-transform ${isZoomed ? 'hidden' : ''}`}
              style={{
                transform: `translateX(${slidePosition}px)`,
                maxWidth: '320px',
                margin: '0 auto'
              }}
            >
              <Image
                src={product.images?.[selectedImage]?.url || DEFAULT_PLACEHOLDER}
                alt={product.name}
                fill
                className="object-contain"
                priority
                sizes="(max-width: 340px) 320px, (max-width: 640px) 90vw, (max-width: 1024px) 50vw, 800px"
              />
            </div>

            {/* Desktop image with zoom */}
            <div className="hidden md:block w-full h-full relative">
              <Image
                src={product.images?.[selectedImage]?.url || DEFAULT_PLACEHOLDER}
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

            {/* Image counter for mobile */}
            {!isZoomed && (
              <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {selectedImage + 1} / {product.images.length}
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              {product.isNew && (
                <span className="bg-[#38D49A]/90 backdrop-blur-md 
                  text-white px-3 py-1 rounded-full text-xs font-semibold
                  shadow-[0_2px_10px_rgb(56,212,154,0.3)]">
                  Bestseller
                </span>
              )}
              <span className="bg-red-500/90 backdrop-blur-md 
                text-white px-3 py-1 rounded-full text-xs font-semibold
                shadow-[0_2px_10px_rgb(239,68,68,0.3)]">
                30% OFF
              </span>
            </div>
          </div>
          
          {/* Thumbnails */}
          <div className="px-2 xs:px-4 sm:px-0 max-w-lg mx-auto">
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide py-2">
              {product.images?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square w-16 sm:w-20 flex-shrink-0 rounded-lg overflow-hidden 
                    hover:opacity-90 transition-opacity ${
                    selectedImage === index ? 'ring-2 ring-[#53D695]' : 'ring-1 ring-gray-200'
                  }`}
                >
                  <Image
                    src={image.url || DEFAULT_PLACEHOLDER}
                    alt={`${product.name} view ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 64px, 80px"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4 sm:space-y-6 px-2 xs:px-4 sm:px-0">
          {/* Simplified price section */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{product.name}</h2>
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
              <span className="text-xl text-gray-500 line-through">
                {formatPrice(calculateOriginalPrice(product.price))}
              </span>
            </div>
          </div>

          {/* Conditional Size Selection */}
          {product.sizes?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Select Size</h3>
              <div className="flex gap-3">
                {product.sizes.map((size,index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(typeof size === 'object' ? size.name : size)}
                    className={`px-4 py-2 rounded-lg border ${
                      selectedSize === (typeof size === 'object' ? size.name : size)
                        ? 'border-[#53D695] bg-[#53D695]/10 text-[#53D695]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {typeof size === 'object' ? size.name : size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conditional Color Selection */}
          {product.colors?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Select Color</h3>
              <div className="flex gap-3">
                {product.colors.map((color,index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(typeof color === 'object' ? color.name : color)}
                    className={`px-4 py-2 rounded-lg border ${
                      selectedColor === (typeof color === 'object' ? color.name : color)
                        ? 'border-[#53D695] bg-[#53D695]/10 text-[#53D695]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {typeof color === 'object' ? color.name : color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Description</h3>
            <p className="text-gray-500">{product.description}</p>
            
            {/* Bullet Points */}
            {product.bulletPoints && product.bulletPoints.length > 0 && (
              <ul className="mt-4 space-y-2">
                {product.bulletPoints.map((point, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#53D695]" />
                    {point}
                  </li>
                ))}
              </ul>
            )}

            <ul className="mt-4 space-y-2">
              {renderFeatures(product.features)}
            </ul>
          </div>

          {/* Updated Features */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
              <div className="p-2 rounded-lg bg-[#53D695]/10 shrink-0">
                <Truck weight="bold" size={20} className="text-[#53D695]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Free Delivery</p>
                <p className="text-sm text-[#53D695] font-medium truncate">8-10 business days</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
              <div className="p-2 rounded-lg bg-[#53D695]/10 shrink-0">
                <ArrowsClockwise weight="bold" size={20} className="text-[#53D695]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">7 Days Return</p>
                <p className="text-sm text-[#53D695] font-medium truncate">Easy & Free Returns</p>
              </div>
            </div>
          </div>

          {/* Updated countdown timer styling */}
          {/* <div className="flex flex-col items-center py-4 sm:py-6">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
              Limited time offer - Sale ends in:
            </p>
            <div className="bg-red-500/90 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
              <CountdownTimer className="text-white text-xs sm:text-sm font-bold" />
            </div>
          </div> */}

          {/* Updated bottom buttons */}
          <div className="pt-6">
            <div className="flex flex-col xs:flex-row gap-3 max-w-[320px] xs:max-w-none mx-auto">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 xs:py-3.5 bg-white text-[#53D695] font-medium rounded-full 
                  hover:bg-gray-50 transition-colors border-2 border-[#53D695] group disabled:opacity-50"
              >
                {addingToCart ? (
                  <div className="w-5 h-5 border-2 border-[#53D695] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingBag 
                      size={20}
                      weight="fill"
                      className="transition-transform group-hover:scale-110" 
                    />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={addingToCart}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 xs:py-3.5 bg-[#53D695] text-white font-medium 
                  rounded-full hover:bg-[#53D695]/90 transition-colors group disabled:opacity-50"
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
    </div>
  );
}
