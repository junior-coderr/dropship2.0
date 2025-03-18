'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CaretLeft, ShoppingBag, Truck, ArrowsClockwise, X, Lightning, VideoCamera, Play, Image as ImageIcon, ShieldCheck, Clock, Medal, ThumbsUp } from 'phosphor-react';
import { useCart } from '@/context/CartContext';
import { useParams } from "next/navigation";
import { useProduct } from '@/hooks/useProduct';
import { useCountdown } from '@/context/CountdownContext';
import Head from 'next/head';
const DEFAULT_PLACEHOLDER = '/placeholder.png';

// Trust feature data
const trustFeatures = [
  {
    icon: ShieldCheck,
    title: "Trusted Platform",
    description: "Shop with confidence on our secure platform"
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Quick dispatch with reliable shipping partners"
  },
  {
    icon: Medal,
    title: "Quality Assured",
    description: "All products are quality checked before dispatch"
  },
  {
    icon: ThumbsUp,
    title: "100% Satisfaction",
    description: "Easy returns if you're not completely satisfied"
  }
];

// Collection of uncommon Indian names and surnames - expanded list
const uniqueNames = [
  "Advait Bhattacharyya", "Zara Chandramouli", "Ishaan Ganguly", "Mira Qureshi", 
  "Vihaan Chakraborty", "Nyra Bhattacharya", "Aditya Rajagopalan", "Aradhya Venkatesan",
  "Reyansh Talwar", "Kiara Menon", "Arhaan Ramanathan", "Kyra Deshpande",
  "Dhruv Hegde", "Aadhya Iyer", "Kabir Subramaniam", "Pari Gopalakrishnan",
  "Vivaan Kulkarni", "Ananya Khatri", "Ayaan Nambiar", "Myra Krishnamurthy",
  "Atharva Srinivasan", "Aanya Choudhury", "Aryan Narasimhan", "Shanaya Rajagopal",
  "Rudra Parthasarathy", "Amaira Balakrishnan", "Viraj Sundaram", "Trisha Trivedi",
  "Shlok Venkataraman", "Navya Raghunathan", "Arnav Chattopadhyay", "Avni Padmanabhan",
  "Rishaan Bhagat", "Saanvi Mukherjee", "Aarav Khandelwal", "Tara Sengupta",
  "Yuvan Lokhande", "Ira Majumdar", "Veer Chakrapani", "Aisha Ghatak",
  "Shaurya Deol", "Diya Bandyopadhyay", "Ahaan Maheshwari", "Anvi Sreekumar",
  "Krish Sisodia", "Riya Thiruchelvam", "Rohan Viswanathan", "Nisha Balasubramanian"
];

