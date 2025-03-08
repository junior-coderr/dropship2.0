'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CaretLeft, ShoppingBag, Truck, ArrowsClockwise, X, Lightning, VideoCamera, Play, Image as ImageIcon } from 'phosphor-react';
import { useCart } from '@/context/CartContext';
import { useParams } from "next/navigation";
import { useProduct } from '@/hooks/useProduct';
import { useCountdown } from '@/context/CountdownContext';
import Head from 'next/head';
// import CountdownTimer from '@/components/CountdownTimer';
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
  const [showVideo, setShowVideo] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const videoRef = useRef(null);
  const minSwipeDistance = 50;

  // Update document head with dynamic metadata when product loads
  useEffect(() => {
    if (product) {
      // Update the document title
      document.title = `${product.name} | CupidCart`;
      
      // Create meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', `${product.description?.substring(0, 150)}... Buy ${product.name} at the best price with free shipping and returns.`);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = `${product.description?.substring(0, 150)}... Buy ${product.name} at the best price with free shipping and returns.`;
        document.head.appendChild(meta);
      }
      
      // Add Open Graph tags
      const ogTags = [
        { property: 'og:title', content: `${product.name} | CupidCart` },
        { property: 'og:description', content: product.description?.substring(0, 150) || `${product.name} - Premium quality product` },
        { property: 'og:image', content: product.images?.[0]?.url || DEFAULT_PLACEHOLDER },
        { property: 'og:type', content: 'product' },
        { property: 'og:price:amount', content: product.price },
        { property: 'og:price:currency', content: 'INR' },
        { property: 'product:availability', content: product.inStock ? 'in stock' : 'out of stock' }
      ];
      
      ogTags.forEach(tag => {
        let ogTag = document.querySelector(`meta[property="${tag.property}"]`);
        if (ogTag) {
          ogTag.setAttribute('content', tag.content);
        } else {
          ogTag = document.createElement('meta');
          ogTag.setAttribute('property', tag.property);
          ogTag.setAttribute('content', tag.content);
          document.head.appendChild(ogTag);
        }
      });
    }
  }, [product]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(price);
  };

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
    if (product?.sizes?.length > 0) {
      setSelectedSize(product.sizes[0]); // Set first size as default
    }
    if (product?.colors?.length > 0) {
      const firstColor = typeof product.colors[0] === 'object' ? 
        product.colors[0].name : 
        product.colors[0];
      setSelectedColor(firstColor); // Set first color as default
    }
  }, [product,useProduct]); // Run once when component mounts

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

  const handleVideoLoadStart = () => {
    setVideoLoading(true);
  };

  const handleVideoLoaded = () => {
    setVideoLoading(false);
  };

  const toggleVideo = () => {
    if (showVideo) {
      // When switching from video to image
      setShowVideo(false);
      // Keep the first image selected when switching back from video
      setSelectedImage(0);
    } else {
      // When switching to video
      setShowVideo(true);
      setIsZoomed(false); // Reset zoom when switching to video
      setVideoLoading(true);
      // Reset any image-specific states
      setZoomPosition({ x: 0, y: 0 });
      setTouchStart(null);
      setTouchEnd(null);
      setIsSwiping(false);
      setSlidePosition(0);
    }
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
    <>
      {/* Custom metadata elements */}
      <Head>
        <title>{`${product.name} | CupidCart`}</title>
        <meta name="description" content={`${product.description?.substring(0, 150)}... Buy ${product.name} at the best price.`} />
        <meta name="keywords" content={`${product.name}, CupidCart, buy online, premium products, ${product.categories?.join(', ') || ''}`} />
        
        {/* Product-specific structured data */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": "${product.name}",
            "image": "${product.images?.[0]?.url || DEFAULT_PLACEHOLDER}",
            "description": "${product.description?.replace(/"/g, '\\"') || ''}",
            "brand": {
              "@type": "Brand",
              "name": "CupidCart"
            },
            "offers": {
              "@type": "Offer",
              "url": "${typeof window !== 'undefined' ? window.location.href : ''}",
              "priceCurrency": "INR",
              "price": "${product.price}",
              "priceValidUntil": "${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}",
              "itemCondition": "https://schema.org/NewCondition",
              "availability": "${product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'}"
            }
          }
        `}</script>
      </Head>
      
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
              onClick={!showVideo ? handleImageClick : undefined}
              onMouseMove={!showVideo ? handleMouseMove : undefined}
              onMouseLeave={() => setZoomPosition({ x: 0, y: 0 })}
              onTouchStart={!showVideo ? onTouchStart : undefined}
              onTouchMove={!showVideo ? onTouchMove : undefined}
              onTouchEnd={!showVideo ? onTouchEnd : undefined}
            >
              {showVideo && product?.video && product.video.url ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <video
                    ref={videoRef}
                    src={product.video.url}
                    controls
                    preload="metadata"
                    poster={product.images?.[0]?.url}
                    className="w-full h-full object-contain"
                    onLoadStart={handleVideoLoadStart}
                    onLoadedData={handleVideoLoaded}
                  >
                    Your browser does not support the video tag.
                  </video>
                  {videoLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50/70">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#53D695] border-t-transparent" />
                    </div>
                  )}
                </div>
              ) : (
                <>
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

                  <Image
                    src={product.images?.[selectedImage]?.url || DEFAULT_PLACEHOLDER}
                    alt={product.name}
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 340px) 320px, (max-width: 640px) 90vw, (max-width: 1024px) 50vw, 800px"
                  />

                  {/* Product badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {product.isNew && (
                      <span className="bg-[#38D49A]/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold shadow-[0_2px_10px_rgb(56,212,154,0.3)]">
                        Bestseller
                      </span>
                    )}
                    <span className="bg-red-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold shadow-[0_2px_10px_rgb(239,68,68,0.3)]">
                      30% OFF
                    </span>
                  </div>

                  {/* Removed video toggle button from here */}
                </>
              )}
            </div>

            {/* Thumbnails row */}
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide py-2">
              {/* Video thumbnail - if available */}
              {product?.video && product.video.url && (
                <button
                  onClick={toggleVideo}
                  className={`relative aspect-square w-16 sm:w-20 flex-shrink-0 rounded-lg overflow-hidden hover:opacity-90 transition-opacity ${
                    showVideo ? 'ring-2 ring-[#53D695]' : 'ring-1 ring-gray-200'
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    {showVideo ? (
                      <ImageIcon size={20} weight="bold" className="text-white" />
                    ) : (
                      <VideoCamera size={20} weight="bold" className="text-white" />
                    )}
                  </div>
                  <div className="absolute inset-0">
                    <Image
                      src={product.images?.[0]?.url || DEFAULT_PLACEHOLDER}
                      alt="Video thumbnail"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 64px, 80px"
                    />
                  </div>
                </button>
              )}

              {/* Image thumbnails */}
              {product?.images?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setShowVideo(false);
                    setSelectedImage(index);
                  }}
                  className={`relative aspect-square w-16 sm:w-20 flex-shrink-0 rounded-lg overflow-hidden hover:opacity-90 transition-opacity ${
                    !showVideo && selectedImage === index ? 'ring-2 ring-[#53D695]' : 'ring-1 ring-gray-200'
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

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6 px-2 xs:px-4 sm:px-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{product.name}</h2>
                {/* <br /> */}
              <div className="flex items-baseline gap-4 mb-6 mt-3">
                <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
                {product.discountedPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(calculateOriginalPrice(product.price))}
                  </span>
                )}
              </div>

              {/* Stock Status Badge */}
              {!product.inStock && (
                <div className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  Out of Stock
                </div>
              )}

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
                    <p className="text-sm text-[#53D695] font-medium truncate">Free Returns</p>
                  </div>
                </div>
              </div>

              {/* Updated countdown timer styling */}
              {/* <div className="flex flex-col items-center py-4 sm:py-6"></div>
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
                    disabled={addingToCart || !product.inStock}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 xs:py-3.5 bg-white text-[#53D695] font-medium rounded-full 
                      hover:bg-gray-50 transition-colors border-2 border-[#53D695] group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
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
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={addingToCart || !product.inStock}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 xs:py-3.5 bg-[#53D695] text-white font-medium 
                      rounded-full hover:bg-[#53D695]/90 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Lightning 
                      size={20} 
                      weight="fill"
                      className="transition-transform group-hover:scale-110" 
                    />
                    {product.inStock ? 'Buy Now' : 'Out of Stock'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}