// Positive-only product category-specific review templates
const categoryReviews = {
  // Clothing reviews - all positive
  clothing: [
    "This fits perfectly! The fabric quality is excellent and the stitching is well done. Very comfortable to wear.",
    "The color is exactly as shown in the pictures. The material feels premium and washes well.",
    "Comfortable fit and the fabric feels good on skin. Looks elegant and received many compliments.",
    "Great for casual wear. Very comfortable and the color hasn't faded even after multiple washes.",
    "The fabric is breathable and perfect for summer. I'm planning to buy in other colors too.",
    "Perfect for my body type! The cut is flattering and the material feels luxurious.",
    "Excellent craftsmanship and attention to detail. Worth every rupee I paid.",
    "The fabric blend is comfortable and doesn't cause any irritation even in hot weather.",
    "Sizing was accurate as per the chart. The outfit looks expensive and well-tailored.",
    "Versatile piece that can be dressed up or down. Gets lots of compliments.",
    "The outfit looks exactly like in the pictures. Feels well-made and durable.",
    "Perfect for formal occasions. The fit is impeccable and the material is high quality."
  ],
  
  // Electronics reviews - all positive
  electronics: [
    "Works flawlessly! The battery life is impressive and the performance exceeds expectations.",
    "The build quality is sturdy and the features work as advertised. Very happy with this purchase.",
    "Very intuitive interface and easy to set up. Battery performance is better than expected.",
    "The sound quality is exceptional! Crystal clear audio even at high volumes.",
    "Perfect for my needs - fast processing and responsive controls. Great value purchase.",
    "Sleek design and premium feel. Works seamlessly with all my other devices.",
    "Energy efficient and quiet operation. Exactly what I needed for my home setup.",
    "Excellent picture/display quality with vibrant colors and sharp contrast.",
    "Compact design that doesn't compromise on performance. Impressed with the quality control.",
    "Smart features work perfectly and make everyday tasks much easier.",
    "The camera quality is incredible, capturing details I didn't expect at this price point.",
    "Setup was straightforward and the user manual was clear and helpful."
  ],
  
  // Home & Decor reviews - all positive
  homeDecor: [
    "This looks absolutely stunning in my living room! The craftsmanship is excellent.",
    "Beautiful piece that has elevated the look of my home. Well-made and elegant.",
    "Exactly what I was looking for. High-quality material and looks expensive.",
    "Adds a nice touch to my home decor. Reasonably priced for the quality.",
    "The intricate details are beautifully crafted. Gets noticed by every guest who visits.",
    "Perfect centerpiece for my dining table. The design is timeless and elegant.",
    "Excellent craftsmanship with attention to the smallest details. Worth the investment.",
    "The colors are rich and complement my existing decor beautifully.",
    "Unique design that's become a conversation starter. Very happy with this purchase.",
    "The texture and finish look much more expensive than the actual price.",
    "The handcrafted elements make this piece special. No regrets buying this.",
    "Elegant design that immediately elevates the room's appearance."
  ],
  
  // Beauty & Personal Care reviews - all positive
  beauty: [
    "Amazing product! Saw visible results within a week. Will definitely repurchase.",
    "The fragrance is lovely and the product quality is excellent. Highly recommend!",
    "Best skincare product I've used! My skin looks and feels so much better.",
    "No irritation on my sensitive skin, which is rare. Happy with the purchase overall.",
    "The formulation feels luxurious and absorbs quickly without leaving any residue.",
    "Noticed improved skin texture after just two weeks of consistent use.",
    "Perfect for my skin type! Has helped with my concerns without causing breakouts.",
    "My skin feels hydrated throughout the day. Will be purchasing the full range.",
    "Elegant packaging and the product inside lives up to the premium feel.",
    "Value for money considering how little product you need for each application.",
    "The natural ingredients have made a noticeable difference to my complexion.",
    "The applicator is well-designed and makes the product easy to use."
  ],
  
  // Accessories reviews - all positive
  accessories: [
    "This is so stylish and complements my outfits perfectly! High-quality material too.",
    "Elegant design and excellent quality. Gets noticed everywhere I wear it.",
    "Absolutely love this! The craftsmanship is impressive and it looks premium.",
    "Versatile design that works with both casual and formal outfits. Great purchase!",
    "Perfect statement piece that elevates even the simplest outfit. Very happy!",
    "Unique design that I haven't seen elsewhere. Gets me compliments every time.",
    "The attention to detail is impressive. Looks much more expensive than it is.",
    "Perfectly sized and the adjustable features make it comfortable to wear all day.",
    "Exceeded my expectations in terms of quality and design. Worth every rupee.",
    "The finishing touches show real attention to craftsmanship and quality.",
    "Lightweight yet durable, perfect for everyday wear without sacrificing style.",
    "The clasp is secure and well-designed - no worries about losing it."
  ],
  
  // Default/General reviews - all positive
  default: [
    "Great purchase! The quality is excellent and it arrived in perfect condition.",
    "Very satisfied with this purchase. The quality exceeded my expectations.",
    "Love everything about this! Would definitely recommend to friends and family.",
    "Excellent value for money. Very happy with my purchase.",
    "The product performs exactly as described. No complaints whatsoever.",
    "Surprisingly good quality considering the reasonable price point.",
    "Exceeded my expectations in every way. Will definitely purchase again.",
    "Perfect for my needs and arrived sooner than expected. Great service!",
    "Well-designed and practical. Makes my life easier which is what I wanted.",
    "High quality product that performs better than expected. Very satisfied!",
    "The attention to detail is impressive. Five stars all the way.",
    "Easy to use and works perfectly. Definitely worth the investment."
  ]
};

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
  
  // Determine product category based on product name or actual category
  const determineCategory = (product) => {
    if (!product) return 'default';
    
    const nameLower = product.name.toLowerCase();
    const categoryLower = product.category?.toLowerCase() || '';
    
    if (
      nameLower.includes('shirt') || 
      nameLower.includes('dress') || 
      nameLower.includes('pant') ||
      nameLower.includes('jacket') ||
      categoryLower.includes('cloth') ||
      categoryLower.includes('apparel') ||
      categoryLower.includes('wear')
    ) {
      return 'clothing';
    }
    
    if (
      nameLower.includes('phone') ||
      nameLower.includes('laptop') ||
      nameLower.includes('headphone') ||
      nameLower.includes('charger') ||
      nameLower.includes('device') ||
      categoryLower.includes('electronics') ||
      categoryLower.includes('gadget')
    ) {
      return 'electronics';
    }
    
    if (
      nameLower.includes('decor') ||
      nameLower.includes('furniture') ||
      nameLower.includes('lamp') ||
      nameLower.includes('rug') ||
      nameLower.includes('curtain') ||
      categoryLower.includes('home') ||
      categoryLower.includes('decor')
    ) {
      return 'homeDecor';
    }
    
    if (
      nameLower.includes('cream') ||
      nameLower.includes('lotion') ||
      nameLower.includes('serum') ||
      nameLower.includes('makeup') ||
      nameLower.includes('shampoo') ||
      categoryLower.includes('beauty') ||
      categoryLower.includes('cosmetic') ||
      categoryLower.includes('personal care')
    ) {
      return 'beauty';
    }
    
    if (
      nameLower.includes('necklace') ||
      nameLower.includes('bracelet') ||
      nameLower.includes('ring') ||
      nameLower.includes('watch') ||
      nameLower.includes('earring') ||
      nameLower.includes('bag') ||
      categoryLower.includes('accessory') ||
      categoryLower.includes('accessories') ||
      categoryLower.includes('jewelry')
    ) {
      return 'accessories';
    }
    
    return 'default';
  };
  
  // Generate product-specific reviews based on product ID to ensure consistency
  const productReviews = useMemo(() => {
    if (!product || !product._id) return [];
    
    // Determine category for relevant reviews
    const category = determineCategory(product);
    const relevantReviews = categoryReviews[category] || categoryReviews.default;
    
    // Use product ID to generate a consistent and unique seed
    const seed = parseInt(product._id.substring(0, 8), 16);
    
    // Create a more sophisticated pseudo-random number generator
    const seededRandom = (seed, index) => {
      const x = Math.sin(seed * 9999 + index * 7777) * 10000;
      return x - Math.floor(x);
    };
    
    // Use the product ID to determine if this product should have few reviews
    // Some products will have only 1-2 reviews to make it seem more realistic
    const shouldHaveFewReviews = seededRandom(seed, 50) < 0.4; // 40% chance of having few reviews
    
    // Generate reviews for this product - either 1-2 or 3-5 reviews
    const numReviews = shouldHaveFewReviews 
      ? Math.floor(seededRandom(seed, 0) * 2) + 1 // 1 or 2 reviews
      : Math.floor(seededRandom(seed, 0) * 3) + 3; // 3, 4, or 5 reviews
    
    // Track used names and reviews to ensure uniqueness
    const usedNameIndices = new Set();
    const usedReviewIndices = new Set();
    const reviews = [];
    
    for (let i = 0; i < numReviews; i++) {
      // Select unique name
      let nameIndex;
      do {
        nameIndex = Math.floor(seededRandom(seed, i + 100) * uniqueNames.length);
      } while (usedNameIndices.has(nameIndex));
      usedNameIndices.add(nameIndex);
      
      // Select unique review
      let reviewIndex;
      do {
        reviewIndex = Math.floor(seededRandom(seed, i + 200) * relevantReviews.length);
      } while (usedReviewIndices.has(reviewIndex));
      usedReviewIndices.add(reviewIndex);
      
      reviews.push({
        name: uniqueNames[nameIndex],
        comment: relevantReviews[reviewIndex]
      });
    }
    
    return reviews;
  }, [product]);

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

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send the review to the backend
    console.log('Review submitted:', { name: reviewName, comment: reviewText });
    setReviewSubmitted(true);
    
    // Reset form and close modal after 2 seconds
    setTimeout(() => {
      setReviewText('');
      setReviewName('');
      setReviewSubmitted(false);
      setIsReviewModalOpen(false);
    }, 2000);
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
                    {/* <p className="text-sm text-[#53D695] font-medium truncate"></p> */}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                  <div className="p-2 rounded-lg bg-[#53D695]/10 shrink-0">
                    <ArrowsClockwise weight="bold" size={20} className="text-[#53D695]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">7 Days Return</p>
                    <p className="text-sm text-[#53D695] font-medium truncate">Easy Returns</p>
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
        
        {/* Vertical Product Images Gallery - Added to make page lengthier */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 text-center mb-8">Product Gallery</h3>
          
          <div className="flex flex-col items-center gap-6 md:gap-10">
            {product?.images?.map((image, index) => (
              <div key={index} className="w-full max-w-2xl relative">
                <div className="relative aspect-square w-full overflow-hidden bg-gray-100 rounded-2xl shadow-md">
                  <Image
                    src={image.url || DEFAULT_PLACEHOLDER}
                    alt={`${product.name} - Image ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 672px"
                  />
                </div>
                <div className="absolute top-4 right-4 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-md backdrop-blur-sm">
                  {index + 1} / {product.images.length}
                </div>
              </div>
            ))}
            
            {/* Video if available */}
            {product?.video && product.video.url && (
              <div className="w-full max-w-2xl">
                <div className="relative aspect-video w-full overflow-hidden bg-gray-100 rounded-2xl shadow-md">
                  <video
                    src={product.video.url}
                    controls
                    preload="metadata"
                    poster={product.images?.[0]?.url}
                    className="w-full h-full object-contain"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Trust Features Section */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 text-center mb-8">Why Shop With CupidCart</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {trustFeatures.map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center p-4 rounded-xl border border-gray-100 hover:border-[#53D695]/50 hover:shadow-md transition-all">
                <div className="mb-3 p-3 bg-[#53D695]/10 rounded-full">
                  <feature.icon size={24} weight="bold" className="text-[#53D695]" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Feedback</h3>
              <p className="text-gray-500">Real experiences from verified buyers</p>
            </div>
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              className="px-4 py-2 bg-[#53D695] text-white rounded-full font-medium hover:bg-[#53D695]/90 transition-colors"
            >
              Write a Review
            </button>
          </div>
          
          <div className="space-y-6">
            {productReviews.map((review, index) => (
              <div key={index} className="p-6 border border-gray-100 rounded-xl hover:border-gray-200 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900">{review.name}</h4>
                  </div>
                  <div className="bg-green-50 px-2 py-1 rounded-md">
                    <p className="text-xs text-green-700 font-medium">Verified Purchase</p>
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#53D695]/10 rounded-full text-[#53D695] font-medium">
              <span>Customer Satisfaction</span>
              <span className="bg-[#53D695] text-white px-2 py-0.5 rounded-md text-xs font-bold">
                100%
              </span>
            </div>
          </div>
        </div>
        
        {/* Review Modal */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
              
              {reviewSubmitted ? (
                <div className="py-8 text-center">
                  <div className="mb-4 mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
                  <p className="text-gray-600">Your review has been submitted successfully.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Write a Review</h3>
                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        id="name"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#53D695] focus:border-[#53D695] outline-none"
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                      <textarea
                        id="review"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#53D695] focus:border-[#53D695] outline-none"
                        placeholder="Share your experience with this product..."
                        required
                      ></textarea>
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#53D695] text-white font-medium rounded-full hover:bg-[#53D695]/90 transition-colors"
                    >
                      Submit Review
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}


